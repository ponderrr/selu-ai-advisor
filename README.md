<div align="center">

# SELU AI Advisor
AI-powered academic advising platform for SELU CS students, delivering streaming guidance, progress analytics, and degree-planning automation.

<br/>

![Build](https://img.shields.io/badge/Build-FastAPI_%2B_React-8B5CF6?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-0.1.0-00D9FF?style=for-the-badge)
![DB](https://img.shields.io/badge/PostgreSQL-Primary-FF006E?style=for-the-badge)
![Rate%20Limit](https://img.shields.io/badge/Rate_Limiter-Redis-8B5CF6?style=for-the-badge)

</div>

---

## About
SELU AI Advisor is a full-stack platform combining a FastAPI backend with a React/MUI dashboard to deliver AI-assisted advising for Computer Science students. It centralizes course catalogs, degree progress, and personalized recommendations, while persisting chat context and enforcing secure, rate-limited access. Built for academic IT teams, advisors, and students who need compliant, repeatable guidance workflows with strong data integrity.

---

## Key Features
- **Streaming AI Advisor** — `/api/chat` streams Ollama responses with preserved history and Redis-backed rate limiting.
- **Typed Auth & Session Control** — JWT auth, refresh tokens, device/session tracking, and OTP-driven onboarding.
- **Degree Progress Intelligence** — GPA timelines, graduation requirement checks, analytics, and PDF/Excel report exports.
- **Course Intelligence Layer** — Fuzzy search, category filters, and personalized recommendations derived from student progress.
- **Student-Course Ledger** — Robust CRUD with GPA calculation, semester tagging, and conflict checks before deletion.
- **Program Requirements API** — Degree-program structure exposed via typed schemas for planners and UI modules.
- **Admin & Observability Hooks** — SQLAdmin dashboard-ready models plus centralized middleware and CORS controls.
- **Frontend Experience** — React 18 + MUI with protected routes, onboarding flows, dashboard widgets, and chat-ready shell.

---

## Tech Stack
**Languages**  
![Python](https://img.shields.io/badge/Python-3.11+-8B5CF6?style=for-the-badge) ![JavaScript](https://img.shields.io/badge/JavaScript-ES2021-00D9FF?style=for-the-badge)

**Backend / Services**  
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.x-00D9FF?style=for-the-badge) ![Uvicorn](https://img.shields.io/badge/Uvicorn-ASGI-8B5CF6?style=for-the-badge) ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.x-FF006E?style=for-the-badge) ![Pydantic](https://img.shields.io/badge/Pydantic-v2-00D9FF?style=for-the-badge)

**Databases / State**  
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Primary-FF006E?style=for-the-badge) ![Redis](https://img.shields.io/badge/Redis-Rate%20Limit%20%2F%20Cache-8B5CF6?style=for-the-badge)

**Frontend**  
![React](https://img.shields.io/badge/React-18-00D9FF?style=for-the-badge) ![MUI](https://img.shields.io/badge/MUI-5-8B5CF6?style=for-the-badge) ![Chart.js](https://img.shields.io/badge/Chart.js-4-FF006E?style=for-the-badge)

**Observability / Security**  
![JWT](https://img.shields.io/badge/JWT-Auth-8B5CF6?style=for-the-badge) ![FastAPI%20Limiter](https://img.shields.io/badge/FastAPI_Limiter-Redis-00D9FF?style=for-the-badge) ![Passlib](https://img.shields.io/badge/Passlib-Passwords-FF006E?style=for-the-badge)

**Tooling & Infra**  
![Alembic](https://img.shields.io/badge/Alembic-Migrations-8B5CF6?style=for-the-badge) ![SQLAdmin](https://img.shields.io/badge/SQLAdmin-Backoffice-00D9FF?style=for-the-badge) ![httpx](https://img.shields.io/badge/httpx-Async-FF006E?style=for-the-badge) ![Prettier](https://img.shields.io/badge/Prettier-Frontend_Format-8B5CF6?style=for-the-badge)

---

## Architecture
High-level: React SPA talks to FastAPI over `/api/*`. FastAPI enforces JWT + Redis rate limiting, orchestrates PostgreSQL for persistence, Redis for limiter/session metadata, and streams AI responses from an Ollama model. Alembic manages schema evolution; SQLAdmin provides admin UI.

```mermaid
flowchart LR
  User[Browser UI] -->|HTTPS| WebApp[React 18 + MUI]
  WebApp -->|JWT| API[FastAPI ASGI]
  API -->|ORM| PG[(PostgreSQL)]
  API -->|Limiter| Redis[(Redis)]
  API -->|chat stream| Ollama[Ollama Model]
  API -->|Admin| SQLAdmin[SQLAdmin UI]
  API -->|Migrations| Alembic
```

Component responsibilities

```mermaid
flowchart TB
  Auth[Auth & OTP] --> Sessions[Session Tracking]
  Courses[Course Catalog & Search] --> Recs[Recommendation Service]
  StudentCourse[Student-Course Ledger] --> Progress[Progress & GPA Analytics]
  Chat[AI Chat Streaming] --> History[Chat History Service]
  Progress --> Reports[PDF/Excel Reports]
```

API lifecycle (chat)

```mermaid
sequenceDiagram
  participant UI as React Client
  participant API as FastAPI /chat
  participant RL as Redis RateLimiter
  participant DB as PostgreSQL
  participant AI as Ollama
  UI->>API: POST /api/chat (JWT + session_id)
  API->>RL: check quota
  API->>DB: persist user message
  API->>AI: stream chat with history
  AI-->>API: stream chunks
  API-->>UI: text/event-stream chunks
  API->>DB: store AI reply, update session activity
```

Deployment (suggested)

```mermaid
flowchart LR
  Dev[Developer] --> CI[CI/CD]
  CI -->|Builds| Docker[Backend Image]
  CI -->|Builds| ReactBuild[Static Bundle]
  Docker --> K8s[Compose/K8s Runtime]
  ReactBuild --> CDN[Static Host or S3+CF]
  K8s --> SVC[FastAPI Service]
  SVC --> PG[(PostgreSQL)]
  SVC --> Redis[(Redis)]
  SVC --> Ollama
```

Performance & reliability: async FastAPI + httpx streaming, Redis-backed rate limiting, JWT + refresh rotation with session revocation, and DB constraints on users, courses, and enrollments.

---

## Documentation & Deep Examples
Real endpoints and flows:

```24:105:server/app/api/endpoints/chat.py
@chat_router.post("/", response_class=StreamingResponse, dependencies=[Depends(RateLimiter(times=5, seconds=60))])
async def chat_with_ai(chat_request: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not await ollama_service.health_check():
        raise HTTPException(status_code=503, detail="AI service is currently unavailable.")
    current_session_id = await get_or_create_session_id(db, current_user.id, chat_request.session_id)
    await create_chat_message(db, current_user.id, current_session_id, "user", chat_request.message)
    history_messages = await get_chat_history(db, current_user.id, current_session_id, limit=50)
    # streams chunks to client and persists AI reply
```

```18:83:server/app/api/endpoints/course.py
@course_module.get("/search")
def search_courses(q: str, db: Session = Depends(get_db)):
    # fuzzy search by title, level enum, category enum, or credits
```

```21:103:server/app/api/endpoints/student_course/student_course.py
@student_course_module.put("/{course_id}")
def update_student_course(...):
    return functions.update_student_course(db, current_user.id, course_id, payload)
```

Example API call (streaming chat)

```bash
curl -N -H "Authorization: Bearer <jwt>" \
     -H "Content-Type: application/json" \
     -d '{"message":"Plan my next semester","session_id":null}' \
     http://localhost:8000/api/chat/
```

React fetch pattern

```javascript
const res = await fetch("/api/chat/", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ message, session_id }),
});
const reader = res.body.getReader(); // stream chunks
```

CLI & ops
- Run migrations: `alembic upgrade head`
- Seed data: `python -m server.scripts.seed_db`
- Create admin: `python -m server.scripts.create_admin`

Configuration

| Key | Description | Default |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL URL for core data | `postgresql://postgres:9873@localhost:5432/aidvisor` |
| `REDIS_URL` | Redis for rate limiting/session metadata | `redis://localhost:6379/0` |
| `OLLAMA_BASE_URL` | Ollama endpoint | `http://localhost:11434` |
| `OLLAMA_MODEL` | Model name | `mistral` |
| `OLLAMA_TIMEOUT` | AI call timeout (s) | `60.0` |
| `SECRET_KEY` | JWT signing key | set in env (override code defaults) |
| `REFRESH_SECRET_KEY` | Refresh token secret | set in env (override code defaults) |

---

## Getting Started
Prerequisites: Python 3.11+, Node 18+, PostgreSQL 14+, Redis 6+, (optional) Ollama with `mistral` pulled.

Backend
```bash
cd server
python -m venv .venv && .\.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend
```bash
cd client
npm install
npm start    # proxies to http://localhost:8000
```

Production notes
- Serve FastAPI behind Nginx with `uvicorn --workers 4 --proxy-headers`.
- Externalize secrets and `DATABASE_URL`; never ship hard-coded keys.
- Provide Redis in all environments or disable limiter explicitly.
- Build React (`npm run build`) and serve via CDN/static host; keep API under `/api`.

---

## API Documentation
Auth: Bearer JWT. Obtain via `/api/login`, refresh via `/api/refresh`. Chat limited to 5 req / 60s per token.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/login` | Issue access/refresh tokens, create session record |
| POST | `/api/refresh` | Rotate access token, bump session activity |
| GET | `/api/users/me` | Current user profile + degree program |
| POST | `/api/users/` | Create user (requires `@selu.edu`, OTP verification) |
| CRUD | `/api/courses/*` | Catalog listing, fuzzy search, recommendations, admin CRUD |
| CRUD | `/api/student-courses/*` | Assign/update/remove enrollments, GPA snapshot |
| GET | `/api/progress/*` | Overall %, detailed timeline, analytics, report download |
| POST | `/api/chat/` | Streamed AI advising with history |
| GET | `/api/degree-programs/{id}/requirements` | Program structure/requirements |

Errors: JSON with `detail`; 401 on JWT issues, 409 on conflicts, 422 on validation; chat emits `AI_ERROR` tokens if downstream issues.

---

## Project Structure
```
/client                # React 18 + MUI dashboard
  ├─ src/components    # Layout, auth, settings, progress widgets
  ├─ src/pages         # Dashboard, Chat shell, Profile, Schedule, Onboarding flows
  ├─ src/services/api  # Frontend API clients
/server                # FastAPI service
  ├─ app/api/endpoints # Auth, chat, courses, student-course, progress, degree-program
  ├─ app/core          # Config, security, middleware, DB engine, OTP
  ├─ app/models        # Users, sessions, courses, degree programs, chat messages
  ├─ app/services      # AI client (Ollama), chat history, recommendations, reports
  ├─ alembic           # Database migrations
  ├─ scripts           # Seed/create admin utilities
```


