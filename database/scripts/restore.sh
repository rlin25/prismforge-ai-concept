#!/bin/bash

# PrismForge AI Database Restore Script
# This script restores database backups with decryption and verification
# Usage: ./restore.sh [backup_file] [environment] [options]

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-${PROJECT_ROOT}/database/backups}"
LOG_FILE="${LOG_FILE:-${BACKUP_DIR}/restore.log}"
ENCRYPTION_KEY_FILE="${ENCRYPTION_KEY_FILE:-}"

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-prismforge}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"

# Command line arguments
BACKUP_FILE="${1:-}"
ENVIRONMENT="${2:-production}"
DRY_RUN="${3:-}"

# Options
FORCE_RESTORE=false
SKIP_VERIFICATION=false
CREATE_DB=false

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

# Show usage
show_usage() {
    cat << EOF
Usage: $0 [backup_file] [environment] [options]

Arguments:
    backup_file     Path to backup file or backup identifier
    environment     Target environment (production, staging, development)
    
Options:
    --dry-run       Show what would be done without executing
    --force         Force restore without confirmation
    --skip-verify   Skip backup verification
    --create-db     Create database if it doesn't exist
    --help          Show this help message

Examples:
    $0 /path/to/backup.sql.gz production
    $0 production_full_20240101_120000 staging --force
    $0 latest production --dry-run

Environment Variables:
    DB_HOST         Database host (default: localhost)
    DB_PORT         Database port (default: 5432)
    DB_NAME         Database name (default: prismforge)
    DB_USER         Database user (default: postgres)
    DB_PASSWORD     Database password
    ENCRYPTION_KEY_FILE  Path to GPG key for decryption
    BACKUP_DIR      Backup directory path
EOF
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN="true"
                shift
                ;;
            --force)
                FORCE_RESTORE=true
                shift
                ;;
            --skip-verify)
                SKIP_VERIFICATION=true
                shift
                ;;
            --create-db)
                CREATE_DB=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                shift
                ;;
        esac
    done
}

# Validate prerequisites
validate_prerequisites() {
    log "Validating prerequisites..."
    
    # Check required commands
    command -v psql >/dev/null 2>&1 || error_exit "psql not found"
    command -v pg_isready >/dev/null 2>&1 || error_exit "pg_isready not found"
    command -v gunzip >/dev/null 2>&1 || error_exit "gunzip not found"
    
    # Check GPG if needed
    if [[ -n "$ENCRYPTION_KEY_FILE" ]]; then
        command -v gpg >/dev/null 2>&1 || error_exit "gpg not found (required for decryption)"
        [[ -f "$ENCRYPTION_KEY_FILE" ]] || error_exit "Encryption key file not found: $ENCRYPTION_KEY_FILE"
    fi
    
    # Validate backup file
    if [[ -z "$BACKUP_FILE" ]]; then
        error_exit "Backup file not specified"
    fi
    
    # Set password if provided
    if [[ -n "$DB_PASSWORD" ]]; then
        export PGPASSWORD="$DB_PASSWORD"
    fi
    
    log "Prerequisites validated successfully"
}

# Find backup file
find_backup_file() {
    local backup_identifier="$1"
    local found_file=""
    
    # If it's a full path and exists, use it
    if [[ -f "$backup_identifier" ]]; then
        found_file="$backup_identifier"
    # If it's "latest", find the most recent backup
    elif [[ "$backup_identifier" == "latest" ]]; then
        found_file=$(find "$BACKUP_DIR" -name "${ENVIRONMENT}_*.sql.gz*" -type f | sort -r | head -n1)
    # Otherwise, look in backup directory
    else
        # Try exact match first
        if [[ -f "${BACKUP_DIR}/${backup_identifier}" ]]; then
            found_file="${BACKUP_DIR}/${backup_identifier}"
        # Try with common extensions
        elif [[ -f "${BACKUP_DIR}/${backup_identifier}.sql.gz" ]]; then
            found_file="${BACKUP_DIR}/${backup_identifier}.sql.gz"
        elif [[ -f "${BACKUP_DIR}/${backup_identifier}.sql.gz.gpg" ]]; then
            found_file="${BACKUP_DIR}/${backup_identifier}.sql.gz.gpg"
        # Try pattern matching
        else
            found_file=$(find "$BACKUP_DIR" -name "*${backup_identifier}*" -type f | head -n1)
        fi
    fi
    
    if [[ -z "$found_file" || ! -f "$found_file" ]]; then
        error_exit "Backup file not found: $backup_identifier"
    fi
    
    echo "$found_file"
}

