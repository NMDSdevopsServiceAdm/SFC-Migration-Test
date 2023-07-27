resource "aws_ecr_repository" "sfc_backend_ecr_repository" {
  name                 = "sfc_backend"
}

resource "aws_db_instance" "sfc_rds_db" {
  identifier             = "sam-db"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "14.7"
  username               = "administrator" # TODO: We may want this as a random string
  password               = random_password.sfc_rds_password.result
  skip_final_snapshot    = true
}

resource "random_password" "sfc_rds_password" {
  length           = 20
  special          = true
  override_special = "!@#$%&*-_=+?"
}

resource "aws_secretsmanager_secret" "sfc_rds_params" {
  name                    = "/test/rds/all"
  description             = "Database parameters"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "sfc_rds_params" {
  secret_id     = aws_secretsmanager_secret.sfc_rds_params.id
  secret_string = jsonencode({
    DB_HOST = aws_db_instance.sfc_rds_db.address
    DB_PORT = aws_db_instance.sfc_rds_db.port
    DB_USER = aws_db_instance.sfc_rds_db.username
    DB_PASS = random_password.sfc_rds_password.result
  })
}
resource "aws_elasticache_cluster" "sfc_redis" {
  cluster_id           = "sfc-redis"
  engine               = "redis"
  node_type            = "cache.t4g.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
}