# Backend Structure TODO

`backend/app/main.py` still owns the active FastAPI routes so launch cleanup does not risk route regressions. Split it gradually in small PRs after launch verification.

Suggested route modules:

- `routes/events.py`
- `routes/projects.py`
- `routes/blog.py`
- `routes/certificates.py`
- `routes/admin.py`
- `routes/contact.py`

Suggested service modules:

- `services/audit.py`
- `services/certificates.py`
- `services/events.py`

Migration plan:

1. Move pure helpers and constants first, with import checks after each move.
2. Move one route group at a time behind an `APIRouter`.
3. Preserve existing paths, response shapes, auth checks, and RLS assumptions.
4. Add smoke tests for each moved route before removing the original definitions.
