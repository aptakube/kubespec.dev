# Builder stage

FROM node:22.0.0-alpine@sha256:1b2479dd35a99687d6638f5976fd235e26c5b37e8122f786fcd5fe231d63de5b AS builder

WORKDIR /app

# Install deps first (cache-friendly)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . ./

ARG GITHUB_TOKEN


# Download CRDs and build the static site
RUN npm run download && npm run build

# ─────────────────────────────
# Runtime stage 
FROM node:22.0.0-alpine@sha256:1b2479dd35a99687d6638f5976fd235e26c5b37e8122f786fcd5fe231d63de5b AS 

WORKDIR /app

# We only need package files to run astro preview + the built assets
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built static site
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=4321

# Run as non-root for security
USER node

EXPOSE 4321


# Serve the static site
CMD ["npm", "run", "start"]
