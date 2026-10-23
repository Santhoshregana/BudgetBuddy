# BudgetBuddy — 

This project implements Milestone 1 (Weeks 1–2): project scope, initial database design, Django REST Framework backend setup, JWT authentication, and a React frontend skeleton. The backend uses modular apps and environment-specific settings. It uses Django REST Framework rather than FastAPI.

## Milestone 1 scope and roles
- A registered student manages their own profile and, in later milestones, their income, expenses, budgets, savings goals, notifications, and reports.
- Django staff users are administrators who can manage the application through Django Admin; regular users are not granted staff access.
- This milestone establishes authentication and the database schema. Expense/income workflows, dashboards, analytics, notification delivery, report generation, and public CRUD APIs are later implementation work.

## Backend structure
- `config/settings/base.py` contains shared settings; `development.py` selects local SQLite; `production.py` requires PostgreSQL and explicit production hosts/origins.
- `apps/` contains separate authentication, profile, income, expense, budget, savings-goal, notification, and analytics modules. The analytics module owns the initial report schema; report generation remains for a later milestone.
- `common/` contains reusable timestamps, owner/admin permissions, and API pagination.
- `users/migrations/` is retained as a migration-compatibility archive. The modular apps map to the existing database tables, so applying migrations preserves current data rather than recreating tables.
- The project keeps Django's built-in user model to preserve existing accounts and migration history. Regular registered users are students; Django's `is_staff` and groups provide the administrator capability.

## Database design
All finance and account-related records are linked to Django's user model. Deleting a user deletes their related records.
- `Profile`: one-to-one account profile, preferred three-letter currency code (defaults to INR), optional allowance, and JSON preferences.
- `Income`: source, positive amount, date received, and optional notes.
- `Expense`: category, positive amount, date spent, and optional description.
- `Budget`: name, positive planned amount, and inclusive start/end dates.
- `SavingsGoal`: name, target and current amounts, and optional target date.
- `Notification`: title, message, read state, and creation time.
- `Report`: title, date range, generated JSON data, and creation time.

The schema is implemented as Django models and checked-in migrations. Development uses SQLite; production settings require a PostgreSQL `DATABASE_URL`. Both environments use the same migrations.

## Included in Milestone 1
- Django REST API with public registration, JWT login/refresh, authenticated profile endpoint, and health check.
- Profile creation during account registration.
- React + Vite frontend skeleton for registration/login and a profile test.
- Configurable CORS and separate development/production database settings.

## Windows local setup

Run these commands from the workspace folder `D:\budgetbuddy`. The project is in
`budgetbuddy_part1`, so include that folder when changing directories.

### Backend (PowerShell)
```powershell
Set-Location .\budgetbuddy_part1\backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py test
.\.venv\Scripts\python.exe manage.py runserver
```
The backend loads values from `.env` at startup. The supplied example is for local development; do not use its development secret in production. The API health check is `http://127.0.0.1:8000/api/health/`.

### Frontend (new PowerShell terminal)
```powershell
Set-Location .\budgetbuddy_part1\frontend
npm.cmd install
Copy-Item .env.example .env
npm.cmd run dev
```
Open the Vite URL printed in the terminal (usually `http://localhost:5173`).

## API endpoints
- `GET /api/health/` — public health check
- `POST /api/auth/register/` — create account; JSON: `username`, `email`, `password`, `password_confirm`
- `POST /api/auth/token/` — JWT login; JSON: `username`, `password`
- `POST /api/auth/token/refresh/` — refresh access token
- `GET /api/auth/me/` — authenticated account profile; send `Authorization: Bearer <access-token>`.

The finance models are database foundations for later milestones; their CRUD endpoints and corresponding user interfaces are not part of Milestone 1.

## Deployment notes
Do not deploy with the development secret. Set `DJANGO_SETTINGS_MODULE=config.settings.production`, a strong unique `DJANGO_SECRET_KEY` (at least 50 characters), `DJANGO_ALLOWED_HOSTS` to the backend hostname, `CORS_ALLOWED_ORIGINS` to the frontend origin, and `DATABASE_URL` to a persistent PostgreSQL database URL. Use the backend build command `bash build.sh` and start command `gunicorn config.wsgi:application`. The exact commands/settings may need adjustment to match the selected host's current interface.

## Security and scope
This is a development starter, not a finished or independently security-audited production application. Never commit real secrets or `.env` files. Before production, review password, CORS, database, and HTTPS configuration. Finance CRUD, analytics, notification delivery, and report generation remain for later milestones.
