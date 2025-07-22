# Tests HTTP pour la Phase 3 - Interface Enseignant

## Fichiers de tests créés/mis à jour

### 1. `bulletin-periods.http`
- ✅ GET `/bulletin-periods/active` - Récupérer les périodes actives
- ✅ GET `/bulletin-periods/current` - Récupérer la période courante
- ✅ GET `/bulletin-periods/year/{year}` - Récupérer les périodes par année
- ✅ POST `/bulletin-periods/create` - Créer une période
- ✅ GET `/bulletin-periods/{id}` - Récupérer une période par ID
- ✅ PUT `/bulletin-periods/{id}` - Modifier une période
- ✅ DELETE `/bulletin-periods/{id}` - Supprimer une période

### 2. `evaluations.http`
- ✅ GET `/evaluations/teacher/{teacherId}` - Évaluations par enseignant
- ✅ GET `/evaluations/visible/class/{classId}/period/{periodId}` - Évaluations visibles
- ✅ GET `/evaluations/subject/{subjectId}/class/{classId}` - Évaluations par matière/classe
- ✅ GET `/evaluations/subject/{subjectId}/class/{classId}/period/{periodId}` - Avec période
- ✅ GET `/evaluations/{id}` - Évaluation par ID
- ✅ POST `/evaluations/create` - Créer une évaluation
- ✅ PUT `/evaluations/{id}` - Modifier une évaluation
- ✅ PUT `/evaluations/{id}/toggle-visibility` - Basculer la visibilité
- ✅ PUT `/evaluations/{id}/toggle-grades-visibility` - Basculer la visibilité des notes
- ✅ DELETE `/evaluations/{id}` - Supprimer une évaluation

### 3. `grades.http`
- ✅ GET `/grades/evaluation/{evaluationId}` - Notes par évaluation
- ✅ GET `/grades/student/{studentId}/visible` - Notes visibles d'un étudiant
- ✅ GET `/grades/calculation/student/{studentId}/subject/{subjectId}/period/{periodId}` - Pour calculs
- ✅ GET `/grades/average/student/{studentId}/subject/{subjectId}/period/{periodId}` - Moyennes
- ✅ GET `/grades/{gradeId}` - Note par ID
- ✅ POST `/grades/save` - Sauvegarder une note
- ✅ POST `/grades/bulk-save` - Sauvegarder plusieurs notes en lot
- ✅ PUT `/grades/{gradeId}` - Modifier une note
- ✅ DELETE `/grades/{gradeId}` - Supprimer une note

### 4. `coefficients.http`
- ✅ GET `/coefficients/class/{classId}` - Coefficients par classe
- ✅ GET `/coefficients/subject/{subjectId}` - Coefficients par matière
- ✅ GET `/coefficients/subject/{subjectId}/class/{classId}` - Coefficient spécifique
- ✅ GET `/coefficients/value/subject/{subjectId}/class/{classId}` - Valeur du coefficient
- ✅ GET `/coefficients/all` - Tous les coefficients
- ✅ POST `/coefficients/save` - Sauvegarder un coefficient
- ✅ POST `/coefficients/bulk-save/class/{classId}` - Sauvegarder en lot par classe
- ✅ PUT `/coefficients/{coefficientId}/deactivate` - Désactiver
- ✅ DELETE `/coefficients/{coefficientId}` - Supprimer

### 5. `phase3-workflow.http`
- ✅ Workflow complet de test pour la Phase 3
- ✅ Tests séquentiels des fonctionnalités enseignant
- ✅ Création de données de test (période, évaluation, notes)
- ✅ Tests des calculs et moyennes
- ✅ Tests de visibilité des évaluations et notes

### 6. `dashboard.http`
- ✅ GET `/dashboard/kpis` - Indicateurs de performance

### 7. Fichiers mis à jour
- ✅ `classes.http` - Ajout de POST `/classes/create`
- ✅ `subject.http` - Ajout de POST `/subject/create`
- ✅ `students.http` - Déjà complet

## Comment utiliser les tests

### Dans VS Code avec l'extension REST Client :
1. Ouvrir un fichier `.http`
2. Cliquer sur "Send Request" au-dessus de chaque requête
3. Voir les résultats dans le panneau de droite

### En ligne de commande avec curl :
```bash
# Exemple pour tester l'endpoint teachers
curl -X GET http://localhost:3000/teachers/getAll

# Exemple pour créer une évaluation
curl -X POST http://localhost:3000/evaluations/create \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Math", "maxScore": 20, ...}'
```

### Ordre recommandé de tests pour la Phase 3 :
1. **phase3-workflow.http** - Test complet du workflow
2. **bulletin-periods.http** - Tests des périodes de bulletin
3. **evaluations.http** - Tests des évaluations
4. **grades.http** - Tests des notes
5. **coefficients.http** - Tests des coefficients

## Variables à remplacer dans les tests
- `{teacherId}` → ID réel de l'enseignant (ex: 1, 2)
- `{classId}` → ID réel de la classe (ex: 1)
- `{subjectId}` → ID réel de la matière (ex: 1)
- `{studentId}` → ID réel de l'étudiant (ex: 1, 2, 3)
- `{evaluationId}` → ID réel de l'évaluation après création
- `{periodId}` → ID réel de la période après création

## Statut des tests
- ✅ **API opérationnelle** : Port 3000
- ✅ **Base de données** : PostgreSQL connectée
- ✅ **Données de test** : Enseignants, classes, matières disponibles
- ⚠️ **À créer** : Périodes de bulletin, évaluations, notes (via les tests)
