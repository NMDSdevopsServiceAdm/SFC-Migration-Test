provider "aws" {
  region = "eu-west-1"
}

# ---------------------------------------------
# Provision S3 bucket with public access
# ---------------------------------------------

# resource "aws_s3_bucket" "sfc-frontend" {
#   bucket = var.bucket_name

#   tags = {
#     Name = "S3 bucket for zuhal"
#   }
# }

# resource "aws_s3_bucket_ownership_controls" "sfc-frontend" {
#   bucket = aws_s3_bucket.sfc-frontend.id
#   rule {
#     object_ownership = "BucketOwnerPreferred"
#   }
# }

# resource "aws_s3_bucket_public_access_block" "sfc-frontend" {
#   bucket = aws_s3_bucket.sfc-frontend.id

#   block_public_acls       = false
#   block_public_policy     = false
#   ignore_public_acls      = false
#   restrict_public_buckets = false
# }

# resource "aws_s3_bucket_acl" "sfc-frontend" {
#   depends_on = [
#     aws_s3_bucket_ownership_controls.sfc-frontend,
#     aws_s3_bucket_public_access_block.sfc-frontend,
#   ]

#   bucket = aws_s3_bucket.sfc-frontend.id
#   acl    = "public-read"
# }

# ---------------------------------------------
# Provision App Runner (Don't have correct permissions)
# ---------------------------------------------
# resource "aws_apprunner_service" "example" {
#   service_name = "example"

#   source_configuration {
#     image_repository {
#       image_configuration {
#         port = 3000
#       }
#       image_identifier      = "914197850242.dkr.ecr.eu-west-1.amazonaws.com/sfc-migration-test"
#       image_repository_type = "ECR_PUBLIC"
#     }
#     auto_deployments_enabled = false
#   }

#   tags = {
#     Name = "example-apprunner-service"
#   }
# }

# ---------------------------------------------
# DB SETUP (Don't have the right permissions atm)
# ---------------------------------------------

# resource "aws_db_instance" "sfc-test-db" {
#   identifier             = "sfc-test-db"
#   instance_class         = "db.t3.micro"
#   allocated_storage      = 20
#   engine                 = "postgres"
#   engine_version         = "14.1"
#   username               = "administrator"
#   password               = "random_password.main.result"
#   # db_subnet_group_name   = aws_db_subnet_group.sfc-test-db.name
#   # vpc_security_group_ids = [aws_security_groups.rds.id]
#   # parameter_group_name   = aws_db_parameter_group.sfc-test-db.name
#   skip_final_snapshot    = true
# }

# // Generate Password
# resource "random_password" "main" {
#   length           = 20
#   special          = true
#   override_special = "!@#$%&*-_=+?"
# }

# // Store Password
# resource "aws_secretsmanager_secret" "rds_params" {
#   name                    = "/test/rds/all"
#   description             = "Database parameters"
#   recovery_window_in_days = 0
# }

# resource "aws_secretsmanager_secret_version" "rds_params" {
#   secret_id     = aws_secretsmanager_secret.rds_params.id
#   secret_string = jsonencode({
#     DB_HOST = aws_db_instance.sfc-test-db.address
#     DB_PORT = aws_db_instance.sfc-test-db.port
#     DB_USER = aws_db_instance.sfc-test-db.username
#     DB_PASS = random_password.main.result
#   })
# }

# // Retrieve Password
# data "aws_secretsmanager_secret_version" "rds_params" {
#   secret_id  = aws_secretsmanager_secret.rds_params.id
#   depends_on = [aws_secretsmanager_secret_version.rds_params]
# }

# -----------------------------

# output "rds_address" {
#   # value = jsondecode(data.aws_secretsmanager_secret_version.rds_params.secret_string)["rds_address"]
#   value = aws_db_instance.sfc-test-db.address
# }

# output "rds_port" {
#   # value = jsondecode(data.aws_secretsmanager_secret_version.rds_params.secret_string)["rds_port"]
#   value = aws_db_instance.sfc-test-db.port
# }

# output "rds_username" {
#   # value = jsondecode(data.aws_secretsmanager_secret_version.rds_params.secret_string)["rds_username"]
#   value = aws_db_instance.sfc-test-db.username
# }

# output "rds_password" {
#   # value     = jsondecode(data.aws_secretsmanager_secret_version.rds_params.secret_string)["rds_password"]
#   value = aws_db_instance.sfc-test-db.password
#   sensitive = true
# }

# output "rds_all" {
# value = jsondecode(data.aws_secretsmanager_secret_version.rds_params.secret_string)
# }

# resource "aws_elasticache_cluster" "example" {
#   cluster_id           = "sfc-migration-zuhal"
#   engine               = "redis"
#   node_type            = "cache.t4g.micro"
#   num_cache_nodes      = 1
#   parameter_group_name = "default.redis7.cluster.on"
#   port                 = 6379
# }

# resource "aws_elasticache_replication_group" "example" {
#   automatic_failover_enabled  = true
#   preferred_cache_cluster_azs = ["eu-west-1a", "eu-west-1b"]
#   replication_group_id        = "tf-rep-group-1"
#   description                 = "example description"
#   node_type                   = "cache.t4g.micro"
#   num_cache_clusters          = 1
#   parameter_group_name        = "default.redis7.cluster.on"
#   port                        = 6379
# }

# resource "aws_elasticache_cluster" "replica" {
#   cluster_id           = "cluster-example"
#   replication_group_id = aws_elasticache_replication_group.example.id
# }



