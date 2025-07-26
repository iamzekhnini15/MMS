# Bonnes pratiques de sécurité Docker - MMS

## ✅ Sécurité implémentée

### 1. Images de base sécurisées
- **Eclipse Temurin** (OpenJDK officiel) au lieu d'images Oracle
- **Alpine Linux** pour réduire la surface d'attaque
- **Images officielles** avec mises à jour de sécurité régulières

### 2. Utilisateurs non-root
- Tous les conteneurs s'exécutent avec des utilisateurs dédiés
- UID/GID spécifiques (1000) pour éviter les conflits
- Pas de privilèges sudo dans les conteneurs

### 3. Multi-stage builds
- Séparation build/runtime pour réduire la taille des images
- Exclusion des outils de développement de l'image finale
- Cache optimisé pour accélérer les builds

### 4. Isolation réseau
- Réseau dédié `mms-network`
- Communication inter-services uniquement
- Exposition minimale des ports

### 5. Health checks
- Surveillance automatique de l'état des services
- Redémarrage automatique en cas de problème
- Endpoints de santé dédiés

### 6. Gestion des secrets
- Variables d'environnement pour les credentials
- Fichier `.env` ignoré par Git
- Pas de secrets en dur dans les images

### 7. Headers de sécurité
- **X-Frame-Options** : Protection contre clickjacking
- **X-Content-Type-Options** : Prévention du MIME sniffing
- **X-XSS-Protection** : Protection XSS basique
- **Content-Security-Policy** : Politique de sécurité du contenu
- **Referrer-Policy** : Contrôle des informations de référent

### 8. Rate limiting
- Limitation du taux de requêtes API
- Protection renforcée sur les endpoints d'authentification
- Prévention des attaques par déni de service

## 🔒 Configuration PostgreSQL sécurisée

### Authentification
```properties
# SCRAM-SHA-256 au lieu de MD5
POSTGRES_INITDB_ARGS=--auth-host=scram-sha-256
```

### Utilisateur dédié
- Pas d'utilisation du superutilisateur `postgres`
- Privilèges minimaux pour l'application
- Mot de passe complexe via variables d'environnement

## 🛡️ Configuration Nginx sécurisée

### Masquage d'informations
```nginx
server_tokens off;  # Cache la version Nginx
```

### Protection contre les attaques
```nginx
# Limitation des requêtes
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# Buffers sécurisés
client_body_buffer_size 1k;
client_header_buffer_size 1k;
client_max_body_size 10m;
```

## 📊 Monitoring de sécurité

### Logs d'audit
- Logs d'accès Nginx structurés
- Logs applicatifs avec niveaux appropriés
- Rotation automatique des logs

### Surveillance des conteneurs
```bash
# Vérifier les processus en cours
docker-compose exec api ps aux

# Vérifier les connexions réseau
docker-compose exec api netstat -tulpn

# Vérifier l'utilisation des ressources
docker stats
```

## 🚨 Alertes et incidents

### Détection d'anomalies
- Health checks échouent → Redémarrage automatique
- Consommation excessive de ressources → Alertes
- Tentatives d'intrusion → Logs détaillés

### Plan de réponse
1. Isoler le conteneur compromis
2. Analyser les logs
3. Reconstruire l'image si nécessaire
4. Mettre à jour les dépendances

## 🔄 Mises à jour de sécurité

### Images de base
```bash
# Mettre à jour les images de base
docker-compose pull
docker-compose build --no-cache
```

### Dépendances
```bash
# API Java
./mvnw versions:display-dependency-updates

# Frontend Node.js
npm audit
npm audit fix
```

## 📋 Checklist de sécurité

### Avant déploiement
- [ ] Changement des mots de passe par défaut
- [ ] Vérification des vulnérabilités d'images
- [ ] Test des health checks
- [ ] Validation des headers de sécurité
- [ ] Test du rate limiting

### Maintenance régulière
- [ ] Mise à jour des images de base (mensuel)
- [ ] Audit des dépendances (hebdomadaire)
- [ ] Rotation des logs (automatique)
- [ ] Backup de la base de données (quotidien)
- [ ] Monitoring des performances

## 🔧 Outils de sécurité recommandés

### Scan de vulnérabilités
```bash
# Trivy (scan d'images)
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image mms-api

# Docker Scout
docker scout cves mms-api
```

### Monitoring
- **Prometheus** + **Grafana** pour les métriques
- **ELK Stack** pour l'analyse des logs
- **Falco** pour la détection d'intrusion

## 🚀 Recommandations pour la production

### Infrastructure
- Utiliser un orchestrateur (Kubernetes, Docker Swarm)
- Implémenter un reverse proxy avec SSL/TLS
- Configurer un WAF (Web Application Firewall)
- Mettre en place une solution de backup automatisée

### Monitoring avancé
- Alertes en temps réel
- Dashboards de sécurité
- Correlation des logs de sécurité
- Tests de pénétration réguliers

### Conformité
- Respect du RGPD pour les données personnelles
- Audit de sécurité régulier
- Documentation des procédures de sécurité
- Formation de l'équipe aux bonnes pratiques
