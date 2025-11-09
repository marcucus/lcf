# LCF Auto Performance

Application web professionnelle pour le garage LCF Auto Performance, incluant système de gestion de rendez-vous, authentification sécurisée et interface d'administration.

## 📚 Documentation Projet

- 📋 **[ANALYSE.md](./ANALYSE.md)** - Vue d'ensemble et résumé exécutif
- ✅ **[TASKS.md](./TASKS.md)** - Liste complète des tâches à effectuer
- 📖 **[PROJET.md](./PROJET.md)** - Documentation technique détaillée
- 📝 **[specifications.md](./specifications.md)** - Cahier des charges complet

## 🎯 Fonctionnalités principales

- ✅ **Authentification complète** - Email/password et Google OAuth
- ✅ **Système de rendez-vous** - Réservation en ligne avec prévention des conflits
- ✅ **Espace client** - Dashboard personnel avec gestion des RDV
- ✅ **Pages services** - Entretien, Réparation, Re-programmation
- ✅ **Thème clair/sombre** - Toggle automatique avec préférences système
- ✅ **Design responsive** - Mobile-first avec Tailwind CSS
- ✅ **Notifications Push FCM** - Rappels de RDV et nouveaux véhicules
- 🔄 **Administration** - Gestion utilisateurs et véhicules (en cours)
- 🔄 **Avis Google** - Intégration API Google Business (planifié)

## 🛠️ Technologies

- **Next.js 16** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling utility-first
- **Firebase** - Authentication, Firestore, Storage, Cloud Messaging
- **Firebase Cloud Functions** - Backend serverless pour notifications
- **React Icons** - Feather Icons

## 🚀 Installation

```bash
# Installation
npm install

# Configuration
cp .env.local.example .env.local
# Éditer .env.local avec vos credentials Firebase

# Développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📦 Build

```bash
# Build pour production
npm run build

# Démarrer en production
npm start
```

## 📋 Structure

```
src/
├── app/                 # Pages Next.js
│   ├── dashboard/      # Espace client
│   ├── rendez-vous/    # Système de réservation
│   ├── services/       # Pages de services
│   └── login/          # Authentification
├── components/         # Composants réutilisables
│   ├── ui/            # Boutons, inputs, cards...
│   ├── layout/        # Header, Footer
│   ├── auth/          # Routes protégées
│   └── notifications/ # Gestion des notifications
├── lib/               # Utilitaires
│   ├── firebase/      # Configuration Firebase & FCM
│   └── firestore/     # Helpers base de données
└── types/             # Types TypeScript

functions/             # Cloud Functions Firebase
├── src/
│   ├── appointmentReminders.ts  # Rappels de RDV
│   ├── vehicleNotifications.ts  # Alertes nouveaux véhicules
│   └── notifications.ts         # Helpers FCM
```

## 🎨 Design System

- **Couleur d'accent**: #1CCEFF (cyan)
- **Polices**: Inter (corps), Poppins (titres)
- **Thèmes**: Clair & Sombre avec transition fluide
- **Responsive**: Mobile-first design

## 🔐 Sécurité

- Authentification Firebase
- Routes protégées par rôles (User, AgendaManager, Admin)
- Transactions Firestore anti-conflits
- Règles de sécurité Firestore (à finaliser)

## 📝 Configuration Firebase

Créez un projet Firebase et activez:
1. Authentication (Email/Password + Google)
2. Cloud Firestore
3. Cloud Storage
4. Cloud Messaging (FCM)
5. Cloud Functions

### Variables d'environnement requises

Consultez `.env.local.example` pour les variables requises:
- Configuration Firebase standard
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY` - Clé VAPID pour les notifications web

### Configuration des notifications push

1. Dans la console Firebase, allez dans Project Settings > Cloud Messaging
2. Générez une paire de clés Web Push (VAPID)
3. Copiez la clé publique dans `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
4. Mettez à jour `public/firebase-messaging-sw.js` avec votre configuration Firebase

### Déploiement des Cloud Functions

```bash
cd functions
npm install
npm run deploy
```

Voir [functions/README.md](./functions/README.md) pour plus de détails.

## 🔔 Notifications Push

L'application supporte les notifications push via Firebase Cloud Messaging:

### Fonctionnalités
- **Rappels de rendez-vous**: Notification 24h avant le RDV
- **Nouveaux véhicules**: Alerte lors de l'ajout d'un véhicule
- **Préférences utilisateur**: Gestion fine des types de notifications

### Configuration utilisateur
Les utilisateurs peuvent:
1. Activer/désactiver les notifications dans leur dashboard
2. Choisir les types de notifications à recevoir
3. Gérer les autorisations du navigateur

### Cloud Functions
- `sendAppointmentReminders`: Fonction planifiée (toutes les heures)
- `onVehicleCreated`: Trigger Firestore sur création de véhicule
- `onVehicleUpdated`: Trigger Firestore sur mise à jour de véhicule

## 🤝 Contribution

Voir [PROJET.md](./PROJET.md) pour la roadmap complète et les fonctionnalités à implémenter.

## 📄 Licence

© 2024 LCF Auto Performance - Tous droits réservés