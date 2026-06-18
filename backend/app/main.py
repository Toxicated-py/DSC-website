from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Any

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .auth import get_current_profile, get_current_user, profile_roles, require_admin
from .config import Settings, get_settings
from .schemas import (
    ApiStatus,
    BlogPostCreate,
    CertificateBulkIssue,
    CertificateIssue,
    CertificateUpdate,
    ContactMessageCreate,
    EventStaffUpdate,
    EventProposalCreate,
    GallerySubmissionCreate,
    GenericPayload,
    ProjectCreate,
    SiteSettingsUpdate,
    StatusUpdate,
    TicketScan,
)
from .supabase_rest import SupabaseRestClient, SupabaseRestError


def supabase_http_error(exc: SupabaseRestError) -> HTTPException:
    raw = str(exc).lower()
    if exc.status_code in {401, 403}:
        detail = "You do not have permission to do this. Please log in again."
    elif exc.status_code == 404:
        detail = "The requested item could not be found."
    elif exc.status_code == 409 or "duplicate" in raw or "unique" in raw:
        detail = "This item already exists."
    elif "foreign key" in raw or "profile" in raw:
        detail = "Your account profile is still being prepared. Please refresh and try again."
    elif "null value" in raw or "schema cache" in raw or "column" in raw or exc.status_code >= 500:
        detail = "We could not save this right now. Please check the form and try again."
    else:
        detail = "Something went wrong. Please try again."
    return HTTPException(status_code=exc.status_code, detail=detail)


def get_supabase(settings: Settings = Depends(get_settings)) -> SupabaseRestClient:
    try:
        return SupabaseRestClient(settings)
    except SupabaseRestError as exc:
        raise supabase_http_error(exc) from exc


def get_user_supabase(settings: Settings, profile: dict[str, Any]) -> SupabaseRestClient:
    return SupabaseRestClient(settings, auth_token=profile.get("_auth_token"))


def get_service_supabase(settings: Settings) -> SupabaseRestClient:
    return SupabaseRestClient(settings, use_service_role=True)


def get_privileged_supabase(settings: Settings, auth_token: str | None = None) -> SupabaseRestClient:
    try:
        return get_service_supabase(settings)
    except SupabaseRestError:
        return SupabaseRestClient(settings, auth_token=auth_token)


async def select_one(
    client: SupabaseRestClient,
    table: str,
    filters: dict[str, str],
    columns: str = "*",
) -> dict[str, Any] | None:
    try:
        return await client.select(table, columns=columns, filters=filters, single=True)
    except SupabaseRestError as exc:
        if exc.status_code == 406:
            return None
        raise


async def ensure_not_duplicate(
    client: SupabaseRestClient,
    table: str,
    *,
    owner_column: str,
    owner_id: str,
    title: str,
) -> None:
    existing = await client.select(
        table,
        columns="id",
        filters={
            owner_column: f"eq.{owner_id}",
            "title": f"eq.{title}",
            "status": "in.(draft,submitted,pending,approved,published)",
        },
        limit=1,
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="This item was already submitted. Please wait for review or edit the existing one.",
        )


def audit_summary(action: str, resource: str, row: dict[str, Any] | None = None, resource_id: str | None = None) -> str:
    title = ""
    if row:
        title = str(
            row.get("title")
            or row.get("full_name")
            or row.get("name")
            or row.get("subject")
            or row.get("certificate_title")
            or row.get("email")
            or ""
        )
    label = title or resource_id or resource.replace("-", " ")
    return f"{action.replace('_', ' ').title()} {resource.replace('-', ' ')}: {label}"


