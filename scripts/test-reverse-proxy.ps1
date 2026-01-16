# Script pour tester le reverse-proxy localement

Write-Host "=== 🔧 Test du reverse-proxy local ===" -ForegroundColor Cyan

# 1. Build l'image
Write-Host "`n📦 Build de l'image reverse-proxy..." -ForegroundColor Yellow
Set-Location reverse-proxy
docker build -t reverse-proxy-test .
Set-Location ..

# 2. Créer un réseau Docker
Write-Host "`n🌐 Création du réseau Docker..." -ForegroundColor Yellow
docker network create test-network 2>$null

# 3. Démarrer un conteneur nginx simple pour frontend
Write-Host "`n🎨 Démarrage du mock frontend..." -ForegroundColor Yellow
docker run -d --name test-frontend --network test-network -p 8081:80 nginx:alpine
Start-Sleep -Seconds 2
docker exec test-frontend sh -c 'echo "<h1>Frontend Mock</h1>" > /usr/share/nginx/html/index.html'

# 4. Démarrer un conteneur simple pour API
Write-Host "`n⚙️ Démarrage du mock API..." -ForegroundColor Yellow
docker run -d --name test-api --network test-network -p 8082:3000 hashicorp/http-echo:latest -text="API Mock Response"

# 5. Démarrer le reverse-proxy
Write-Host "`n🔄 Démarrage du reverse-proxy..." -ForegroundColor Yellow
docker run -d --name test-reverse-proxy --network test-network -p 8080:80 reverse-proxy-test

# 6. Attendre que tout démarre
Write-Host "`n⏳ Attente du démarrage (5s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 7. Tester les endpoints
Write-Host "`n=== 📊 Tests ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "`n1. Test du frontend (http://localhost:8080):" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing
    Write-Host $response.Content
} catch {
    Write-Host "Erreur: $_" -ForegroundColor Red
}

Write-Host "`n2. Test de l'API (http://localhost:8080/api/):" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/" -UseBasicParsing
    Write-Host $response.Content
} catch {
    Write-Host "Erreur: $_" -ForegroundColor Red
}

Write-Host "`n3. Test du health check (http://localhost:8080/health):" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing
    Write-Host $response.Content
} catch {
    Write-Host "Erreur: $_" -ForegroundColor Red
}

Write-Host "`n=== Logs du reverse-proxy ===" -ForegroundColor Cyan
docker logs test-reverse-proxy --tail 20

Write-Host "`n=== 🧹 Nettoyage ===" -ForegroundColor Yellow
docker stop test-frontend test-api test-reverse-proxy 2>$null
docker rm test-frontend test-api test-reverse-proxy 2>$null
docker network rm test-network 2>$null

Write-Host "`nTest termine!" -ForegroundColor Green
Write-Host ""
Write-Host "Si vous avez vu les reponses ci-dessus, le reverse-proxy fonctionne!" -ForegroundColor Cyan
Write-Host "Vous pouvez maintenant push vers GitHub." -ForegroundColor Cyan
