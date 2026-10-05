# PRN232 TaskTrack Assignment 2

[![Assignment 2 CI](https://github.com/PhucPhamHong-dev/PRN232_TaskTrackAssignment2/actions/workflows/ci.yml/badge.svg)](https://github.com/PhucPhamHong-dev/PRN232_TaskTrackAssignment2/actions/workflows/ci.yml)

TaskTrack Assignment 2 is a full-stack task and team management application with JWT authentication, role-based access control, protected administration, refresh-token rotation, account management, and profile security.

## Live application

- Frontend: [qe190133-prn232-ass2-fe.vercel.app](https://qe190133-prn232-ass2-fe.vercel.app)
- Backend: [qe190133-prn232-ass2-be.onrender.com](https://qe190133-prn232-ass2-be.onrender.com)
- Swagger: [qe190133-prn232-ass2-be.onrender.com/swagger](https://qe190133-prn232-ass2-be.onrender.com/swagger)

## Features

- Public department, project, task, tag, detail, and search pages.
- Staff registration and secure login with PBKDF2 password hashing.
- Short-lived signed JWT access tokens and rotating refresh tokens.
- Authenticated CRUD for departments, projects, tasks, and tags.
- Administrator-only account listing, role updates, and safe deletion.
- Profile name and password updates with refresh-token revocation.
- Task creator/updater audit fields and soft deletion.
- Responsive Next.js administration dashboard with accessible dialogs and session-aware navigation.
- GitHub Actions backend build, Docker validation, frontend lint, and production build.

## Repository structure

- [`backend`](backend) - ASP.NET Core 8 API, service, repository, Swagger, and Docker configuration.
- [`frontend`](frontend) - Next.js 16 App Router application.
- [`database`](database) - idempotent PostgreSQL Assignment 2 schema and Admin seed.
- [`docs`](docs) - deployment instructions.

## Authorization matrix

| Operation | Public | Staff | Admin |
| --- | :---: | :---: | :---: |
| Read departments, projects, tasks, tags | Yes | Yes | Yes |
| Create, update, delete workspace data | No | Yes | Yes |
| View and manage accounts | No | No | Yes |
| View and update own profile | No | Yes | Yes |

## Local development

1. Run `database/001_assignment2_auth.sql` against PostgreSQL.
2. Copy `backend/TaskTrack.API/appsettings.Local.example.json` to `appsettings.Local.json` and fill in the connection string and local JWT secret.
3. Start the backend:

   ```bash
   dotnet run --project backend/TaskTrack.API
   ```

4. Create `frontend/.env.local`:

   ```env
   NEXT_PUBLIC_QE190133_ASS2_API_URL=http://localhost:5000
   ```

5. Start the frontend:

   ```bash
   cd frontend
   npm ci
   npm run dev
   ```

Production secrets and grading passwords are intentionally excluded from this repository. See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for deployment steps.
