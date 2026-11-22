# M3HFIL (Mehfil)

**A platform for community collectives:** organizers run memberships and events from a web console, and members carry
secure digital passes and chat from a mobile app. *Mehfil* means "gathering". The project started under the working name
**Hive**, which still appears in parts of the code.

## What it does
- **Console app (organizers):** onboard a collective, manage members, create and edit events,
  and issue passes.
- **Member app (mobile):** join collectives, browse events, chat, and show a QR-code digital pass at the door.
- **Secure passes:** signed QR codes, emailed on issue, with access blocked automatically for blocked members.

## Architecture

| Part | Stack |
|---|---|
| Backend API | Node.js, **Fastify**, TypeScript, **PostgreSQL** (Supabase) with **Drizzle ORM**, JWT auth, Nodemailer, Google Cloud Storage |
| Console app | **React**, Vite, TypeScript |
| Member app | **React Native** (Expo) |
| Infrastructure | **Terraform** on **Google Cloud** (Compute Engine VM, Secret Manager, remote state in GCS), Nginx reverse proxy |
| CI/CD | **GitHub Actions**: CI on every PR; deploy on merge to `main` |

```
 Member app (Expo) ─┐
                    ├─► Fastify API (TypeScript, Drizzle) ─► PostgreSQL (Supabase)
 Console (React) ───┘        │
                             ├─► Google Cloud Storage (uploads)   ├─► SMTP (pass emails)
                             └─ deployed to a GCP VM behind Nginx, provisioned with Terraform, via GitHub Actions
```

## My contributions (Ayush Gautam)
- **CI/CD:** wrote the GitHub Actions workflows: CI on pull requests, and a deploy pipeline that builds on the CI runner,
  ships artifacts to the VM over SCP and gates the release on a health check; deploys run on merge to `main`.
- **Events:** event-details editing in the console, with form validation in both the console and the API.
- **Passes:** blocked-member pass gating, so blocked members can't be issued or use passes.
- **Onboarding:** onboarding validation and a display-name fallback.

Built with two teammates. This public copy has a fresh history; identifiers for the team's live infrastructure (GCP project,
server IP, database host) are replaced with placeholders.

---

## 🛠️ Global Prerequisites

Before getting started, make sure you have the following tools installed:
1.  **Node.js** (v20+ LTS recommended)
2.  **Docker / Docker Compose** (for running a local PostgreSQL instance)
3.  **Google Cloud SDK (`gcloud` CLI)** (for infrastructure access)
4.  **Terraform** (v1.3.0+ for managing infrastructure)

---

## 🚀 Collaborator Quick-Start (Onboarding)

Follow these steps to configure your local workspace to deploy infrastructure and run the apps:

### 1. Authenticate with Google Cloud
Ensure you are logged into your Google Cloud account with permissions for the project `your-gcp-project-id`:
```bash
gcloud auth login
gcloud auth application-default login
```

### 2. Bootstrap Terraform & Remote State
Terraform is configured to use a remote **GCP Storage (GCS)** backend. This ensures the infrastructure state is shared securely across all collaborators.

To initialize Terraform and join the remote state:
```bash
cd terraform
./bootstrap.sh
```
This script will verify your authentication, ensure the GCS bucket (`your-gcp-project-id-tfstate`) is initialized on GCP, and automatically run `terraform init`.

### 3. Generate Local Environment Credentials
Secrets (like the database URL, signing keys, JWT keys, and the SMTP email password) are securely stored in **GCP Secret Manager**. Secrets in use:

| Secret Manager ID | Env var | Purpose |
|---|---|---|
| `database-url` | `DATABASE_URL` | Supabase Postgres connection string |
| `jwt-secret` | `JWT_SECRET` | JWT signing key |
| `qr-secret` | `QR_SECRET` | HMAC key for pass QR codes |
| `smtp-pass` | `SMTP_PASS` | Password for the outbound email mailbox (pass delivery) |

To pull the latest secrets from GCP Secret Manager:
```bash
# From the repository root
./scripts/pull-secrets.sh
```
This writes `backend/.env` with the secret values plus the non-secret SMTP
config (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `MAIL_FROM`).

> [!IMPORTANT]
> **Never commit secrets or hardcode passwords.** Anything sensitive (passwords,
> API keys, connection strings) belongs in GCP Secret Manager, surfaced locally
> via `pull-secrets.sh` and on the VM via `startup-script.sh`. `backend/.env`
> is gitignored. When you add a new secret, add it to Secret Manager, wire it in
> `terraform/main.tf` (container + VM IAM), `scripts/pull-secrets.sh`, and
> `terraform/startup-script.sh`.

#### Email / pass delivery
Issued passes are emailed to members (see `backend/README.md`). Delivery uses SMTP
(currently the `admin@m3hfil.com` Spacemail mailbox). Only the mailbox **password**
is a secret (`smtp-pass`); if it is absent, the backend runs in no-send dev mode
and logs instead of sending.

> [!NOTE]
> **Database Environment Separation:**
> *   **Local Development**: By default, local development uses a local PostgreSQL database running in Docker (via `docker-compose.yml` on port `5432`). This matches the default credentials in `backend/.env.example`.
> *   **Production / GCP Staging**: The GCP Compute Engine VM uses the remote PostgreSQL database hosted on **Supabase**.
> *   Running `./scripts/pull-secrets.sh` downloads the production Supabase database credentials. If a local `.env` already exists, the script will warn you and offer to save the production keys to `.env.production` instead, to prevent overwriting your local development environment database settings.

---

## 💻 Local Running Guides

For component-specific details, please check individual README files. Here is the high-level flow:

### Running the Backend
1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Spin up the local database (if you aren't using the shared database URL):
    ```bash
    docker-compose up -d
    ```
4.  Run migrations:
    ```bash
    npm run db:generate
    npm run db:push
    ```
5.  Start the development server:
    ```bash
    npm run dev
    ```

### Running the Organizer Console Web App
1.  Navigate to the `console-app` folder:
    ```bash
    cd console-app
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Vite dev server:
    ```bash
    npm run dev
    ```

### Running the Member Mobile App
1.  Navigate to the `member-app` folder:
    ```bash
    cd member-app
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Metro Bundler:
    ```bash
    npx expo start
    ```
