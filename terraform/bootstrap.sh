#!/bin/bash
# bootstrap.sh - Prepare GCP GCS bucket for Terraform remote state

set -e

PROJECT_ID="your-gcp-project-id"
BUCKET_NAME="${PROJECT_ID}-tfstate"
REGION="us-east1"

echo "=== Hive GCP Bootstrap ==="

# 1. Check if user is authenticated with gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
  echo "Error: No active gcloud account found. Please run 'gcloud auth login' first."
  exit 1
fi

echo "Authenticated with gcloud."

# 2. Check if GCS bucket exists, and create if missing
echo "Checking state bucket: gs://${BUCKET_NAME}"
if ! gsutil ls -b "gs://${BUCKET_NAME}" >/dev/null 2>&1; then
  echo "Bucket gs://${BUCKET_NAME} does not exist. Creating..."
  gsutil mb -p "${PROJECT_ID}" -l "${REGION}" "gs://${BUCKET_NAME}"
  echo "Enabling versioning on gs://${BUCKET_NAME}..."
  gsutil versioning set on "gs://${BUCKET_NAME}"
  echo "Bucket gs://${BUCKET_NAME} created and configured successfully."
else
  echo "Bucket gs://${BUCKET_NAME} already exists."
fi

# 3. Check for local terraform.tfvars
if [ ! -f "terraform.tfvars" ]; then
  if [ -f "terraform.tfvars.example" ]; then
    echo "Creating terraform.tfvars from template..."
    cp terraform.tfvars.example terraform.tfvars
    echo "WARNING: Please review and update 'terraform.tfvars' with your settings."
  else
    echo "Warning: No terraform.tfvars found."
  fi
fi

# 4. Initialize Terraform remote state
echo "Initializing Terraform..."
terraform init

echo "=== Bootstrap Completed Successfully ==="
