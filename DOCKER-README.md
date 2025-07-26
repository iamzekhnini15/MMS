# Guide Docker pour MMS (Management System)

## Architecture Containerisée

Cette application utilise une architecture multi-conteneurs avec Docker Compose :

- **Frontend** : React + TypeScript + Vite dans un conteneur Nginx
- **Backend** : Spring Boot dans un conteneur Java optimisé
- **Base de données** : PostgreSQL avec données d'initialisation
- **pgAdmin** : Interface d'administration de base de données (optionnel)

## Prérequis

- Docker Desktop installé
- Git (pour cloner le projet)
- Au moins 4GB de RAM disponible

## Démarrage rapide

### 1. Cloner et naviguer vers le projet
```bash
git clone <votre-repo>
cd MMS
```

### 2. Construire et démarrer tous les services
```bash
docker-compose up --build
```

### 3. Accéder aux services
- **Frontend** : http://localhost:8080
- **Backend API** : http://localhost:3000
- **pgAdmin** : http://localhost:5050 (admin@mms.local / admin123)
- **PostgreSQL** : localhost:5432 (mmsuser / mmspassword)

## Utilisateur Admin par défaut

Un utilisateur administrateur est automatiquement créé :
- **Email** : admin@school.be
- **Mot de passe** : password
- **Rôle** : ADMIN

⚠️ **Important** : Changez ce mot de passe après la première connexion !

## Commandes utiles

### Gestion des conteneurs
```bash
# Démarrer en arrière-plan
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Voir les logs
docker-compose logs -f

# Reconstruire un service spécifique
docker-compose build backend
docker-compose up backend

# Redémarrer un service
docker-compose restart backend
```

### Développement
```bash
# Démarrer seulement la base de données
docker-compose up postgres

# Construire seulement le frontend
cd frontend && npm run docker:build

# Mode développement avec live reload
# (Démarrer postgres en conteneur, frontend/backend en local)
docker-compose up postgres pgadmin
```

### Base de données
```bash
# Accéder à PostgreSQL directement
docker exec -it mms-postgres psql -U mmsuser -d mms

# Sauvegarder la base de données
docker exec mms-postgres pg_dump -U mmsuser mms > backup.sql

# Restaurer une sauvegarde
docker exec -i mms-postgres psql -U mmsuser mms < backup.sql

# Voir les logs PostgreSQL
docker-compose logs postgres
```

## Configuration d'environnement

### Variables d'environnement (optionnel)
Créez un fichier `.env` à la racine pour personnaliser :

```env
# Base de données
POSTGRES_DB=mms
POSTGRES_USER=mmsuser
POSTGRES_PASSWORD=mmspassword

# Ports
FRONTEND_PORT=8080
BACKEND_PORT=3000
POSTGRES_PORT=5432
PGADMIN_PORT=5050

# pgAdmin
PGADMIN_EMAIL=admin@mms.local
PGADMIN_PASSWORD=admin123
```

## Déploiement sur Azure Container Instances

### 1. Construire et pousser vers Azure Container Registry
```bash
# Se connecter à Azure
az login

# Créer un registre de conteneurs
az acr create --resource-group mms-rg --name mmsregistry --sku Basic

# Se connecter au registre
az acr login --name mmsregistry

# Construire et pousser les images
docker-compose build
docker tag mms-frontend mmsregistry.azurecr.io/mms-frontend:latest
docker tag mms-backend mmsregistry.azurecr.io/mms-backend:latest

docker push mmsregistry.azurecr.io/mms-frontend:latest
docker push mmsregistry.azurecr.io/mms-backend:latest
```

### 2. Déployer avec Azure Container Instances
```bash
# Créer un groupe de conteneurs
az container create \
  --resource-group mms-rg \
  --name mms-app \
  --image mmsregistry.azurecr.io/mms-frontend:latest \
  --dns-name-label mms-app-unique \
  --ports 80
```

## Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   ```bash
   # Vérifier les ports utilisés
   netstat -an | findstr :3000
   
   # Modifier les ports dans docker-compose.yml si nécessaire
   ```

2. **Problème de connexion à la base de données**
   ```bash
   # Vérifier que PostgreSQL est démarré
   docker-compose logs postgres
   
   # Tester la connexion
   docker exec mms-postgres pg_isready -U mmsuser
   ```

3. **Erreur de build frontend**
   ```bash
   # Nettoyer le cache npm
   docker-compose exec frontend npm cache clean --force
   
   # Reconstruire sans cache
   docker-compose build --no-cache frontend
   ```

4. **Problème de permissions**
   ```bash
   # Sur Linux/Mac, ajuster les permissions
   sudo chown -R $USER:$USER .
   ```

### Logs utiles
```bash
# Logs de tous les services
docker-compose logs

# Logs d'un service spécifique
docker-compose logs backend
docker-compose logs postgres

# Suivre les logs en temps réel
docker-compose logs -f backend
```

## Avantages de cette approche

✅ **Simplicité** : Un seul `docker-compose up` démarre tout
✅ **Isolation** : Chaque service dans son propre conteneur
✅ **Portabilité** : Fonctionne identique sur Windows/Mac/Linux
✅ **Développement** : Environment de dev identique à la production
✅ **Déploiement** : Facile à déployer sur n'importe quel cloud
✅ **Scalabilité** : Facile de scaler horizontalement
✅ **Maintenance** : Mise à jour des services indépendamment

## Migration depuis votre setup Azure actuel

1. **Sauvegarder vos données** de la base PostgreSQL Azure
2. **Tester localement** avec Docker Compose
3. **Déployer sur Azure Container Instances** ou **Azure Kubernetes Service**
4. **Migrer les données** vers la nouvelle base PostgreSQL containerisée

Cette approche vous donnera beaucoup plus de flexibilité et simplifiera grandement la gestion de votre infrastructure !
