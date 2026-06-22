from __future__ import annotations

from typing import Any, Literal

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


class GenericPayload(BaseModel):
    data: dict[str, Any]


class StatusUpdate(BaseModel):
    status: str = Field(min_length=2, max_length=40)


class EventStaffUpdate(BaseModel):
    emails: list[EmailStr] = []


class TicketScan(BaseModel):
    ticket_code: str = Field(min_length=3, max_length=120)


class SiteSettingsUpdate(BaseModel):
    value: dict[str, Any]


class EventProposalCreate(BaseModel):
    title: str = Field(min_length=2, max_length=180)
    event_type: str = "WORKSHOP"
    proposed_date: str | None = None
    proposed_time: str | None = None
    venue: str | None = None
    capacity: int | None = None
    host: str | None = None
    coordinator_emails: list[EmailStr] = []
    summary: str | None = None
    prerequisites: str | None = None
    outcomes: str | None = None


class ProjectCreate(BaseModel):
    title: str = Field(min_length=2, max_length=180)
    category: str | None = None
    team: str | None = None
    technologies: list[str] = []
    summary: str | None = None
    content: str | None = None
    thumbnail_url: str | None = None
    status: str = "submitted"


class BlogPostCreate(BaseModel):
    title: str = Field(min_length=2, max_length=180)
    summary: str | None = None
    tags: list[str] = []
    cover_image_url: str | None = None
    content: str | None = None
    status: str = "submitted"


class GallerySubmissionCreate(BaseModel):
    title: str = Field(min_length=2, max_length=180)
    image_url: str = Field(min_length=5)
    event_name: str | None = None
    event_id: str | None = None


class CertificateImportRow(BaseModel):
    required_email: str
    required_name: str
    required_certificate_id: str


class CertificateImportPayload(BaseModel):
    rows: list[CertificateImportRow]
    event_id: str | None = None
    event_name: str
    certificate_type: str = Field(min_length=2, max_length=200)
    issued_at: str | None = None


class AdminResource(str):
    pass


ReviewStatus = Literal["draft", "submitted", "pending", "approved", "rejected", "published", "archived"]
