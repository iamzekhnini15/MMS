# Guide d'utilisation du système d'emploi du temps

## Vue d'ensemble

Le système d'emploi du temps permet de générer automatiquement des plannings pour les classes en respectant les contraintes de disponibilité des professeurs et des salles.

## Entités principales

- **TimeSlot** : Créneaux horaires (ex: Lundi 14h-16h)
- **Timetable** : Un emploi du temps complet pour une période
- **TimetableEntry** : Une entrée dans l'emploi du temps (classe + matière + prof + salle + créneau)
- **TeacherAvailability** : Disponibilités des professeurs
- **ClassroomAvailability** : Disponibilités des salles

## API Endpoints

### 1. Initialiser les créneaux horaires par défaut
```bash
POST /api/timetables/time-slots/init
```

### 2. Créer un créneau horaire personnalisé
```bash
POST /api/timetables/time-slots
Content-Type: application/json

{
  "dayOfWeek": "MONDAY",
  "startTime": "14:00",
  "endTime": "16:00",
  "name": "Lundi 14h-16h",
  "description": "Période après-midi"
}
```

### 3. Générer un emploi du temps
```bash
POST /api/timetables/generate
Content-Type: application/json

{
  "name": "Emploi du temps - Semestre 1 2025",
  "startDate": "2025-01-15",
  "endDate": "2025-06-15",
  "classRequirements": [
    {
      "classId": 1,
      "subjects": [
        {
          "subjectId": 1,
          "hoursPerWeek": 4,
          "preferredTeacherIds": [5],
          "preferredClassroomIds": [1, 2]
        },
        {
          "subjectId": 2,
          "hoursPerWeek": 3,
          "preferredTeacherIds": [2, 3],
          "preferredClassroomIds": [3]
        }
      ]
    },
    {
      "classId": 2,
      "subjects": [
        {
          "subjectId": 1,
          "hoursPerWeek": 3,
          "preferredTeacherIds": [2],
          "preferredClassroomIds": [1, 2]
        }
      ]
    }
  ],
  "options": {
    "maxTimeoutSeconds": 30,
    "allowPartialSolution": true,
    "priority": "BALANCED"
  }
}
```

### 4. Consulter l'emploi du temps d'une classe
```bash
GET /api/timetables/class/1
```

### 5. Consulter l'emploi du temps d'un professeur
```bash
GET /api/timetables/teacher/5
```

### 6. Publier un emploi du temps
```bash
PUT /api/timetables/{id}/publish
```

## Exemple d'utilisation complet

### Étape 1: Préparer les données de base

1. **Créer les créneaux horaires** (si pas encore fait) :
```bash
curl -X POST http://localhost:3000/api/timetables/time-slots/init
```

2. **Vérifier les entités existantes** :
- Classes (via `/api/classes/getAll`)
- Professeurs (via `/api/teachers/getAll`)
- Matières (via `/api/subjects/getAll`)
- Salles (via `/api/classroom/getAll`)

### Étape 2: Configurer les disponibilités (optionnel)

Par défaut, tous les professeurs et salles sont disponibles sur tous les créneaux. Pour restreindre :

```sql
-- Exemple : Le professeur 5 n'est pas disponible le vendredi après-midi
INSERT INTO teacher_availabilities (id_teacher, id_time_slot, is_available) 
VALUES (5, 16, false); -- Supposons que 16 = Vendredi 14h-16h
```

### Étape 3: Générer l'emploi du temps

```bash
curl -X POST http://localhost:3000/api/timetables/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emploi du temps - Test",
    "startDate": "2025-01-15",
    "endDate": "2025-06-15",
    "classRequirements": [
      {
        "classId": 1,
        "subjects": [
          {
            "subjectId": 1,
            "hoursPerWeek": 4,
            "preferredTeacherIds": [5],
            "preferredClassroomIds": [1]
          }
        ]
      }
    ]
  }'
```

### Étape 4: Consulter le résultat

```bash
# Voir l'emploi du temps de la classe 1
curl http://localhost:3000/api/timetables/class/1

# Voir l'emploi du temps du professeur 5
curl http://localhost:3000/api/timetables/teacher/5
```

## Contraintes gérées automatiquement

1. **Un professeur ne peut être dans deux endroits en même temps**
2. **Une salle ne peut héberger deux cours simultanément**
3. **Une classe ne peut avoir deux cours en même temps**
4. **Respect des disponibilités des professeurs et des salles**
5. **Association professeur-matière** (via la table `teacher_subjects`)

## Algorithme de génération

Le système utilise un algorithme de **backtracking avec contraintes** :

1. **Analyse des besoins** : Calcule toutes les heures de cours nécessaires
2. **Génération des candidats** : Pour chaque besoin, trouve les professeurs/salles/créneaux possibles
3. **Assignation progressive** : Assigne cours par cours en vérifiant les contraintes
4. **Retour en arrière** : Si une impasse est atteinte, revient sur les décisions précédentes
5. **Solution optimale** : Trouve la première solution complète ou la meilleure solution partielle

## Extensibilité

Le système peut être étendu facilement :

- **Contraintes supplémentaires** : Ajout de règles métier (ex: pas de cours après 18h)
- **Optimisations** : Préférences pour certains créneaux ou salles
- **Algorithmes alternatifs** : Algorithmes génétiques, recuit simulé
- **Interface graphique** : Édition manuelle et glisser-déposer

## Structure de la base de données

Les nouvelles tables créées :

- `time_slots` : Définition des créneaux horaires
- `timetables` : Métadonnées des emplois du temps
- `timetable_entries` : Entrées individuelles de l'emploi du temps
- `teacher_availabilities` : Disponibilités des professeurs
- `classroom_availabilities` : Disponibilités des salles
