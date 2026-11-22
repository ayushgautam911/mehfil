#!/usr/bin/env bash
#
# write-backend-env.sh — (re)generate the backend .env from GCP Secret Manager.
#
# Runs ON the GCP VM and authenticates as the instance service account via the
# metadata server (no key files needed). This is the single source of truth for
# the backend's runtime environment and is invoked both:
#   - at first boot by terraform/startup-script.sh, and
#   - on every deploy by .github/workflows/deploy.yml (before the service restart)
# so the running server's config/secrets always match Secret Manager.
#
# Secret values (database-url, jwt-secret, qr-secret, smtp-pass) come from Secret
# Manager; non-secret config (SMTP host/port/user, MAIL_FROM, PORT) is literal.
set -eu

PROJECT_ID="${PROJECT_ID:-your-gcp-project-id}"
ENV_FILE="${ENV_FILE:-/opt/hive/backend/.env}"

# Fetch a secret's latest version via the instance service account.
# Usage: get_secret <name> [optional]   (optional=true -> empty instead of failing)
get_secret() {
  local name="$1"
  local optional="${2:-false}"
  local token payload

  token=$(curl -s -H "Metadata-Flavor: Google" \
    "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token" \
    | grep -o '"access_token":"[^"]*' | grep -o '[^"]*$') || true

  payload=$(curl -s -H "Authorization: Bearer $token" \
    "https://secretmanager.googleapis.com/v1/projects/${PROJECT_ID}/secrets/${name}/versions/latest:access" \
    | jq -r '.payload.data // empty') || true

  if [ -n "$payload" ]; then
    echo "$payload" | base64 --decode
  elif [ "$optional" = "true" ]; then
    echo ""
  else
    echo "ERROR: failed to fetch required secret '$name' from Secret Manager" >&2
    return 1
  fi
}

echo "Generating ${ENV_FILE} from Secret Manager (project ${PROJECT_ID})..."

DATABASE_URL=$(get_secret "database-url")
if [[ "$DATABASE_URL" == *"db.<supabase-project-ref>.supabase.co"* ]]; then
  echo "Rewriting direct Supabase database URL to pooler URL for IPv4 support..."
  DATABASE_URL=$(echo "$DATABASE_URL" | sed 's|postgres://postgres:|postgres://postgres.<supabase-project-ref>:|' | sed 's|db.<supabase-project-ref>.supabase.co|aws-1-us-west-2.pooler.supabase.com|')
  if [[ "$DATABASE_URL" != *"sslmode="* ]]; then
    if [[ "$DATABASE_URL" == *"?"* ]]; then
      DATABASE_URL="${DATABASE_URL}&sslmode=require"
    else
      DATABASE_URL="${DATABASE_URL}?sslmode=require"
    fi
  fi
fi
JWT_SECRET=$(get_secret "jwt-secret")
QR_SECRET=$(get_secret "qr-secret")
SMTP_PASS=$(get_secret "smtp-pass" true) # optional -> no-send dev mode if absent

# Keep the .env readable only by its owner.
umask 077
cat > "$ENV_FILE" <<EOF
PORT=3000
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
QR_SECRET=$QR_SECRET
SMTP_HOST=mail.spacemail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=admin@m3hfil.com
SMTP_PASS=$SMTP_PASS
MAIL_FROM=M3HFIL <admin@m3hfil.com>
GCS_EVENT_IMAGES_BUCKET=${PROJECT_ID}-event-images
EOF

echo "Wrote ${ENV_FILE}."
