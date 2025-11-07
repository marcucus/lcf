# Liste Complète des Tâches - Application LCF AUTO PERFORMANCE

## Résumé de l'Analyse

Ce document présente l'analyse complète du code existant par rapport aux spécifications définies dans `specifications.md`, et établit la liste exhaustive de toutes les tâches nécessaires pour finaliser l'application.

### État Actuel du Projet

#### ✅ **Fonctionnalités Déjà Implémentées**

**Phase 1-2 : Configuration & Système de Design**
- ✅ Configuration Firebase (Authentication, Firestore, Storage)
- ✅ Système de couleurs avec accent #1CCEFF
- ✅ Polices Inter et Poppins
- ✅ Composants UI réutilisables (Button, Input, Card, Select, Textarea)
- ✅ Thème clair/sombre avec toggle fonctionnel
- ✅ Navigation responsive (Header, Footer)

**Phase 3 : Système d'Authentification**
- ✅ Inscription avec email/password et Google OAuth
- ✅ Connexion avec validation
- ✅ Réinitialisation de mot de passe
- ✅ Gestion des sessions
- ✅ Routes protégées avec AuthGuard
- ✅ Contrôle d'accès basé sur les rôles (RBAC) - types définis

**Phase 4 : Pages Publiques**
- ✅ Page d'accueil avec Hero section
- ✅ Pages services (vue d'ensemble, entretien, réparation, reprogrammation)
- ✅ Page contact avec informations et horaires
- ⚠️ Page véhicules (placeholder uniquement, CRUD manquant)

**Phase 5 : Portail Client**
- ✅ Tableau de bord client avec statistiques
- ✅ Système de réservation en 4 étapes
- ✅ Sélection de service et créneau horaire
- ✅ Informations véhicule et confirmation
- ✅ Gestion des rendez-vous avec règle des 24 heures
- ✅ Transactions Firestore anti-conflits
- ✅ Annulation de rendez-vous
- ✅ Historique complet

---

## 📋 LISTE DES TÂCHES À EFFECTUER

### **PRIORITÉ 1 : PANNEAU D'ADMINISTRATION (CRITIQUE)**

Ces fonctionnalités sont essentielles pour que l'application soit utilisable par le garage.

#### **Tâche 1.1 : Créer la Structure Admin**
**Objectif** : Mettre en place l'architecture de base du panneau d'administration

**Actions** :
- [ ] Créer le répertoire `/src/app/admin`
- [ ] Créer la page d'accueil admin `/src/app/admin/page.tsx`
- [ ] Créer le layout admin `/src/app/admin/layout.tsx`
- [ ] Implémenter la protection de route (accès AgendaManager + Admin uniquement)
- [ ] Créer le composant de navigation admin (sidebar ou tabs)

**Référence** : Section 7.0 des spécifications

---

#### **Tâche 1.2 : Dashboard Administratif**
**Objectif** : Vue d'ensemble synthétique de l'activité du garage

**Actions** :
- [ ] Créer `/src/app/admin/page.tsx` (tableau de bord principal)
- [ ] Afficher les KPIs :
  - [ ] Nombre de rendez-vous du jour
  - [ ] Nombre de rendez-vous de la semaine
  - [ ] Nombre total de véhicules en vente
  - [ ] Derniers avis Google (si intégration faite)
- [ ] Créer des composants de cartes pour chaque KPI
- [ ] Ajouter des graphiques simples (optionnel)
- [ ] Implémenter les requêtes Firestore pour récupérer les données en temps réel

**Référence** : Section 7.1 des spécifications

---

#### **Tâche 1.3 : Gestion du Calendrier Global**
**Objectif** : Interface centrale pour visualiser et gérer tous les rendez-vous

**Actions** :
- [ ] Créer `/src/app/admin/calendrier/page.tsx`
- [ ] Implémenter le calendrier avec vues multiples :
  - [ ] Vue par jour
  - [ ] Vue par semaine
  - [ ] Vue par mois
- [ ] Afficher tous les rendez-vous de tous les clients
- [ ] Implémenter un code couleur par type de service :
  - [ ] Entretien : couleur 1
  - [ ] Réparation : couleur 2
  - [ ] Reprogrammation : couleur 3
- [ ] Synchronisation en temps réel via Firestore onSnapshot
- [ ] Fonctionnalités de gestion :
  - [ ] Créer un rendez-vous manuellement (modal)
  - [ ] Modifier un rendez-vous existant (modal)
  - [ ] Supprimer un rendez-vous (avec confirmation)
  - [ ] Aucune restriction de temps (bypass de la règle 24h)
- [ ] Afficher les détails du client au clic sur un rendez-vous

**Référence** : Section 7.2 des spécifications

**Composants à créer** :
- `CalendarView.tsx` - Composant calendrier principal
- `AppointmentModal.tsx` - Modal de création/édition
- `AppointmentCard.tsx` - Carte d'affichage de rendez-vous

---

#### **Tâche 1.4 : Gestion des Utilisateurs (CRUD)**
**Objectif** : Interface complète pour gérer tous les comptes utilisateurs

**Actions** :
- [ ] Créer `/src/app/admin/utilisateurs/page.tsx`
- [ ] Afficher la liste de tous les utilisateurs dans un tableau
- [ ] Colonnes du tableau :
  - [ ] Nom complet
  - [ ] Email
  - [ ] Rôle (avec badge coloré)
  - [ ] Date de création
  - [ ] Actions (éditer, supprimer)
- [ ] Implémenter la recherche/filtrage :
  - [ ] Recherche par nom ou email
  - [ ] Filtre par rôle
- [ ] Fonctionnalités CRUD :
  - [ ] **Créer** : Modal ou page pour créer un utilisateur manuellement
  - [ ] **Lire** : Clic pour voir les détails complets
  - [ ] **Mettre à jour** : 
    - [ ] Modifier informations personnelles
    - [ ] Changer le rôle (select avec user/agendaManager/admin)
  - [ ] **Supprimer** : Avec confirmation et suppression en cascade des rendez-vous
- [ ] Pagination pour gérer de nombreux utilisateurs
- [ ] Créer `/src/lib/firestore/users.ts` avec les fonctions :
  - [ ] `getAllUsers()`
  - [ ] `createUser(data)`
  - [ ] `updateUser(uid, data)`
  - [ ] `updateUserRole(uid, newRole)`
  - [ ] `deleteUser(uid)`

**Référence** : Section 7.3 des spécifications et matrice 4.3

**Composants à créer** :
- `UsersTable.tsx` - Tableau des utilisateurs
- `UserModal.tsx` - Modal de création/édition
- `UserDetailsModal.tsx` - Détails complets
- `DeleteUserConfirmation.tsx` - Modal de confirmation

---

#### **Tâche 1.5 : Gestion des Véhicules d'Occasion (CRUD)**
**Objectif** : Interface pour gérer le catalogue de véhicules à vendre

**Actions** :
- [ ] Créer `/src/app/admin/vehicules/page.tsx`
- [ ] Afficher la liste de tous les véhicules
- [ ] Créer `/src/lib/firestore/vehicles.ts` avec les fonctions :
  - [ ] `getAllVehicles()`
  - [ ] `getAvailableVehicles()` (isSold = false)
  - [ ] `getVehicleById(id)`
  - [ ] `createVehicle(data)`
  - [ ] `updateVehicle(id, data)`
  - [ ] `deleteVehicle(id)`
  - [ ] `markVehicleAsSold(id)`
- [ ] Fonctionnalités CRUD :
  - [ ] **Créer** : 
    - [ ] Formulaire complet avec tous les champs
    - [ ] Upload multi-images vers Cloud Storage
    - [ ] Affichage preview des images uploadées
  - [ ] **Lire** : Grille de véhicules avec cartes
  - [ ] **Mettre à jour** :
    - [ ] Éditer toutes les informations
    - [ ] Ajouter/supprimer des photos
    - [ ] Marquer comme vendu (toggle isSold)
  - [ ] **Supprimer** : Suppression complète (avec images dans Storage)
- [ ] Créer `/src/lib/storage/vehicles.ts` pour gérer les images :
  - [ ] `uploadVehicleImages(files)`
  - [ ] `deleteVehicleImage(url)`
  - [ ] `deleteAllVehicleImages(vehicleId)`

**Référence** : Section 7.4 des spécifications, Collection 8.2.3

**Composants à créer** :
- `VehicleGrid.tsx` - Grille d'affichage
- `VehicleForm.tsx` - Formulaire de création/édition
- `ImageUploader.tsx` - Composant d'upload multi-images
- `VehicleCard.tsx` - Carte de véhicule (réutilisable)

**Structure de données** (vehicles collection) :
```typescript
{
  vehicleId: string,
  make: string,
  model: string,
  year: number,
  price: number,
  mileage: number,
  fuelType: string,
  description: string,
  imageUrls: string[],
  isSold: boolean,
  createdAt: Timestamp
}
```

---

### **PRIORITÉ 2 : CATALOGUE PUBLIC DE VÉHICULES**

#### **Tâche 2.1 : Page de Listing des Véhicules**
**Objectif** : Afficher le catalogue public des véhicules disponibles

**Actions** :
- [ ] Compléter `/src/app/vehicules/page.tsx`
- [ ] Récupérer les véhicules disponibles (isSold = false)
- [ ] Afficher en grille responsive
- [ ] Implémenter les filtres :
  - [ ] Par marque (select dynamique)
  - [ ] Par fourchette de prix (slider ou inputs)
  - [ ] Par année (slider ou select)
  - [ ] Par type de carburant
- [ ] Ajouter une barre de recherche (recherche dans marque/modèle)
- [ ] Tri :
  - [ ] Plus récent
  - [ ] Prix croissant/décroissant
  - [ ] Kilométrage croissant/décroissant
- [ ] Toggle vue grille/liste
- [ ] Chaque carte de véhicule affiche :
  - [ ] Photo principale
  - [ ] Marque et modèle
  - [ ] Année
  - [ ] Prix en gros
  - [ ] Kilométrage
  - [ ] Badge "Nouveau" si récent (< 30 jours)

**Référence** : Section 5.3 des spécifications

---

#### **Tâche 2.2 : Page de Détail d'un Véhicule**
**Objectif** : Afficher toutes les informations d'un véhicule spécifique

**Actions** :
- [ ] Créer `/src/app/vehicules/[id]/page.tsx`
- [ ] Galerie de photos :
  - [ ] Image principale grande
  - [ ] Miniatures cliquables en dessous
  - [ ] Lightbox pour voir en plein écran (optionnel)
- [ ] Afficher toutes les informations :
  - [ ] Marque, modèle, année
  - [ ] Prix bien visible
  - [ ] Description complète
  - [ ] Fiche technique :
    - [ ] Kilométrage
    - [ ] Type de carburant
    - [ ] Puissance
    - [ ] Transmission
    - [ ] Etc.
- [ ] Formulaire de contact :
  - [ ] Nom
  - [ ] Email
  - [ ] Téléphone
  - [ ] Message
  - [ ] Envoi par email ou stockage dans Firestore
- [ ] Bouton de partage (optionnel)
- [ ] Véhicules similaires en bas de page (optionnel)

**Référence** : Section 5.3 des spécifications

**Composants à créer** :
- `VehicleGallery.tsx` - Galerie d'images
- `VehicleSpecs.tsx` - Fiche technique
- `ContactForm.tsx` - Formulaire de contact

---

### **PRIORITÉ 3 : INTÉGRATION GOOGLE REVIEWS**

Cette fonctionnalité est complexe et nécessite une configuration OAuth.

#### **Tâche 3.1 : Configuration OAuth Google Business Profile**
**Objectif** : Permettre l'accès sécurisé à l'API Google Business Profile

**Actions** :
- [ ] Créer un projet dans Google Cloud Console
- [ ] Activer l'API Google Business Profile
- [ ] Configurer l'écran de consentement OAuth
- [ ] Créer des credentials OAuth 2.0
- [ ] Ajouter les URLs de redirection autorisées
- [ ] Créer une Cloud Function pour le flux OAuth :
  - [ ] `functions/src/googleAuth/initiateAuth.ts`
  - [ ] `functions/src/googleAuth/handleCallback.ts`
  - [ ] `functions/src/googleAuth/refreshToken.ts`
- [ ] Stocker les tokens de manière sécurisée dans Firestore ou Secret Manager
- [ ] Créer une interface de configuration unique pour l'admin :
  - [ ] `/src/app/admin/configuration/google/page.tsx`
  - [ ] Bouton "Connecter Google Business Profile"
  - [ ] Affichage du statut de connexion
  - [ ] Bouton de déconnexion

**Référence** : Section 7.5 des spécifications

---

#### **Tâche 3.2 : Cloud Function - Récupération des Avis**
**Objectif** : Fonction serveur pour récupérer les avis Google

**Actions** :
- [ ] Créer `functions/src/reviews/getReviews.ts`
- [ ] Implémenter l'appel à l'API Google Business Profile
- [ ] Parser les données reçues
- [ ] Gérer les erreurs et les limites de taux
- [ ] Retourner les avis formatés
- [ ] Implémenter la pagination si nécessaire
- [ ] Ajouter du logging pour le débogage

**Référence** : Section 7.5 des spécifications

---

#### **Tâche 3.3 : Interface de Gestion des Avis**
**Objectif** : Afficher et répondre aux avis Google depuis le panneau admin

**Actions** :
- [ ] Créer `/src/app/admin/avis/page.tsx`
- [ ] Afficher la liste des avis récents :
  - [ ] Nom du client
  - [ ] Note en étoiles (5 étoiles)
  - [ ] Commentaire
  - [ ] Date
  - [ ] Statut : répondu ou non
- [ ] Pour chaque avis sans réponse :
  - [ ] Zone de texte pour rédiger une réponse
  - [ ] Bouton "Utiliser un modèle"
  - [ ] Bouton "Envoyer la réponse"
- [ ] Filtres :
  - [ ] Tous les avis
  - [ ] Avis sans réponse
  - [ ] Par note (5 étoiles, 4 étoiles, etc.)
- [ ] Rafraîchissement automatique ou bouton de rafraîchissement

**Référence** : Section 7.5 des spécifications

---

#### **Tâche 3.4 : Système de Modèles de Réponse**
**Objectif** : Gagner du temps en utilisant des réponses pré-enregistrées

**Actions** :
- [ ] Créer une collection Firestore `reviewTemplates`
- [ ] Structure :
  ```typescript
  {
    templateId: string,
    name: string,
    content: string,
    category: 'positive' | 'negative' | 'neutral',
    createdAt: Timestamp
  }
  ```
- [ ] Créer `/src/app/admin/avis/modeles/page.tsx`
- [ ] Liste des modèles existants
- [ ] CRUD pour les modèles :
  - [ ] Créer un nouveau modèle
  - [ ] Modifier un modèle
  - [ ] Supprimer un modèle
- [ ] Dans l'interface de réponse aux avis :
  - [ ] Modal de sélection de modèle
  - [ ] Insertion du modèle dans la zone de texte
  - [ ] Possibilité de personnaliser après insertion
- [ ] Créer `/src/lib/firestore/reviewTemplates.ts`

**Référence** : Section 7.5 des spécifications

**Exemples de modèles** :
- Positif : "Merci beaucoup pour votre commentaire positif..."
- Négatif : "Nous sommes sincèrement désolés..."
- Neutre : "Merci d'avoir pris le temps de nous laisser un avis..."

---

#### **Tâche 3.5 : Cloud Function - Poster une Réponse**
**Objectif** : Fonction serveur pour envoyer une réponse à un avis Google

**Actions** :
- [ ] Créer `functions/src/reviews/postReply.ts`
- [ ] Recevoir les paramètres (reviewId, replyText)
- [ ] Valider les données
- [ ] Appeler l'API Google Business Profile pour poster la réponse
- [ ] Gérer les erreurs :
  - [ ] Token expiré -> rafraîchir automatiquement
  - [ ] Limites de taux atteintes -> message d'erreur clair
  - [ ] API indisponible -> retry logic
- [ ] Retourner le statut de succès/échec
- [ ] Logger l'opération

**Référence** : Section 7.5 des spécifications

---

### **PRIORITÉ 4 : SÉCURITÉ ET RÈGLES FIRESTORE**

#### **Tâche 4.1 : Règles de Sécurité Firestore**
**Objectif** : Protéger les données et implémenter les permissions RBAC

**Actions** :
- [ ] Créer `firestore.rules` à la racine du projet
- [ ] Implémenter les règles pour la collection `users` :
  - [ ] Lecture : Chaque utilisateur peut lire son propre document, admin peut tout lire
  - [ ] Écriture : Admin seulement pour créer/modifier/supprimer
  - [ ] Utilisateur peut modifier son propre profil (sauf le rôle)
- [ ] Règles pour la collection `appointments` :
  - [ ] Création : Utilisateur authentifié uniquement
  - [ ] Lecture : Utilisateur peut lire ses propres RDV, admin/agendaManager peuvent tout lire
  - [ ] Modification : 
    - [ ] Utilisateur peut modifier/annuler ses RDV si > 24h
    - [ ] Admin/agendaManager peuvent modifier/supprimer sans restriction
  - [ ] Validation : Vérifier que le créneau n'est pas déjà pris
- [ ] Règles pour la collection `vehicles` :
  - [ ] Lecture : Tout le monde (même non authentifié) si isSold = false
  - [ ] Écriture : Admin seulement
- [ ] Règles pour la collection `reviewTemplates` :
  - [ ] Lecture : Admin seulement
  - [ ] Écriture : Admin seulement
- [ ] Déployer les règles :
  ```bash
  firebase deploy --only firestore:rules
  ```

**Référence** : Section 2.2 (Sécurité) et matrice 4.3 des spécifications

**Exemple de règle** :
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Fonction helper pour vérifier le rôle
    function hasRole(role) {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    function isAdmin() {
      return hasRole('admin');
    }
    
    // Règles pour users
    match /users/{userId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == userId || isAdmin());
      allow create: if isAdmin();
      allow update: if isAdmin() || 
                       (request.auth.uid == userId && 
                        request.resource.data.role == resource.data.role); // Ne peut pas changer son propre rôle
      allow delete: if isAdmin();
    }
    
    // Etc.
  }
}
```

---

#### **Tâche 4.2 : Règles de Sécurité Storage**
**Objectif** : Protéger les fichiers uploadés dans Cloud Storage

**Actions** :
- [ ] Créer `storage.rules` à la racine du projet
- [ ] Règles pour les images de véhicules :
  - [ ] Lecture : Public (tout le monde)
  - [ ] Écriture : Admin seulement
  - [ ] Taille maximale : 5 MB par image
  - [ ] Types autorisés : image/jpeg, image/png, image/webp
- [ ] Déployer les règles :
  ```bash
  firebase deploy --only storage
  ```

**Référence** : Section 2.2 des spécifications

**Exemple de règle** :
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /vehicles/{vehicleId}/{imageId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.auth.token.role == 'admin' &&
                      request.resource.size < 5 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

### **PRIORITÉ 5 : CLOUD FUNCTIONS**

#### **Tâche 5.1 : Configuration du Projet Cloud Functions**
**Objectif** : Préparer l'environnement pour les Cloud Functions

**Actions** :
- [ ] Initialiser Firebase Functions :
  ```bash
  firebase init functions
  ```
- [ ] Choisir TypeScript
- [ ] Configurer ESLint
- [ ] Installer les dépendances :
  ```bash
  cd functions
  npm install
  ```
- [ ] Configurer les variables d'environnement dans Firebase :
  ```bash
  firebase functions:config:set google.api_key="XXX"
  ```

---

#### **Tâche 5.2 : Cloud Function - Email de Confirmation de Rendez-vous**
**Objectif** : Envoyer automatiquement un email quand un RDV est créé

**Actions** :
- [ ] Créer `functions/src/appointments/onAppointmentCreate.ts`
- [ ] Trigger Firestore : `onCreate` sur la collection `appointments`
- [ ] Configurer un service d'envoi d'email :
  - [ ] Option 1 : SendGrid
  - [ ] Option 2 : Nodemailer avec Gmail
  - [ ] Option 3 : Firebase Extensions (Trigger Email)
- [ ] Template d'email HTML :
  - [ ] Logo du garage
  - [ ] Récapitulatif du rendez-vous
  - [ ] Informations de contact
  - [ ] Politique d'annulation (24h)
- [ ] Envoyer l'email au client
- [ ] Logger les succès/échecs
- [ ] Gérer les erreurs (retry)

**Référence** : Section 6.1 des spécifications

---

#### **Tâche 5.3 : Cloud Function - Validation Règle des 24 Heures**
**Objectif** : Valider côté serveur que la règle des 24h est respectée

**Actions** :
- [ ] Créer `functions/src/appointments/validateModification.ts`
- [ ] Trigger : `onUpdate` ou `onDelete` sur `appointments`
- [ ] Vérifier la différence entre l'heure actuelle et l'heure du RDV
- [ ] Si < 24h ET utilisateur = 'user' (pas admin/agendaManager) :
  - [ ] Annuler la modification
  - [ ] Retourner une erreur
- [ ] Sinon : Permettre la modification
- [ ] Alternative : Implémenter comme fonction callable depuis le client

**Référence** : Section 6.3 des spécifications

**Note** : Cette logique est déjà partiellement dans les règles Firestore, mais une Cloud Function peut ajouter une couche de validation supplémentaire.

---

#### **Tâche 5.4 : Cloud Function - Notifications**
**Objectif** : Système de notifications pour l'admin et les clients (optionnel)

**Actions** :
- [ ] Cloud Function pour notification à l'admin quand un nouveau RDV est créé
- [ ] Cloud Function pour rappel de RDV (24h avant)
- [ ] Utiliser Firebase Cloud Messaging (FCM) ou email
- [ ] Optionnel : Notifications push sur navigateur

---

### **PRIORITÉ 6 : OPTIMISATIONS ET TESTS**

#### **Tâche 6.1 : Performance et Core Web Vitals**
**Objectif** : Atteindre les métriques de performance spécifiées

**Actions** :
- [ ] Audit Lighthouse sur toutes les pages principales
- [ ] Optimiser les images :
  - [ ] Utiliser Next.js Image component
  - [ ] Formats modernes (WebP)
  - [ ] Lazy loading
- [ ] Optimiser le LCP (Largest Contentful Paint < 2.5s) :
  - [ ] Précharger les ressources critiques
  - [ ] Optimiser le CSS critique
  - [ ] CDN Firebase Hosting déjà en place
- [ ] Optimiser le FID (First Input Delay < 100ms) :
  - [ ] Code splitting
  - [ ] Defer non-critical JS
- [ ] Ajouter un service worker pour le caching (optionnel)
- [ ] Mesurer avec des outils :
  - [ ] Google PageSpeed Insights
  - [ ] WebPageTest
  - [ ] Chrome DevTools

**Référence** : Section 2.2 (Performance) des spécifications

---

#### **Tâche 6.2 : Accessibilité WCAG 2.1 AA**
**Objectif** : Rendre l'application accessible à tous

**Actions** :
- [ ] Audit avec outils automatisés :
  - [ ] WAVE
  - [ ] axe DevTools
  - [ ] Lighthouse Accessibility
- [ ] Vérifier les contrastes de couleurs :
  - [ ] Thème clair : ratio minimum 4.5:1
  - [ ] Thème sombre : ratio minimum 4.5:1
  - [ ] Utiliser un outil comme Contrast Checker
- [ ] Navigation au clavier :
  - [ ] Tous les éléments interactifs accessibles au Tab
  - [ ] Focus visible
  - [ ] Ordre de tabulation logique
- [ ] Sémantique HTML :
  - [ ] Utiliser les balises appropriées (header, nav, main, article, etc.)
  - [ ] Titres hiérarchiques (h1, h2, h3...)
- [ ] ARIA :
  - [ ] Labels pour les éléments de formulaire
  - [ ] aria-label pour les icônes
  - [ ] aria-live pour les notifications
  - [ ] aria-expanded pour les menus
- [ ] Images :
  - [ ] Alt text descriptif
  - [ ] Texte alt vide pour images décoratives
- [ ] Formulaires :
  - [ ] Labels associés
  - [ ] Messages d'erreur clairs
  - [ ] Instructions visibles

**Référence** : Section 2.2 (Accessibilité) des spécifications

---

#### **Tâche 6.3 : Tests Utilisateurs**
**Objectif** : Valider l'expérience utilisateur avec de vrais utilisateurs

**Actions** :
- [ ] Scénarios de test à préparer :
  - [ ] Prise de rendez-vous complète (utilisateur lambda)
  - [ ] Annulation de rendez-vous
  - [ ] Navigation dans le catalogue de véhicules
  - [ ] Contact via formulaire
- [ ] Tester sur différents appareils :
  - [ ] Desktop (Windows, Mac)
  - [ ] Mobile (iOS, Android)
  - [ ] Tablette
- [ ] Tester sur différents navigateurs :
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Collecter les retours :
  - [ ] Points de friction
  - [ ] Bugs UI
  - [ ] Suggestions d'amélioration
- [ ] Itérer sur les retours

**Référence** : Section 2.2 des spécifications

---

#### **Tâche 6.4 : Tests Automatisés (Optionnel mais Recommandé)**
**Objectif** : Assurer la qualité du code

**Actions** :
- [ ] Installer Jest et React Testing Library
- [ ] Tests unitaires :
  - [ ] Composants UI
  - [ ] Fonctions utilitaires
  - [ ] Hooks personnalisés
- [ ] Tests d'intégration :
  - [ ] Flux d'authentification
  - [ ] Prise de rendez-vous
  - [ ] CRUD véhicules
- [ ] Tests E2E avec Playwright ou Cypress :
  - [ ] Parcours utilisateur complet
  - [ ] Parcours admin complet

---

### **PRIORITÉ 7 : DOCUMENTATION ET DÉPLOIEMENT**

#### **Tâche 7.1 : Documentation Technique**
**Objectif** : Documenter le code et l'architecture pour faciliter la maintenance

**Actions** :
- [ ] README.md complet (déjà fait, mais à mettre à jour)
- [ ] Documentation des Cloud Functions
- [ ] Documentation des règles de sécurité
- [ ] Diagrammes d'architecture (optionnel) :
  - [ ] Schéma de l'architecture Firebase
  - [ ] Flux de données
  - [ ] Flux utilisateur
- [ ] Commentaires dans le code pour les parties complexes
- [ ] Guide de contribution (si projet open source)

---

#### **Tâche 7.2 : Documentation Utilisateur**
**Objectif** : Créer des guides pour les utilisateurs finaux

**Actions** :
- [ ] Guide utilisateur client :
  - [ ] Comment créer un compte
  - [ ] Comment prendre un rendez-vous
  - [ ] Comment annuler/reporter
- [ ] Guide administrateur :
  - [ ] Accès au panneau d'administration
  - [ ] Gestion du calendrier
  - [ ] Gestion des utilisateurs
  - [ ] Gestion des véhicules
  - [ ] Réponse aux avis Google
- [ ] FAQ
- [ ] Tutoriels vidéo (optionnel)

---

#### **Tâche 7.3 : Déploiement Initial**
**Objectif** : Mettre l'application en production

**Actions** :
- [ ] Configuration du projet Firebase en production
- [ ] Variables d'environnement de production
- [ ] Build optimisé :
  ```bash
  npm run build
  ```
- [ ] Déploiement Firebase Hosting :
  ```bash
  firebase deploy --only hosting
  ```
- [ ] Déploiement des Cloud Functions :
  ```bash
  firebase deploy --only functions
  ```
- [ ] Déploiement des règles Firestore et Storage :
  ```bash
  firebase deploy --only firestore:rules,storage
  ```
- [ ] Configuration du domaine personnalisé (si applicable)
- [ ] Configuration SSL (automatique avec Firebase Hosting)

---

#### **Tâche 7.4 : Monitoring et Maintenance**
**Objectif** : Surveiller l'application en production

**Actions** :
- [ ] Configurer Firebase Analytics
- [ ] Configurer Firebase Crashlytics (pour les erreurs)
- [ ] Configurer Firebase Performance Monitoring
- [ ] Mettre en place des alertes :
  - [ ] Erreurs critiques
  - [ ] Pics de trafic
  - [ ] Échecs des Cloud Functions
- [ ] Plan de sauvegarde des données Firestore
- [ ] Plan de mise à jour :
  - [ ] Dépendances npm
  - [ ] Sécurité
  - [ ] Nouvelles fonctionnalités

---

### **PRIORITÉ 8 : FONCTIONNALITÉS OPTIONNELLES (NICE TO HAVE)**

#### **Tâche 8.1 : Intégration Google Maps Avancée**
**Actions** :
- [ ] Calculateur d'itinéraire sur la page contact
- [ ] Vue Street View du garage
- [ ] Géolocalisation de l'utilisateur

---

#### **Tâche 8.2 : Système de Chat en Direct**
**Actions** :
- [ ] Intégrer un widget de chat (Intercom, Crisp, ou custom)
- [ ] Chat en temps réel avec Firebase Realtime Database
- [ ] Notifications pour l'admin

---

#### **Tâche 8.3 : Espace Blog/Actualités**
**Actions** :
- [ ] Section blog pour publier des articles
- [ ] Catégories : Conseils, Actualités, Promotions
- [ ] CMS simple pour l'admin

---

#### **Tâche 8.4 : Système de Devis en Ligne**
**Actions** :
- [ ] Formulaire de demande de devis
- [ ] Stockage dans Firestore
- [ ] Interface admin pour gérer les demandes

---

#### **Tâche 8.5 : Programme de Fidélité**
**Actions** :
- [ ] Système de points
- [ ] Récompenses
- [ ] Suivi dans le profil client

---

#### **Tâche 8.6 : Notifications Push**
**Actions** :
- [ ] Firebase Cloud Messaging
- [ ] Notifications pour rappels de RDV
- [ ] Notifications pour nouveaux véhicules

---

#### **Tâche 8.7 : Mode Hors Ligne (PWA)**
**Actions** :
- [ ] Service Worker
- [ ] Manifest.json
- [ ] Cache API
- [ ] Installation sur mobile

---

## 📊 RÉSUMÉ PAR PHASE

| Phase | Nombre de Tâches | Priorité | Estimation |
|-------|-----------------|----------|------------|
| **Phase 6 - Admin Dashboard** | 5 tâches majeures | 🔴 CRITIQUE | 2-3 semaines |
| **Phase 7 - Catalogue Véhicules Public** | 2 tâches | 🟠 HAUTE | 1 semaine |
| **Phase 8 - Google Reviews** | 5 tâches | 🟡 MOYENNE | 2 semaines |
| **Phase 9 - Sécurité Firestore** | 2 tâches | 🔴 CRITIQUE | 3-5 jours |
| **Phase 10 - Cloud Functions** | 4 tâches | 🟡 MOYENNE | 1-2 semaines |
| **Phase 11 - Optimisations** | 4 tâches | 🟢 NORMALE | 1 semaine |
| **Phase 12 - Documentation & Déploiement** | 4 tâches | 🟠 HAUTE | 1 semaine |
| **Phase 13 - Optionnel** | 7 tâches | ⚪ BASSE | Variable |

**Estimation totale pour les fonctionnalités critiques** : 8-12 semaines

---

## 🎯 ROADMAP RECOMMANDÉE

### Sprint 1 (Semaine 1-2) : Administration - Base
- ✅ Tâche 1.1 : Structure Admin
- ✅ Tâche 1.2 : Dashboard Administratif
- ✅ Tâche 1.3 : Calendrier Global

### Sprint 2 (Semaine 3-4) : Administration - Gestion
- ✅ Tâche 1.4 : Gestion des Utilisateurs
- ✅ Tâche 1.5 : Gestion des Véhicules (partie admin)

### Sprint 3 (Semaine 5) : Catalogue Public
- ✅ Tâche 2.1 : Page Listing Véhicules
- ✅ Tâche 2.2 : Page Détail Véhicule

### Sprint 4 (Semaine 6-7) : Sécurité
- ✅ Tâche 4.1 : Règles Firestore
- ✅ Tâche 4.2 : Règles Storage
- ✅ Tests de sécurité

### Sprint 5 (Semaine 8-9) : Cloud Functions
- ✅ Tâche 5.1 : Configuration
- ✅ Tâche 5.2 : Email de confirmation
- ✅ Tâche 5.3 : Validation 24h

### Sprint 6 (Semaine 10-11) : Google Reviews
- ✅ Tâche 3.1 : OAuth Configuration
- ✅ Tâche 3.2 : Récupération des avis
- ✅ Tâche 3.3 : Interface de gestion
- ✅ Tâche 3.4 : Modèles de réponse
- ✅ Tâche 3.5 : Poster une réponse

### Sprint 7 (Semaine 12) : Optimisations et Tests
- ✅ Tâche 6.1 : Performance
- ✅ Tâche 6.2 : Accessibilité
- ✅ Tâche 6.3 : Tests utilisateurs

### Sprint 8 (Semaine 13) : Documentation et Déploiement
- ✅ Tâche 7.1 : Documentation technique
- ✅ Tâche 7.2 : Documentation utilisateur
- ✅ Tâche 7.3 : Déploiement
- ✅ Tâche 7.4 : Monitoring

---

## 📝 NOTES IMPORTANTES

### Points d'Attention

1. **Sécurité** : Les règles Firestore sont critiques et doivent être testées rigoureusement avant le déploiement en production.

2. **Google Reviews** : L'intégration avec l'API Google Business Profile peut être complexe. Prévoir du temps pour la configuration OAuth et le debugging.

3. **Cloud Functions** : Attention aux coûts. Les Cloud Functions sont facturées à l'usage. Optimiser pour réduire les invocations inutiles.

4. **Performances** : Les images de véhicules peuvent être lourdes. Utiliser l'optimisation d'images (compression, formats modernes).

5. **RGPD** : Si l'application collecte des données personnelles, s'assurer de la conformité RGPD :
   - Mentions légales
   - Politique de confidentialité
   - Consentement cookies
   - Droit à l'oubli

### Technologies Complémentaires Suggérées

- **SendGrid** ou **Mailgun** : Pour l'envoi d'emails transactionnels
- **Algolia** : Pour une recherche avancée dans le catalogue de véhicules (optionnel)
- **Sentry** : Pour le monitoring des erreurs en production
- **Google Analytics 4** : Pour l'analyse du trafic

### Prochaines Étapes Immédiates

1. **Prioriser** : Décider avec le client quelles fonctionnalités sont absolument nécessaires pour la V1
2. **Planifier** : Créer un planning détaillé avec des jalons
3. **Commencer par l'admin** : C'est le bloquant principal pour que le garage puisse utiliser l'application
4. **Itérer** : Déployer progressivement et collecter les retours

---

## ✅ CHECKLIST DE LANCEMENT

Avant de mettre en production :

- [ ] Toutes les fonctionnalités critiques sont implémentées et testées
- [ ] Les règles de sécurité Firestore et Storage sont déployées
- [ ] Les Cloud Functions sont déployées et testées
- [ ] L'application passe les audits Lighthouse (Performance, Accessibilité, Best Practices, SEO)
- [ ] Tests sur tous les navigateurs principaux
- [ ] Tests sur mobile et tablette
- [ ] Documentation complète (technique et utilisateur)
- [ ] Variables d'environnement de production configurées
- [ ] Domaine personnalisé configuré (si applicable)
- [ ] Monitoring et analytics en place
- [ ] Sauvegardes configurées
- [ ] Plan de maintenance défini
- [ ] Conformité RGPD vérifiée
- [ ] Mentions légales et politique de confidentialité en place

---

**Document créé le** : 3 novembre 2024  
**Basé sur** : specifications.md et analyse du code existant  
**Version** : 1.0
