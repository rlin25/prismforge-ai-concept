# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-cache-subnet"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.project_name}-cache-subnet-group"
  }
}

# ElastiCache Parameter Group
resource "aws_elasticache_parameter_group" "main" {
  name   = "${var.project_name}-redis-params"
  family = "redis7.x"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  tags = {
    Name = "${var.project_name}-redis-params"
  }
}

# ElastiCache Replication Group
resource "aws_elasticache_replication_group" "main" {
  replication_group_id         = "${var.project_name}-redis"
  description                  = "Redis cache for ${var.project_name}"
  
  port                         = 6379
  parameter_group_name         = aws_elasticache_parameter_group.main.name
  node_type                    = var.redis_node_type
  num_cache_clusters           = var.redis_num_cache_nodes
  
  engine                       = "redis"
  engine_version              = "7.0"
  
  subnet_group_name           = aws_elasticache_subnet_group.main.name
  security_group_ids          = [aws_security_group.redis.id]
  
  # Enable encryption
  at_rest_encryption_enabled  = true
  transit_encryption_enabled  = true
  auth_token                  = random_password.redis_auth_token.result
  
  # Enable automatic failover for multi-AZ
  automatic_failover_enabled  = var.environment == "production" ? true : false
  multi_az_enabled           = var.environment == "production" ? true : false
  
  # Backup configuration
  snapshot_retention_limit   = var.environment == "production" ? 5 : 1
  snapshot_window           = "03:00-05:00"
  
  # Maintenance window
  maintenance_window        = "sun:05:00-sun:07:00"
  
  # Notification
  notification_topic_arn    = aws_sns_topic.alerts.arn
  
  # Enable logging
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_slow.name
    destination_type = "cloudwatch-logs"
    log_format      = "text"
    log_type        = "slow-log"
  }

  tags = {
    Name = "${var.project_name}-redis-replication-group"
  }

  lifecycle {
    prevent_destroy = true
  }
}

# Random password for Redis AUTH
resource "random_password" "redis_auth_token" {
  length  = 32
  special = false
}

# CloudWatch Log Group for Redis slow logs
resource "aws_cloudwatch_log_group" "redis_slow" {
  name              = "/aws/elasticache/redis/${var.project_name}/slow-log"
  retention_in_days = var.log_retention_in_days
  kms_key_id       = aws_kms_key.logs.arn

  tags = {
    Name = "${var.project_name}-redis-slow-logs"
  }
}

# Store Redis auth token in SSM Parameter Store
resource "aws_ssm_parameter" "redis_auth_token" {
  name  = "/${var.project_name}/redis_auth_token"
  type  = "SecureString"
  value = random_password.redis_auth_token.result
  
  key_id = aws_kms_key.main.key_id

  tags = {
    Name = "${var.project_name}-redis-auth-token"
  }
}