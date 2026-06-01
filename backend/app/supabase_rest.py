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
    def __init__(self, settings: Settings) -> None:
        if not settings.is_supabase_configured:
            raise SupabaseRestError("Supabase is not configured for the Python API.", 503)

        self.base_url = settings.supabase_url.rstrip("/")
        self.headers = {
            "apikey": settings.supabase_key,
            "authorization": f"Bearer {settings.supabase_key}",
            "content-type": "application/json",
        }

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

    async def insert(self, table: str, payload: dict[str, Any]) -> Any:
        headers = {
            **self.headers,
            "prefer": "return=representation",
        }
        return await self._request("POST", table, json=payload, headers=headers)

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

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.request(method, url, headers=headers or self.headers, json=json)

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
