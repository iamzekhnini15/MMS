# Guide rapide: Fix du reverse-proxy pour Azure

## Problème
Le reverse-proxy ne trouve pas les conteneurs API et Frontend sur Azure (erreur 502).

## Solution appliquée
Modification de `/reverse-proxy/nginx.conf` pour utiliser les **noms de conteneurs** au lieu des noms de service :

- ❌ Avant: `http://api:3000` et `http://frontend:80`
- ✅ Après: `http://api-prod:3000` et `http://frontend-prod:80`

Ces noms correspondent aux `container_name` définis dans `docker-compose.deploy.yml`.

## Déploiement

### Étape 1: Commit et push
```bash
git add .
git commit -m "fix: update reverse-proxy to use correct container names for Azure"
git push origin main
```

### Étape 2: Attendre le déploiement
Le workflow GitHub Actions va:
1. Builder la nouvelle image du reverse-proxy
2. La pusher vers ghcr.io
3. Redéployer sur Azure

Temps estimé: 5-10 minutes

### Étape 3: Vérifier
Une fois le déploiement terminé:
```powershell
# Redémarrer l'app Azure
az webapp restart --name mms-staging-app --resource-group mms-app

# Voir les logs
az webapp log tail --name mms-staging-app --resource-group mms-app
```

Testez ensuite votre application:
```
https://mms-staging-app-fkc3avdseqhbe7a4.centralus-01.azurewebsites.net
```

## Diagnostic si le problème persiste

```powershell
# Exécuter le script de diagnostic complet
.\scripts\fix-502.ps1
```

## Changements appliqués

Fichiers modifiés:
- `reverse-proxy/nginx.conf` - Noms de conteneurs corrects + meilleurs timeouts
- `scripts/test-reverse-proxy.ps1` - Script de test local
- `scripts/fix-502.ps1` - Script de diagnostic Azure

La configuration nginx inclut maintenant:
- Noms de conteneurs corrects (`api-prod`, `frontend-prod`)
- Timeouts augmentés (60s)
- Endpoint `/health` pour Azure
- Meilleur logging
- Buffering optimisé
