# Guide de Planification Manuelle des Emplois du Temps - Version Améliorée

## Vue d'ensemble

La nouvelle version du planificateur manuel d'emplois du temps offre une expérience utilisateur grandement améliorée avec la détection de conflits en temps réel et une interface intuitive pour la programmation des cours.

## Nouvelles Fonctionnalités

### 1. **Vérification de Conflits en Temps Réel**

#### Côté Backend
- **Nouveau endpoint**: `POST /api/timetables/check-conflicts`
- **Service de validation amélioré**: `TimetableValidationService`
- **Vérifications complètes**:
  - Conflits de professeurs (déjà occupé à ce créneau)
  - Conflits de salles (déjà réservée à ce créneau)  
  - Conflits de classes (déjà un cours programmé)
  - Disponibilités des professeurs (contraintes définies)
  - Disponibilités des salles (contraintes définies)

#### Côté Frontend
- **Détection automatique** des conflits lors de la sélection d'un créneau
- **Cache intelligent** pour éviter les appels répétés à l'API
- **Interface visuelle** avec codes couleur

### 2. **Interface Utilisateur Améliorée**

#### Codes Couleur pour les Créneaux
- 🟢 **Vert**: Créneau disponible, peut être sélectionné
- 🔴 **Rouge**: Conflit détecté, ne peut pas être sélectionné
- ⚫ **Gris**: Créneau déjà occupé par cette classe
- ⏳ **Animation**: Vérification en cours

#### Légende Interactive
Une légende claire aide l'utilisateur à comprendre l'état de chaque créneau.

#### Tooltips Informatifs
Chaque créneau affiche des informations détaillées au survol :
- Raison du conflit si applicable
- État de disponibilité
- Messages d'erreur spécifiques

### 3. **Workflow Optimisé**

1. **Sélection de la classe** → Chargement automatique des cours compatibles
2. **Configuration des cours** → Assignment des professeurs et salles
3. **Programmation intelligente** → Sélection des créneaux avec validation en temps réel
4. **Visualisation** → Emploi du temps programmé en temps réel
5. **Sauvegarde** → Création de l'emploi du temps final

## Architecture Technique

### Nouveaux DTOs

```java
// Requête de vérification de conflits
ConflictCheckRequest {
  Long classId;
  Long courseId;
  Long teacherId;
  Long classroomId;
  Long timeSlotId;
  Long excludeTimetableEntryId; // Pour la modification
}

// Réponse de vérification de conflits  
ConflictCheckResponse {
  boolean hasConflicts;
  List<String> conflicts;
  boolean teacherUnavailable;
  boolean classroomUnavailable;
  String teacherAvailabilityReason;
  String classroomAvailabilityReason;
}
```

### Nouveau Service de Validation

Le `TimetableValidationService` a été étendu avec :
- `checkConflicts(ConflictCheckRequest)` - Vérification complète
- `isTeacherAvailableForTimeSlot(teacherId, timeSlotId)` - Disponibilité professeur
- `isClassroomAvailableForTimeSlot(classroomId, timeSlotId)` - Disponibilité salle

### Frontend TypeScript

```typescript
// Types pour la gestion des conflits
interface ConflictCheckRequest {
  classId: number;
  courseId?: number;
  teacherId?: number;
  classroomId?: number;
  timeSlotId: number;
  excludeTimetableEntryId?: number;
}

interface ConflictCheckResponse {
  hasConflicts: boolean;
  conflicts: string[];
  teacherUnavailable: boolean;
  classroomUnavailable: boolean;
  teacherAvailabilityReason?: string;
  classroomAvailabilityReason?: string;
}
```

## Utilisation

### 1. Accès au Planificateur
- Navigation : **Administration** → **Gestion des Emplois du Temps** → **Planification Manuelle**

### 2. Configuration Initiale
1. Sélectionner une **classe** dans le menu déroulant
2. Les cours compatibles se chargent automatiquement selon le niveau de la classe

### 3. Assignment des Ressources
1. **Ajouter des cours** avec le bouton "+" 
2. Pour chaque cours :
   - Sélectionner le **professeur** qualifié
   - Assigner une **salle** de classe
   - Les champs obligatoires sont marqués avec *

### 4. Programmation des Créneaux
1. Cliquer sur **"Programmer"** pour un cours configuré
2. L'interface affiche tous les créneaux de la semaine
3. **Codes couleur en temps réel** :
   - Vert = Disponible
   - Rouge = Conflit
   - Gris = Occupé
4. Cliquer sur un créneau vert pour programmer le cours

### 5. Gestion des Conflits
- Les conflits sont détectés **automatiquement**
- **Messages détaillés** expliquent la nature du conflit
- **Pas de sélection possible** sur les créneaux en conflit

### 6. Finalisation
1. Réviser l'emploi du temps dans la section "Emploi du Temps Programmé"
2. Supprimer des entrées si nécessaire
3. Cliquer sur **"Créer l'Emploi du Temps"** pour sauvegarder

## Gestion des Erreurs

### Validation Côté Serveur
Même avec la validation frontend, le serveur effectue une validation finale avant la création.

### Messages d'Erreur Contextuels
- Conflits de professeurs : "Le professeur est déjà occupé à ce créneau avec la classe X"
- Conflits de salles : "La salle est déjà occupée à ce créneau par le cours Y"
- Indisponibilité : "Le professeur/La salle n'est pas disponible à ce créneau"

## Avantages

### Pour les Utilisateurs
- **Expérience fluide** sans erreurs de programmation
- **Feedback immédiat** sur les conflits
- **Interface intuitive** avec codes couleur
- **Gain de temps** significatif

### Pour le Système
- **Prévention des conflits** en amont
- **Réduction des erreurs** dans la base de données
- **Performance optimisée** avec le cache des conflits
- **Maintenance facilitée** avec une architecture claire

## Configuration Avancée

### Gestion des Disponibilités
Les administrateurs peuvent définir des contraintes de disponibilité :
- **Professeurs** : Créneaux où un professeur n'est pas disponible
- **Salles** : Créneaux où une salle n'est pas utilisable

### Endpoint pour les Disponibilités
- `GET/POST /api/availabilities/teacher` - Gestion des disponibilités professeurs
- `GET/POST /api/availabilities/classroom` - Gestion des disponibilités salles

## Bonnes Pratiques

1. **Configurer les disponibilités** en amont pour une détection optimale
2. **Assigner professeurs et salles** avant de programmer les créneaux
3. **Vérifier l'emploi du temps** avant la sauvegarde finale
4. **Utiliser les tooltips** pour comprendre les conflits

Cette nouvelle version transforme la planification manuelle d'un processus prone aux erreurs en une expérience utilisateur fluide et sécurisée.
