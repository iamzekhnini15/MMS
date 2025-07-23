# Système de Protection et Redirection basé sur les Rôles

## Vue d'ensemble

Ce système implémente une protection des routes et une redirection automatique basées sur les rôles d'utilisateur (ADMIN, TEACHER, STUDENT).

## Composants Principaux

### 1. `useRoleBasedRedirect` Hook
**Fichier**: `src/hooks/useRoleBasedRedirect.ts`

Fonctions:
- `redirectBasedOnRole(user)`: Redirige vers le dashboard approprié
- `getDefaultRouteForRole(role)`: Retourne la route par défaut pour un rôle

Mappings des rôles:
- `ADMIN` → `/admin/dashboard`
- `TEACHER` → `/teacher/dashboard`
- `STUDENT` → `/student`

### 2. `LoginForm` Component
**Fichier**: `src/components/login-form.tsx`

Modifications:
- Import du hook `useRoleBasedRedirect`
- useEffect qui surveille `authenticatedUser`
- Redirection automatique après connexion réussie

### 3. `ProtectedRoute` Component
**Fichier**: `src/components/ProtectedRoutes.tsx`

Améliorations:
- Import du hook `useRoleBasedRedirect`
- Redirection intelligente vers le dashboard approprié si accès non autorisé
- Remplace la redirection vers "/" par une redirection vers le dashboard du rôle

### 4. `RoleBasedDashboardRedirect` Component
**Fichier**: `src/components/pages/RoleBasedDashboardRedirect.tsx`

Purpose:
- Composant de redirection automatique pour la route `/dashboard`
- Affiche un loader pendant la redirection
- Utilise le hook `useRoleBasedRedirect`

## Routes Définies

### Routes Générales
- `/dashboard` → Redirection automatique basée sur le rôle
- `/schedule` → Emploi du temps (accessible à tous les rôles connectés)

### Routes Admin (ADMIN seulement)
- `/admin/dashboard` → DashboardPage avec protection ADMIN
- `/manage-courses` → Gestion des cours
- `/manage-courses/:id` → Détails d'un cours
- `/manage-teachers` → Gestion des professeurs
- `/manage-classes` → Gestion des classes
- `/manage-classes/:id` → Détails d'une classe
- `/manage-classroom` → Gestion des salles de classe

### Routes Teacher (TEACHER seulement)
- `/teacher/dashboard` → TeacherDashboard avec protection TEACHER
- `/teacher` → TeacherDashboard (existant)
- `/teacher/evaluations` → EvaluationsManagement
- `/teacher/grades` → TeacherGradesPage
- `/teacher/coefficients` → TeacherCoefficientsPage
- `/teacher/classes` → TeacherClassesPage
- `/teacher/bulletins` → TeacherBulletinsPage

### Routes Student (STUDENT seulement)
- `/student` → StudentDashboard (dashboard par défaut)
- `/student/grades` → MyGradesPage
- `/student/schedule` → StudentSchedule
- `/student/bulletins` → StudentBulletins
- `/student/resources` → StudentResources

## Flux d'Authentification

1. **Connexion**: LoginForm → `loginUser()` → useEffect détecte `authenticatedUser`
2. **Redirection**: `redirectBasedOnRole()` → Navigation vers dashboard approprié
3. **Protection**: ProtectedRoute vérifie les rôles requis
4. **Accès refusé**: Redirection vers dashboard approprié au lieu de "/"

## Avantages

- ✅ Sécurité renforcée avec vérification des rôles
- ✅ Expérience utilisateur améliorée (redirection automatique)
- ✅ Maintenance simplifiée avec logique centralisée
- ✅ Évite les erreurs 404 et pages non autorisées
- ✅ Gestion cohérente des permissions

## Utilisation

Après connexion, les utilisateurs sont automatiquement redirigés:
- **Administrateurs** → Page d'administration avec KPIs et gestion
- **Professeurs** → Dashboard professeur avec évaluations et bulletins
- **Étudiants** → Dashboard étudiant avec notes et emploi du temps

Aucune configuration supplémentaire n'est nécessaire côté composants.
