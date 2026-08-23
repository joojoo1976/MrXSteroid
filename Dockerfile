# =============================================================
# MrXSteroid — Dockerfile
# Multi-stage production build for Next.js 15 (Node.js LTS)
# =============================================================

# --- Stage 1: Dependency Installer --------------------------
FROM node:22-alpine AS deps

# Enable corepack for potential pnpm/yarn usage
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package manifests only (layer cache optimization)
COPY package.json package-lock.json* ./

# Install all dependencies (including devDeps needed for build)
RUN npm ci --legacy-peer-deps

# --- Stage 2: Builder ----------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy full source
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN npm run build

# --- Stage 3: Production Runner ------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only what's needed to run the server
COPY --from=builder /app/public ./public

# Copy built application files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Run Next.js standalone server
CMD ["node", "server.js"]
