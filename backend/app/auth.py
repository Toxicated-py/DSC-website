from __future__ import annotations

from typing import Any

import httpx
from fastapi import Depends, Header, HTTPException

from .config import Settings, get_settings
from .supabase_rest import SupabaseRestClient, SupabaseRestError
from .http_client import get_http_client


ADMIN_ROLES = {"admin", "president"}


def _token_from_header(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Login required.")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid authorization header.")
    return token


async def get_current_user(
    authorization: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    token = _token_from_header(authorization)
    if not settings.is_supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured.")

    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/user"
    headers = {
        "apikey": settings.supabase_key,
        "authorization": f"Bearer {token}",
    }
    response = await get_http_client().get(url, headers=headers)

    if response.status_code >= 400:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")
    return response.json()


async def get_current_profile(
    user: dict[str, Any] = Depends(get_current_user),
    authorization: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    token = _token_from_header(authorization)
    client = SupabaseRestClient(settings, get_http_client(), auth_token=token)
    user_id = user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid session.")

    try:
        profile = await client.select(
            "profiles",
            filters={"id": f"eq.{user_id}"},
            single=True,
        )
    except SupabaseRestError as exc:
        if exc.status_code == 406:
            email = user.get("email") or ""
            metadata = user.get("user_metadata") or {}
            full_name = metadata.get("full_name") or metadata.get("name") or email.split("@")[0] or "Member"
            phone = metadata.get("phone") or user.get("phone")
            roles = ["member", "student"] if email.lower().endswith("@sms.tu.edu.np") else ["member"]
            try:
                try:
                    write_client = SupabaseRestClient(settings, get_http_client(), use_service_role=True)
                except SupabaseRestError:
                    write_client = client
                rows = await write_client.insert(
                    "profiles",
                    {
                        "id": user_id,
                        "email": email,
                        "full_name": full_name,
                        "phone": phone or None,
                        "role": "member",
                        "roles": roles,
                        "membership_status": "approved",
                    },
                )
            except SupabaseRestError as insert_exc:
                raise HTTPException(status_code=403, detail="Your account profile could not be prepared. Please try again.") from insert_exc
            profile = rows[0] if rows else None
            if not profile:
                raise HTTPException(status_code=403, detail="Profile could not be created.") from exc
        else:
            raise HTTPException(status_code=exc.status_code, detail="Could not load your account profile. Please try again.") from exc

    profile["_auth_token"] = token
    return profile


def profile_roles(profile: dict[str, Any]) -> set[str]:
    roles = set()
    role = profile.get("role")
    if isinstance(role, str):
        roles.add(role.lower())
    for item in profile.get("roles") or []:
        if isinstance(item, str):
            roles.add(item.lower())
    return roles


async def require_admin(profile: dict[str, Any] = Depends(get_current_profile)) -> dict[str, Any]:
    if not (profile_roles(profile) & ADMIN_ROLES):
        raise HTTPException(status_code=403, detail="Admin access required.")
    return profile
