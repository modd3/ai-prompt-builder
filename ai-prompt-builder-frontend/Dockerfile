# ============================================================================
# Frontend Dockerfile - AI Prompt Builder
# ============================================================================
# Multi-stage build: Node.js for build, Nginx for serving
# This optimizes the final image size by only including production files
# ============================================================================

# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build the production bundle
# This creates an optimized build in the build/ directory
RUN npm run build

# Stage 2: Production serve stage with Nginx
FROM nginx:alpine

# Copy built files from builder stage to Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000 for the frontend
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
