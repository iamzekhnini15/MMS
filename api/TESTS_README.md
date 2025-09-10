# Tests Documentation - Système Timetable

## 🧪 Types de Tests Implementés

### 1. Tests HTTP (.http files)
- **Fichier** : `test/timetables.http`
- **Utilisation** : Tests manuels des APIs REST avec VSCode REST Client
- **Couverture** :
  - ✅ Initialisation des time slots par défaut
  - ✅ Génération automatique d'emplois du temps
  - ✅ Gestion des disponibilités professeurs/salles
  - ✅ CRUD complet des timetables
  - ✅ Tests d'erreurs et cas limites

### 2. Tests Unitaires (JUnit 5)

#### TimeSlotServiceTest
- **Fichier** : `src/test/java/.../services/TimeSlotServiceTest.java`
- **Couverture** :
  - ✅ Récupération de tous les time slots
  - ✅ Filtrage par jour de la semaine
  - ✅ Création de time slots personnalisés
  - ✅ Initialisation des slots par défaut
  - ✅ Gestion des formats de temps invalides

#### TimetableControllerTest
- **Fichier** : `src/test/java/.../controllers/TimetableControllerTest.java`
- **Type** : Tests d'intégration avec MockMvc
- **Couverture** :
  - ✅ Endpoints de génération de timetable
  - ✅ Récupération des données
  - ✅ Publication et suppression
  - ✅ Gestion des time slots

#### AvailabilityControllerTest
- **Fichier** : `src/test/java/.../controllers/AvailabilityControllerTest.java`
- **Type** : Tests d'intégration avec MockMvc
- **Couverture** :
  - ✅ Création de disponibilités professeurs
  - ✅ Création de disponibilités salles
  - ✅ Récupération des disponibilités
  - ✅ Suppression de disponibilités

## 🚀 Comment Exécuter les Tests

### Tests HTTP
1. Installer l'extension "REST Client" dans VSCode
2. Ouvrir le fichier `test/timetables.http`
3. Cliquer sur "Send Request" au-dessus de chaque requête
4. Vérifier les réponses dans le panneau de résultats

### Tests Unitaires
```bash
# Tous les tests
./mvnw test

# Tests spécifiques
./mvnw test -Dtest=TimeSlotServiceTest
./mvnw test -Dtest=TimetableControllerTest
./mvnw test -Dtest=AvailabilityControllerTest

# Compilation tests seulement
./mvnw test-compile
```

## 📋 Variables d'Environnement pour Tests HTTP

Modifiez les variables en haut du fichier `timetables.http` :
```
@baseUrl = http://localhost:8080/api
@timetableId = 1
@classId = 1
@teacherId = 1
@classroomId = 1
```

## 🔍 Scénarios de Test Couverts

### Génération d'Emploi du Temps
```http
POST {{baseUrl}}/timetables/generate
{
  "classId": 1,
  "startDate": "2025-09-08",
  "endDate": "2025-12-20",
  "subjectHours": {
    "1": 4,  // Mathématiques: 4h/semaine
    "2": 3,  // Français: 3h/semaine
    "3": 2   // Sciences: 2h/semaine
  }
}
```

### Gestion des Disponibilités
```http
# Professeur disponible le lundi 8h-12h
POST {{baseUrl}}/availabilities/teachers
{
  "teacherId": 1,
  "dayOfWeek": "MONDAY",
  "startTime": "08:00",
  "endTime": "12:00"
}

# Salle disponible le lundi 8h-17h
POST {{baseUrl}}/availabilities/classrooms
{
  "classroomId": 1,
  "dayOfWeek": "MONDAY", 
  "startTime": "08:00",
  "endTime": "17:00"
}
```

## ⚠️ Tests d'Erreurs

Le fichier HTTP inclut des tests pour :
- IDs invalides (classe inexistante)
- Formats de date incorrects
- Créneaux horaires invalides
- Jours de semaine inexistants

## 📊 Résultats Attendus

### Tests Unitaires
- ✅ **TimeSlotServiceTest** : 7 tests (création, récupération, validation)
- ✅ **TimetableControllerTest** : 7 tests (API endpoints, statut HTTP)
- ✅ **AvailabilityControllerTest** : 6 tests (CRUD disponibilités)

### Tests HTTP
- ✅ **17 requêtes principales** : Workflow complet de génération
- ✅ **4 tests d'erreurs** : Validation des cas d'échec

## 🎯 Prochaines Étapes

1. **Tests d'Intégration** : Tests avec base de données H2
2. **Tests de Performance** : Génération avec données volumineuses
3. **Tests Selenium** : Interface utilisateur (après développement frontend)
4. **Tests de Charge** : Stress testing des APIs

## 🔧 Configuration Maven

Les tests utilisent les dépendances suivantes :
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

Inclut automatiquement :
- JUnit 5
- Mockito
- Spring Test & MockMvc
- AssertJ
- Hamcrest
