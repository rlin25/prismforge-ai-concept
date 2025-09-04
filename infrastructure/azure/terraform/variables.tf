# PrismForge AI - Azure Infrastructure Variables

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US"
}

variable "secondary_location" {
  description = "Azure region for disaster recovery"
  type        = string
  default     = "West US 2"
}

variable "environment" {
  description = "Environment name (production, staging, development)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be production, staging, or development."
  }
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "prismforge-ai"
}

variable "owner" {
  description = "Project owner/team"
  type        = string
  default     = "platform-team"
}

variable "cost_center" {
  description = "Cost center for billing"
  type        = string
  default     = "engineering"
}

# Networking
variable "vnet_cidr" {
  description = "CIDR block for VNet"
  type        = string
  default     = "10.0.0.0/16"
}

variable "appgateway_subnet_cidr" {
  description = "CIDR block for Application Gateway subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "app_subnet_cidr" {
  description = "CIDR block for application subnet"
  type        = string
  default     = "10.0.2.0/24"
}

variable "database_subnet_cidr" {
  description = "CIDR block for database subnet"
  type        = string
  default     = "10.0.3.0/24"
}

# Container Apps
variable "container_app_environment_name" {
  description = "Name of Container Apps Environment"
  type        = string
  default     = "prismforge-env"
}

variable "app_container_cpu" {
  description = "CPU allocation for application container"
  type        = number
  default     = 1
}

variable "app_container_memory" {
  description = "Memory allocation for application container in Gi"
  type        = string
  default     = "2Gi"
}

variable "app_min_replicas" {
  description = "Minimum number of replicas"
  type        = number
  default     = 2
}

variable "app_max_replicas" {
  description = "Maximum number of replicas"
  type        = number
  default     = 10
}

# PostgreSQL Configuration
variable "postgres_sku_name" {
  description = "PostgreSQL SKU name"
  type        = string
  default     = "GP_Standard_D2s_v3"
}

variable "postgres_storage_mb" {
  description = "PostgreSQL storage in MB"
  type        = number
  default     = 32768
}

variable "postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "13"
}

variable "postgres_administrator_login" {
  description = "PostgreSQL administrator login"
  type        = string
  default     = "postgres"
}

variable "postgres_backup_retention_days" {
  description = "PostgreSQL backup retention in days"
  type        = number
  default     = 7
}

# Redis Configuration
variable "redis_sku_name" {
  description = "Redis SKU name"
  type        = string
  default     = "Standard"
}

variable "redis_family" {
  description = "Redis family"
  type        = string
  default     = "C"
}

variable "redis_capacity" {
  description = "Redis capacity"
  type        = number
  default     = 1
}

# Application Gateway
variable "app_gateway_sku_name" {
  description = "Application Gateway SKU name"
  type        = string
  default     = "WAF_v2"
}

variable "app_gateway_sku_tier" {
  description = "Application Gateway SKU tier"
  type        = string
  default     = "WAF_v2"
}

variable "app_gateway_sku_capacity" {
  description = "Application Gateway SKU capacity"
  type        = number
  default     = 2
}

# Domain and SSL
variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = ""
}

variable "ssl_certificate_path" {
  description = "Path to SSL certificate"
  type        = string
  default     = ""
}

variable "ssl_certificate_password" {
  description = "SSL certificate password"
  type        = string
  sensitive   = true
  default     = ""
}

# Security
variable "allowed_ip_ranges" {
  description = "IP ranges allowed to access the application"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "enable_waf" {
  description = "Enable Web Application Firewall"
  type        = bool
  default     = true
}

# Monitoring
variable "log_analytics_retention_days" {
  description = "Log Analytics retention in days"
  type        = number
  default     = 30
}

variable "enable_application_insights" {
  description = "Enable Application Insights"
  type        = bool
  default     = true
}

# Environment Variables
variable "anthropic_api_key" {
  description = "Anthropic API key"
  type        = string
  sensitive   = true
}

variable "nextauth_secret" {
  description = "NextAuth secret"
  type        = string
  sensitive   = true
}

variable "supabase_url" {
  description = "Supabase URL"
  type        = string
  default     = ""
}

variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "supabase_service_role_key" {
  description = "Supabase service role key"
  type        = string
  sensitive   = true
  default     = ""
}

# Backup and DR
variable "enable_geo_redundant_backup" {
  description = "Enable geo-redundant backup"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Backup retention in days"
  type        = number
  default     = 30
}

# Scaling
variable "cpu_threshold" {
  description = "CPU threshold for auto-scaling"
  type        = number
  default     = 70
}

variable "memory_threshold" {
  description = "Memory threshold for auto-scaling"
  type        = number
  default     = 80
}

variable "http_requests_threshold" {
  description = "HTTP requests threshold for auto-scaling"
  type        = number
  default     = 1000
}

# Container Registry
variable "acr_sku" {
  description = "Azure Container Registry SKU"
  type        = string
  default     = "Premium"
}

variable "acr_admin_enabled" {
  description = "Enable admin user for ACR"
  type        = bool
  default     = false
}

# Key Vault
variable "key_vault_sku_name" {
  description = "Key Vault SKU name"
  type        = string
  default     = "premium"
}

variable "soft_delete_retention_days" {
  description = "Key Vault soft delete retention days"
  type        = number
  default     = 7
}