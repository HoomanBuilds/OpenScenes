#!/bin/bash

set -e

echo "Checking infra..."

RUNNING=$(docker compose ps --services --filter "status=running" | wc -l)

if [ "$RUNNING" -eq 4 ]; then
  echo "Infra already running"
else
  echo "Starting infra..."
  docker compose up -d > /dev/null 2>&1
  echo "Infra started"
fi

echo "Postgres  : localhost:5432"
echo "Redis     : localhost:6379"
echo "RabbitMQ  : localhost:5672 (UI: http://localhost:15672)"
echo "MinIO     : localhost:9000 (UI: http://localhost:9001)"
