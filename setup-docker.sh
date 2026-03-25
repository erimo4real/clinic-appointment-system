#!/bin/bash
#
# =====================================================
# CLINIC APPOINTMENT SYSTEM - Docker Setup Script
# =====================================================
#
# Manages Docker services for the clinic application.
# 
# Usage:
#   ./setup-docker.sh start    - Start all services
#   ./setup-docker.sh stop     - Stop all services
#   ./setup-docker.sh restart  - Restart all services
#   ./setup-docker.sh seed     - Seed the database
#   ./setup-docker.sh logs     - View logs
#   ./setup-docker.sh clean    - Remove all containers and volumes
#   ./setup-docker.sh rebuild  - Rebuild and restart
#   ./setup-docker.sh status   - Show service status
#
# =====================================================

set -e

COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.docker"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo_step() { echo ">>> $1"; }
echo_success() { echo -e "${GREEN}[OK]${NC} $1"; }
echo_error() { echo -e "${RED}[ERROR]${NC} $1"; }
echo_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Check if required files exist
check_setup() {
  echo_step "Checking setup..."
  
  if [ ! -f "$ENV_FILE" ]; then
    if [ -f "$ENV_FILE.example" ]; then
      cp "$ENV_FILE.example" "$ENV_FILE"
      echo_warning "Created $ENV_FILE from example"
      echo_warning "Please edit $ENV_FILE with your configuration!"
    else
      echo_error "$ENV_FILE.example not found"
      exit 1
    fi
  fi
  
  echo_success "Setup OK"
}

# Start all services
cmd_start() {
  check_setup
  echo_step "Starting services..."
  docker compose --env-file "$ENV_FILE" up -d
  echo_success "Services started"
  echo ""
  echo "Access URLs:"
  echo "  Frontend: http://localhost"
  echo "  Backend:  http://localhost:5000"
}

# Stop all services
cmd_stop() {
  echo_step "Stopping services..."
  docker compose --env-file "$ENV_FILE" down
  echo_success "Services stopped"
}

# Restart services
cmd_restart() {
  echo_step "Restarting services..."
  docker compose --env-file "$ENV_FILE" restart
  echo_success "Services restarted"
}

# Seed database
cmd_seed() {
  check_setup
  echo_step "Seeding database..."
  docker compose --env-file "$ENV_FILE" up -d backend
  docker exec clinic_backend node seed/seed.js
  echo_success "Database seeded"
  echo ""
  echo "Test Credentials:"
  echo "  Admin:   admin@medbookpro.com / admin123"
  echo "  Doctor:  dr.smith@medbookpro.com / doctor123"
  echo "  Patient: patient1@example.com / patient123"
}

# View logs
cmd_logs() {
  echo_step "Viewing logs (Ctrl+C to exit)..."
  docker compose --env-file "$ENV_FILE" logs -f
}

# Show status
cmd_status() {
  echo_step "Service Status:"
  docker compose --env-file "$ENV_FILE" ps
}

# Rebuild services
cmd_rebuild() {
  check_setup
  echo_step "Rebuilding services..."
  docker compose --env-file "$ENV_FILE" build --no-cache
  docker compose --env-file "$ENV_FILE" up -d
  echo_success "Services rebuilt"
}

# Clean up everything
cmd_clean() {
  echo_warning "This will delete all containers and volumes!"
  read -p "Type 'yes' to confirm: " confirm
  if [ "$confirm" = "yes" ]; then
    echo_step "Cleaning up..."
    docker compose --env-file "$ENV_FILE" down -v
    echo_success "Cleanup complete"
  fi
}

# Show help
cmd_help() {
  echo "Clinic Appointment System - Docker Setup"
  echo ""
  echo "Usage: ./setup-docker.sh <command>"
  echo ""
  echo "Commands:"
  echo "  start     Start all services"
  echo "  stop      Stop all services"
  echo "  restart   Restart all services"
  echo "  seed      Seed the database"
  echo "  logs      View logs"
  echo "  status    Show status"
  echo "  rebuild   Rebuild containers"
  echo "  clean     Remove containers and volumes"
  echo "  help      Show this help"
}

# Main command router
case "${1:-start}" in
  start)   cmd_start ;;
  stop)    cmd_stop ;;
  restart) cmd_restart ;;
  seed)    cmd_seed ;;
  logs)    cmd_logs ;;
  status)  cmd_status ;;
  rebuild) cmd_rebuild ;;
  clean)   cmd_clean ;;
  help|--help|-h) cmd_help ;;
  *)       echo_error "Unknown command: $1"; cmd_help; exit 1 ;;
esac
