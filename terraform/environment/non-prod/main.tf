provider "aws" {
  region = "eu-west-1"
}

module "frontend" {
  source = "../../modules/frontend"

  frontend_bucket_name = var.frontend_bucket_name
}