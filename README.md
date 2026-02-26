# Smart Complaint Portal (Frontend)

Role-based complaint management system for college/institute workflows.

## Current Scope
- Student: register/login, create complaint, list complaints, profile, complaint history timeline.
- Department: login/register, assigned/in-progress/resolved pages, status updates, complaint history timeline.
- Admin: login/register, all complaints, assignment queue, status control, escalations/departments views, complaint history timeline.

## Stack
- Frontend: HTML, CSS, Vanilla JS (ES modules)
- Backend: FastAPI + SQLModel + JWT
- Database: SQLite (`backend/complaints.db`)

## Project Layout
This repository is `frontend/`. Backend exists in sibling folder `../backend`.

Important frontend paths:
- `index.html`
- `pages/user/*`
- `pages/department/*`
- `pages/admin/*`
- `src/modules/*`
- `src/services/*`
- `assets/css/style.css`

## Quick Start (Full App)
1. Start backend:
```bash
cd ../backend
uv run uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

2. Start frontend static server (choose one):
- VS Code Live Server on `frontend/index.html`
- or:
```bash
cd frontend
python3 -m http.server 5500
```

3. Open:
- `http://127.0.0.1:5500/index.html`
- If served from project root path, use `http://127.0.0.1:5500/frontend/index.html`

## Demo Helper Script
Use:
```bash
bash scripts/demo.sh
```

It checks backend health and prints demo URLs + role flow checklist.

## Suggested Demo Accounts
Use your seeded accounts, or register fresh from UI:
- Student: `/pages/user/register.html`
- Department: `/pages/department/register.html`
- Admin: `/pages/admin/register.html`

## Demo Flow (Viva)
1. Student login -> create complaint -> open My Complaints -> view history.
2. Admin login -> Assignment Queue -> assign complaint to department.
3. Department login -> Assigned/In Progress -> update status -> verify history updates.
4. Admin All Complaints -> update status + view timeline.

## Notes
- Frontend auth guards are for UX navigation; backend enforces real access control.
- API base config is in `src/config/apiConfig.js`.
- Offline auth fallback is disabled.
