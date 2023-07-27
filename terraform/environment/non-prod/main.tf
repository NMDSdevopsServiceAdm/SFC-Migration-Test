provider "aws" {
  region = "eu-west-1"
}

module "frontend" {
  source = "../../modules/frontend"

  frontend_bucket_name = var.frontend_bucket_name
}


# # TODO: We need to enable this to save state soon
# # terraform {
# #   backend "s3" {
# #     key = "medium-terraform/prod/terraform.tfstate"
# #     # ...
# #   }
# # }

