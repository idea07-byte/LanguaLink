# =====================================================================
# LinguaLink Frontend — Multi-stage Dockerfile (Phase 19 Deployment)
# =====================================================================

# Stage 1: Build production bundle
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx Alpine
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Remove default assets
RUN rm -rf ./*

# Copy built dist from build stage
COPY --from=build /app/dist .

# Copy custom reverse proxy config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
