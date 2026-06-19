from __future__ import annotations

from typing import Any
from urllib.parse import urlencode

import httpx

from .config import Settings


class SupabaseRestError(RuntimeError):
    def __init__(self, message: str, status_code: int = 500) -> None:
        super().__init__(message)
        self.status_code = status_code


class SupabaseRestClient:
    def __init__(self, settings: Settings, http_client: httpx.AsyncClient, *, auth_token: str | None = None, use_service_role: bool = False) -> None:
        if not settings.is_supabase_configured:
            raise SupabaseRestError("Supabase is not configured for the Python API.", 503)
        if use_service_role and not settings.supabase_service_role_key:
            raise SupabaseRestError("Supabase service role key is not configured for this backend operation.", 503)

        self.base_url = settings.supabase_url.rstrip("/")
        api_key = settings.supabase_service_role_key if use_service_role else settings.supabase_key
        bearer_token = settings.supabase_service_role_key if use_service_role else auth_token or settings.supabase_key
        self.admin_rpc_secret = settings.admin_rpc_secret
        self.headers = {
            "apikey": api_key,
            "authorization": f"Bearer {bearer_token}",
            "content-type": "application/json",
        }
        self.http_client = http_client

    async def select(
        self,
        table: str,
        *,
        columns: str = "*",
        filters: dict[str, str] | None = None,
        order: str | None = None,
        limit: int | None = None,
        single: bool = False,
    ) -> Any:
        params: dict[str, str | int] = {"select": columns}
        if filters:
            params.update(filters)
        if order:
            params["order"] = order
        if limit is not None:
            params["limit"] = limit

        headers = dict(self.headers)
        if single:
            headers["accept"] = "application/vnd.pgrst.object+json"

        return await self._request("GET", table, params=params, headers=headers)

    async def insert(self, table: str, payload: dict[str, Any], *, return_representation: bool = True) -> Any:
        headers = {
            **self.headers,
            "prefer": "return=representation" if return_representation else "return=minimal",
        }
        return await self._request("POST", table, json=payload, headers=headers)

    async def upsert(self, table: str, payload: dict[str, Any], *, on_conflict: str | None = None) -> Any:
        headers = {
            **self.headers,
            "prefer": "resolution=merge-duplicates,return=representation",
        }
        params = {"on_conflict": on_conflict} if on_conflict else None
        return await self._request("POST", table, params=params, json=payload, headers=headers)

    async def update(
        self,
        table: str,
        payload: dict[str, Any],
        *,
        filters: dict[str, str],
        single: bool = False,
    ) -> Any:
        headers = {
            **self.headers,
            "prefer": "return=representation",
        }
        if single:
            headers["accept"] = "application/vnd.pgrst.object+json"
        return await self._request("PATCH", table, params=filters, json=payload, headers=headers)

    async def delete(self, table: str, *, filters: dict[str, str]) -> Any:
        headers = {
            **self.headers,
            "prefer": "return=representation",
        }
        return await self._request("DELETE", table, params=filters, headers=headers)

    async def rpc(self, function_name: str, payload: dict[str, Any] | None = None) -> Any:
        return await self._request("POST", f"rpc/{function_name}", json=payload or {})

    async def list_auth_users(self, *, page: int = 1, per_page: int = 100) -> list[dict[str, Any]]:
        url = f"{self.base_url}/auth/v1/admin/users"
        try:
            response = await self.http_client.get(url, headers=self.headers, params={"page": page, "per_page": per_page})
        except httpx.RequestError as exc:
            raise SupabaseRestError("Supabase Auth is not reachable.", 503) from exc

        if response.status_code >= 400:
            raise SupabaseRestError(response.text, response.status_code)
        data = response.json()
        return data.get("users", []) if isinstance(data, dict) else []

    async def _request(
        self,
        method: str,
        table: str,
        *,
        params: dict[str, str | int] | None = None,
        json: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        query = f"?{urlencode(params)}" if params else ""
        url = f"{self.base_url}/rest/v1/{table}{query}"

        try:
            response = await self.http_client.request(method, url, headers=headers or self.headers, json=json)
        except httpx.RequestError as exc:
            raise SupabaseRestError("Supabase is not reachable. Check the configured hosted Supabase URL.", 503) from exc

        if response.status_code >= 400:
            detail = response.text
            try:
                detail = response.json().get("message", detail)
            except ValueError:
                pass
            raise SupabaseRestError(str(detail), response.status_code)

        if not response.content:
            return None
        return response.json()
