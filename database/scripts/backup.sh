#!/bin/bash

# PrismForge AI Database Backup Script
# This script creates database backups with encryption and compression
# Usage: ./backup.sh [environment] [backup_type]

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-${PROJECT_ROOT}/database/backups}"
LOG_FILE="${LOG_FILE:-${BACKUP_DIR}/backup.log}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
ENCRYPTION_KEY_FILE="${ENCRYPTION_KEY_FILE:-}"
S3_BUCKET="${S3_BUCKET:-}"
AZURE_CONTAINER="${AZURE_CONTAINER:-}"
GCS_BUCKET="${GCS_BUCKET:-}"

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-prismforge}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"

# Default values
ENVIRONMENT="${1:-production}"
BACKUP_TYPE="${2:-full}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="${ENVIRONMENT}_${BACKUP_TYPE}_${TIMESTAMP}"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Cleanup function
cleanup() {
    if [[ -n "${TEMP_DIR:-}" && -d "$TEMP_DIR" ]]; then
        rm -rf "$TEMP_DIR"
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Validate prerequisites
validate_prerequisites() {
    log "Validating prerequisites..."
    
    # Check required commands
    command -v pg_dump >/dev/null 2>&1 || error_exit "pg_dump not found"
    command -v gzip >/dev/null 2>&1 || error_exit "gzip not found"
    
    # Check encryption tool if encryption is enabled
    if [[ -n "$ENCRYPTION_KEY_FILE" ]]; then
        command -v gpg >/dev/null 2>&1 || error_exit "gpg not found (required for encryption)"
        [[ -f "$ENCRYPTION_KEY_FILE" ]] || error_exit "Encryption key file not found: $ENCRYPTION_KEY_FILE"
    fi
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Test database connection
    log "Testing database connection..."
    if [[ -n "$DB_PASSWORD" ]]; then
        export PGPASSWORD="$DB_PASSWORD"
    fi
    
    pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1 || \
        error_exit "Cannot connect to database"
    
    log "Prerequisites validated successfully"
}

# Create database backup
create_backup() {
    log "Starting $BACKUP_TYPE backup for $ENVIRONMENT environment..."
    
    local backup_file="${BACKUP_DIR}/${BACKUP_FILENAME}.sql"
    local compressed_file="${backup_file}.gz"
    local final_file="$compressed_file"
    
    # Create temporary directory
    TEMP_DIR=$(mktemp -d)
    local temp_backup="${TEMP_DIR}/backup.sql"
    
    case "$BACKUP_TYPE" in
        "full")
            log "Creating full database backup..."
            pg_dump \
                --host="$DB_HOST" \
                --port="$DB_PORT" \
                --username="$DB_USER" \
                --dbname="$DB_NAME" \
                --verbose \
                --no-password \
                --format=plain \
                --no-privileges \
                --no-owner \
                --create \
                --clean \
                --if-exists \
                --file="$temp_backup" || error_exit "pg_dump failed"
            ;;
        "schema")
            log "Creating schema-only backup..."
            pg_dump \
                --host="$DB_HOST" \
                --port="$DB_PORT" \
                --username="$DB_USER" \
                --dbname="$DB_NAME" \
                --verbose \
                --no-password \
                --format=plain \
                --schema-only \
                --no-privileges \
                --no-owner \
                --create \
                --clean \
                --if-exists \
                --file="$temp_backup" || error_exit "pg_dump schema failed"
            ;;
        "data")
            log "Creating data-only backup..."
            pg_dump \
                --host="$DB_HOST" \
                --port="$DB_PORT" \
                --username="$DB_USER" \
                --dbname="$DB_NAME" \
                --verbose \
                --no-password \
                --format=plain \
                --data-only \
                --no-privileges \
                --no-owner \
                --file="$temp_backup" || error_exit "pg_dump data failed"
            ;;
        *)
            error_exit "Unknown backup type: $BACKUP_TYPE"
            ;;
    esac
    
    # Compress backup
    log "Compressing backup..."
    gzip -c "$temp_backup" > "$compressed_file" || error_exit "Compression failed"
    
    # Encrypt if enabled
    if [[ -n "$ENCRYPTION_KEY_FILE" ]]; then
        log "Encrypting backup..."
        local encrypted_file="${compressed_file}.gpg"
        gpg --trust-model always --encrypt \
            --recipient-file "$ENCRYPTION_KEY_FILE" \
            --output "$encrypted_file" \
            "$compressed_file" || error_exit "Encryption failed"
        rm "$compressed_file"
        final_file="$encrypted_file"
    fi
    
    # Verify backup file
    if [[ ! -f "$final_file" ]]; then
        error_exit "Backup file was not created: $final_file"
    fi
    
    local file_size=$(du -h "$final_file" | cut -f1)
    log "Backup created successfully: $final_file ($file_size)"
    
    # Create metadata file
    create_backup_metadata "$final_file"
    
    echo "$final_file"
}

