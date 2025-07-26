# Guide Docker pour MMS

Ce guide vous explique comment utiliser la configuration Docker de l'application MMS (Management de Mentions Scolaires).

## 🏗️ Architecture

L'application est composée de 4 services principaux :

- **database** : PostgreSQL 16 (base de données)
- **api** : Spring Boot (backend Java)
- **frontend** : React + Vite + Nginx (interface utilisateur)
- **nginx** : Reverse proxy (optionnel, pour la production)

## 🚀 Démarrage rapide

### Prérequis
- Docker Desktop installé et en cours d'exécution
- Au moins 4GB de RAM disponible
- Ports 80, 3000 et 5432 libres

### 1. Configuration

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Modifier les variables si nécessaire
nano .env
```

### 2. Lancement

#### Méthode 1 : Scripts automatisés (recommandé)

**Linux/Mac :**
```bash
chmod +x scripts/dev.sh
./scripts/dev.sh start
```

**Windows :**
```cmd
scripts\dev.bat start
```

#### Méthode 2 : Docker Compose direct

```bash
# Build et démarrage
docker-compose up -d --build

# Vérifier l'état
docker-compose ps
```

### 3. Accès aux services

- **Frontend** : http://localhost
- **API** : http://localhost:3000/api
- **Base de données** : localhost:5432
- **Nginx (prod)** : http://localhost:8080

## 📋 Commandes utiles

### Scripts de gestion

```bash
# Construire les images
./scripts/dev.sh build

# Démarrer les services
./scripts/dev.sh start

# Arrêter les services
./scripts/dev.sh stop

# Redémarrer
./scripts/dev.sh restart

# Voir l'état
./scripts/dev.sh status

# Voir les logs
./scripts/dev.sh logs [service]

# Nettoyer tout
./scripts/dev.sh clean

# Réinitialiser la base de données
./scripts/dev.sh reset-db
```

### Docker Compose direct

```bash
# Démarrer en mode développement
docker-compose up -d

# Démarrer avec le reverse proxy (production)
docker-compose --profile production up -d

# Voir les logs d'un service
docker-compose logs -f api

# Reconstruire un service
docker-compose build api

# Arrêter et supprimer
docker-compose down -v
```

## 🔧 Configuration avancée

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|---------|
| `DB_PASSWORD` | Mot de passe PostgreSQL | `SecurePassword123!` |
| `SPRING_PROFILES_ACTIVE` | Profil Spring Boot | `docker` |
| `JVM_OPTS` | Options JVM pour l'API | `-Xmx512m -Xms256m` |
| `VITE_API_URL` | URL de l'API pour le frontend | `http://localhost:3000/api` |

### Volumes persistants

- `postgres_data` : Données de la base PostgreSQL
- `api_uploads` : Fichiers uploadés par l'API

### Réseau

Tous les services communiquent via le réseau `mms-network` (172.20.0.0/16).

## 🛡️ Sécurité

### Mesures implémentées

1. **Utilisateurs non-root** dans tous les conteneurs
2. **Multi-stage builds** pour réduire la surface d'attaque
3. **Health checks** pour tous les services
4. **Security headers** dans Nginx
5. **Rate limiting** sur les endpoints sensibles
6. **Images Alpine** pour réduire les vulnérabilités
7. **No new privileges** pour tous les conteneurs

### Authentification base de données

- Utilisation de SCRAM-SHA-256 pour PostgreSQL
- Variables d'environnement pour les credentials
- Utilisateur dédié (non-postgres) pour l'application

## 🩺 Monitoring et logs

### Health checks

Chaque service expose un endpoint de santé :
- API : `/actuator/health`
- Frontend : `/health`
- Database : `pg_isready`

### Logs centralisés

```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f api

# Logs avec horodatage
docker-compose logs -f -t
```

## 🚀 Déploiement en production

### 1. Configuration

```bash
# Variables d'environnement production
export DB_PASSWORD="your-secure-password"
export CORS_ALLOWED_ORIGINS="https://yourdomain.com"
```

### 2. Lancement avec reverse proxy

```bash
docker-compose --profile production up -d
```

### 3. SSL/TLS (recommandé)

Ajouter un certificat SSL via Let's Encrypt ou un load balancer cloud.

## 🔍 Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   ```bash
   # Vérifier les ports
   netstat -tulpn | grep :80
   
   # Changer le port dans docker-compose.yml
   ports:
     - "8080:80"  # au lieu de 80:80
   ```

2. **Base de données non accessible**
   ```bash
   # Vérifier l'état
   docker-compose exec database pg_isready -U mms_user -d mms
   
   # Réinitialiser
   ./scripts/dev.sh reset-db
   ```

3. **Images obsolètes**
   ```bash
   # Rebuilder sans cache
   docker-compose build --no-cache
   ```

4. **Problèmes de permissions**
   ```bash
   # Linux/Mac : ajuster les permissions
   sudo chown -R $USER:$USER .
   ```

### Logs de debug

```bash
# Mode verbose pour docker-compose
docker-compose --verbose up

# Logs détaillés d'un conteneur
docker logs --details mms-api
```

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)

## 🆘 Support

En cas de problème :
1. Vérifier les logs : `./scripts/dev.sh logs`
2. Vérifier l'état : `./scripts/dev.sh status`
3. Redémarrer : `./scripts/dev.sh restart`
4. En dernier recours : `./scripts/dev.sh clean` puis `./scripts/dev.sh start`