# Verify backup metadata
verify_backup_metadata() {
    local backup_file="$1"
    local metadata_file="${backup_file}.meta"
    
    if [[ "$SKIP_VERIFICATION" == "true" ]]; then
        log "Skipping backup verification as requested"
        return 0
    fi
    
    if [[ ! -f "$metadata_file" ]]; then
        log "WARNING: Metadata file not found, skipping detailed verification"
        return 0
    fi
    
    log "Verifying backup metadata..."
    
    # Check file size
    local actual_size
    actual_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file")
    local expected_size
    expected_size=$(grep -o '"file_size": [0-9]*' "$metadata_file" | cut -d' ' -f2)
    
    if [[ -n "$expected_size" && "$actual_size" != "$expected_size" ]]; then
        error_exit "Backup file size mismatch: expected $expected_size, got $actual_size"
    fi
    
    # Check checksum
    local actual_checksum
    actual_checksum=$(sha256sum "$backup_file" | cut -d' ' -f1)
    local expected_checksum
    expected_checksum=$(grep -o '"checksum": "[^"]*"' "$metadata_file" | cut -d'"' -f4)
    
    if [[ -n "$expected_checksum" && "$actual_checksum" != "$expected_checksum" ]]; then
        error_exit "Backup checksum mismatch: expected $expected_checksum, got $actual_checksum"
    fi
    
    # Display backup information
    log "Backup verification passed"
    if command -v jq >/dev/null 2>&1 && [[ -f "$metadata_file" ]]; then
        log "Backup information:"
        jq -r '. | "  Date: \(.date)\n  Type: \(.backup_type)\n  Environment: \(.environment)\n  Size: \(.file_size) bytes"' "$metadata_file" | \
            while IFS= read -r line; do log "$line"; done
    fi
}

# Prepare backup for restore
prepare_backup() {
    local backup_file="$1"
    
    # Create temporary directory
    TEMP_DIR=$(mktemp -d)
    local prepared_file="${TEMP_DIR}/restore.sql"
    
    log "Preparing backup for restore..."
    
    # Determine file type and process accordingly
    if [[ "$backup_file" == *.gpg ]]; then
        # Decrypt and decompress
        log "Decrypting backup file..."
        if [[ -n "$ENCRYPTION_KEY_FILE" ]]; then
            gpg --batch --yes --decrypt --output "${TEMP_DIR}/backup.gz" "$backup_file" || \
                error_exit "Decryption failed"
        else
            error_exit "Encryption key file not specified for encrypted backup"
        fi
        
        log "Decompressing decrypted backup..."
        gunzip -c "${TEMP_DIR}/backup.gz" > "$prepared_file" || error_exit "Decompression failed"
        
    elif [[ "$backup_file" == *.gz ]]; then
        # Just decompress
        log "Decompressing backup file..."
        gunzip -c "$backup_file" > "$prepared_file" || error_exit "Decompression failed"
        
    else
        # Copy as-is
        log "Using backup file as-is..."
        cp "$backup_file" "$prepared_file" || error_exit "Failed to copy backup file"
    fi
    
    # Verify prepared file
    if [[ ! -f "$prepared_file" || ! -s "$prepared_file" ]]; then
        error_exit "Prepared backup file is empty or missing"
    fi
    
    log "Backup prepared successfully"
    echo "$prepared_file"
}

# Create database if needed
create_database_if_needed() {
    if [[ "$CREATE_DB" == "true" ]]; then
        log "Creating database if it doesn't exist..."
        
        # Connect to postgres database to create target database
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
             -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | \
             grep -q 1 || \
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
             -c "CREATE DATABASE $DB_NAME" || \
             error_exit "Failed to create database"
        
        log "Database creation check completed"
    fi
}

# Test database connection
test_database_connection() {
    log "Testing database connection..."
    
    pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1 || \
        error_exit "Cannot connect to target database"
    
    # Test actual connection
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
         -c "SELECT 1" >/dev/null 2>&1 || \
         error_exit "Cannot execute queries on target database"
    
    log "Database connection successful"
}

# Get database info before restore
get_database_info() {
    log "Gathering database information before restore..."
    
    local info_file="${TEMP_DIR}/db_info_before.txt"
    
    {
        echo "Database: $DB_NAME"
        echo "Host: $DB_HOST:$DB_PORT"
        echo "User: $DB_USER"
        echo "Date: $(date)"
        echo "---"
        
        # Table count
        echo -n "Tables: "
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
             -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('information_schema', 'pg_catalog')" 2>/dev/null || echo "unknown"
        
        # Database size
        echo -n "Size: "
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
             -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'))" 2>/dev/null || echo "unknown"
        
        # Version
        echo -n "PostgreSQL version: "
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
             -t -c "SELECT version()" 2>/dev/null | cut -d',' -f1 || echo "unknown"
             
    } > "$info_file"
    
    cat "$info_file" | while IFS= read -r line; do log "$line"; done
}

