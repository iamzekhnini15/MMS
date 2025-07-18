# Page Emploi du Temps - SchedulePage

## 🎯 Vue d'ensemble

La page `SchedulePage` est une interface complète de gestion d'emploi du temps pour le système ManageMySchool. Elle permet de visualiser, créer, modifier et supprimer des créneaux de cours avec une interface moderne et intuitive.

## ✨ Fonctionnalités principales

### 📊 Tableau de bord
- **Statistiques en temps réel** : Cours du jour, enseignants actifs, salles utilisées, total des cours
- **Indicateurs visuels** avec icônes Lucide React

### 🗓️ Visualisation de l'emploi du temps
- **Vue grille hebdomadaire** : Affichage des cours de 8h à 20h
- **Navigation temporelle** : Boutons précédent/suivant pour naviguer entre les semaines
- **Cartes de cours interactives** avec informations détaillées :
  - Nom du cours
  - Horaires (début - fin)
  - Enseignant responsable
  - Salle de classe

### 🔍 Recherche et filtrage
- **Barre de recherche** : Recherche par nom de cours, enseignant ou salle
- **Filtres** : Par enseignant, par salle de classe
- **Onglets de vue** : Jour, Semaine, Mois

### ➕ Gestion des créneaux
- **Création de nouveaux créneaux** via modal
- **Édition en un clic** sur les cours existants
- **Suppression avec confirmation**
- **Validation de formulaire** complète

### 📱 Interface responsive
- **Design adaptatif** pour desktop, tablet et mobile
- **Composants UI modernes** avec shadcn/ui
- **Animations fluides** et transitions

## 🛠️ Architecture technique

### Composants principaux
```
SchedulePage.tsx                 // Composant principal
├── course-card.tsx             // Carte de cours dans la grille
├── schedule-loading.tsx        // Skeleton de chargement
├── empty-schedule.tsx          // État vide (aucun cours)
├── form-message.tsx           // Messages de validation
└── toast.tsx                  // Notifications
```

### Contextes utilisés
- `CoursesContext` : Gestion des cours (CRUD)
- `TeacherContext` : Liste des enseignants
- `ClassesContext` : Gestion des classes
- `ClassroomContext` : Gestion des salles

### Technologies
- **React 18** avec hooks modernes
- **TypeScript** pour la sécurité des types
- **React Router** pour la navigation
- **Lucide React** pour les icônes
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants

## 🎨 Design System

### Palette de couleurs
- **Primaire** : Bleu (#3B82F6)
- **Secondaire** : Gris (#6B7280)
- **Succès** : Vert (#10B981)
- **Erreur** : Rouge (#EF4444)
- **Avertissement** : Jaune (#F59E0B)

### Composants UI
- `Button` : Actions utilisateur
- `Card` : Conteneurs de contenu
- `Badge` : Labels et statuts
- `Dialog` : Modals et popups
- `Input` : Champs de saisie
- `Select` : Listes déroulantes
- `Tabs` : Navigation par onglets

## 📋 Fonctionnalités détaillées

### 1. Grille horaire
```tsx
// Créneaux de 8h à 20h (12 heures)
const timeSlots = Array.from({ length: 12 }, (_, i) => ({
  hour: 8 + i,
  display: `${(8 + i).toString().padStart(2, '0')}:00`,
}));
```

### 2. Gestion des cours
```tsx
// Création de cours
const handleSubmit = async (e: React.FormEvent) => {
  // Validation des données
  // Appel API via createCourse()
  // Rafraîchissement de la liste
};
```

### 3. Navigation temporelle
```tsx
// Navigation par semaine
const navigateWeek = (direction: 'prev' | 'next') => {
  const newDate = new Date(currentDate);
  newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
  setCurrentDate(newDate);
};
```

## 🔄 États de l'application

### États de chargement
- **Loading** : Skeleton avec animation
- **Empty** : Message d'encouragement + bouton création
- **Error** : Message d'erreur avec possibilité de retry

### États de données
- **Courses** : Liste des cours avec filtrage
- **Teachers** : Enseignants disponibles
- **Classrooms** : Salles disponibles
- **FormData** : Données du formulaire de création/édition

## 🚀 Performance

### Optimisations
- **Filtrage côté client** pour une recherche instantanée
- **Composants mémorisés** pour éviter les re-renders inutiles
- **Lazy loading** pour les gros datasets
- **Skeleton loading** pour une meilleure UX

### Gestion d'erreur
- **Try-catch** sur toutes les opérations async
- **Messages d'erreur contextuels**
- **Fallbacks** pour les cas d'échec

## 📱 Responsive Design

### Breakpoints
- **Mobile** : < 768px
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

### Adaptations
- **Navigation mobile** : Menu hamburger
- **Grille adaptative** : Scroll horizontal sur mobile
- **Modals full-screen** sur petits écrans

## 🧪 Tests recommandés

### Tests unitaires
- Rendu des composants
- Gestion des états
- Validation des formulaires
- Fonctions utilitaires

### Tests d'intégration
- CRUD des cours
- Navigation temporelle
- Recherche et filtrage
- Responsive design

## 🔮 Améliorations futures

### Fonctionnalités v2
- **Vue calendrier mensuel** complète
- **Drag & drop** pour déplacer les cours
- **Récurrence** pour les cours réguliers
- **Conflits de planning** automatiques
- **Export PDF/Excel** de l'emploi du temps
- **Notifications push** pour les changements
- **Mode sombre** pour l'interface

### Intégrations
- **Synchronisation Google Calendar**
- **Import/Export iCal**
- **API de géolocalisation** pour les salles
- **Intégration vidéo** pour les cours en ligne

---

## 💡 Notes de développement

Cette page représente un exemple complet d'application React moderne avec :
- Architecture modulaire et réutilisable
- Gestion d'état avancée avec Context API
- Interface utilisateur responsive et accessible
- Performance optimisée avec les bonnes pratiques React
- TypeScript pour la robustesse du code
