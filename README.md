# Smart Complaint Portal (Frontend)

Role-based complaint management UI for students, departments, and admin.

## Features
- Student:
  - register/login
  - forgot password (OTP via email)
  - dashboard
  - create complaint (with optional department)
  - my complaints + history
  - profile page
- Department:
  - register/login
  - forgot password (OTP)
  - complaint workflow pages (assigned / in progress / resolved)
  - status updates
- Admin:
  - login
  - dashboard + recent complaints
  - all complaints (status update, assignment, history)
  - assignment queue
  - escalations page
  - departments directory
  - pagination for large tables
- UX:
  - role-based guards
  - mobile-friendly layouts
  - floating toast notifications for interaction feedback
  - button loading states with spinner

## Tech Stack
- HTML + CSS + Vanilla JS (ES modules)
- Backend integration: FastAPI REST API

## Project Structure
- `index.html`
- `pages/user/*`
- `pages/department/*`
- `pages/admin/*`
- `src/modules/*`
- `src/services/*`
- `src/config/apiConfig.js`
- `assets/css/style.css`

Backend is in sibling folder: `../backend`.

## Local Run
1. Start backend:
```bash
cd ../backend
uv run uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
2. Start frontend static server:
```bash
cd frontend
python3 -m http.server 5500
```
3. Open:
- `http://127.0.0.1:5500/index.html`

## Demo Flow
1. Student registers/logs in and creates complaint.
2. Admin assigns complaint to a department.
3. Department updates complaint status.
4. Student sees updates + complaint history.

## Important Notes
- Admin self-registration is disabled in backend.
- Frontend guards are UX-only; backend enforces real authorization.
- Update API base settings in `src/config/apiConfig.js` for deployed backend.
