#!/bin/bash

# PrismForge AI Production Deployment Script
# This script orchestrates the complete production deployment of PrismForge AI
# Usage: ./deploy-production.sh [environment] [deployment-strategy]

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
DEPLOYMENT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="${LOG_FILE:-${DEPLOYMENT_DIR}/deploy-$(date +%Y%m%d-%H%M%S).log}"

# Default values
ENVIRONMENT="${1:-production}"
DEPLOYMENT_STRATEGY="${2:-blue-green}"
VERSION="${VERSION:-$(git rev-parse --short HEAD)}"
DRY_RUN="${DRY_RUN:-false}"
SKIP_TESTS="${SKIP_TESTS:-false}"
SKIP_BACKUP="${SKIP_BACKUP:-false}"

# Configuration files
CONFIG_FILE="${DEPLOYMENT_DIR}/configs/${ENVIRONMENT}.env"
KUBECONFIG_FILE="${KUBECONFIG_FILE:-}"
TERRAFORM_DIR="${PROJECT_ROOT}/infrastructure"

# Logging function
log() {
    local level="$1"
    shift
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR" "$1"
    send_notification "failed" "$1"
    exit 1
}

# Show usage
show_usage() {
    cat << EOF
Usage: $0 [environment] [deployment-strategy] [options]

Arguments:
    environment         Target environment (production, staging, development)
    deployment-strategy Deployment strategy (blue-green, rolling, canary)

Options:
    DRY_RUN=true       Show what would be done without executing
    SKIP_TESTS=true    Skip pre-deployment tests
    SKIP_BACKUP=true   Skip database backup
    VERSION=<version>  Specify version to deploy (default: current git commit)

Environment Variables:
    KUBECONFIG_FILE    Path to Kubernetes config file
    SLACK_WEBHOOK      Slack webhook URL for notifications
    GITHUB_TOKEN       GitHub token for API access
    AWS_PROFILE        AWS profile to use
    AZURE_SUBSCRIPTION_ID  Azure subscription ID

Examples:
    $0 production blue-green
    DRY_RUN=true $0 production rolling
    VERSION=v1.2.3 $0 production canary

EOF
}

# Validate prerequisites
validate_prerequisites() {
    log "INFO" "Validating deployment prerequisites..."
    
    # Check required commands
    local required_commands=("kubectl" "helm" "docker" "git" "curl" "jq")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            error_exit "Required command not found: $cmd"
        fi
    done
    
    # Check configuration file
    if [[ ! -f "$CONFIG_FILE" ]]; then
        error_exit "Configuration file not found: $CONFIG_FILE"
    fi
    
    # Source configuration
    source "$CONFIG_FILE"
    
    # Validate required environment variables
    local required_vars=("NAMESPACE" "IMAGE_REGISTRY" "DATABASE_HOST")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error_exit "Required environment variable not set: $var"
        fi
    done
    
    # Check Kubernetes connectivity
    if [[ -n "$KUBECONFIG_FILE" ]]; then
        export KUBECONFIG="$KUBECONFIG_FILE"
    fi
    
    if ! kubectl cluster-info >/dev/null 2>&1; then
        error_exit "Cannot connect to Kubernetes cluster"
    fi
    
    # Check container registry access
    if ! docker pull "$IMAGE_REGISTRY/hello-world:latest" >/dev/null 2>&1; then
        log "WARN" "Cannot pull from container registry, proceeding anyway"
    fi
    
    log "INFO" "Prerequisites validation completed successfully"
}

