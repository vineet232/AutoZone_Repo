# variables.tf

variable "project" {
  description = "GCP project ID"
}

variable "environments" {
  description = "Environment names"
  type        = set(string)
  default     = ["dev", "prod"]
}

variable "services" {
  description = "Map of Cloud Run services"
  type        = map(object({
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

variable "regions" {
  description = "Map of environment-specific regions"
  type        = map(string)
  default     = {
    dev  = "us-central1",
    prod = "us-east1",
  }
}
