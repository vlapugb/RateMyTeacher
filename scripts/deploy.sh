#!/usr/bin/env bash
set -euo pipefail

cd /root/studradar

echo "=== Pulling changes ==="
git fetch origin
git reset --hard origin/$(git rev-parse --abbrev-ref HEAD)

echo "=== Reading env vars ==="
DATABASE_URL=$(grep '^DATABASE_URL=' .env | cut -d= -f2-)
BETTER_AUTH_URL=$(grep '^BETTER_AUTH_URL=' .env | cut -d= -f2-)
BETTER_AUTH_SECRET=$(grep '^BETTER_AUTH_SECRET=' .env | cut -d= -f2-)

export DATABASE_URL
export BETTER_AUTH_URL
export BETTER_AUTH_SECRET

echo "=== Building Docker image ==="
docker compose build \
  --build-arg "DATABASE_URL=${DATABASE_URL}" \
  --build-arg "BETTER_AUTH_URL=${BETTER_AUTH_URL}" \
  --build-arg "BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}" \
  app

echo "=== Restarting services ==="
docker compose up -d --force-recreate app

echo "=== Waiting for healthcheck ==="
sleep 10
curl -fsS -o /dev/null -w '%{http_code}' https://ratespbuteacher.ru/api/health
echo ""

echo "=== Deploy complete ==="
