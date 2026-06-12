#!/bin/bash
set -e

echo "==> Somar QR — Deploy"

# Pull latest
git pull origin main

# Build and restart
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml build --no-cache app

# Run migrations
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy

# Restart
docker compose -f docker-compose.prod.yml up -d --force-recreate app

# Clean up old images
docker image prune -f

echo "==> Deploy concluído!"
