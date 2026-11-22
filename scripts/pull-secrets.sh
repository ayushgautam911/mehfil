#!/bin/bash
# pull-secrets.sh - Pull latest secrets from GCP Secret Manager and write them to backend/.env

set -e

PROJECT_ID="your-gcp-project-id"

# Find repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== Pulling Secrets from GCP ==="

# 1. Verify gcloud authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
  echo "Error: No active gcloud account found. Please run 'gcloud auth login' first."
  exit 1
fi

echo "Fetching secrets from project: ${PROJECT_ID}"

# 2. Fetch secrets from Secret Manager
DATABASE_URL=$(gcloud secrets versions access latest --secret="database-url" --project="${PROJECT_ID}")
JWT_SECRET=$(gcloud secrets versions access latest --secret="jwt-secret" --project="${PROJECT_ID}")
QR_SECRET=$(gcloud secrets versions access latest --secret="qr-secret" --project="${PROJECT_ID}")
# SMTP password is optional (email falls back to no-send mode if absent).
SMTP_PASS=$(gcloud secrets versions access latest --secret="smtp-pass" --project="${PROJECT_ID}" 2>/dev/null || echo "")

# 3. Write backend/.env
ENV_FILE="${REPO_ROOT}/backend/.env"

if [ -f "$ENV_FILE" ]; then
  echo "WARNING: A local backend/.env already exists."
  echo "Overwriting it will replace local development configuration (like your local PostgreSQL database URL) with production GCP/Supabase credentials."
  read -p "Do you want to overwrite your local backend/.env with production credentials? (y/N): " -r response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    ENV_FILE="${REPO_ROOT}/backend/.env.production"
    echo "Saving production credentials to ${ENV_FILE} instead."
  fi
fi

echo "Writing secrets to ${ENV_FILE}..."

cat <<EOF > "${ENV_FILE}"
PORT=3000
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
QR_SECRET=${QR_SECRET}
SMTP_HOST=mail.spacemail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=admin@m3hfil.com
SMTP_PASS=${SMTP_PASS}
MAIL_FROM=M3HFIL <admin@m3hfil.com>
GCS_EVENT_IMAGES_BUCKET=${PROJECT_ID}-event-images
EOF

echo "=== Local environment setup completed successfully ==="
