# Assignment 2 deployment

## Database

Run `database/001_assignment2_auth.sql` once against the existing PostgreSQL database. The script is idempotent, adds the authentication schema and audit columns, and seeds the Admin account with a PBKDF2 hash.

## Render backend

Create a Render Web Service from this repository with root directory `backend` and Docker runtime. Configure:

- `DATABASE_URL`: the Supabase PostgreSQL connection URL.
- `JWT_SECRET`: a cryptographically random value with at least 64 characters.
- `ASPNETCORE_ENVIRONMENT`: `Production`.
- `FRONTEND_URL`: `https://qe190133-prn232-ass2-fe.vercel.app`.
- Health-check path: `/health`.

## Vercel frontend

Import the same repository and set the root directory to `frontend`. Configure:

- `NEXT_PUBLIC_QE190133_ASS2_API_URL`: `https://qe190133-prn232-ass2-be.onrender.com`.

## Verification order

1. Confirm `/health` and `/swagger` on Render.
2. Open `/register` on Vercel and create the Staff grading account.
3. Verify Staff CRUD access and HTTP 403 for `/api/accounts`.
4. Verify Admin account management.
5. Run the manual GitHub Actions production smoke test.
