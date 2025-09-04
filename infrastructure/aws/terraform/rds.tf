# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = aws_subnet.database[*].id

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# RDS Parameter Group
resource "aws_db_parameter_group" "main" {
  family = "postgres15"
  name   = "${var.project_name}-db-params"

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  tags = {
    Name = "${var.project_name}-db-params"
  }
}

# RDS Enhanced Monitoring Role
resource "aws_iam_role" "rds_enhanced_monitoring" {
  name = "${var.project_name}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-rds-monitoring-role"
  }
}

resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
  role       = aws_iam_role.rds_enhanced_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# RDS Primary Instance
resource "aws_db_instance" "primary" {
  identifier = "${var.project_name}-primary"

  # Engine
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class

  # Storage
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id           = aws_kms_key.rds.arn

  # Database
  db_name  = "prismforge"
  username = "postgres"
  password = random_password.db_password.result

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  port                   = 5432
  publicly_accessible    = false

  # Backup
  backup_retention_period = var.db_backup_retention_period
  backup_window          = var.db_backup_window
  maintenance_window     = var.db_maintenance_window
  
  copy_tags_to_snapshot = true
  skip_final_snapshot   = false
  final_snapshot_identifier = "${var.project_name}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  # Monitoring
  monitoring_interval = var.enable_enhanced_monitoring ? var.monitoring_interval : 0
  monitoring_role_arn = var.enable_enhanced_monitoring ? aws_iam_role.rds_enhanced_monitoring.arn : null

  performance_insights_enabled = true
  performance_insights_kms_key_id = aws_kms_key.rds.arn
  performance_insights_retention_period = 7

  # Parameters
  parameter_group_name = aws_db_parameter_group.main.name

  # Logging
  enabled_cloudwatch_logs_exports = ["postgresql"]

  # Multi-AZ for high availability
  multi_az = var.environment == "production" ? true : false

  # Deletion protection for production
  deletion_protection = var.environment == "production" ? true : false

  tags = {
    Name = "${var.project_name}-primary-db"
  }

  lifecycle {
    prevent_destroy = true
  }
}

# RDS Read Replica for production
resource "aws_db_instance" "replica" {
  count = var.environment == "production" ? 1 : 0

  identifier = "${var.project_name}-replica"

  # Source
  replicate_source_db = aws_db_instance.primary.identifier

  # Instance
  instance_class = var.db_instance_class

  # Network
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  # Monitoring
  monitoring_interval = var.enable_enhanced_monitoring ? var.monitoring_interval : 0
  monitoring_role_arn = var.enable_enhanced_monitoring ? aws_iam_role.rds_enhanced_monitoring.arn : null

  performance_insights_enabled = true
  performance_insights_kms_key_id = aws_kms_key.rds.arn
  performance_insights_retention_period = 7

  # Auto minor version upgrade
  auto_minor_version_upgrade = true

  tags = {
    Name = "${var.project_name}-replica-db"
  }
}

# DB Cluster for disaster recovery (cross-region)
resource "aws_db_instance" "dr" {
  count    = var.enable_cross_region_backup ? 1 : 0
  provider = aws.dr

  identifier = "${var.project_name}-dr"

  # Create from snapshot
  snapshot_identifier = aws_db_snapshot.automated.id

  # Engine
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class

  # Network - using default VPC in DR region for simplicity
  publicly_accessible = false

  # Skip final snapshot for DR instance
  skip_final_snapshot = true

  tags = {
    Name = "${var.project_name}-dr-db"
  }
}

# Automated snapshots for cross-region backup
resource "aws_db_snapshot" "automated" {
  count                  = var.enable_cross_region_backup ? 1 : 0
  db_instance_identifier = aws_db_instance.primary.id
  db_snapshot_identifier = "${var.project_name}-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  tags = {
    Name = "${var.project_name}-automated-snapshot"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# CloudWatch Log Group for RDS
resource "aws_cloudwatch_log_group" "rds" {
  name              = "/aws/rds/instance/${aws_db_instance.primary.id}/postgresql"
  retention_in_days = var.log_retention_in_days
  kms_key_id       = aws_kms_key.logs.arn

  tags = {
    Name = "${var.project_name}-rds-logs"
  }
}