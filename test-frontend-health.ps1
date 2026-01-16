Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Testing Frontend Health Check Fix" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Cleaning up..." -ForegroundColor Yellow
docker compose down --volumes 2>&1 | Out-Null

Write-Host "Step 2: Building frontend image..." -ForegroundColor Yellow
docker compose build frontend

Write-Host ""
Write-Host "Step 3: Starting DB, API, and Frontend..." -ForegroundColor Yellow
docker compose up -d db api frontend

Write-Host ""
Write-Host "Step 4: Waiting 45 seconds for services..." -ForegroundColor Yellow
Start-Sleep -Seconds 45

Write-Host ""
Write-Host "Step 5: Checking container status..." -ForegroundColor Yellow
docker compose ps

Write-Host ""
Write-Host "Step 6: Testing frontend health from inside container..." -ForegroundColor Yellow
$healthTest = docker exec frontend-prod curl -f http://localhost:80 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend internal health check: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend internal health check: FAILED" -ForegroundColor Red
    Write-Host "Error: $healthTest"
}

Write-Host ""
Write-Host "Step 7: Checking Docker health status..." -ForegroundColor Yellow
$healthStatus = docker inspect frontend-prod --format='{{.State.Health.Status}}' 2>&1
Write-Host "Health Status: $healthStatus"

Write-Host ""
Write-Host "Step 8: Testing from host machine..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    Write-Host "✓ Frontend accessible from host: SUCCESS" -ForegroundColor Green
} catch {
    Write-Host "✗ Frontend accessible from host: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "Step 9: Viewing frontend logs..." -ForegroundColor Yellow
docker compose logs frontend --tail=30

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Enter to clean up and exit..."
Read-Host
docker compose down
