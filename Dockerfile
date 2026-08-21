# Multi-stage Dockerfile for Cloud-Native Zero Trust Architecture
# Base layer: Node.js 22 LTS Alpine (minimal attack surface)
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies (supports both npm ci with lockfile or fallback npm install)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source code
COPY . .

# Build Vite frontend SPA & Express backend bundle (dist/server.cjs)
RUN npm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Install production-only dependencies
COPY package*.json ./
RUN (if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi) && npm cache clean --force

# Copy built production assets from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user for Zero Trust Principle of Least Privilege (PoLP)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs && \
    chown -R appuser:nodejs /app

USER appuser

# Expose standard application container port
EXPOSE 3000

# Container healthcheck for AWS ECS / GCP Cloud Run / Kubernetes orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the bundled server
CMD ["node", "dist/server.cjs"]