async def write_audit_log(
    client: SupabaseRestClient,
    profile: dict[str, Any],
    *,
    action: str,
    resource: str,
    resource_id: str | None = None,
    summary: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    try:
        await client.insert(
            "audit_logs",
            {
                "actor_id": profile.get("id"),
                "actor_email": profile.get("email"),
                "action": action,
                "resource": resource,
                "resource_id": resource_id,
                "summary": summary or audit_summary(action, resource, None, resource_id),
                "metadata": metadata or {},
            },
        )
    except SupabaseRestError:
        # Audit logs are useful but should not break normal admin actions if the
        # migration has not been applied yet or Supabase is temporarily stale.
        return


def table_for_resource(resource: str) -> str:
    table = ADMIN_TABLES.get(resource)
    if not table:
        raise HTTPException(status_code=404, detail="Unknown admin resource.")
    return table


def is_full_admin(profile: dict[str, Any]) -> bool:
    return bool(profile_roles(profile) & {"admin", "president"})


def is_organizer(profile: dict[str, Any]) -> bool:
    return bool(profile_roles(profile) & {"organizer"})


RESOURCE_OWNER_COLUMNS = {
    "events": "created_by",
    "event-proposals": "proposed_by",
    "projects": "author_id",
    "blog-posts": "author_id",
}

ADMIN_ONLY_RESOURCES = {
    "profiles",
    "designation-options",
    "certificates",
    "gallery",
    "partners",
    "learning-materials",
    "contact-messages",
}


async def active_registration_count(client: SupabaseRestClient, event_id: str) -> int:
    rows = await client.select(
        "event_registrations",
        columns="id",
        filters={"event_id": f"eq.{event_id}", "status": "in.(registered,checked_in)"},
    )
    return len(rows or [])


async def attach_event_counts(client: SupabaseRestClient, events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    enriched: list[dict[str, Any]] = []
    for event in events:
        event_id = event.get("id")
        registered_count = 0
        if event_id:
            try:
                registered_count = await active_registration_count(client, event_id)
            except SupabaseRestError:
                registered_count = int(event.get("registered_count") or event.get("registeredCount") or 0)
        enriched.append({**event, "registeredCount": registered_count, "registered_count": registered_count})
    return enriched


async def managed_event_ids(client: SupabaseRestClient, profile: dict[str, Any]) -> set[str]:
    if is_full_admin(profile):
        rows = await client.select("events", columns="id")
        return {row["id"] for row in rows if row.get("id")}
    own_events = await client.select("events", columns="id", filters={"created_by": f"eq.{profile['id']}"})
    staff_rows = await client.select(
        "event_staff",
        columns="event_id",
        filters={"email": f"eq.{str(profile.get('email') or '').lower()}"},
    )
    return {
        *(row["id"] for row in own_events if row.get("id")),
        *(row["event_id"] for row in staff_rows if row.get("event_id")),
    }


async def require_resource_access(
    client: SupabaseRestClient,
    profile: dict[str, Any],
    resource: str,
    *,
    item_id: str | None = None,
    action: str = "read",
) -> dict[str, Any] | None:
    if is_full_admin(profile):
        return None
    if not is_organizer(profile):
        raise HTTPException(status_code=403, detail="Admin or organizer access required.")
    if resource in ADMIN_ONLY_RESOURCES:
        raise HTTPException(status_code=403, detail="This area is restricted to admins.")

    table = table_for_resource(resource)
    if item_id:
        row = await select_one(client, table, {"id": f"eq.{item_id}"})
        if not row:
            raise HTTPException(status_code=404, detail="Item not found.")
        owner_column = RESOURCE_OWNER_COLUMNS.get(resource)
        if owner_column and row.get(owner_column) == profile["id"]:
            return row
        if resource in {"certificates", "event-registrations"} and row.get("event_id") in await managed_event_ids(client, profile):
            return row
        raise HTTPException(status_code=403, detail="You can only manage your own items.")
    return None


async def list_accessible_resource(
    client: SupabaseRestClient,
    profile: dict[str, Any],
    resource: str,
    status: str | None = None,
    service_client: SupabaseRestClient | None = None,
) -> list[dict[str, Any]]:
    table = table_for_resource(resource)
    filters = {"status": f"eq.{status}"} if status else None
    if is_full_admin(profile):
        if resource == "profiles":
            admin_client = service_client or client
            await backfill_profiles_from_auth(admin_client)
            return await admin_client.select(table, filters=filters, order=RESOURCE_ORDER.get(table))
        return await client.select(table, filters=filters, order=RESOURCE_ORDER.get(table))
    await require_resource_access(client, profile, resource)
    owner_column = RESOURCE_OWNER_COLUMNS.get(resource)
    if owner_column:
        scoped_filters = {**(filters or {}), owner_column: f"eq.{profile['id']}"}
        return await client.select(table, filters=scoped_filters, order=RESOURCE_ORDER.get(table))
    if resource in {"certificates", "event-registrations"}:
        ids = await managed_event_ids(client, profile)
        if not ids:
            return []
        rows = await client.select(table, filters=filters, order=RESOURCE_ORDER.get(table))
        return [row for row in rows if row.get("event_id") in ids]
    raise HTTPException(status_code=403, detail="This area is restricted to admins.")


async def backfill_profiles_from_auth(client: SupabaseRestClient) -> None:
    try:
        auth_users = await client.list_auth_users()
        profiles = await client.select("profiles", columns="id")
    except SupabaseRestError:
        return

    existing_ids = {row.get("id") for row in profiles or []}
    missing_profiles = []
    for user in auth_users:
        user_id = user.get("id")
        email = user.get("email") or ""
        if not user_id or user_id in existing_ids:
            continue
        metadata = user.get("user_metadata") or {}
        missing_profiles.append({
            "id": user_id,
            "email": email,
            "full_name": metadata.get("full_name") or metadata.get("name") or email.split("@")[0] or "Member",
            "role": "member",
            "roles": ["member"],
            "membership_status": "approved",
        })

    for row in missing_profiles:
        try:
            await client.upsert("profiles", row, on_conflict="id")
        except SupabaseRestError:
            continue


def normalize_certificate(row: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(row.get("signature_data"), list):
        row["signature_data"] = []
    if not isinstance(row.get("template_data"), dict):
        row["template_data"] = {}
    return row


async def optional_profile(
    authorization: str | None,
    settings: Settings,
    client: SupabaseRestClient,
) -> dict[str, Any] | None:
    if not authorization:
        return None
    try:
        user = await get_current_user(authorization=authorization, settings=settings)
        return await get_current_profile(user=user, authorization=authorization, settings=settings)
    except HTTPException:
        return None


async def can_manage_event(client: SupabaseRestClient, profile: dict[str, Any], event: dict[str, Any]) -> bool:
    if profile_roles(profile) & {"admin", "president"}:
        return True
    if event.get("created_by") == profile.get("id"):
        return True
    staff_rows = await client.select(
        "event_staff",
        columns="id,email,user_id,can_scan",
        filters={"event_id": f"eq.{event.get('id')}"},
    )
    profile_email = str(profile.get("email") or "").lower()
    return any(
        row.get("can_scan")
        and (row.get("user_id") == profile.get("id") or str(row.get("email") or "").lower() == profile_email)
        for row in staff_rows
    )


async def generate_verification_code(client: SupabaseRestClient) -> str:
    year = date.today().year
    for attempt in range(10):
        latest = await client.select(
            "certificates",
            columns="verification_code",
            filters={"verification_code": f"like.CLUB-{year}-%"},
            order="verification_code.desc",
            limit=1,
        )
        latest_code = latest[0]["verification_code"] if latest else None
        latest_number = int(str(latest_code).split("-")[-1]) if latest_code else 0
        candidate = f"CLUB-{year}-{latest_number + 1 + attempt:05d}"
        exists = await select_one(client, "certificates", {"verification_code": f"eq.{candidate}"})
        if not exists:
            return candidate
    raise HTTPException(status_code=500, detail="Could not generate a unique verification code.")


async def issue_certificate_row(client: SupabaseRestClient, payload: CertificateIssue) -> dict[str, Any]:
    duplicate = await select_one(
        client,
        "certificates",
        {"member_id": f"eq.{payload.member_id}", "event_id": f"eq.{payload.event_id}"},
    )
    if duplicate:
        raise HTTPException(status_code=409, detail="Certificate already issued to this person for this event.")

    event = await select_one(client, "events", {"id": f"eq.{payload.event_id}"})
    profile = await select_one(client, "profiles", {"id": f"eq.{payload.member_id}"})
    verification_code = await generate_verification_code(client)
    recipient_name = (
        payload.recipient_name_snapshot
        or (profile or {}).get("full_name")
        or (profile or {}).get("email")
        or "Participant"
    )
    event_title = payload.event_title_snapshot or (event or {}).get("title") or "Event"
    signature_data = [signature.model_dump() for signature in payload.signature_data]
    data = payload.model_dump(exclude={"recipient_name_snapshot", "event_title_snapshot"})

    row = {
        **data,
        "signature_data": signature_data,
        "verification_code": verification_code,
        "event_title_snapshot": event_title,
        "recipient_name_snapshot": recipient_name,
        "status": "valid",
        # Legacy columns kept populated while older frontend code still exists.
        "recipient_id": payload.member_id,
        "title": payload.certificate_title,
        "template_style": payload.template,
        "certificate_url": payload.external_pdf_url,
        "issued_at": payload.issued_date,
    }

    try:
        inserted = await client.insert("certificates", row)
    except SupabaseRestError as exc:
        if "duplicate" in str(exc).lower() or "unique" in str(exc).lower():
            raise HTTPException(status_code=409, detail="Certificate already issued to this person for this event.") from exc
        raise supabase_http_error(exc) from exc

    return normalize_certificate(inserted[0])


settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")

ADMIN_TABLES = {
    "events": "events",
    "event-proposals": "event_proposals",
    "projects": "projects",
    "blog-posts": "blog_posts",
    "gallery": "gallery_submissions",
    "partners": "partner_submissions",
    "learning-materials": "learning_materials",
    "profiles": "profiles",
    "designation-options": "designation_options",
    "certificates": "certificates",
    "contact-messages": "contact_messages",
    "event-registrations": "event_registrations",
}

RESOURCE_ORDER = {
    "events": "created_at.desc",
    "event_proposals": "submitted_at.desc",
    "projects": "submitted_at.desc",
    "blog_posts": "published_at.desc",
    "gallery_submissions": "created_at.desc",
    "partner_submissions": "created_at.desc",
    "learning_materials": "created_at.desc",
    "profiles": "created_at.desc",
    "designation_options": "sort_order.asc",
    "certificates": "created_at.desc",
    "contact_messages": "created_at.desc",
    "event_registrations": "registered_at.desc",
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=ApiStatus)
async def health(current_settings: Settings = Depends(get_settings)) -> ApiStatus:
    return ApiStatus(
        ok=True,
        app=current_settings.app_name,
        environment=current_settings.environment,
        supabase_configured=current_settings.is_supabase_configured,
    )


@app.get("/api/site-settings")
async def get_site_settings(client: SupabaseRestClient = Depends(get_supabase)) -> dict[str, Any]:
    try:
        row = await client.select(
            "site_settings",
            columns="value",
            filters={"key": "eq.site"},
            single=True,
        )
    except SupabaseRestError as exc:
        if exc.status_code == 406:
            return {}
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc

    value = row.get("value") if isinstance(row, dict) else {}
    if not isinstance(value, dict):
        return {}

    team_members = value.get("teamMembers")
    if isinstance(team_members, list):
        profile_ids = {
            member.get("profileId")
            for member in team_members
            if isinstance(member, dict) and member.get("profileId")
        }
        profile_emails = {
            str(member.get("profileEmail")).lower()
            for member in team_members
            if isinstance(member, dict) and member.get("profileEmail")
        }
        profiles: list[dict[str, Any]] = []
        for profile_id in profile_ids:
            profile = await select_one(
                client,
                "profiles",
                {"id": f"eq.{profile_id}"},
                columns="id,email,full_name,avatar_url,bio,designation,major,github_username,linkedin_username,profile_links",
            )
            if profile:
                profiles.append(profile)
        for profile_email in profile_emails:
            profile = await select_one(
                client,
                "profiles",
                {"email": f"eq.{profile_email}"},
                columns="id,email,full_name,avatar_url,bio,designation,major,github_username,linkedin_username,profile_links",
            )
            if profile:
                profiles.append(profile)

        profiles_by_id = {profile.get("id"): profile for profile in profiles if profile.get("id")}
        profiles_by_email = {str(profile.get("email", "")).lower(): profile for profile in profiles if profile.get("email")}
        resolved_members = []
        for member in team_members:
            if not isinstance(member, dict):
                continue
            profile = profiles_by_id.get(member.get("profileId")) or profiles_by_email.get(str(member.get("profileEmail", "")).lower())
            if profile:
                resolved_members.append({
                    **member,
                    "source": "profile",
                    "profileId": profile.get("id"),
                    "profileEmail": profile.get("email"),
                    "name": profile.get("full_name") or member.get("name") or profile.get("email") or "Member",
                    "meta": member.get("meta") or profile.get("designation") or profile.get("major") or "",
                    "image": profile.get("avatar_url") or member.get("image") or "",
                    "bio": profile.get("bio") or member.get("bio") or "",
                    "email": member.get("email") or profile.get("email") or "",
                    "linkedin": member.get("linkedin") or profile.get("linkedin_username") or "",
                    "github": member.get("github") or profile.get("github_username") or "",
                    "profileLinks": profile.get("profile_links") if isinstance(profile.get("profile_links"), list) else [],
                })
            else:
                resolved_members.append(member)
        value = {**value, "teamMembers": resolved_members}

    return value


@app.get("/api/events")
async def list_events(
    status: str = Query("approved"),
    settings: Settings = Depends(get_settings),
    client: SupabaseRestClient = Depends(get_supabase),
) -> list[dict[str, Any]]:
    try:
        events = await client.select(
            "events",
            filters={"status": f"eq.{status}"},
            order="start_time.asc",
        )
        return await attach_event_counts(get_privileged_supabase(settings), events)
    except SupabaseRestError as exc:
        raise supabase_http_error(exc) from exc


@app.get("/api/events/{event_id}")
async def get_public_event(
    event_id: str,
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    service_client = get_privileged_supabase(settings)
    event = await select_one(service_client, "events", {"id": f"eq.{event_id}"})
    if not event or event.get("status") not in {"approved", "published"}:
        raise HTTPException(status_code=404, detail="Event not found.")

    registered_count = await active_registration_count(service_client, event_id)
    return {**event, "registeredCount": registered_count, "registered_count": registered_count}


@app.get("/api/events/{event_id}/workspace")
async def event_workspace(
    event_id: str,
    authorization: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    service_client = get_privileged_supabase(settings)
    event = await select_one(
        service_client,
        "events",
        {"id": f"eq.{event_id}"},
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    registered_count = await active_registration_count(service_client, event_id)
    profile = await optional_profile(authorization, settings, client)
    manager = await can_manage_event(service_client, profile, event) if profile else False
    if event.get("status") not in {"approved", "published"} and not manager:
        raise HTTPException(status_code=404, detail="This event is not public yet.")
    my_registration: dict[str, Any] | None = None
    if profile:
        existing_registration = await service_client.select(
            "event_registrations",
            columns="id,event_id,user_id,ticket_code,status,registered_at,checked_in_at",
            filters={"event_id": f"eq.{event_id}", "user_id": f"eq.{profile['id']}"},
            limit=1,
        )
        my_registration = existing_registration[0] if existing_registration else None
    attendees: list[dict[str, Any]] = []
    if manager:
        registrations = await service_client.select(
            "event_registrations",
            columns="id,event_id,user_id,ticket_code,status,registered_at,checked_in_at",
            filters={"event_id": f"eq.{event_id}"},
            order="registered_at.desc",
        )
        profile_ids = [row["user_id"] for row in registrations if row.get("user_id")]
        profile_rows = []
        for profile_id in profile_ids:
            found = await select_one(service_client, "profiles", {"id": f"eq.{profile_id}"})
            if found:
                profile_rows.append(found)
        profiles_by_id = {row["id"]: row for row in profile_rows}
        attendees = [{**row, "profiles": profiles_by_id.get(row.get("user_id"))} for row in registrations]

    return {
        "event": {**event, "registeredCount": registered_count, "registered_count": registered_count},
        "can_manage": manager,
        "my_registration": my_registration,
        "attendees": attendees,
    }


@app.post("/api/events/{event_id}/reserve", status_code=201)
async def reserve_event_spot(
    event_id: str,
    profile: dict[str, Any] = Depends(get_current_profile),
    settings: Settings = Depends(get_settings),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    service_client = get_privileged_supabase(settings, profile.get("_auth_token") if profile else None)
    event = await select_one(client, "events", {"id": f"eq.{event_id}"})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    if not event.get("registration_open") or event.get("status") == "archived":
        raise HTTPException(status_code=400, detail="Registration is closed for this event.")
    start_time = event.get("start_time")
    if start_time and str(start_time) < date.today().isoformat():
        raise HTTPException(status_code=400, detail="This event has ended.")
    existing = await client.select(
        "event_registrations",
        columns="id,event_id,user_id,ticket_code,status,registered_at,checked_in_at",
        filters={"event_id": f"eq.{event_id}", "user_id": f"eq.{profile['id']}"},
        limit=1,
    )
    if existing:
        count = await active_registration_count(client, event_id)
        return {"message": "Already registered.", "registration": existing[0], "registered_count": count}
    registered_count = await active_registration_count(client, event_id)
    if event.get("capacity") and registered_count >= int(event.get("capacity")):
        raise HTTPException(status_code=400, detail="This event is full.")
    rows = await service_client.insert(
        "event_registrations",
        {"event_id": event_id, "user_id": profile["id"], "status": "registered"},
    )
    return {
        "message": "Registered.",
        "registration": rows[0] if rows else None,
        "registered_count": await active_registration_count(client, event_id),
    }


@app.get("/api/me/tickets")
async def get_my_tickets(
    profile: dict[str, Any] = Depends(get_current_profile),
    settings: Settings = Depends(get_settings),
    client: SupabaseRestClient = Depends(get_supabase),
) -> list[dict[str, Any]]:
    user_client = SupabaseRestClient(settings, auth_token=profile.get("_auth_token"))
    registrations = await user_client.select(
        "event_registrations",
        columns="id,event_id,user_id,ticket_code,status,registered_at,checked_in_at",
        filters={"user_id": f"eq.{profile['id']}"},
        order="registered_at.desc",
    )
    event_cache: dict[str, dict[str, Any] | None] = {}
    tickets: list[dict[str, Any]] = []
    for registration in registrations:
        event_id = registration.get("event_id")
        if event_id and event_id not in event_cache:
            event_cache[event_id] = await select_one(
                client,
                "events",
                {"id": f"eq.{event_id}"},
                columns="id,title,event_type,start_time,end_time,venue,capacity,status",
            )
        tickets.append(
            {
                **registration,
                "event": event_cache.get(event_id) if event_id else None,
                "profile": {
                    "id": profile.get("id"),
                    "full_name": profile.get("full_name"),
                    "email": profile.get("email"),
                },
            }
        )
    return tickets


@app.patch("/api/events/{event_id}/registrations/{registration_id}/check-in")
async def check_in_registration(
    event_id: str,
    registration_id: str,
    profile: dict[str, Any] = Depends(get_current_profile),
    settings: Settings = Depends(get_settings),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    user_client = SupabaseRestClient(settings, auth_token=profile.get("_auth_token"))
    event = await select_one(client, "events", {"id": f"eq.{event_id}"})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    if not await can_manage_event(user_client, profile, event):
        raise HTTPException(status_code=403, detail="You are not allowed to manage this event.")
    rows = await user_client.update(
        "event_registrations",
        {"status": "checked_in", "checked_in_at": datetime.now(timezone.utc).isoformat()},
        filters={"id": f"eq.{registration_id}", "event_id": f"eq.{event_id}"},
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Registration not found.")
    return rows[0]


@app.post("/api/events/{event_id}/scan")
async def scan_event_ticket(
    event_id: str,
    payload: TicketScan,
    profile: dict[str, Any] = Depends(get_current_profile),
    settings: Settings = Depends(get_settings),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    user_client = SupabaseRestClient(settings, auth_token=profile.get("_auth_token"))
    event = await select_one(client, "events", {"id": f"eq.{event_id}"})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    if event.get("end_time") and str(event.get("end_time")) < datetime.now(timezone.utc).isoformat():
        raise HTTPException(status_code=400, detail="Scanner is closed because this event has ended.")
    if not await can_manage_event(user_client, profile, event):
        raise HTTPException(status_code=403, detail="You are not allowed to scan for this event.")
    ticket_code = payload.ticket_code.strip()
    if not ticket_code:
        raise HTTPException(status_code=400, detail="Ticket code is required.")
    registrations = await user_client.select(
        "event_registrations",
        columns="id,event_id,user_id,ticket_code,status,registered_at,checked_in_at",
        filters={"event_id": f"eq.{event_id}", "ticket_code": f"eq.{ticket_code}"},
        limit=1,
    )
    if not registrations:
        raise HTTPException(status_code=404, detail="Ticket not found for this event.")
    registration = registrations[0]
    attendee = await select_one(
        client,
        "profiles",
        {"id": f"eq.{registration.get('user_id')}"},
        columns="id,full_name,email",
    ) if registration.get("user_id") else None
    if registration.get("checked_in_at") or registration.get("status") == "checked_in":
        return {
            "message": "Ticket was already checked in.",
            "already_checked_in": True,
            "registration": registration,
            "profile": attendee,
        }
    rows = await user_client.update(
        "event_registrations",
        {"status": "checked_in", "checked_in_at": datetime.now(timezone.utc).isoformat()},
        filters={"id": f"eq.{registration['id']}"},
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Ticket not found for this event.")
    return {
        "message": "Ticket checked in.",
        "already_checked_in": False,
        "registration": rows[0],
        "profile": attendee,
    }


@app.get("/api/projects")
async def list_projects(
    status: str = Query("published"),
    client: SupabaseRestClient = Depends(get_supabase),
) -> list[dict[str, Any]]:
    try:
        return await client.select(
            "projects",
            filters={"status": f"eq.{status}"},
            order="published_at.desc",
        )
    except SupabaseRestError as exc:
        raise supabase_http_error(exc) from exc


@app.get("/api/blog-posts")
async def list_blog_posts(
    status: str = Query("published"),
    client: SupabaseRestClient = Depends(get_supabase),
) -> list[dict[str, Any]]:
    try:
        return await client.select(
            "blog_posts",
            filters={"status": f"eq.{status}"},
            order="published_at.desc",
        )
    except SupabaseRestError as exc:
        raise supabase_http_error(exc) from exc


@app.get("/api/gallery")
async def list_gallery(
    authorization: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
    client: SupabaseRestClient = Depends(get_supabase),
) -> list[dict[str, Any]]:
    try:
        rows = await client.select(
            "gallery_submissions",
            filters={"status": "in.(approved,published)"},
            order="created_at.desc",
        )
        profile = await optional_profile(authorization, settings, client)
        gallery_ids = [row.get("id") for row in rows if row.get("id")]
        like_counts: dict[str, int] = {}
        liked_ids: set[str] = set()
        if gallery_ids:
            service_client = get_privileged_supabase(settings, profile.get("_auth_token") if profile else None)
            try:
                likes = await service_client.select(
                    "gallery_likes",
                    columns="gallery_id,user_id",
                    filters={"gallery_id": f"in.({','.join(gallery_ids)})"},
                )
                for like in likes or []:
                    gallery_id = like.get("gallery_id")
                    if gallery_id:
                        like_counts[gallery_id] = like_counts.get(gallery_id, 0) + 1
                    if profile and like.get("user_id") == profile.get("id"):
                        liked_ids.add(gallery_id)
            except SupabaseRestError:
                like_counts = {}
                liked_ids = set()
        return [
            {
                **row,
                "likes_count": like_counts.get(row.get("id"), 0),
                "liked_by_me": row.get("id") in liked_ids,
            }
            for row in rows
        ]
    except SupabaseRestError as exc:
        raise supabase_http_error(exc) from exc


@app.post("/api/gallery/{gallery_id}/like")
async def toggle_gallery_like(
    gallery_id: str,
    profile: dict[str, Any] = Depends(get_current_profile),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    client = get_privileged_supabase(settings, profile.get("_auth_token"))
    gallery = await select_one(client, "gallery_submissions", {"id": f"eq.{gallery_id}"})
    if not gallery or gallery.get("status") not in {"approved", "published"}:
        raise HTTPException(status_code=404, detail="Gallery item not found.")
    existing = await client.select(
        "gallery_likes",
        columns="id",
        filters={"gallery_id": f"eq.{gallery_id}", "user_id": f"eq.{profile['id']}"},
        limit=1,
    )
    liked = False
    if existing:
        await client.delete("gallery_likes", filters={"id": f"eq.{existing[0]['id']}"})
    else:
        await client.insert("gallery_likes", {"gallery_id": gallery_id, "user_id": profile["id"]})
        liked = True
    likes = await client.select("gallery_likes", columns="id", filters={"gallery_id": f"eq.{gallery_id}"})
    return {"liked": liked, "likes_count": len(likes or [])}


@app.get("/api/partners")
async def list_partners(client: SupabaseRestClient = Depends(get_supabase)) -> list[dict[str, Any]]:
    try:
        return await client.select(
            "partner_submissions",
            filters={"status": "in.(approved,published)"},
            order="created_at.desc",
        )
    except SupabaseRestError as exc:
        raise supabase_http_error(exc) from exc


@app.get("/api/learning-materials")
async def list_learning_materials(client: SupabaseRestClient = Depends(get_supabase)) -> list[dict[str, Any]]:
    try:
        return await client.select(
            "learning_materials",
            filters={"status": "in.(approved,published)"},
            order="created_at.desc",
        )
    except SupabaseRestError as exc:
        raise supabase_http_error(exc) from exc


@app.get("/api/designation-options")
async def list_designation_options(client: SupabaseRestClient = Depends(get_supabase)) -> list[dict[str, Any]]:
    return await client.select(
        "designation_options",
        columns="id,label,is_active,sort_order",
        filters={"is_active": "eq.true"},
        order="sort_order.asc,label.asc",
    )


@app.get("/api/home-summary")
async def get_home_summary(
    settings: Settings = Depends(get_settings),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    events = await list_events(status="approved", settings=settings, client=client)
    projects = await list_projects(status="published", client=client)
    posts = await list_blog_posts(status="published", client=client)
    partners = await list_partners(client=client)
    service_client = get_privileged_supabase(settings)
    try:
        members = await service_client.select(
            "profiles",
            columns="id",
            filters={"membership_status": "in.(approved,published)"},
        )
    except SupabaseRestError:
        members = []
    settings_rows = await client.select("site_settings", filters={"key": "eq.site"}, limit=1)
    settings_value = settings_rows[0].get("value") if settings_rows else {}
    team_members = settings_value.get("teamMembers") if isinstance(settings_value, dict) else []
    member_count = len(members or []) or (len(team_members) if isinstance(team_members, list) else 0)
    today = date.today().isoformat()
    upcoming_events = [
        event for event in events
        if not event.get("start_time") or str(event.get("start_time")) >= today
    ][:8]
    return {
        "counts": {
            "events": len(events),
            "projects": len(projects),
            "blog_posts": len(posts),
            "partners": len(partners),
            "members": member_count,
        },
        "next_event": upcoming_events[0] if upcoming_events else (events[0] if events else None),
        "upcoming_events": upcoming_events,
        "featured_project": projects[0] if projects else None,
    }


@app.post("/api/contact-messages", status_code=201)
async def create_contact_message(
    payload: ContactMessageCreate,
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    client = get_privileged_supabase(settings)
    try:
        await client.insert("contact_messages", payload.model_dump(), return_representation=False)
    except SupabaseRestError as exc:
        if exc.status_code in {401, 403}:
            raise HTTPException(status_code=503, detail="Messages are temporarily unavailable. Please try again later.") from exc
        raise supabase_http_error(exc) from exc

    return {"message": "Message received."}


@app.get("/api/certificates/verify/{code}")
async def verify_certificate(
    code: str,
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    client = get_privileged_supabase(settings)
    try:
        row = await client.select(
            "public_certificates",
            filters={"verification_code": f"eq.{code}"},
            single=True,
        )
    except SupabaseRestError as exc:
        if exc.status_code == 406:
            raise HTTPException(status_code=404, detail="Certificate not found.") from exc
        if exc.status_code in {401, 403}:
            raise HTTPException(status_code=503, detail="Certificate verification is temporarily unavailable. Please try again later.") from exc
        raise supabase_http_error(exc) from exc

    return row


@app.get("/api/certificates/{certificate_id}")
async def get_certificate(
    certificate_id: str,
    profile: dict[str, Any] = Depends(get_current_profile),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    client = get_privileged_supabase(settings, profile.get("_auth_token"))
    row = await select_one(client, "certificates", {"id": f"eq.{certificate_id}"})
    if not row:
        raise HTTPException(status_code=404, detail="Certificate not found.")
    is_admin = profile.get("role") in {"admin", "president"} or "admin" in (profile.get("roles") or [])
    if not is_admin and row.get("member_id") != profile["id"] and row.get("recipient_id") != profile["id"]:
        raise HTTPException(status_code=403, detail="You do not have access to this certificate.")
    return normalize_certificate(row)


@app.get("/api/me")
async def get_me(profile: dict[str, Any] = Depends(get_current_profile)) -> dict[str, Any]:
    visible_profile = dict(profile)
    visible_profile.pop("_auth_token", None)
    return visible_profile


@app.patch("/api/me")
async def update_me(
    payload: GenericPayload,
    profile: dict[str, Any] = Depends(get_current_profile),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    client = get_privileged_supabase(settings, profile.get("_auth_token"))
    allowed = {
        "full_name",
        "bio",
        "designation",
        "batch_year",
        "major",
        "github_username",
        "linkedin_username",
        "profile_links",
        "skills",
        "student_email",
        "is_sms_student",
    }
    updates = {key: value for key, value in payload.data.items() if key in allowed}
    if "designation" in updates and updates.get("designation") != profile.get("designation"):
        updates["designation_status"] = "pending"
    rows = await client.update("profiles", updates, filters={"id": f"eq.{profile['id']}"})
    if not rows:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return rows[0]


@app.get("/api/me/submissions")
async def get_my_submissions(
    profile: dict[str, Any] = Depends(get_current_profile),
    settings: Settings = Depends(get_settings),
) -> dict[str, list[dict[str, Any]]]:
    client = get_privileged_supabase(settings, profile.get("_auth_token"))
    user_id = profile["id"]
    projects = await client.select("projects", filters={"author_id": f"eq.{user_id}"}, order="submitted_at.desc")
    blog_posts = await client.select("blog_posts", filters={"author_id": f"eq.{user_id}"}, order="published_at.desc")
    proposals = await client.select("event_proposals", filters={"proposed_by": f"eq.{user_id}"}, order="submitted_at.desc")
    gallery = await client.select("gallery_submissions", filters={"submitted_by": f"eq.{user_id}"}, order="created_at.desc")
    certificates = await client.select("certificates", filters={"member_id": f"eq.{user_id}"}, order="created_at.desc")
    return {
        "projects": projects,
        "blog_posts": blog_posts,
        "event_proposals": proposals,
        "gallery_submissions": gallery,
        "certificates": [normalize_certificate(row) for row in certificates],
    }


@app.get("/api/me/certificates")
async def get_my_certificates(
    profile: dict[str, Any] = Depends(get_current_profile),
    settings: Settings = Depends(get_settings),
) -> list[dict[str, Any]]:
    client = get_privileged_supabase(settings, profile.get("_auth_token"))
    rows = await client.select(
        "certificates",
        filters={"member_id": f"eq.{profile['id']}"},
        order="created_at.desc",
    )
    if not rows:
        rows = await client.select(
            "certificates",
            filters={"recipient_id": f"eq.{profile['id']}"},
            order="created_at.desc",
        )
    return [normalize_certificate(row) for row in rows]


@app.post("/api/submissions/event-proposals", status_code=201)
async def submit_event_proposal(
    payload: EventProposalCreate,
    profile: dict[str, Any] = Depends(get_current_profile),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    client = get_privileged_supabase(settings, profile.get("_auth_token"))
    await ensure_not_duplicate(
        client,
        "event_proposals",
        owner_column="proposed_by",
        owner_id=profile["id"],
        title=payload.title,
    )
    row = await client.insert(
        "event_proposals",
        {
            **payload.model_dump(),
            "coordinator_emails": [str(email) for email in payload.coordinator_emails],
            "proposed_by": profile["id"],
            "status": "pending",
        },
    )
    return row[0]


@app.post("/api/submissions/projects", status_code=201)
async def submit_project(
    payload: ProjectCreate,
    profile: dict[str, Any] = Depends(get_current_profile),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    client = get_privileged_supabase(settings, profile.get("_auth_token"))
    await ensure_not_duplicate(client, "projects", owner_column="author_id", owner_id=profile["id"], title=payload.title)
    row = await client.insert("projects", {**payload.model_dump(), "author_id": profile["id"], "status": "submitted"})
    return row[0]


@app.post("/api/submissions/blog-posts", status_code=201)
async def submit_blog_post(
    payload: BlogPostCreate,
    profile: dict[str, Any] = Depends(get_current_profile),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    client = get_privileged_supabase(settings, profile.get("_auth_token"))
    await ensure_not_duplicate(client, "blog_posts", owner_column="author_id", owner_id=profile["id"], title=payload.title)
    row = await client.insert("blog_posts", {**payload.model_dump(), "author_id": profile["id"], "status": "submitted"})
    return row[0]


@app.post("/api/submissions/gallery", status_code=201)
async def submit_gallery(
    payload: GallerySubmissionCreate,
    profile: dict[str, Any] = Depends(get_current_profile),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    client = get_privileged_supabase(settings, profile.get("_auth_token"))
    existing = await client.select(
        "gallery_submissions",
        columns="id",
        filters={
            "submitted_by": f"eq.{profile['id']}",
            "image_url": f"eq.{payload.image_url}",
            "status": "in.(pending,approved,published)",
        },
        limit=1,
    )
    if existing:
        raise HTTPException(status_code=409, detail="This photo was already submitted.")
    row = await client.insert(
        "gallery_submissions",
        {**payload.model_dump(), "submitted_by": profile["id"], "status": "pending"},
    )
    return row[0]


@app.get("/api/admin/resources/{resource}")
async def admin_list_resource(
    resource: str,
    status: str | None = None,
    profile: dict[str, Any] = Depends(get_current_profile),
    settings: Settings = Depends(get_settings),
    client: SupabaseRestClient = Depends(get_supabase),
) -> list[dict[str, Any]]:
    user_client = get_user_supabase(settings, profile)
    service_client = get_privileged_supabase(settings, profile.get("_auth_token")) if resource == "profiles" and is_full_admin(profile) else None
    return await list_accessible_resource(user_client, profile, resource, status, service_client=service_client)


@app.get("/api/admin/audit-logs")
async def admin_list_audit_logs(
    profile: dict[str, Any] = Depends(require_admin),
    settings: Settings = Depends(get_settings),
    client: SupabaseRestClient = Depends(get_supabase),
) -> list[dict[str, Any]]:
    user_client = get_privileged_supabase(settings, profile.get("_auth_token"))
    try:
        return await user_client.select("audit_logs", order="created_at.desc", limit=250)
    except SupabaseRestError as exc:
        if exc.status_code in {404, 400}:
            return []
        raise supabase_http_error(exc) from exc


@app.post("/api/admin/resources/{resource}", status_code=201)
async def admin_create_resource(
    resource: str,
    payload: GenericPayload,
    profile: dict[str, Any] = Depends(get_current_profile),
    settings: Settings = Depends(get_settings),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    user_client = get_user_supabase(settings, profile)
    await require_resource_access(user_client, profile, resource, action="create")
    table = table_for_resource(resource)
    data = dict(payload.data)
    if not is_full_admin(profile):
        if resource == "events":
            data["created_by"] = profile["id"]
        elif resource in {"projects", "blog-posts"}:
            data["author_id"] = profile["id"]
        elif resource == "event-proposals":
            data["proposed_by"] = profile["id"]
    rows = await user_client.insert(table, data)
    row = rows[0] if rows else {}
    await write_audit_log(
        user_client,
        profile,
        action="create",
        resource=resource,
        resource_id=str(row.get("id") or ""),
        summary=audit_summary("create", resource, row),
        metadata={"table": table},
    )
    return row


@app.patch("/api/admin/resources/{resource}/{item_id}")
async def admin_update_resource(
    resource: str,
    item_id: str,
    payload: GenericPayload,
    profile: dict[str, Any] = Depends(get_current_profile),
    settings: Settings = Depends(get_settings),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    user_client = get_user_supabase(settings, profile)
    await require_resource_access(user_client, profile, resource, item_id=item_id, action="update")
    table = table_for_resource(resource)
    data = dict(payload.data)
    if not is_full_admin(profile):
        for protected_key in ("created_by", "author_id", "proposed_by", "reviewed_by", "role", "roles"):
            data.pop(protected_key, None)
        if resource in {"projects", "blog-posts"} and data.get("status") == "published":
            data["status"] = "submitted"
        if resource == "events":
            data.pop("status", None)
    rows = await user_client.update(table, data, filters={"id": f"eq.{item_id}"})
    if not rows:
        raise HTTPException(status_code=404, detail="Item not found.")
    row = rows[0]
    await write_audit_log(
        user_client,
        profile,
        action="update",
        resource=resource,
        resource_id=item_id,
        summary=audit_summary("update", resource, row, item_id),
        metadata={"table": table, "changed_fields": sorted(data.keys())},
    )
    return row


@app.patch("/api/admin/resources/{resource}/{item_id}/status")
async def admin_update_resource_status(
    resource: str,
    item_id: str,
    payload: StatusUpdate,
    profile: dict[str, Any] = Depends(get_current_profile),
    settings: Settings = Depends(get_settings),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    user_client = get_user_supabase(settings, profile)
    await require_resource_access(user_client, profile, resource, item_id=item_id, action="status")
    if not is_full_admin(profile):
        raise HTTPException(status_code=403, detail="Only admins can approve, publish, archive, or restore items.")
    table = table_for_resource(resource)
    rows = await user_client.update(table, {"status": payload.status}, filters={"id": f"eq.{item_id}"})
    if not rows:
        raise HTTPException(status_code=404, detail="Item not found.")
    row = rows[0]
    await write_audit_log(
        user_client,
        profile,
        action="status_update",
        resource=resource,
        resource_id=item_id,
        summary=f"Set {resource.replace('-', ' ')} status to {payload.status}",
        metadata={"table": table, "status": payload.status},
    )
    return row


@app.delete("/api/admin/resources/{resource}/{item_id}")
async def admin_delete_resource(
    resource: str,
    item_id: str,
    profile: dict[str, Any] = Depends(get_current_profile),
    settings: Settings = Depends(get_settings),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, str]:
    user_client = get_user_supabase(settings, profile)
    await require_resource_access(user_client, profile, resource, item_id=item_id, action="delete")
    if not is_full_admin(profile) and resource not in {"events", "projects", "blog-posts"}:
        raise HTTPException(status_code=403, detail="Only admins can delete this item.")
    table = table_for_resource(resource)
    await user_client.delete(table, filters={"id": f"eq.{item_id}"})
    await write_audit_log(
        user_client,
        profile,
        action="delete",
        resource=resource,
        resource_id=item_id,
        summary=audit_summary("delete", resource, None, item_id),
        metadata={"table": table},
    )
    return {"message": "Deleted."}


@app.get("/api/admin/events/{event_id}/staff")
async def admin_event_staff(
    event_id: str,
    profile: dict[str, Any] = Depends(get_current_profile),
    client: SupabaseRestClient = Depends(get_supabase),
) -> list[dict[str, Any]]:
    event = await select_one(client, "events", {"id": f"eq.{event_id}"})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    if not await can_manage_event(client, profile, event):
        raise HTTPException(status_code=403, detail="You can only manage staff for your own events.")
    return await client.select(
        "event_staff",
        columns="id,event_id,user_id,email,staff_role,can_scan,created_by,created_at",
        filters={"event_id": f"eq.{event_id}"},
        order="created_at.asc",
    )


@app.put("/api/admin/events/{event_id}/staff")
async def admin_replace_event_staff(
    event_id: str,
    payload: EventStaffUpdate,
    profile: dict[str, Any] = Depends(get_current_profile),
    client: SupabaseRestClient = Depends(get_supabase),
) -> list[dict[str, Any]]:
    event = await select_one(client, "events", {"id": f"eq.{event_id}"})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    if not await can_manage_event(client, profile, event):
        raise HTTPException(status_code=403, detail="You can only manage staff for your own events.")
    await client.delete("event_staff", filters={"event_id": f"eq.{event_id}", "staff_role": "eq.coordinator"})
    rows = [
        {
            "event_id": event_id,
            "email": str(email).lower(),
            "staff_role": "coordinator",
            "can_scan": True,
            "created_by": profile["id"],
        }
        for email in payload.emails
    ]
    if not rows:
        return []

    created: list[dict[str, Any]] = []
    for row in rows:
        created.extend(await client.upsert("event_staff", row, on_conflict="event_id,email") or [])
    await write_audit_log(
        client,
        profile,
        action="update_staff",
        resource="events",
        resource_id=event_id,
        summary=f"Updated event coordinators for {event.get('title') or event_id}",
        metadata={"emails": [row["email"] for row in rows]},
    )
    return created


@app.post("/api/admin/event-proposals/{proposal_id}/create-event")
async def admin_create_event_from_proposal(
    proposal_id: str,
    profile: dict[str, Any] = Depends(require_admin),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    proposal = await select_one(client, "event_proposals", {"id": f"eq.{proposal_id}"})
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found.")
    if proposal.get("status") != "pending":
        raise HTTPException(status_code=400, detail="This proposal has already been reviewed.")

    proposed_start = proposal.get("proposed_date")
    duplicate_filters = {"title": f"eq.{proposal.get('title')}"}
    if proposed_start:
        duplicate_filters["start_time"] = f"eq.{proposed_start}"
    existing = await client.select("events", columns="id", filters=duplicate_filters, limit=1)
    if existing:
        await client.update("event_proposals", {"status": "approved"}, filters={"id": f"eq.{proposal_id}"})
        return {"event_id": existing[0]["id"], "status": "already_exists"}

    slug = str(proposal.get("title") or "event").lower()
    slug = "".join(ch if ch.isalnum() else "-" for ch in slug).strip("-")
    slug = f"{slug}-{proposal_id[:8]}"
    event_rows = await client.insert(
        "events",
        {
            "title": proposal.get("title"),
            "slug": slug,
            "event_type": proposal.get("event_type") or "WORKSHOP",
            "short_description": (proposal.get("summary") or "")[:160],
            "description": proposal.get("summary") or "",
            "start_time": proposed_start,
            "venue": proposal.get("venue"),
            "capacity": proposal.get("capacity") or 40,
            "status": "approved",
            "registration_open": True,
            "created_by": proposal.get("proposed_by") or profile["id"],
        },
    )
    event_row = event_rows[0]

    proposer = await select_one(client, "profiles", {"id": f"eq.{proposal.get('proposed_by')}"}) if proposal.get("proposed_by") else None
    staff_rows = []
    proposer_email = (proposer or {}).get("email") or profile.get("email")
    if proposer_email:
        staff_rows.append(
            {
                "event_id": event_row["id"],
                "user_id": proposal.get("proposed_by"),
                "email": proposer_email,
                "staff_role": "organizer",
                "can_scan": True,
                "created_by": profile["id"],
            }
        )
    for email in proposal.get("coordinator_emails") or []:
        staff_rows.append(
            {
                "event_id": event_row["id"],
                "email": str(email).lower(),
                "staff_role": "coordinator",
                "can_scan": True,
                "created_by": profile["id"],
            }
        )
    for staff in staff_rows:
        await client.upsert("event_staff", staff, on_conflict="event_id,email")

    await client.update("event_proposals", {"status": "approved"}, filters={"id": f"eq.{proposal_id}"})
    await write_audit_log(
        client,
        profile,
        action="create_from_proposal",
        resource="events",
        resource_id=str(event_row.get("id") or ""),
        summary=f"Created event from proposal: {event_row.get('title') or proposal_id}",
        metadata={"proposal_id": proposal_id},
    )
    return {"event_id": event_row["id"], "status": "created", "event": event_row}


@app.put("/api/admin/site-settings")
async def admin_update_site_settings(
    payload: SiteSettingsUpdate,
    profile: dict[str, Any] = Depends(require_admin),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    rows = await client.upsert(
        "site_settings",
        {"key": "site", "value": payload.value, "updated_by": profile["id"]},
        on_conflict="key",
    )
    row = rows[0] if rows else {"key": "site", "value": payload.value}
    await write_audit_log(
        client,
        profile,
        action="update",
        resource="site-settings",
        resource_id="site",
        summary="Updated site settings",
        metadata={"sections": sorted(payload.value.keys()) if isinstance(payload.value, dict) else []},
    )
    return row


@app.get("/api/admin/contacts")
async def admin_list_contacts(
    _: dict[str, Any] = Depends(require_admin),
    client: SupabaseRestClient = Depends(get_supabase),
) -> list[dict[str, Any]]:
    return await client.select("contact_messages", order="created_at.desc")


@app.patch("/api/admin/contacts/{message_id}/status")
async def admin_update_contact_status(
    message_id: str,
    payload: StatusUpdate,
    profile: dict[str, Any] = Depends(require_admin),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    rows = await client.update("contact_messages", {"status": payload.status}, filters={"id": f"eq.{message_id}"})
    if not rows:
        raise HTTPException(status_code=404, detail="Message not found.")
    row = rows[0]
    await write_audit_log(
        client,
        profile,
        action="status_update",
        resource="contact-messages",
        resource_id=message_id,
        summary=f"Set contact message status to {payload.status}",
        metadata={"status": payload.status},
    )
    return row


@app.delete("/api/admin/contacts/{message_id}")
async def admin_delete_contact(
    message_id: str,
    profile: dict[str, Any] = Depends(require_admin),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, str]:
    await client.delete("contact_messages", filters={"id": f"eq.{message_id}"})
    await write_audit_log(
        client,
        profile,
        action="delete",
        resource="contact-messages",
        resource_id=message_id,
        summary=f"Deleted contact message {message_id}",
    )
    return {"message": "Deleted."}


@app.get("/api/admin/events/{event_id}/certificate-queue")
async def admin_certificate_queue(
    event_id: str,
    profile: dict[str, Any] = Depends(require_admin),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    client = get_privileged_supabase(settings, profile.get("_auth_token"))
    event = await select_one(client, "events", {"id": f"eq.{event_id}"})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    registrations = await client.select(
        "event_registrations",
        columns="id,event_id,user_id,status,checked_in_at,profiles:user_id(id,full_name,email)",
        filters={"event_id": f"eq.{event_id}"},
        order="registered_at.asc",
    )
    certs = await client.select(
        "certificates",
        columns="id,member_id,event_id,status,verification_code,recipient_name_snapshot",
        filters={"event_id": f"eq.{event_id}"},
    )
    issued_by_member = {row.get("member_id"): row for row in certs if row.get("member_id")}
    queue = []
    for registration in registrations:
        profile = registration.get("profiles") or {}
        member_id = registration.get("user_id")
        cert = issued_by_member.get(member_id)
        checked_in = registration.get("status") == "checked_in" or bool(registration.get("checked_in_at"))
        queue.append(
            {
                **registration,
                "attendee_name": profile.get("full_name") or profile.get("email") or "Unknown attendee",
                "queue_status": "issued" if cert else ("ready" if checked_in else "registered"),
                "certificate": cert,
            }
        )
    return {"event_id": event_id, "queue": queue, "certificates": [normalize_certificate(row) for row in certs]}


@app.post("/api/admin/certificates/issue", status_code=201)
async def admin_issue_certificate(
    payload: CertificateIssue,
    profile: dict[str, Any] = Depends(require_admin),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    client = get_privileged_supabase(settings, profile.get("_auth_token"))
    event = await select_one(client, "events", {"id": f"eq.{payload.event_id}"})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    certificate = await issue_certificate_row(client, payload)
    await write_audit_log(
        client,
        profile,
        action="issue",
        resource="certificates",
        resource_id=str(certificate.get("id") or ""),
        summary=f"Issued certificate {certificate.get('verification_code') or ''} to {certificate.get('recipient_name_snapshot') or payload.member_id}",
        metadata={"event_id": payload.event_id, "member_id": payload.member_id},
    )
    return certificate


@app.post("/api/admin/certificates/issue-checked-in")
async def admin_issue_checked_in_certificates(
    payload: CertificateBulkIssue,
    profile: dict[str, Any] = Depends(require_admin),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    admin_profile = profile
    client = get_privileged_supabase(settings, profile.get("_auth_token"))
    event = await select_one(client, "events", {"id": f"eq.{payload.event_id}"})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    registrations = await client.select(
        "event_registrations",
        columns="user_id,status,checked_in_at,profiles:user_id(full_name,email)",
        filters={"event_id": f"eq.{payload.event_id}"},
    )
    success: list[dict[str, Any]] = []
    skipped: list[str] = []
    failed: list[str] = []

    for registration in registrations:
        if not (registration.get("status") == "checked_in" or registration.get("checked_in_at")):
            continue
        member_id = registration.get("user_id")
        attendee_profile = registration.get("profiles") or {}
        label = attendee_profile.get("full_name") or attendee_profile.get("email") or member_id or "Unknown attendee"
        if not member_id:
            failed.append(f"{label}: missing member id")
            continue
        try:
            cert = await issue_certificate_row(
                client,
                CertificateIssue(
                    **payload.model_dump(),
                    member_id=member_id,
                    event_id=payload.event_id,
                    recipient_name_snapshot=label,
                ),
            )
            success.append(cert)
        except HTTPException as exc:
            if exc.status_code == 409:
                skipped.append(label)
            else:
                failed.append(f"{label}: {exc.detail}")

    await write_audit_log(
        client,
        admin_profile,
        action="bulk_issue",
        resource="certificates",
        resource_id=payload.event_id,
        summary=f"Bulk certificate issue: {len(success)} issued, {len(skipped)} skipped, {len(failed)} failed",
        metadata={"event_id": payload.event_id, "issued": len(success), "skipped": skipped, "failed": failed},
    )
    return {"success": success, "skipped": skipped, "failed": failed}


@app.get("/api/admin/events/{event_id}/certificates")
async def admin_event_certificates(
    event_id: str,
    profile: dict[str, Any] = Depends(require_admin),
    settings: Settings = Depends(get_settings),
) -> list[dict[str, Any]]:
    client = get_privileged_supabase(settings, profile.get("_auth_token"))
    event = await select_one(client, "events", {"id": f"eq.{event_id}"})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    rows = await client.select(
        "certificates",
        filters={"event_id": f"eq.{event_id}"},
        order="created_at.desc",
    )
    return [normalize_certificate(row) for row in rows]


@app.patch("/api/admin/certificates/{certificate_id}")
async def admin_update_certificate(
    certificate_id: str,
    payload: CertificateUpdate,
    profile: dict[str, Any] = Depends(require_admin),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    client = get_privileged_supabase(settings, profile.get("_auth_token"))
    certificate = await select_one(client, "certificates", {"id": f"eq.{certificate_id}"})
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found.")
    data = payload.model_dump(exclude_unset=True)
    if "signature_data" in data and data["signature_data"] is not None:
        data["signature_data"] = [signature.model_dump() for signature in payload.signature_data or []]
    rows = await client.update("certificates", data, filters={"id": f"eq.{certificate_id}"})
    if not rows:
        raise HTTPException(status_code=404, detail="Certificate not found.")
    certificate = normalize_certificate(rows[0])
    await write_audit_log(
        client,
        profile,
        action="update",
        resource="certificates",
        resource_id=certificate_id,
        summary=f"Updated certificate {certificate.get('verification_code') or certificate_id}",
        metadata={"changed_fields": sorted(data.keys())},
    )
    return certificate


@app.post("/api/admin/certificates/{certificate_id}/revoke")
async def admin_revoke_certificate(
    certificate_id: str,
    profile: dict[str, Any] = Depends(require_admin),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    client = get_privileged_supabase(settings, profile.get("_auth_token"))
    certificate = await select_one(client, "certificates", {"id": f"eq.{certificate_id}"})
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found.")
    rows = await client.update("certificates", {"status": "revoked"}, filters={"id": f"eq.{certificate_id}"})
    if not rows:
        raise HTTPException(status_code=404, detail="Certificate not found.")
    certificate = normalize_certificate(rows[0])
    await write_audit_log(
        client,
        profile,
        action="revoke",
        resource="certificates",
        resource_id=certificate_id,
        summary=f"Revoked certificate {certificate.get('verification_code') or certificate_id}",
    )
    return certificate


@app.delete("/api/admin/certificates/{certificate_id}")
async def admin_delete_certificate(
    certificate_id: str,
    profile: dict[str, Any] = Depends(require_admin),
    settings: Settings = Depends(get_settings),
) -> dict[str, str]:
    client = get_privileged_supabase(settings, profile.get("_auth_token"))
    cert = await select_one(client, "certificates", {"id": f"eq.{certificate_id}"})
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")
    if cert.get("status") != "revoked":
        raise HTTPException(status_code=400, detail="Only revoked certificates can be deleted.")
    await client.delete("certificates", filters={"id": f"eq.{certificate_id}"})
    await write_audit_log(
        client,
        profile,
        action="delete",
        resource="certificates",
        resource_id=certificate_id,
        summary=f"Deleted revoked certificate {cert.get('verification_code') or certificate_id}",
    )
    return {"message": "Deleted."}