# Create backup metadata
create_backup_metadata() {
    local backup_file="$1"
    local metadata_file="${backup_file}.meta"
    
    cat > "$metadata_file" << EOF
{
    "backup_file": "$(basename "$backup_file")",
    "environment": "$ENVIRONMENT",
    "backup_type": "$BACKUP_TYPE",
    "timestamp": "$TIMESTAMP",
    "date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "database": {
        "host": "$DB_HOST",
        "port": $DB_PORT,
        "name": "$DB_NAME",
        "user": "$DB_USER"
    },
    "file_size": $(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file"),
    "checksum": "$(sha256sum "$backup_file" | cut -d' ' -f1)",
    "compressed": true,
    "encrypted": $([ -n "$ENCRYPTION_KEY_FILE" ] && echo "true" || echo "false"),
    "version": "1.0"
}
EOF
    
    log "Metadata created: $metadata_file"
}

# Upload backup to cloud storage
upload_backup() {
    local backup_file="$1"
    local metadata_file="${backup_file}.meta"
    
    # Upload to AWS S3
    if [[ -n "$S3_BUCKET" ]] && command -v aws >/dev/null 2>&1; then
        log "Uploading backup to S3..."
        aws s3 cp "$backup_file" "s3://${S3_BUCKET}/backups/$(basename "$backup_file")" || \
            log "WARNING: S3 upload failed"
        aws s3 cp "$metadata_file" "s3://${S3_BUCKET}/backups/$(basename "$metadata_file")" || \
            log "WARNING: S3 metadata upload failed"
    fi
    
    # Upload to Azure Blob Storage
    if [[ -n "$AZURE_CONTAINER" ]] && command -v az >/dev/null 2>&1; then
        log "Uploading backup to Azure..."
        az storage blob upload \
            --container-name "$AZURE_CONTAINER" \
            --file "$backup_file" \
            --name "backups/$(basename "$backup_file")" || \
            log "WARNING: Azure upload failed"
        az storage blob upload \
            --container-name "$AZURE_CONTAINER" \
            --file "$metadata_file" \
            --name "backups/$(basename "$metadata_file")" || \
            log "WARNING: Azure metadata upload failed"
    fi
    
    # Upload to Google Cloud Storage
    if [[ -n "$GCS_BUCKET" ]] && command -v gsutil >/dev/null 2>&1; then
        log "Uploading backup to GCS..."
        gsutil cp "$backup_file" "gs://${GCS_BUCKET}/backups/" || \
            log "WARNING: GCS upload failed"
        gsutil cp "$metadata_file" "gs://${GCS_BUCKET}/backups/" || \
            log "WARNING: GCS metadata upload failed"
    fi
}

