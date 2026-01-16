@echo off
echo ====================================
echo Testing Docker Compose Setup Locally
echo ====================================

echo.
echo Step 1: Cleaning up existing containers...
docker compose down --volumes

echo.
echo Step 2: Building all images (this may take a few minutes)...
docker compose build --no-cache

echo.
echo Step 3: Starting all services...
docker compose up -d

echo.
echo Step 4: Waiting 60 seconds for services to initialize...
timeout /t 60 /nobreak

echo.
echo Step 5: Checking container status...
docker compose ps

echo.
echo Step 6: Testing frontend health...
curl -f http://localhost:5173 || echo Frontend health check FAILED

echo.
echo Step 7: Testing API health...
curl -f http://localhost:3000/actuator/health || echo API health check FAILED

echo.
echo Step 8: Checking container logs...
echo === Frontend logs ===
docker compose logs frontend --tail=50

echo.
echo === API logs ===
docker compose logs api --tail=50

echo.
echo Step 9: Running E2E tests...
docker compose up e2e

echo.
echo Step 10: Showing final status...
docker compose ps

echo.
echo ====================================
echo Test Complete!
echo ====================================
