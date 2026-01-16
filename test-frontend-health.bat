@echo off
echo Testing Frontend Health Check Fix...
echo.

echo Step 1: Building frontend image only...
docker compose build frontend

echo.
echo Step 2: Starting DB, API, and Frontend...
docker compose up -d db api frontend

echo.
echo Step 3: Waiting for services to start...
timeout /t 45 /nobreak

echo.
echo Step 4: Checking health status...
docker compose ps

echo.
echo Step 5: Inspecting frontend container health...
docker inspect frontend-prod --format='{{.State.Health.Status}}'

echo.
echo Step 6: Viewing frontend health check logs...
docker inspect frontend-prod --format='{{range .State.Health.Log}}{{.Output}}{{end}}'

echo.
echo Step 7: Testing manual curl inside container...
docker exec frontend-prod curl -f http://localhost:80 && echo SUCCESS || echo FAILED

echo.
echo Step 8: Testing from host...
curl -f http://localhost:5173 && echo SUCCESS || echo FAILED

echo.
echo Done! Press any key to stop containers...
pause
docker compose down
