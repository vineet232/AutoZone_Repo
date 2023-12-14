# modules/cloudrun/main.tf

variable "project" {
  description = "GCP project ID"
}

variable "environment" {
  description = "Environment names"
  type        = set(string)
}

variable "services" {
  description = "Map of Cloud Run services"
  type        = map(object({
    image = string
    ports = list(number)
  }))
}

variable "regions" {
  description = "Map of environment-specific regions"
  type        = map(string)
}

locals {
  service_names = keys(var.services)
}

resource "google_cloud_run_service" "cloudrun" {
  count = length(local.service_names) * length(var.environment)

  name     = "${local.service_names[(count.index % length(local.service_names))]}-${var.environment[(count.index / length(local.service_names)) % length(var.environment)]}"
  project  = var.project
  location = var.regions[var.environment[(count.index / length(local.service_names)) % length(var.environment)]]

  template {
    spec {
      containers {
        image = var.services[local.service_names[(count.index % length(local.service_names))]].image
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  # Add other configurations like environment variables, concurrency, etc., as needed
}
