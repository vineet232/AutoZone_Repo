# main.tf

provider "google" {
  credentials = file("./credentials/service-account-key.json")
  project     = var.project
  region      = "us-central1" # Set a default region
}

# Define your environments
locals {
  regions = var.regions
}

# Loop through services
variable "services" {
  type = map(object({
    image = string
    ports = list(number)
  }))
  default = {
    myapp = {
      image = "gcr.io/cloudrun/myapp:latest",
      ports = [80],
    },
    anotherapp = {
      image = "gcr.io/cloudrun/anotherapp:latest",
      ports = [8080],
    },
  }
}

resource "google_project_service" "run" {
  for_each = var.environments
  project  = var.project
  service  = "run.googleapis.com"
}

resource "google_project_service" "cloudbuild" {
  for_each = var.environments
  project  = var.project
  service  = "cloudbuild.googleapis.com"
}

module "cloudrun" {
  source = "./modules/cloudrun"

  providers = {
    google = google
  }

  project     = var.project
  environment = var.environments
  services    = var.services
  regions     = local.regions
}
