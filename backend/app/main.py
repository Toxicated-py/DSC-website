from __future__ import annotations

from datetime import date
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .auth import get_current_profile, require_admin
from .config import Settings, get_settings
from .schemas import (
    ApiStatus,
    BlogPostCreate,
    CertificateBulkIssue,
    CertificateIssue,
    CertificateUpdate,
    ContactMessageCreate,
    EventProposalCreate,
    GallerySubmissionCreate,
    GenericPayload,
    ProjectCreate,
    SiteSettingsUpdate,
    StatusUpdate,
)
from .supabase_rest import SupabaseRestClient, SupabaseRestError


def supabase_http_error(exc: SupabaseRestError) -> HTTPException:
    return HTTPException(status_code=exc.status_code, detail=str(exc))


def get_supabase(settings: Settings = Depends(get_settings)) -> SupabaseRestClient:
    try:
        return SupabaseRestClient(settings)
    except SupabaseRestError as exc:
        raise supabase_http_error(exc) from exc


async def select_one(client: SupabaseRestClient, table: str, filters: dict[str, str]) -> dict[str, Any] | None:
    try:
        return await client.select(table, filters=filters, single=True)
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


def table_for_resource(resource: str) -> str:
    table = ADMIN_TABLES.get(resource)
    if not table:
        raise HTTPException(status_code=404, detail="Unknown admin resource.")
    return table


