#!/bin/bash
#
# =====================================================
# DOCKER ENTRYPOINT SCRIPT
# =====================================================
# 
# This script runs when the backend container starts.
# It waits for MongoDB to be ready, optionally seeds
# the database, and then starts the Node.js server.
#
# =====================================================

set -e

echo "Clinic Backend - Starting..."

# Wait for MongoDB to be available
# Attempts connection up to 60 seconds
echo "Waiting for MongoDB..."
for i in {1..30}; do
  if nc -z mongodb 27017 2>/dev/null; then
    echo "MongoDB is ready!"
    break
  fi
  echo "Attempt $i/30: MongoDB not ready, waiting..."
  sleep 2
done

# Check if database seeding is requested
# Set RUN_SEED=true in docker-compose.yml for first-time setup
if [ "$RUN_SEED" = "true" ] || [ "$RUN_SEED" = "1" ]; then
  echo "Seeding database in background..."
  node seed/seed.js > /dev/null 2>&1 &
fi

# Start the Node.js server
echo "Starting Node.js server..."
exec node server.js
