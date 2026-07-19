# HRMS — End-to-End Setup Guide

## Prerequisites

| Tool | Minimum version | Install |
|------|----------------|---------|
| Bun | 1.1+ | `curl -fsSL https://bun.sh/install \| bash` |
| Node.js | 20 LTS | https://nodejs.org |
| PostgreSQL | 15+ | https://www.postgresql.org/download/ |

---

## 1. Clone and install dependencies

```bash
# From the repo root
cd HRMS
bun install           # installs all workspaces (frontend, backend, packages/*)
```

---

## 2. Create the PostgreSQL database

```sql
-- Connect as a superuser (psql -U postgres)
CREATE USER hrms_user WITH PASSWORD 'hrms_pass';
CREATE DATABASE hrms_db OWNER hrms_user;
GRANT ALL PRIVILEGES ON DATABASE hrms_db TO hrms_user;
```

> **Change the password in production.**

---

## 3. Configure environment variables

**Backend — `backend/.env`** (already exists; verify these values):

```env
DATABASE_URL=postgresql://hrms_user:hrms_pass@localhost:5432/hrms_db

JWT_ACCESS_SECRET=hrms-dev-access-secret-min32chars-changeinprod-xk9
JWT_REFRESH_SECRET=hrms-dev-refresh-secret-min32chars-changeinprod-yz7

PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BCRYPT_SALT_ROUNDS=12
```

**Frontend — `frontend/.env.local`** (already exists):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## 4. Run database migrations

```bash
cd backend
bunx prisma migrate dev --name init
```

This creates all tables. If you already have a migration history, use:

```bash
bunx prisma migrate deploy
```

---

## 5. Seed master data + demo employees

```bash
# Still in /backend
bun prisma db seed
```

This seeds:
- Departments, Designations, Qualification types
- Skill categories + skills, Proficiency levels
- Certifications, Experience types, Organisation types
- BPV weight config, Salary grades, Reward rules, etc.
- **12 demo employees** with full profiles + BPV scores
- **System Admin** account

---

## 6. Start the development servers

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
bun dev
# Starts on http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
bun dev
# Starts on http://localhost:3000
```

---

## 7. Login credentials

### System Admin (full access)
| Field | Value |
|-------|-------|
| Email | `admin@hrms.local` |
| Password | `Admin@123456` |

### Demo Employees (password same for all)
| Name | Email | Role |
|------|-------|------|
| Arjun Mehta | `arjun.mehta@hrms.local` | EMPLOYEE (Architect) |
| Priya Nair | `priya.nair@hrms.local` | EMPLOYEE (Sr. SE) |
| Rajan Pillai | `rajan.pillai@hrms.local` | EMPLOYEE (Director) |
| Ananya Krishnan | `ananya.krishnan@hrms.local` | EMPLOYEE (HR Manager) |
| Senthil Kumar | `senthil.kumar@hrms.local` | EMPLOYEE (Finance Manager) |

**Demo password:** `Demo@123456`

> To change a user's role (e.g. promote Arjun to MANAGER or HR_ADMIN), use the DB directly:
> ```sql
> UPDATE "User" SET role = 'HR_ADMIN'
> WHERE email = 'arjun.mehta@hrms.local';
> ```

---

## 8. Role-Based Access — What each role sees

| Role | Sidebar | Employees | Can Add/Edit/Delete |
|------|---------|-----------|---------------------|
| **EMPLOYEE** | My Profile only | Own profile only | Own quals/skills/certs/experience |
| **MANAGER** | Employees (My Team), Tasks, Time | Direct reports only | Read-only |
| **HR_ADMIN** | All except Config | All employees | Full CRUD + sub-resources |
| **FINANCE_ADMIN** | Employees, Rewards, Beneficiaries, Config | All (read-only) | None |
| **SYSTEM_ADMIN** | Everything | Everything | Full CRUD |

---

## 9. Promote a user to a role

```sql
-- Available roles: EMPLOYEE, MANAGER, HR_ADMIN, FINANCE_ADMIN, SYSTEM_ADMIN
UPDATE "User" SET role = 'HR_ADMIN'
WHERE email = 'ananya.krishnan@hrms.local';

UPDATE "User" SET role = 'MANAGER'
WHERE email = 'arjun.mehta@hrms.local';
```

---

## 10. Common commands

```bash
# Regenerate Prisma client after schema changes
cd backend && bunx prisma generate

# Open Prisma Studio (DB browser)
cd backend && bunx prisma studio

# Type-check both workspaces
cd backend && bun run typecheck
cd frontend && bun run typecheck

# Re-run the seed (safe — uses upsert, idempotent)
cd backend && bun prisma db seed
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `designationId: Invalid` / `departmentId: Invalid` | Run `bun prisma db seed` — master data is missing |
| `CORS error` in browser | Check `FRONTEND_URL` in `backend/.env` matches your frontend URL |
| `JWT invalid` | Make sure `JWT_ACCESS_SECRET` is the same on every restart |
| `Connection refused :4000` | Backend is not running — start it with `bun dev` in `/backend` |
| `P2002 Unique constraint` on seed | Safe to ignore — seed is idempotent, row already exists |
