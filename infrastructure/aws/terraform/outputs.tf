# Output values for AWS infrastructure

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "VPC CIDR block"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "database_subnet_ids" {
  description = "Database subnet IDs"
  value       = aws_subnet.database[*].id
}

# Load Balancer
output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "ALB zone ID"
  value       = aws_lb.main.zone_id
}

output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

# ECS
output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.app.name
}

# Database
output "rds_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.primary.endpoint
  sensitive   = true
}

output "rds_port" {
  description = "RDS port"
  value       = aws_db_instance.primary.port
}

output "rds_replica_endpoint" {
  description = "RDS replica endpoint"
  value       = var.environment == "production" ? aws_db_instance.replica[0].endpoint : null
  sensitive   = true
}

# Redis
output "redis_endpoint" {
  description = "Redis endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}

output "redis_port" {
  description = "Redis port"
  value       = aws_elasticache_replication_group.main.port
}

# ECR
output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.app.repository_url
}

output "ecr_repository_arn" {
  description = "ECR repository ARN"
  value       = aws_ecr_repository.app.arn
}

# Security Groups
output "alb_security_group_id" {
  description = "ALB security group ID"
  value       = aws_security_group.alb.id
}

output "ecs_security_group_id" {
  description = "ECS tasks security group ID"
  value       = aws_security_group.ecs_tasks.id
}

output "rds_security_group_id" {
  description = "RDS security group ID"
  value       = aws_security_group.rds.id
}

output "redis_security_group_id" {
  description = "Redis security group ID"
  value       = aws_security_group.redis.id
}

# KMS Keys
output "main_kms_key_arn" {
  description = "Main KMS key ARN"
  value       = aws_kms_key.main.arn
}

output "rds_kms_key_arn" {
  description = "RDS KMS key ARN"
  value       = aws_kms_key.rds.arn
}

output "logs_kms_key_arn" {
  description = "Logs KMS key ARN"
  value       = aws_kms_key.logs.arn
}

# IAM Roles
output "ecs_execution_role_arn" {
  description = "ECS execution role ARN"
  value       = aws_iam_role.ecs_execution_role.arn
}

output "ecs_task_role_arn" {
  description = "ECS task role ARN"
  value       = aws_iam_role.ecs_task_role.arn
}

# S3 Buckets
output "app_storage_bucket_name" {
  description = "Application storage bucket name"
  value       = aws_s3_bucket.app_storage.bucket
}

output "alb_logs_bucket_name" {
  description = "ALB logs bucket name"
  value       = aws_s3_bucket.alb_logs.bucket
}

# CloudWatch Log Groups
output "app_log_group_name" {
  description = "Application log group name"
  value       = aws_cloudwatch_log_group.app.name
}

output "rds_log_group_name" {
  description = "RDS log group name"
  value       = aws_cloudwatch_log_group.rds.name
}

# Certificate
output "certificate_arn" {
  description = "ACM certificate ARN"
  value       = var.certificate_arn != "" ? var.certificate_arn : (var.domain_name != "" ? aws_acm_certificate.main[0].arn : null)
}

# Domain
output "domain_name" {
  description = "Domain name"
  value       = var.domain_name
}

# Environment
output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

# WAF
output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN"
  value       = var.enable_waf ? aws_wafv2_web_acl.main[0].arn : null
}

# Monitoring
output "sns_alerts_topic_arn" {
  description = "SNS alerts topic ARN"
  value       = aws_sns_topic.alerts.arn
}

# Service Discovery
output "service_discovery_namespace_id" {
  description = "Service discovery namespace ID"
  value       = aws_service_discovery_private_dns_namespace.main.id
}

output "service_discovery_service_arn" {
  description = "Service discovery service ARN"
  value       = aws_service_discovery_service.app.arn
}

# Database Connection String (for reference, actual value stored in SSM)
output "database_connection_info" {
  description = "Database connection information"
  value = {
    host     = aws_db_instance.primary.endpoint
    port     = aws_db_instance.primary.port
    database = aws_db_instance.primary.db_name
    username = aws_db_instance.primary.username
    # Password is stored in SSM Parameter Store
    password_ssm_parameter = aws_ssm_parameter.database_url.name
  }
  sensitive = true
}