# AGENTS.md

Guidance for AI agents (and humans) working in the Hive monorepo. Read this
before making changes.

## Repository layout

| Path | What | Stack |
|---|---|---|
| `backend/` | API (auth, collectives, events, passes/scan, email) | Node + Fastify + TypeScript, Drizzle ORM, PostgreSQL/Supabase |
| `console-app/` | Organizer web app | React + Vite + TypeScript |
| `member-app/` | Member mobile app | React Native (Expo) |
| `terraform/` | GCP infra (VM, networking, Secret Manager) | Terraform + GCS remote state |
| `scripts/` | Operational scripts (e.g. `pull-secrets.sh`) | bash |
| `docs/` | Design system + UI kits | — |

## Golden rules

1. **Never commit or hardcode secrets.** Passwords, API keys, connection
   strings, tokens → **GCP Secret Manager**. `backend/.env` is gitignored;
   `backend/.env.example` is the tracked template. See "Secrets" below.
2. **No MR/PR merges without proper test cases and coverage.** See
   [`test_agent.md`](test_agent.md). New/changed logic must ship with tests
   (happy path **and** edges/failures); all unit suites must pass.
3. **Don't push directly to `main` or run `terraform apply`/destructive cloud
   ops without explicit human approval.** Cloud changes are real-money and
   shared-state.
4. **Keep it building.** `npm run build` (backend & console) and the unit
   suites must stay green.

## Secrets (GCP Secret Manager)

Project: `your-gcp-project-id`. Secrets are declared as containers in
`terraform/main.tf` (+ IAM for the VM service account), surfaced locally by
`scripts/pull-secrets.sh`, and fetched on the VM at boot by
`terraform/startup-script.sh`.

| Secret ID | Env var | Notes |
|---|---|---|
| `database-url` | `DATABASE_URL` | Supabase connection string |
| `jwt-secret` | `JWT_SECRET` | JWT signing |
| `qr-secret` | `QR_SECRET` | HMAC for pass QR codes |
| `smtp-pass` | `SMTP_PASS` | Email mailbox password (pass delivery) |

Non-secret config (`SMTP_HOST/PORT/SECURE/USER`, `MAIL_FROM`, `PORT`) lives as
literals in the scripts — not in Secret Manager.

**Adding a new secret:** (1) add the value in Secret Manager
(`gcloud secrets create <id>` + `gcloud secrets versions add <id> --data-file=-`),
(2) declare the container + VM IAM in `terraform/main.tf`, (3) fetch it in
`scripts/pull-secrets.sh` and `terraform/startup-script.sh`, (4) document it in
`README.md`.

## Local development

- Root `README.md` has the full onboarding (gcloud auth → `terraform/bootstrap.sh`
  → `scripts/pull-secrets.sh`).
- Backend: `cd backend && npm install && npm run dev` (needs Postgres; local
  Docker `docker-compose up -d`, or the shared Supabase URL from `pull-secrets.sh`).
  Note: `npm run dev` uses `ts-node-dev` — on newer Node, run with `tsx`
  (`npx tsx watch src/server.ts`) since the project is ESM.
- Console: `cd console-app && npm install && npm run dev` (Vite, `:5173`).
  Talks to the backend at `http://localhost:3000/api/v1` on localhost.
- Member app: `cd member-app && npm install && npx expo start`.

## Testing

| App | Command | Framework |
|---|---|---|
| `backend/` | `npm test` | `node:test` via `tsx` (unit, no DB) |
| `backend/` | `npm run test:integration` | script (needs live server + DB) |
| `console-app/` | `npm test` | Vitest |

Extracted, testable seams: `backend/src/qr.ts`, `backend/src/email.ts`,
`console-app/src/templates.ts`. Add tests next to new logic. Full policy in
[`test_agent.md`](test_agent.md).

## Deployment (CI/CD)

- `.github/workflows/ci.yml` — build/typecheck on push/PR.
- `.github/workflows/deploy.yml` — on push to `main`: build on the runner, scp
  compiled artifacts + `scripts/write-backend-env.sh` to the GCP VM,
  `npm ci --omit=dev`, **regenerate `backend/.env` from Secret Manager**, run
  migrations, restart `hive-backend`, health-check.
- **`scripts/write-backend-env.sh` is the single source of truth for the backend
  runtime env.** It pulls secrets from Secret Manager (via the instance service
  account) and writes `/opt/hive/backend/.env`. It is invoked both at first boot
  (`terraform/startup-script.sh`) and on every deploy — so adding/rotating a
  secret just needs a redeploy (no manual VM edits, no re-provision). Add new
  env vars/secrets there.
- Infra changes go through `terraform/` (remote GCS state). Run
  `terraform plan` freely; gate `terraform apply` on human approval.

## Conventions

- TypeScript strict; keep both apps' builds clean.
- Backend is ESM (`"type": "module"`, `NodeNext`): relative imports use `.js`
  extensions.
- Design system: pull tokens from `console-app/src/tokens.css` /
  `member-app/constants/theme.ts`; don't hardcode brand hex/px.
- Only the pass **password** is a secret; keep that distinction when adding config.
