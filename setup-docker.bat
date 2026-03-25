@echo off
REM =====================================================
REM CLINIC APPOINTMENT SYSTEM - Docker Setup Script
REM =====================================================
REM
REM This script helps you set up and run the application
REM using Docker Compose on Windows.
REM
REM Usage:
REM   setup-docker.bat          Start all services
REM   setup-docker.bat stop      Stop all services
REM   setup-docker.bat restart  Restart all services
REM   setup-docker.bat seed     Run database seed
REM   setup-docker.bat logs     View logs
REM   setup-docker.bat status   Show service status
REM   setup-docker.bat clean   Clean up everything
REM   setup-docker.bat rebuild  Rebuild containers
REM   setup-docker.bat help    Show help
REM
REM =====================================================

setlocal enabledelayedexpansion

set "COMPOSE_FILE=docker-compose.yml"
set "ENV_FILE=.env.docker"

goto :main

:header
    echo.
    echo ===========================================
    echo   Clinic Appointment System
    echo ===========================================
    echo.
    exit /b

:success
    echo [SUCCESS] %~1
    exit /b

:error
    echo [ERROR] %~1
    exit /b 1

:warning
    echo [WARNING] %~1
    exit /b

:info
    echo [INFO] %~1
    exit /b

:check_requirements
    call :header
    echo Checking requirements...

    where docker >nul 2>&1
    if errorlevel 1 (
        call :error "Docker is not installed. Please install Docker first."
        exit /b 1
    )
    call :success "Docker is installed"

    docker compose version >nul 2>&1
    if errorlevel 1 (
        call :error "Docker Compose is not installed."
        exit /b 1
    )
    call :success "Docker Compose is available"

    if not exist "%COMPOSE_FILE%" (
        call :error "docker-compose.yml not found in current directory"
        exit /b 1
    )
    call :success "docker-compose.yml found"

    if not exist "%ENV_FILE%" (
        call :warning ".env.docker not found. Creating from example..."
        if exist "%ENV_FILE%.example" (
            copy "%ENV_FILE%.example" "%ENV_FILE%"
            call :success "Created .env.docker from example"
            call :warning "Please edit .env.docker and set your secrets!"
        ) else (
            call :error "%ENV_FILE%.example not found"
            exit /b 1
        )
    ) else (
        call :success ".env.docker found"
    )
    exit /b

:start_services
    call :header
    echo Starting services...

    docker compose --env-file "%ENV_FILE%" up -d

    call :success "Services started!"
    echo.
    echo [ACCESS URLs]
    echo    Frontend: http://localhost
    echo    Backend:  http://localhost:5000
    echo    MongoDB:  mongodb://localhost:27017
    echo.
    call :info "Run 'setup-docker.bat logs' to view logs"
    exit /b

:stop_services
    call :header
    echo Stopping services...

    docker compose --env-file "%ENV_FILE%" down

    call :success "Services stopped!"
    exit /b

:restart_services
    call :header
    echo Restarting services...

    docker compose --env-file "%ENV_FILE%" restart

    call :success "Services restarted!"
    exit /b

:seed_database
    call :header
    echo Seeding database...

    REM Rebuild backend first to ensure seed files are included
    call :info "Rebuilding backend container..."
    docker compose --env-file "%ENV_FILE%" build backend

    REM Start backend with seed environment variable
    call :info "Starting backend with seeding enabled..."
    docker compose --env-file "%ENV_FILE%" up -d backend

    REM Wait a moment for backend to start
    timeout /t 5 /nobreak >nul

    REM Run seed script inside container with MONGODB_URI
    call :info "Running seed script..."
    docker exec -e MONGODB_URI=mongodb://mongodb:27017/clinic_appointment clinic_backend node seed/seed.js

    call :success "Database seeded!"
    echo.
    echo [TEST CREDENTIALS]
    echo    Admin:   admin@medbookpro.com / admin123
    echo    Doctor:  dr.smith@medbookpro.com / doctor123
    echo    Patient: patient1@example.com / patient123
    echo.
    exit /b

:view_logs
    call :header
    echo Viewing logs...
    echo (Press Ctrl+C to exit)
    echo.

    docker compose --env-file "%ENV_FILE%" logs -f
    exit /b

:clean_everything
    call :header
    echo [WARNING] This will delete all containers, volumes, and images!
    echo.
    set /p confirm="Are you sure? Type 'yes' to confirm: "

    if /i "!confirm!"=="yes" (
        echo Cleaning up...
        docker compose --env-file "%ENV_FILE%" down -v --remove-orphans
        call :success "Cleanup complete!"
    ) else (
        call :info "Cleanup cancelled"
    )
    exit /b

:rebuild_services
    call :header
    echo Rebuilding services...

    docker compose --env-file "%ENV_FILE%" build --no-cache
    docker compose --env-file "%ENV_FILE%" up -d

    call :success "Services rebuilt and started!"
    exit /b

:show_status
    call :header
    echo Service Status:
    echo.

    docker compose --env-file "%ENV_FILE%" ps

    echo.
    echo [ACCESS URLs]
    echo    Frontend: http://localhost
    echo    Backend:  http://localhost:5000
    echo    API:      http://localhost:5000/api/health
    exit /b

:show_help
    call :header
    echo Usage: setup-docker.bat [command]
    echo.
    echo Commands:
    echo    start     Start all services
    echo    stop      Stop all services
    echo    restart   Restart all services
    echo    seed      Seed the database with sample data
    echo    logs      View service logs
    echo    status    Show service status
    echo    rebuild   Rebuild and restart services
    echo    clean     Remove all containers and volumes
    echo    help      Show this help message
    echo.
    echo Examples:
    echo    setup-docker.bat start
    echo    setup-docker.bat seed
    echo    setup-docker.bat logs
    exit /b

:main
    set "COMMAND=%~1"

    if "%COMMAND%"=="" goto :start_services
    if /i "%COMMAND%"=="start" goto :start_services
    if /i "%COMMAND%"=="stop" goto :stop_services
    if /i "%COMMAND%"=="restart" goto :restart_services
    if /i "%COMMAND%"=="seed" goto :seed_database
    if /i "%COMMAND%"=="logs" goto :view_logs
    if /i "%COMMAND%"=="status" goto :show_status
    if /i "%COMMAND%"=="rebuild" goto :rebuild_services
    if /i "%COMMAND%"=="clean" goto :clean_everything
    if /i "%COMMAND%"=="help" goto :show_help
    if /i "%COMMAND%"=="/?" goto :show_help

    call :error "Unknown command: %COMMAND%"
    echo.
    goto :show_help