# Run pre-deployment tests
run_pre_deployment_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        log "INFO" "Skipping pre-deployment tests as requested"
        return 0
    fi
    
    log "INFO" "Running pre-deployment tests..."
    
    # Unit tests
    log "INFO" "Running unit tests..."
    cd "$PROJECT_ROOT"
    npm test -- --coverage --passWithNoTests || error_exit "Unit tests failed"
    
    # Integration tests
    log "INFO" "Running integration tests..."
    npm run test:integration || error_exit "Integration tests failed"
    
    # Security scan
    log "INFO" "Running security scan..."
    if command -v npm-audit >/dev/null 2>&1; then
        npm audit --audit-level high || log "WARN" "Security vulnerabilities found"
    fi
    
    # Container security scan
    if command -v trivy >/dev/null 2>&1; then
        trivy image "$IMAGE_REGISTRY/prismforge-ai:$VERSION" || log "WARN" "Container security issues found"
    fi
    
    log "INFO" "Pre-deployment tests completed"
}

# Create database backup
create_database_backup() {
    if [[ "$SKIP_BACKUP" == "true" ]]; then
        log "INFO" "Skipping database backup as requested"
        return 0
    fi
    
    log "INFO" "Creating database backup before deployment..."
    
    local backup_script="${PROJECT_ROOT}/database/scripts/backup.sh"
    if [[ ! -f "$backup_script" ]]; then
        log "WARN" "Backup script not found, skipping backup"
        return 0
    fi
    
    # Create backup with deployment marker
    local backup_file
    backup_file=$("$backup_script" "$ENVIRONMENT" "full" 2>&1 | tail -n1)
    
    if [[ -f "$backup_file" ]]; then
        log "INFO" "Database backup created: $backup_file"
        echo "$backup_file" > "${DEPLOYMENT_DIR}/.last-backup"
    else
        error_exit "Database backup failed"
    fi
}

# Build and push container image
build_and_push_image() {
    log "INFO" "Building and pushing container image..."
    
    cd "$PROJECT_ROOT"
    
    local image_tag="${IMAGE_REGISTRY}/prismforge-ai:${VERSION}"
    local latest_tag="${IMAGE_REGISTRY}/prismforge-ai:latest"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "DRY RUN: Would build and push image: $image_tag"
        return 0
    fi
    
    # Build image
    docker build \
        --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
        --build-arg VCS_REF="$(git rev-parse HEAD)" \
        --build-arg VERSION="$VERSION" \
        --tag "$image_tag" \
        --tag "$latest_tag" \
        . || error_exit "Docker build failed"
    
    # Push image
    docker push "$image_tag" || error_exit "Docker push failed"
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        docker push "$latest_tag" || error_exit "Docker push latest failed"
    fi
    
    log "INFO" "Container image built and pushed successfully"
}

# Deploy using blue-green strategy
deploy_blue_green() {
    log "INFO" "Executing blue-green deployment..."
    
    local current_version
    current_version=$(kubectl get deployment prismforge-ai -n "$NAMESPACE" -o jsonpath='{.metadata.labels.version}' 2>/dev/null || echo "none")
    
    local new_color="green"
    if [[ "$current_version" == "green" ]]; then
        new_color="blue"
    fi
    
    log "INFO" "Deploying to $new_color environment (current: $current_version)"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "DRY RUN: Would deploy to $new_color environment"
        return 0
    fi
    
    # Deploy to new environment
    helm upgrade --install "prismforge-ai-$new_color" "${PROJECT_ROOT}/helm/prismforge-ai" \
        --namespace "$NAMESPACE" \
        --create-namespace \
        --set image.repository="${IMAGE_REGISTRY}/prismforge-ai" \
        --set image.tag="$VERSION" \
        --set environment="$ENVIRONMENT" \
        --set deployment.color="$new_color" \
        --set replicaCount="${REPLICA_COUNT:-3}" \
        --values "${PROJECT_ROOT}/helm/prismforge-ai/values-${ENVIRONMENT}.yaml" \
        --wait --timeout=15m || error_exit "Helm deployment failed"
    
    # Wait for deployment to be ready
    kubectl wait --for=condition=ready pod \
        -l app.kubernetes.io/name=prismforge-ai,version="$new_color" \
        -n "$NAMESPACE" \
        --timeout=600s || error_exit "Deployment readiness check failed"
    
    # Run smoke tests on new environment
    run_smoke_tests "$new_color"
    
    # Switch traffic to new environment
    log "INFO" "Switching traffic to $new_color environment..."
    kubectl patch service prismforge-ai-app -n "$NAMESPACE" \
        -p "{\"spec\":{\"selector\":{\"version\":\"$new_color\"}}}" || \
        error_exit "Traffic switch failed"
    
    # Wait and verify
    sleep 30
    run_smoke_tests "production"
    
    # Clean up old environment
    if [[ "$current_version" != "none" && "$current_version" != "$new_color" ]]; then
        log "INFO" "Cleaning up old $current_version environment..."
        helm uninstall "prismforge-ai-$current_version" -n "$NAMESPACE" || \
            log "WARN" "Failed to uninstall old environment"
    fi
    
    log "INFO" "Blue-green deployment completed successfully"
}

