from __future__ import annotations

from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .config import Settings, get_settings
from .schemas import ApiStatus, ContactMessageCreate
from .supabase_rest import SupabaseRestClient, SupabaseRestError


def supabase_http_error(exc: SupabaseRestError) -> HTTPException:
    return HTTPException(status_code=exc.status_code, detail=str(exc))


def get_supabase(settings: Settings = Depends(get_settings)) -> SupabaseRestClient:
    try:
        return SupabaseRestClient(settings)
    except SupabaseRestError as exc:
        raise supabase_http_error(exc) from exc


settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")

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
            filters={"status": "eq.approved"},
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
            filters={"status": "eq.published"},
            order="created_at.desc",
        )
    except SupabaseRestError as exc:
        raise supabase_http_error(exc) from exc


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
