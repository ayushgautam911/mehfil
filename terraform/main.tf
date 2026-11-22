# VPC Network
resource "google_compute_network" "vpc_network" {
  name                    = "hive-vpc"
  auto_create_subnetworks = false
}

# Subnet
resource "google_compute_subnetwork" "subnet" {
  name          = "hive-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.vpc_network.id
}

# Firewall Rule - Allow external SSH, HTTP, HTTPS
resource "google_compute_firewall" "allow_web" {
  name    = "hive-allow-web"
  network = google_compute_network.vpc_network.name

  allow {
    protocol = "tcp"
    ports    = ["22", "80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["hive-web-server"]
}

# VM Service Account (Basic SA for standard VM isolation)
resource "google_service_account" "vm_sa" {
  account_id   = "hive-vm-sa"
  display_name = "Service Account for Hive VM"
}

# Static External IP Address
resource "google_compute_address" "static_ip" {
  name   = "hive-static-ip"
  region = var.region
}

# Compute Engine VM Instance
resource "google_compute_instance" "vm_instance" {
  name         = "hive-console-vm"
  machine_type = "e2-micro" # Eligible for GCP Free Tier
  zone         = var.zone

  tags = ["hive-web-server"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
      size  = 20 # 20 GB disk size
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.subnet.id

    access_config {
      nat_ip = google_compute_address.static_ip.address
    }
  }

  service_account {
    email  = google_service_account.vm_sa.email
    scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }

  metadata_startup_script = templatefile("${path.module}/startup-script.sh", {
    PROJECT_ID = var.project_id,
    REPO_URL   = var.repo_url
  })

  lifecycle {
    ignore_changes = [
      metadata_startup_script
    ]
  }
}

# Enable Secret Manager API
resource "google_project_service" "secretmanager" {
  service                    = "secretmanager.googleapis.com"
  disable_dependent_services = true
  disable_on_destroy         = false
}

# Secret Manager Secrets
resource "google_secret_manager_secret" "database_url" {
  secret_id = "database-url"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret" "qr_secret" {
  secret_id = "qr-secret"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secretmanager]
}

# SMTP password for outbound email (pass delivery). Only the password is a
# secret; host/port/user/from are non-sensitive config set in the scripts.
resource "google_secret_manager_secret" "smtp_pass" {
  secret_id = "smtp-pass"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secretmanager]
}

# Event images bucket — flyers/covers uploaded from the console. Objects are
# publicly readable (they're promotional assets embedded in the apps by URL);
# writes go through the backend only.
resource "google_storage_bucket" "event_images" {
  name                        = "${var.project_id}-event-images"
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = false

  cors {
    origin          = ["*"]
    method          = ["GET"]
    response_header = ["Content-Type"]
    max_age_seconds = 3600
  }
}

# Anyone can FETCH an event image by its exact URL, but not LIST the bucket:
# legacyObjectReader grants storage.objects.get only (objectViewer would also
# grant objects.list, letting anyone enumerate every image URL). Object names
# carry 256 bits of crypto-random entropy, so unlisted URLs are unguessable.
resource "google_storage_bucket_iam_member" "event_images_public_read" {
  bucket = google_storage_bucket.event_images.name
  role   = "roles/storage.legacyObjectReader"
  member = "allUsers"
}

# The VM (backend) can create/overwrite objects.
resource "google_storage_bucket_iam_member" "event_images_vm_writer" {
  bucket = google_storage_bucket.event_images.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.vm_sa.email}"
}

# IAM bindings for VM Service Account to access secrets
resource "google_secret_manager_secret_iam_member" "vm_sa_db_url" {
  secret_id = google_secret_manager_secret.database_url.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.vm_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "vm_sa_jwt" {
  secret_id = google_secret_manager_secret.jwt_secret.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.vm_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "vm_sa_qr" {
  secret_id = google_secret_manager_secret.qr_secret.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.vm_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "vm_sa_smtp" {
  secret_id = google_secret_manager_secret.smtp_pass.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.vm_sa.email}"
}