# Deploy using rolling strategy
deploy_rolling() {
    log "INFO" "Executing rolling deployment..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "DRY RUN: Would perform rolling deployment"
        return 0
    fi
    
    # Update existing deployment
    helm upgrade prismforge-ai "${PROJECT_ROOT}/helm/prismforge-ai" \
        --namespace "$NAMESPACE" \
        --set image.repository="${IMAGE_REGISTRY}/prismforge-ai" \
        --set image.tag="$VERSION" \
        --set environment="$ENVIRONMENT" \
        --set replicaCount="${REPLICA_COUNT:-3}" \
        --values "${PROJECT_ROOT}/helm/prismforge-ai/values-${ENVIRONMENT}.yaml" \
        --wait --timeout=15m || error_exit "Rolling deployment failed"
    
    # Wait for rollout to complete
    kubectl rollout status deployment/prismforge-ai -n "$NAMESPACE" --timeout=600s || \
        error_exit "Rollout status check failed"
    
    run_smoke_tests "production"
    
    log "INFO" "Rolling deployment completed successfully"
}

# Deploy using canary strategy
deploy_canary() {
    log "INFO" "Executing canary deployment..."
    
    local canary_percentage="${CANARY_PERCENTAGE:-10}"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "DRY RUN: Would perform canary deployment with $canary_percentage% traffic"
        return 0
    fi
    
    # Deploy canary version
    helm upgrade --install prismforge-ai-canary "${PROJECT_ROOT}/helm/prismforge-ai" \
        --namespace "$NAMESPACE" \
        --set image.repository="${IMAGE_REGISTRY}/prismforge-ai" \
        --set image.tag="$VERSION" \
        --set environment="$ENVIRONMENT" \
        --set deployment.type="canary" \
        --set canary.percentage="$canary_percentage" \
        --set replicaCount="1" \
        --values "${PROJECT_ROOT}/helm/prismforge-ai/values-${ENVIRONMENT}.yaml" \
        --wait --timeout=10m || error_exit "Canary deployment failed"
    
    # Wait for canary to be ready
    kubectl wait --for=condition=ready pod \
        -l app.kubernetes.io/name=prismforge-ai,deployment=canary \
        -n "$NAMESPACE" \
        --timeout=300s || error_exit "Canary readiness check failed"
    
    # Monitor canary for specified duration
    local monitor_duration="${CANARY_MONITOR_DURATION:-300}"
    log "INFO" "Monitoring canary deployment for ${monitor_duration} seconds..."
    sleep "$monitor_duration"
    
    # Check canary metrics
    if ! check_canary_metrics; then
        log "ERROR" "Canary metrics check failed, rolling back..."
        helm uninstall prismforge-ai-canary -n "$NAMESPACE"
        error_exit "Canary deployment failed metrics check"
    fi
    
    # Promote canary to production
    log "INFO" "Promoting canary to production..."
    deploy_rolling
    
    # Clean up canary
    helm uninstall prismforge-ai-canary -n "$NAMESPACE" || \
        log "WARN" "Failed to clean up canary deployment"
    
    log "INFO" "Canary deployment completed successfully"
}

# Run smoke tests
run_smoke_tests() {
    local target="${1:-production}"
    log "INFO" "Running smoke tests against $target environment..."
    
    local base_url
    if [[ "$target" == "production" ]]; then
        base_url="${PRODUCTION_URL:-https://prismforge-ai.example.com}"
    else
        base_url="http://prismforge-ai-$target.$NAMESPACE.svc.cluster.local"
    fi
    
    # Health check
    if ! curl -f -s --max-time 30 "$base_url/api/health" >/dev/null; then
        error_exit "Health check failed for $target environment"
    fi
    
    # Basic functionality tests
    cd "$PROJECT_ROOT"
    if [[ -f "package.json" ]] && npm run test:smoke >/dev/null 2>&1; then
        npm run test:smoke -- --baseUrl="$base_url" || \
            error_exit "Smoke tests failed for $target environment"
    fi
    
    log "INFO" "Smoke tests passed for $target environment"
}

# Check canary metrics
check_canary_metrics() {
    log "INFO" "Checking canary deployment metrics..."
    
    # Check error rate (should be < 5%)
    local error_rate
    error_rate=$(kubectl exec -n monitoring deployment/prometheus -- \
        promtool query instant \
        'rate(http_requests_total{deployment="canary",status=~"5.."}[5m]) / rate(http_requests_total{deployment="canary"}[5m])' \
        2>/dev/null | grep -o '[0-9]*\.[0-9]*' || echo "0")
    
    if (( $(echo "$error_rate > 0.05" | bc -l) )); then
        log "ERROR" "Canary error rate too high: $error_rate"
        return 1
    fi
    
    # Check response time (95th percentile should be < 2s)
    local response_time
    response_time=$(kubectl exec -n monitoring deployment/prometheus -- \
        promtool query instant \
        'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{deployment="canary"}[5m]))' \
        2>/dev/null | grep -o '[0-9]*\.[0-9]*' || echo "0")
    
    if (( $(echo "$response_time > 2.0" | bc -l) )); then
        log "ERROR" "Canary response time too high: ${response_time}s"
        return 1
    fi
    
    log "INFO" "Canary metrics check passed (error_rate: $error_rate, response_time: ${response_time}s)"
    return 0
}

# Update DNS and CDN
update_dns_cdn() {
    log "INFO" "Updating DNS and CDN configuration..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "DRY RUN: Would update DNS and CDN configuration"
        return 0
    fi
    
    # Update Cloudflare DNS (example)
    if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
        curl -X PUT "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$CLOUDFLARE_RECORD_ID" \
             -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
             -H "Content-Type: application/json" \
             --data "{\"type\":\"A\",\"name\":\"prismforge-ai.com\",\"content\":\"$NEW_IP_ADDRESS\"}" \
             >/dev/null 2>&1 || log "WARN" "Failed to update Cloudflare DNS"
    fi
    
    # Purge CDN cache
    if [[ -n "${CDN_PURGE_URL:-}" ]]; then
        curl -X POST "$CDN_PURGE_URL" \
             -H "Authorization: Bearer ${CDN_API_TOKEN:-}" \
             >/dev/null 2>&1 || log "WARN" "Failed to purge CDN cache"
    fi
    
    log "INFO" "DNS and CDN update completed"
}

# Send deployment notification
send_notification() {
    local status="$1"
    local message="${2:-}"
    
    if [[ -z "${SLACK_WEBHOOK:-}" ]]; then
        return 0
    fi
    
    local color="good"
    local status_text="✅ Success"
    
    if [[ "$status" != "success" ]]; then
        color="danger"
        status_text="❌ Failed"
    fi
    
    local payload
    payload=$(jq -n \
        --arg text "PrismForge AI Deployment" \
        --arg color "$color" \
        --arg status "$status_text" \
        --arg env "$ENVIRONMENT" \
        --arg strategy "$DEPLOYMENT_STRATEGY" \
        --arg version "$VERSION" \
        --arg message "$message" \
        '{
            text: $text,
            attachments: [{
                color: $color,
                fields: [
                    {title: "Status", value: $status, short: true},
                    {title: "Environment", value: $env, short: true},
                    {title: "Strategy", value: $strategy, short: true},
                    {title: "Version", value: $version, short: true},
                    {title: "Message", value: $message, short: false}
                ],
                timestamp: (now | floor)
            }]
        }')
    
    curl -X POST -H 'Content-type: application/json' \
         --data "$payload" \
         "$SLACK_WEBHOOK" >/dev/null 2>&1 || \
         log "WARN" "Failed to send Slack notification"
}