def normalize_certificate(row: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(row.get("signature_data"), list):
        row["signature_data"] = []
    return row


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

    return row.get("value") if isinstance(row, dict) else {}


@app.get("/api/events")
async def list_events(
    status: str = Query("approved"),
    client: SupabaseRestClient = Depends(get_supabase),
) -> list[dict[str, Any]]:
    try:
        return await client.select(
            "events",
            filters={"status": f"eq.{status}"},
            order="start_time.asc",
        )
    except SupabaseRestError as exc:
        raise supabase_http_error(exc) from exc


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
async def list_gallery(client: SupabaseRestClient = Depends(get_supabase)) -> list[dict[str, Any]]:
    try:
        return await client.select(
            "gallery_submissions",
            filters={"status": "in.(approved,published)"},
            order="created_at.desc",
        )
    except SupabaseRestError as exc:
        raise supabase_http_error(exc) from exc


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
async def get_home_summary(client: SupabaseRestClient = Depends(get_supabase)) -> dict[str, Any]:
    events = await list_events(status="approved", client=client)
    projects = await list_projects(status="published", client=client)
    posts = await list_blog_posts(status="published", client=client)
    partners = await list_partners(client=client)
    return {
        "counts": {
            "events": len(events),
            "projects": len(projects),
            "blog_posts": len(posts),
            "partners": len(partners),
        },
        "next_event": events[0] if events else None,
        "featured_project": projects[0] if projects else None,
    }


@app.post("/api/contact-messages", status_code=201)
async def create_contact_message(
    payload: ContactMessageCreate,
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    try:
        rows = await client.insert("contact_messages", payload.model_dump())
    except SupabaseRestError as exc:
        raise supabase_http_error(exc) from exc

    return {"message": "Message received.", "data": rows[0] if rows else None}


@app.get("/api/certificates/verify/{code}")
async def verify_certificate(
    code: str,
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    try:
        row = await client.select(
            "public_certificates",
            filters={"verification_code": f"eq.{code}"},
            single=True,
        )
    except SupabaseRestError as exc:
        if exc.status_code == 406:
            raise HTTPException(status_code=404, detail="Certificate not found.") from exc
        raise supabase_http_error(exc) from exc

    return row


@app.get("/api/me")
async def get_me(profile: dict[str, Any] = Depends(get_current_profile)) -> dict[str, Any]:
    return profile


@app.patch("/api/me")
async def update_me(
    payload: GenericPayload,
    profile: dict[str, Any] = Depends(get_current_profile),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    allowed = {
        "full_name",
        "bio",
        "designation",
        "batch_year",
        "major",
        "github_username",
        "linkedin_username",
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
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, list[dict[str, Any]]]:
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


@app.post("/api/submissions/event-proposals", status_code=201)
async def submit_event_proposal(
    payload: EventProposalCreate,
    profile: dict[str, Any] = Depends(get_current_profile),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
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
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    await ensure_not_duplicate(client, "projects", owner_column="author_id", owner_id=profile["id"], title=payload.title)
    row = await client.insert("projects", {**payload.model_dump(), "author_id": profile["id"], "status": "submitted"})
    return row[0]


@app.post("/api/submissions/blog-posts", status_code=201)
async def submit_blog_post(
    payload: BlogPostCreate,
    profile: dict[str, Any] = Depends(get_current_profile),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    await ensure_not_duplicate(client, "blog_posts", owner_column="author_id", owner_id=profile["id"], title=payload.title)
    row = await client.insert("blog_posts", {**payload.model_dump(), "author_id": profile["id"], "status": "submitted"})
    return row[0]


@app.post("/api/submissions/gallery", status_code=201)
async def submit_gallery(
    payload: GallerySubmissionCreate,
    profile: dict[str, Any] = Depends(get_current_profile),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
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
    _: dict[str, Any] = Depends(require_admin),
    client: SupabaseRestClient = Depends(get_supabase),
) -> list[dict[str, Any]]:
    table = table_for_resource(resource)
    filters = {"status": f"eq.{status}"} if status else None
    return await client.select(table, filters=filters, order=RESOURCE_ORDER.get(table))


@app.post("/api/admin/resources/{resource}", status_code=201)
async def admin_create_resource(
    resource: str,
    payload: GenericPayload,
    _: dict[str, Any] = Depends(require_admin),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    table = table_for_resource(resource)
    rows = await client.insert(table, payload.data)
    return rows[0] if rows else {}


@app.patch("/api/admin/resources/{resource}/{item_id}")
async def admin_update_resource(
    resource: str,
    item_id: str,
    payload: GenericPayload,
    _: dict[str, Any] = Depends(require_admin),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    table = table_for_resource(resource)
    rows = await client.update(table, payload.data, filters={"id": f"eq.{item_id}"})
    if not rows:
        raise HTTPException(status_code=404, detail="Item not found.")
    return rows[0]


@app.patch("/api/admin/resources/{resource}/{item_id}/status")
async def admin_update_resource_status(
    resource: str,
    item_id: str,
    payload: StatusUpdate,
    _: dict[str, Any] = Depends(require_admin),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    table = table_for_resource(resource)
    rows = await client.update(table, {"status": payload.status}, filters={"id": f"eq.{item_id}"})
    if not rows:
        raise HTTPException(status_code=404, detail="Item not found.")
    return rows[0]


@app.delete("/api/admin/resources/{resource}/{item_id}")
async def admin_delete_resource(
    resource: str,
    item_id: str,
    _: dict[str, Any] = Depends(require_admin),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, str]:
    table = table_for_resource(resource)
    await client.delete(table, filters={"id": f"eq.{item_id}"})
    return {"message": "Deleted."}


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
    return rows[0] if rows else {"key": "site", "value": payload.value}


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
    _: dict[str, Any] = Depends(require_admin),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    rows = await client.update("contact_messages", {"status": payload.status}, filters={"id": f"eq.{message_id}"})
    if not rows:
        raise HTTPException(status_code=404, detail="Message not found.")
    return rows[0]


@app.delete("/api/admin/contacts/{message_id}")
async def admin_delete_contact(
    message_id: str,
    _: dict[str, Any] = Depends(require_admin),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, str]:
    await client.delete("contact_messages", filters={"id": f"eq.{message_id}"})
    return {"message": "Deleted."}


@app.get("/api/admin/events/{event_id}/certificate-queue")
async def admin_certificate_queue(
    event_id: str,
    _: dict[str, Any] = Depends(require_admin),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
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
    _: dict[str, Any] = Depends(require_admin),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    return await issue_certificate_row(client, payload)


@app.post("/api/admin/certificates/issue-checked-in")
async def admin_issue_checked_in_certificates(
    payload: CertificateBulkIssue,
    _: dict[str, Any] = Depends(require_admin),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
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
        profile = registration.get("profiles") or {}
        label = profile.get("full_name") or profile.get("email") or member_id or "Unknown attendee"
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

    return {"success": success, "skipped": skipped, "failed": failed}


@app.patch("/api/admin/certificates/{certificate_id}")
async def admin_update_certificate(
    certificate_id: str,
    payload: CertificateUpdate,
    _: dict[str, Any] = Depends(require_admin),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    data = payload.model_dump(exclude_unset=True)
    if "signature_data" in data and data["signature_data"] is not None:
        data["signature_data"] = [signature.model_dump() for signature in payload.signature_data or []]
    rows = await client.update("certificates", data, filters={"id": f"eq.{certificate_id}"})
    if not rows:
        raise HTTPException(status_code=404, detail="Certificate not found.")
    return normalize_certificate(rows[0])


@app.post("/api/admin/certificates/{certificate_id}/revoke")
async def admin_revoke_certificate(
    certificate_id: str,
    _: dict[str, Any] = Depends(require_admin),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, Any]:
    rows = await client.update("certificates", {"status": "revoked"}, filters={"id": f"eq.{certificate_id}"})
    if not rows:
        raise HTTPException(status_code=404, detail="Certificate not found.")
    return normalize_certificate(rows[0])


@app.delete("/api/admin/certificates/{certificate_id}")
async def admin_delete_certificate(
    certificate_id: str,
    _: dict[str, Any] = Depends(require_admin),
    client: SupabaseRestClient = Depends(get_supabase),
) -> dict[str, str]:
    cert = await select_one(client, "certificates", {"id": f"eq.{certificate_id}"})
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")
    if cert.get("status") != "revoked":
        raise HTTPException(status_code=400, detail="Only revoked certificates can be deleted.")
    await client.delete("certificates", filters={"id": f"eq.{certificate_id}"})
    return {"message": "Deleted."}
