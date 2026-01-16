# Résolution du problème 502 Bad Gateway sur Azure

## 🔍 Diagnostic

### 1. Vérifier les logs Azure

```powershell
# Exécutez depuis le dossier scripts/
.\check-azure-logs.ps1
```

Ou avec bash:
```bash
./scripts/check-azure-logs.sh
```

### 2. Vérifier que les conteneurs démarrent

```bash
# Voir le statut du Web App
az webapp show --name mms-staging-app --resource-group mms-app --query "state" -o tsv

# Redémarrer l'application
az webapp restart --name mms-staging-app --resource-group mms-app
```

### 3. Vérifier les variables d'environnement

L'API a besoin de ces variables pour se connecter à la BD :

```bash
# Vérifier les variables
az webapp config appsettings list \
  --name mms-staging-app \
  --resource-group mms-app \
  --output table
```

**Variables requises :**
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `AZURE_BLOB_SAS_TOKEN` (optionnel pour le stockage de fichiers)

### 4. Configurer les variables si manquantes

```bash
az webapp config appsettings set \
  --name mms-staging-app \
  --resource-group mms-app \
  --settings \
    SPRING_DATASOURCE_URL="jdbc:postgresql://VOTRE-SERVER.postgres.database.azure.com:5432/mms_staging_db?sslmode=require" \
    SPRING_DATASOURCE_USERNAME="votre_username" \
    SPRING_DATASOURCE_PASSWORD="votre_password"
```

## 🛠️ Solutions possibles

### Solution 1: Activer les logs applicatifs

```bash
# Activer les logs
az webapp log config \
  --name mms-staging-app \
  --resource-group mms-app \
  --application-logging filesystem \
  --detailed-error-messages true \
  --failed-request-tracing true \
  --web-server-logging filesystem

# Voir les logs en temps réel
az webapp log tail --name mms-staging-app --resource-group mms-app
```

### Solution 2: Vérifier la configuration multicontainer

Azure Web App doit savoir quel conteneur exposer sur le port 80.

```bash
# Vérifier la configuration actuelle
az webapp config container show \
  --name mms-staging-app \
  --resource-group mms-app
```

Le conteneur `reverse-proxy` doit être configuré pour exposer le port 80.

### Solution 3: Vérifier le networking entre conteneurs

Sur Azure, les conteneurs doivent pouvoir se parler. Vérifiez dans `docker-compose.deploy.yml` :

- ✅ Les noms de service sont corrects (api, frontend, reverse-proxy)
- ✅ Les health checks sont définis
- ✅ Les dépendances sont correctes (depends_on)
- ✅ Le reverse-proxy utilise les bons noms de service

### Solution 4: Redéployer l'application

Si tout semble correct mais ça ne fonctionne toujours pas :

```bash
# 1. Arrêter l'app
az webapp stop --name mms-staging-app --resource-group mms-app

# 2. Nettoyer les conteneurs
az webapp config container delete \
  --name mms-staging-app \
  --resource-group mms-app

# 3. Reconfigurer
az webapp config container set \
  --name mms-staging-app \
  --resource-group mms-app \
  --multicontainer-config-type compose \
  --multicontainer-config-file docker-compose.deploy.yml

# 4. Redémarrer
az webapp start --name mms-staging-app --resource-group mms-app
```

### Solution 5: Vérifier les images Docker

```bash
# Les images doivent être publiques ou vous devez configurer les credentials
az webapp config container set \
  --name mms-staging-app \
  --resource-group mms-app \
  --docker-registry-server-url https://ghcr.io \
  --docker-registry-server-user VOTRE_GITHUB_USERNAME \
  --docker-registry-server-password VOTRE_GITHUB_TOKEN
```

## 🏥 Health Check de l'API

Testez si l'API répond directement (sans passer par le reverse-proxy) :

```bash
# Depuis Azure Cloud Shell ou un conteneur
curl http://api-prod:3000/actuator/health
```

## 📋 Checklist de vérification

- [ ] Les 3 images Docker sont bien pushées sur ghcr.io
- [ ] Les variables d'environnement sont configurées
- [ ] Le firewall Azure PostgreSQL autorise les connexions Azure
- [ ] Les credentials GHCR sont corrects dans Azure
- [ ] Les logs montrent que les conteneurs démarrent
- [ ] Le health check de l'API passe (actuator/health)
- [ ] Le reverse-proxy arrive à résoudre les noms DNS des services

## 🐛 Erreurs communes

### "Container X didn't respond to HTTP pings on port 80"
- Le port 80 du reverse-proxy n'est pas exposé
- Le reverse-proxy ne démarre pas correctement

### "Backend X is unhealthy"
- L'API ne peut pas se connecter à la base de données
- Les variables d'environnement sont manquantes ou incorrectes
- Le health check échoue

### "DNS resolution failed"
- Les noms de service dans nginx.conf ne correspondent pas à docker-compose
- Utilisez les noms de conteneur définis dans docker-compose.deploy.yml

## 📞 Support

Si le problème persiste, collectez ces informations :

```bash
# Logs de l'application
az webapp log tail --name mms-staging-app --resource-group mms-app > logs.txt

# Configuration actuelle
az webapp config container show \
  --name mms-staging-app \
  --resource-group mms-app > config.json

# Variables d'environnement (masquez les secrets avant de partager!)
az webapp config appsettings list \
  --name mms-staging-app \
  --resource-group mms-app > settings.json
```
