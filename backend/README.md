# Hive Backend (MVP Console-Only)

This is the Node.js / TypeScript / Fastify backend for the Hive project. It uses PostgreSQL as the primary database and Drizzle ORM for schema and migration management.

## Prerequisites

- **Node.js**: v20+ (Targeting ES2022)
- **Docker / Docker Compose**: For running the PostgreSQL database locally

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   A local `.env` file has been created. Ensure variables match your requirements:
   - `PORT`: Port the server runs on (default `3000`)
   - `DATABASE_URL`: Connection string for PostgreSQL
   - `JWT_SECRET`: Secret key used to sign and verify JWT tokens
   - `QR_SECRET`: Secret key used to sign and verify check-in QR codes
   - **Email (SMTP)** — optional; needed to actually deliver passes:
     - `SMTP_HOST`, `SMTP_PORT` (default `587`), `SMTP_SECURE` (`true` for 465)
     - `SMTP_USER`, `SMTP_PASS`
     - `MAIL_FROM` (e.g. `Hive <passes@yourdomain.com>`)
     - If `SMTP_HOST` is unset, email runs in **no-send dev mode** (it logs the
       message instead of sending) so the pass flow still completes locally.

3. **Start PostgreSQL Container**:
   Make sure Docker is running, then execute:
   ```bash
   docker-compose up -d
   ```

4. **Run Database Migrations**:
   Generate the Drizzle schema and push it to the database:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start Dev Server**:
   Start the Fastify API server with hot-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

- **Auth**:
  - `POST /api/v1/auth/signup`: Create admin user + auto-create collective.
  - `POST /api/v1/auth/login`: Login admin, return JWT.
- **Collectives**:
  - `GET /api/v1/collectives/mine`: Fetch organizer's collective.
  - `GET /api/v1/collectives/:id/members`: Fetch members lists.
  - `POST /api/v1/collectives/:id/members`: Register new member directly.
  - `PATCH /api/v1/collectives/:id/members/:uid`: Toggle block status.
- **Events**:
  - `GET /api/v1/collectives/:id/events`: List events for a collective (includes `passHolders` IDs).
  - `POST /api/v1/collectives/:id/events`: Create a new event.
- **Passes**:
  - `POST /api/v1/events/:id/passes/send`: Atomically issue pass to member (capacity-checked). **Blocked members are rejected (`403 MEMBER_BLOCKED`) before any pass is created.** On success the pass is **emailed to the member** (see "Pass delivery" below); the response includes an `email` status (`{ to, configured, sent }`).
  - `POST /api/v1/passes/scan`: Scan/validate a QR check-in payload. Verifies the HMAC signature (constant-time), then atomically marks the pass `used`. Re-scanning a used pass returns `409 ALREADY_SCANNED`.
  - `GET /api/v1/passes/:id`: Public route to view pass (QR code) details.

## Pass delivery (email)

When a pass is issued it is emailed to the member's address. The email
(`src/email.ts`) is rendered as branded HTML + a plaintext fallback and carries
the entry **QR code** (generated with `qrcode`, encoding the `qrToken:qrSignature`
payload the scanner reads) as an inline attachment. Delivery uses **Nodemailer**
over SMTP — Hive does not run its own mail server, so point `SMTP_*` at a provider.
Production uses the `admin@m3hfil.com` **Spacemail** mailbox. Email failures never
roll back an issued pass; the route reports status instead.

**Secrets:** only the mailbox **password** is sensitive and lives in **GCP Secret
Manager** as `smtp-pass` (the rest — `SMTP_HOST/PORT/SECURE/USER`, `MAIL_FROM` — are
non-secret config). Locally, `../scripts/pull-secrets.sh` writes it into `backend/.env`;
on the VM, `../terraform/startup-script.sh` fetches it at boot. If `SMTP_HOST`/`SMTP_PASS`
are unset, email runs in no-send dev mode (logs instead of sending).

The QR signing/verification lives in `src/qr.ts` (`signQrToken`, `verifyQrPayload`,
…) so it can be unit-tested independently of the routes.

## Testing

Unit tests (no DB or server required) — Node's built-in test runner via `tsx`:
```bash
npm test
```
Covers QR signing/verification (`src/qr.ts`) and pass-email rendering + dev-mode
send (`src/email.ts`).

Integration script (exercises live endpoints; requires a running dev server + DB):
```bash
npm run test:integration
```

> See [`../test_agent.md`](../test_agent.md) for the testing policy. **No MR/PR
> should merge without proper test cases and coverage.**