# Perform database restore
perform_restore() {
    local prepared_file="$1"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would restore database from: $prepared_file"
        log "DRY RUN: Target database: $DB_NAME on $DB_HOST:$DB_PORT"
        log "DRY RUN: No actual changes will be made"
        return 0
    fi
    
    # Get confirmation unless forced
    if [[ "$FORCE_RESTORE" != "true" ]]; then
        echo
        echo "WARNING: This will replace all data in database '$DB_NAME'"
        echo "Target: $DB_HOST:$DB_PORT"
        echo "Environment: $ENVIRONMENT"
        echo
        read -p "Are you sure you want to continue? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            log "Restore cancelled by user"
            exit 0
        fi
    fi
    
    log "Starting database restore..."
    
    # Create pre-restore backup if this is production
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log "Creating pre-restore backup for production..."
        local pre_restore_backup="${BACKUP_DIR}/pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
        pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" | gzip > "$pre_restore_backup" || \
            log "WARNING: Failed to create pre-restore backup"
    fi
    
    # Perform restore
    log "Executing restore operation..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
         -v ON_ERROR_STOP=1 \
         -f "$prepared_file" || error_exit "Database restore failed"
    
    log "Database restore completed successfully"
}

# Verify restore
verify_restore() {
    log "Verifying database restore..."
    
    # Basic connectivity test
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
         -c "SELECT 1" >/dev/null 2>&1 || error_exit "Database not accessible after restore"
    
    # Check if main tables exist
    local table_count
    table_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
                  -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('information_schema', 'pg_catalog')" 2>/dev/null || echo "0")
    
    if [[ "$table_count" -eq 0 ]]; then
        error_exit "No tables found after restore - restore may have failed"
    fi
    
    # Check for expected PrismForge tables
    local prismforge_tables
    prismforge_tables=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
                       -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'prismforge'" 2>/dev/null || echo "0")
    
    if [[ "$prismforge_tables" -gt 0 ]]; then
        log "Found $prismforge_tables PrismForge tables"
    fi
    
    log "Database verification passed"
    log "Tables found: $table_count"
}

# Generate restore report
generate_restore_report() {
    local backup_file="$1"
    local report_file="${BACKUP_DIR}/restore_report_$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$report_file" << EOF
{
    "restore_date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "backup_file": "$backup_file",
    "environment": "$ENVIRONMENT",
    "database": {
        "host": "$DB_HOST",
        "port": $DB_PORT,
        "name": "$DB_NAME",
        "user": "$DB_USER"
    },
    "options": {
        "dry_run": $([ "$DRY_RUN" = "true" ] && echo "true" || echo "false"),
        "force": $FORCE_RESTORE,
        "skip_verification": $SKIP_VERIFICATION,
        "create_db": $CREATE_DB
    },
    "status": "completed"
}
EOF
    
    log "Restore report generated: $report_file"
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
    "text": "Database Restore Notification",
    "attachments": [{
        "color": "$color",
        "fields": [
            {"title": "Status", "value": "$status_text", "short": true},
            {"title": "Environment", "value": "$ENVIRONMENT", "short": true},
            {"title": "Database", "value": "$DB_NAME", "short": true},
            {"title": "Backup File", "value": "$(basename "$backup_file")", "short": false}
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
    log "Starting database restore process..."
    log "Backup identifier: $BACKUP_FILE"
    log "Target environment: $ENVIRONMENT"
    
    # Parse additional arguments
    parse_arguments "$@"
    
    validate_prerequisites
    
    # Find the actual backup file
    local backup_file
    backup_file=$(find_backup_file "$BACKUP_FILE")
    log "Found backup file: $backup_file"
    
    verify_backup_metadata "$backup_file"
    
    create_database_if_needed
    
    test_database_connection
    
    get_database_info
    
    # Prepare backup for restore
    local prepared_file
    prepared_file=$(prepare_backup "$backup_file")
    
    # Perform restore
    perform_restore "$prepared_file"
    
    # Verify restore if not dry run
    if [[ "$DRY_RUN" != "true" ]]; then
        verify_restore
        generate_restore_report "$backup_file"
        send_notification "success" "$backup_file"
    fi
    
    log "Restore process completed successfully"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi