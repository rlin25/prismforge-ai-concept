# Multi-stage Dockerfile for PrismForge AI Enterprise Deployment
# Stage 1: Build Dependencies and Application
FROM node:18-alpine AS deps

# Install security updates and necessary packages
RUN apk add --no-cache libc6-compat dumb-init

# Create non-root user for security
RUN addgroup --gid 1001 --system nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./

# Install dependencies with security best practices
RUN npm ci --only=production --audit --fund=false
RUN npm audit --audit-level high

# Stage 2: Build Application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build application
RUN npm run build

# Stage 3: Production Runtime
FROM node:18-alpine AS runner

# Install security updates
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup --gid 1001 --system nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Security hardening
RUN chmod -R 755 /app
RUN chown -R nextjs:nodejs /app

# Remove package managers for security
RUN apk del --no-cache npm yarn

# Create logs directory
RUN mkdir -p /app/logs && chown nextjs:nodejs /app/logs

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "server.js"]