# Clean up old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."
    
    # Local cleanup
    find "$BACKUP_DIR" -name "*.sql.gz*" -mtime +$RETENTION_DAYS -type f -delete || \
        log "WARNING: Local cleanup failed"
    find "$BACKUP_DIR" -name "*.meta" -mtime +$RETENTION_DAYS -type f -delete || \
        log "WARNING: Local metadata cleanup failed"
    
    # S3 cleanup
    if [[ -n "$S3_BUCKET" ]] && command -v aws >/dev/null 2>&1; then
        aws s3 ls "s3://${S3_BUCKET}/backups/" | \
        awk '{print $4}' | \
        while read -r file; do
            if [[ -n "$file" ]]; then
                file_date=$(echo "$file" | grep -oE '[0-9]{8}_[0-9]{6}' || true)
                if [[ -n "$file_date" ]]; then
                    file_timestamp=$(date -d "${file_date:0:8} ${file_date:9:2}:${file_date:11:2}:${file_date:13:2}" +%s 2>/dev/null || echo "0")
                    cutoff_timestamp=$(date -d "$RETENTION_DAYS days ago" +%s)
                    if [[ "$file_timestamp" -lt "$cutoff_timestamp" && "$file_timestamp" -ne "0" ]]; then
                        aws s3 rm "s3://${S3_BUCKET}/backups/$file" || \
                            log "WARNING: Failed to delete old S3 backup: $file"
                    fi
                fi
            fi
        done
    fi
    
    log "Cleanup completed"
}

# Verify backup integrity
verify_backup() {
    local backup_file="$1"
    local metadata_file="${backup_file}.meta"
    
    if [[ ! -f "$metadata_file" ]]; then
        log "WARNING: Metadata file not found, skipping verification"
        return 0
    fi
    
    log "Verifying backup integrity..."
    
    # Check file size
    local actual_size
    actual_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file")
    local expected_size
    expected_size=$(grep -o '"file_size": [0-9]*' "$metadata_file" | cut -d' ' -f2)
    
    if [[ "$actual_size" != "$expected_size" ]]; then
        error_exit "Backup file size mismatch: expected $expected_size, got $actual_size"
    fi
    
    # Check checksum
    local actual_checksum
    actual_checksum=$(sha256sum "$backup_file" | cut -d' ' -f1)
    local expected_checksum
    expected_checksum=$(grep -o '"checksum": "[^"]*"' "$metadata_file" | cut -d'"' -f4)
    
    if [[ "$actual_checksum" != "$expected_checksum" ]]; then
        error_exit "Backup checksum mismatch: expected $expected_checksum, got $actual_checksum"
    fi
    
    log "Backup verification passed"
}

# Send notification
send_notification() {
    local status="$1"
    local backup_file="$2"
    
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local color="good"
        local status_text="✅ Success"
        
        if [[ "$status" != "success" ]]; then
            color="danger"
            status_text="❌ Failed"
        fi
        
        local payload
        payload=$(cat << EOF
{
    "text": "Database Backup Notification",
    "attachments": [{
        "color": "$color",
        "fields": [
            {"title": "Status", "value": "$status_text", "short": true},
            {"title": "Environment", "value": "$ENVIRONMENT", "short": true},
            {"title": "Type", "value": "$BACKUP_TYPE", "short": true},
            {"title": "File", "value": "$(basename "$backup_file")", "short": false}
        ],
        "timestamp": $(date +%s)
    }]
}
EOF
        )
        
        curl -X POST -H 'Content-type: application/json' \
             --data "$payload" \
             "$SLACK_WEBHOOK_URL" >/dev/null 2>&1 || \
             log "WARNING: Failed to send Slack notification"
    fi
}

# Main execution
main() {
    log "Starting database backup process..."
    log "Environment: $ENVIRONMENT"
    log "Backup type: $BACKUP_TYPE"
    log "Timestamp: $TIMESTAMP"
    
    validate_prerequisites
    
    local backup_file
    backup_file=$(create_backup)
    
    verify_backup "$backup_file"
    
    upload_backup "$backup_file"
    
    cleanup_old_backups
    
    send_notification "success" "$backup_file"
    
    log "Backup process completed successfully"
    log "Backup file: $backup_file"
    
    # Return backup file path for scripts
    echo "$backup_file"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi