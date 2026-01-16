#!/bin/bash
# Script pour tester le reverse-proxy localement

echo "=== 🔧 Test du reverse-proxy local ==="

# 1. Build l'image
echo "📦 Build de l'image reverse-proxy..."
cd reverse-proxy
docker build -t reverse-proxy-test .
cd ..

# 2. Créer un réseau Docker
echo "🌐 Création du réseau Docker..."
docker network create test-network 2>/dev/null || echo "Network already exists"

# 3. Démarrer un conteneur nginx simple pour frontend
echo "🎨 Démarrage du mock frontend..."
docker run -d --name test-frontend --network test-network -p 8081:80 nginx:alpine
docker exec test-frontend sh -c 'echo "<h1>Frontend Mock</h1>" > /usr/share/nginx/html/index.html'

# 4. Démarrer un conteneur simple pour API
echo "⚙️ Démarrage du mock API..."
docker run -d --name test-api --network test-network -p 8082:3000 \
  hashicorp/http-echo:latest -text="API Mock Response"

# 5. Démarrer le reverse-proxy
echo "🔄 Démarrage du reverse-proxy..."
docker run -d --name test-reverse-proxy --network test-network -p 8080:80 reverse-proxy-test

# 6. Attendre que tout démarre
echo "⏳ Attente du démarrage (5s)..."
sleep 5

# 7. Tester les endpoints
echo ""
echo "=== 📊 Tests ==="
echo ""

echo "1️⃣ Test du frontend (http://localhost:8080):"
curl -s http://localhost:8080 | head -n 5

echo ""
echo "2️⃣ Test de l'API (http://localhost:8080/api/):"
curl -s http://localhost:8080/api/

echo ""
echo "3️⃣ Test du health check (http://localhost:8080/health):"
curl -s http://localhost:8080/health

echo ""
echo "=== 🧹 Nettoyage ==="
docker stop test-frontend test-api test-reverse-proxy 2>/dev/null
docker rm test-frontend test-api test-reverse-proxy 2>/dev/null
docker network rm test-network 2>/dev/null

echo ""
echo "✅ Test terminé!"
echo ""
echo "Si vous avez vu les réponses ci-dessus, le reverse-proxy fonctionne!"
echo "Vous pouvez maintenant push l'image vers GitHub Container Registry."
