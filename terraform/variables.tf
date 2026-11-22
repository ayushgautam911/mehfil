variable "project_id" {
  description = "The GCP Project ID"
  type        = string
}

variable "region" {
  description = "The GCP region to deploy resources in"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "The GCP zone to deploy the VM in"
  type        = string
  default     = "us-central1-a"
}

variable "database_url" {
  description = "The PostgreSQL connection URL from Supabase"
  type        = string
  sensitive   = true
  default     = ""
}

variable "jwt_secret" {
  description = "JWT Secret token for the Fastify app"
  type        = string
  sensitive   = true
  default     = "production_jwt_secret_token_key"
}

variable "qr_secret" {
  description = "QR HMAC Secret key for signing ticket passes"
  type        = string
  sensitive   = true
  default     = "production_qr_secret_signing_key"
}

variable "repo_url" {
  description = "The Git repository URL for the Hive project"
  type        = string
  default     = "https://github.com/genuinly-dumb/hive.git"
}
