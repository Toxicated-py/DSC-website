from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class ContactMessageCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    subject: str = Field(min_length=2, max_length=180)
    message: str = Field(min_length=5, max_length=5000)


class ApiStatus(BaseModel):
    ok: bool
    app: str
    environment: str
    supabase_configured: bool
