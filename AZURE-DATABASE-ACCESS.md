# Guide d'accès à la base de données Azure PostgreSQL

## 🔍 Obtenir les informations de connexion

### 1. Via Azure Portal
1. Allez sur [Azure Portal](https://portal.azure.com)
2. Recherchez votre serveur PostgreSQL
3. Dans "Connection strings", copiez les informations

### 2. Via Azure CLI

```bash
# Lister tous les serveurs PostgreSQL
az postgres flexible-server list --resource-group mms-app --output table

# Obtenir les détails d'un serveur spécifique
az postgres flexible-server show --resource-group mms-app --name <server-name>

# Obtenir la connection string
az postgres flexible-server show-connection-string --server-name <server-name>
```

## 🔐 Se connecter à la base de données

### Option 1: Via psql (PostgreSQL CLI)

```bash
# Format de connexion
psql "postgresql://<username>:<password>@<server-name>.postgres.database.azure.com:5432/<database-name>?sslmode=require"

# Exemple
psql "postgresql://adminuser@mms-db-server:MySecurePassword123!@mms-db-server.postgres.database.azure.com:5432/mms_staging_db?sslmode=require"
```

### Option 2: Via pgAdmin

1. Ouvrez pgAdmin
2. Créez une nouvelle connexion serveur:
   - **Host**: `<server-name>.postgres.database.azure.com`
   - **Port**: `5432`
   - **Database**: `mms_staging_db` (ou votre nom de DB)
   - **Username**: `<your-username>`
   - **Password**: `<your-password>`
3. Dans l'onglet "SSL", sélectionnez "Require"

### Option 3: Via DBeaver

1. Nouvelle connexion PostgreSQL
2. Remplissez les informations:
   - **Host**: `<server-name>.postgres.database.azure.com`
   - **Port**: `5432`
   - **Database**: `mms_staging_db`
   - **Username**: `<your-username>`
   - **Password**: `<your-password>`
3. Dans "Driver properties", ajoutez `sslmode=require`

### Option 4: Via VS Code (PostgreSQL Extension)

1. Installez l'extension "PostgreSQL" de Chris Kolkman
2. Créez une nouvelle connexion avec:
   - **Host**: `<server-name>.postgres.database.azure.com`
   - **Port**: `5432`
   - **Database**: `mms_staging_db`
   - **Username**: `<your-username>`
   - **Password**: `<your-password>`
   - **SSL**: Enabled

## 🛡️ Configuration du Firewall Azure

Pour vous connecter depuis votre machine locale, vous devez autoriser votre IP :

```bash
# Ajouter votre IP actuelle au firewall
az postgres flexible-server firewall-rule create \
  --resource-group mms-app \
  --name <server-name> \
  --rule-name AllowMyIP \
  --start-ip-address $(curl -s https://api.ipify.org) \
  --end-ip-address $(curl -s https://api.ipify.org)

# Lister les règles de firewall
az postgres flexible-server firewall-rule list \
  --resource-group mms-app \
  --name <server-name> \
  --output table
```

## 📊 Requêtes utiles

### Vérifier les tables
```sql
-- Lister toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Voir la structure d'une table
\d+ users

-- Compter les enregistrements
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Vérifier les données
```sql
-- Utilisateurs
SELECT id_user, email, role, active FROM users;

-- Classes
SELECT id_class, name, level FROM classes;

-- Statistiques
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM students) as total_students,
  (SELECT COUNT(*) FROM teachers) as total_teachers,
  (SELECT COUNT(*) FROM classes) as total_classes;
```

## 🔧 Obtenir les variables d'environnement de l'app Azure

```bash
# Voir toutes les variables d'environnement configurées
az webapp config appsettings list \
  --name mms-staging-app \
  --resource-group mms-app \
  --output table

# Extraire uniquement la connection string
az webapp config appsettings list \
  --name mms-staging-app \
  --resource-group mms-app \
  --query "[?name=='SPRING_DATASOURCE_URL'].value" \
  --output tsv
```

## 📝 Créer un utilisateur admin (si besoin)

```sql
-- Depuis psql ou votre client PostgreSQL
INSERT INTO addresses (box, commune, country, number, postal_code, street)
VALUES ('', 'Brussels', 'Belgium', '1', '1000', 'Admin Street')
RETURNING id_address;

-- Utilisez l'id_address retourné dans la requête suivante
INSERT INTO users (active, id_address, registration_date, civility, email, firstname, lastname, password, phone, role)
VALUES (
  true, 
  <id_address>, 
  NOW(), 
  'Mr', 
  'admin@mms.be', 
  'Admin', 
  'System', 
  '$2a$10$8gj7KRXSy0kDgZl3D8p1COLvPD.dYYk0vQMEjPjNsLJHAKo3YmPBK', -- Password: Admin123!
  '+32470000000', 
  'ADMIN'
);
```

## 🔗 Connexion depuis l'application locale

Si vous voulez tester votre app locale contre la DB Azure :

1. Créez un fichier `.env` dans `/api` :
```properties
SPRING_DATASOURCE_URL=jdbc:postgresql://<server-name>.postgres.database.azure.com:5432/mms_staging_db?sslmode=require
SPRING_DATASOURCE_USERNAME=<your-username>
SPRING_DATASOURCE_PASSWORD=<your-password>
```

2. Lancez l'API avec ce profil:
```bash
cd api
mvn spring-boot:run -Dspring-boot.run.profiles=staging
```

## ⚠️ Sécurité

- ❌ Ne committez JAMAIS les credentials dans Git
- ✅ Utilisez toujours SSL/TLS (`sslmode=require`)
- ✅ Changez les mots de passe par défaut
- ✅ Limitez les accès firewall aux IPs nécessaires
- ✅ Utilisez Azure Key Vault pour les secrets en production