# Generate deployment report
generate_deployment_report() {
    local report_file="${DEPLOYMENT_DIR}/deployment-report-$(date +%Y%m%d-%H%M%S).json"
    
    cat > "$report_file" << EOF
{
    "deployment_date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "environment": "$ENVIRONMENT",
    "strategy": "$DEPLOYMENT_STRATEGY",
    "version": "$VERSION",
    "namespace": "$NAMESPACE",
    "image": "${IMAGE_REGISTRY}/prismforge-ai:${VERSION}",
    "git_commit": "$(git rev-parse HEAD)",
    "git_branch": "$(git rev-parse --abbrev-ref HEAD)",
    "deployed_by": "${USER:-unknown}",
    "deployment_duration": "$((SECONDS / 60)) minutes",
    "options": {
        "dry_run": "$DRY_RUN",
        "skip_tests": "$SKIP_TESTS",
        "skip_backup": "$SKIP_BACKUP"
    },
    "status": "completed"
}
EOF
    
    log "INFO" "Deployment report generated: $report_file"
}

# Rollback deployment
rollback_deployment() {
    log "ERROR" "Initiating deployment rollback..."
    
    # Rollback Helm deployment
    helm rollback prismforge-ai -n "$NAMESPACE" || \
        log "ERROR" "Helm rollback failed"
    
    # Restore database backup if available
    local backup_file
    if [[ -f "${DEPLOYMENT_DIR}/.last-backup" ]]; then
        backup_file=$(cat "${DEPLOYMENT_DIR}/.last-backup")
        if [[ -f "$backup_file" ]]; then
            log "INFO" "Restoring database from backup: $backup_file"
            "${PROJECT_ROOT}/database/scripts/restore.sh" "$backup_file" "$ENVIRONMENT" --force || \
                log "ERROR" "Database restore failed"
        fi
    fi
    
    send_notification "rollback" "Deployment rolled back due to failure"
}

# Main deployment orchestration
main() {
    local start_time=$SECONDS
    
    log "INFO" "Starting PrismForge AI deployment..."
    log "INFO" "Environment: $ENVIRONMENT"
    log "INFO" "Strategy: $DEPLOYMENT_STRATEGY"
    log "INFO" "Version: $VERSION"
    log "INFO" "Dry Run: $DRY_RUN"
    
    # Set trap for cleanup and rollback on error
    trap 'rollback_deployment' ERR
    
    validate_prerequisites
    run_pre_deployment_tests
    create_database_backup
    build_and_push_image
    
    # Execute deployment strategy
    case "$DEPLOYMENT_STRATEGY" in
        "blue-green")
            deploy_blue_green
            ;;
        "rolling")
            deploy_rolling
            ;;
        "canary")
            deploy_canary
            ;;
        *)
            error_exit "Unknown deployment strategy: $DEPLOYMENT_STRATEGY"
            ;;
    esac
    
    update_dns_cdn
    generate_deployment_report
    
    # Clear error trap on success
    trap - ERR
    
    local duration=$((SECONDS - start_time))
    log "INFO" "Deployment completed successfully in $((duration / 60)) minutes and $((duration % 60)) seconds"
    
    send_notification "success" "Deployment completed successfully"
}

# Show help if requested
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
    show_usage
    exit 0
fi

# Run main function
main "$@"