# LCF Auto Performance - Application Web

## Vue d'ensemble du projet

Application web Next.js complète pour le garage LCF Auto Performance, incluant un système de gestion de rendez-vous, authentification Firebase, et interface admin.

## Technologies utilisées

### Frontend
- **Next.js 16** - Framework React avec App Router
- **React 19** - Bibliothèque UI
- **TypeScript** - Typage statique pour une meilleure sécurité
- **Tailwind CSS 3** - Framework CSS utility-first
- **next-themes** - Gestion du thème clair/sombre

### Backend & Services
- **Firebase Authentication** - Authentification email/mot de passe et Google OAuth
- **Cloud Firestore** - Base de données NoSQL temps réel
- **Cloud Storage** - Stockage des images de véhicules
- **Cloud Functions** - Logique serveur (à implémenter)

### Bibliothèques additionnelles
- **react-icons** - Icônes Feather Icons
- **date-fns** - Manipulation de dates
- **react-calendar** - Sélecteur de dates

## Fonctionnalités implémentées

### ✅ Phase 1-2: Configuration & Design System
- Configuration Firebase (client et admin)
- Système de couleurs avec accent #1CCEFF
- Polices Inter et Poppins
- Composants UI réutilisables (Button, Input, Card, Select, Textarea)
- Thème clair/sombre avec toggle
- Navigation responsive (Header, Footer)

### ✅ Phase 3: Système d'authentification
- Inscription avec email/password et Google OAuth
- Connexion avec validation
- Réinitialisation de mot de passe
- Gestion des sessions
- Routes protégées
- Contrôle d'accès basé sur les rôles (RBAC)
  - Utilisateur (user)
  - Gestionnaire d'agenda (agendaManager)
  - Administrateur (admin)

### ✅ Phase 4: Pages publiques
- **Page d'accueil** - Hero section, présentation des services
- **Pages services**
  - Vue d'ensemble des services
  - Entretien (détails complets)
  - Réparation (diagnostic, signes d'alerte)
  - Re-programmation ECU (Stage 1 & 2)
- **Page contact** - Carte Google Maps, informations, horaires
- **Page véhicules** - Placeholder pour catalogue (à développer)

### ✅ Phase 5: Portail client
- **Tableau de bord client**
  - Statistiques (RDV à venir, passés)
  - Liste des rendez-vous
  - Gestion des rendez-vous avec règle 24h
  - Annulation de rendez-vous
- **Système de réservation (4 étapes)**
  1. Sélection du service
  2. Choix de la date et heure
  3. Informations du véhicule
  4. Confirmation avec récapitulatif
- **Fonctionnalités Firestore**
  - Transactions pour éviter les doubles réservations
  - Vérification des créneaux disponibles
  - Règle métier des 24 heures
  - Historique complet

## Structure du projet

```
lcf/
├── src/
│   ├── app/                          # Pages Next.js App Router
│   │   ├── (auth)/                  # Pages d'authentification
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset-password/
│   │   ├── dashboard/               # Espace client
│   │   ├── rendez-vous/             # Système de réservation
│   │   ├── services/                # Pages de services
│   │   │   ├── entretien/
│   │   │   ├── reparation/
│   │   │   └── reprogrammation/
│   │   ├── contact/
│   │   ├── vehicules/
│   │   └── unauthorized/
│   ├── components/
│   │   ├── auth/                    # Composants d'authentification
│   │   ├── layout/                  # Header, Footer
│   │   └── ui/                      # Composants UI réutilisables
│   ├── contexts/                    # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/                       # Custom hooks
│   │   └── useRole.ts
│   ├── lib/
│   │   ├── firebase/               # Configuration Firebase
│   │   │   ├── config.ts           # Client
│   │   │   └── admin.ts            # Admin SDK
│   │   └── firestore/              # Helpers Firestore
│   │       └── appointments.ts
│   └── types/                      # Définitions TypeScript
│       └── index.ts
├── public/                         # Fichiers statiques
├── .env.local.example             # Template variables d'environnement
├── tailwind.config.js             # Configuration Tailwind
└── tsconfig.json                  # Configuration TypeScript
```

## Configuration requise

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
```

### Structure Firestore

#### Collection `users`
```typescript
{
  uid: string,
  email: string,
  firstName: string,
  lastName: string,
  role: 'user' | 'agendaManager' | 'admin',
  createdAt: Timestamp
}
```

#### Collection `appointments`
```typescript
{
  appointmentId: string,
  userId: string,
  customerName: string,
  serviceType: 'entretien' | 'reparation' | 'reprogrammation',
  dateTime: Timestamp,
  vehicleInfo: {
    make: string,
    model: string,
    plate: string
  },
  customerNotes: string,
  status: 'confirmed' | 'completed' | 'cancelled',
  createdAt: Timestamp
}
```

## Commandes disponibles

```bash
# Installation des dépendances
npm install

# Développement
npm run dev

# Build production
npm run build

# Démarrer en production
npm start

# Linter
npm run lint
```

## Fonctionnalités à implémenter

### Phase 6: Admin - Gestion des rendez-vous
- Dashboard admin avec KPIs
- Calendrier global (jour/semaine/mois)
- Mises à jour temps réel
- Création manuelle de RDV
- Modification/suppression sans restriction

### Phase 7: Admin - Gestion des utilisateurs
- Liste des utilisateurs
- CRUD complet
- Attribution des rôles
- Recherche et filtres

### Phase 8: Admin - Gestion des véhicules
- CRUD véhicules d'occasion
- Upload multi-images vers Cloud Storage
- Catalogue public avec filtres

### Phase 9: Intégration Google Reviews
- OAuth 2.0 Google Business Profile
- Affichage des avis
- Système de réponses avec modèles
- Cloud Functions proxy

### Phase 10: Sécurité Firestore
- Règles de sécurité granulaires
- Validation des données
- Index pour optimisation

### Phase 11: Cloud Functions
- Email de confirmation RDV
- Validation 24h serveur
- Proxy API Google
- Notifications

### Phase 12: Tests & Optimisation
- Tests utilisateurs
- Core Web Vitals (LCP < 2.5s, FID < 100ms)
- Accessibilité WCAG 2.1 AA
- Responsive design

## Principes de design

### Palette de couleurs
- **Accent principal**: #1CCEFF (bleu cyan)
- **Thème clair**: Blancs et gris clairs
- **Thème sombre**: Gris foncés et noirs

### Typographie
- Titres: Poppins (600)
- Corps: Inter (400)
- Échelle responsive

### Composants
Tous les composants suivent les principes:
- Minimalisme fonctionnel
- Hiérarchie visuelle claire
- Micro-interactions soignées
- Accessibilité WCAG 2.1

## Règles métier importantes

### Rendez-vous
1. **Règle des 24 heures**: Les clients ne peuvent modifier/annuler un RDV que si celui-ci est à plus de 24h
2. **Prévention des conflits**: Transactions Firestore pour éviter les doubles réservations
3. **Créneaux disponibles**: Lun-Ven, 10h-12h et 14h-18h
4. **Durée**: Créneaux de 30 minutes

### Rôles et permissions
- **User**: Gérer ses propres RDV, consulter services/véhicules
- **AgendaManager**: Tous les droits User + gestion complète du calendrier
- **Admin**: Tous les droits + gestion utilisateurs, véhicules, avis Google

## Support et contact

Pour toute question sur le projet, contactez l'équipe de développement.

## Licence

© 2024 LCF Auto Performance - Tous droits réservés
