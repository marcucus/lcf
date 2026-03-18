# 🚗 LCF Auto Performance

> Application web professionnelle pour le garage **LCF Auto Performance** — réservation en ligne, espace client, gestion des devis & factures, programme de fidélité et tableau de bord administrateur complet.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12-orange?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=googlechrome)](https://web.dev/progressive-web-apps/)

---

## Table des matières

1. [Présentation](#présentation)
2. [Fonctionnalités](#fonctionnalités)
3. [Stack technique](#stack-technique)
4. [Architecture du projet](#architecture-du-projet)
5. [Démarrage rapide](#démarrage-rapide)
6. [Configuration des environnements](#configuration-des-environnements)
7. [Scripts disponibles](#scripts-disponibles)
8. [Déploiement](#déploiement)
9. [Sécurité et rôles](#sécurité-et-rôles)
10. [Documentation](#documentation)
11. [Licence](#licence)

---

## Présentation

**LCF Auto Performance** est une application web full-stack destinée à digitaliser et automatiser la gestion opérationnelle d'un garage automobile. Elle offre à la fois :

- un **portail client** pour réserver des rendez-vous, suivre les devis et factures, et gérer ses véhicules ;
- un **tableau de bord administrateur** pour piloter l'agenda, les utilisateurs, les finances et la réputation en ligne.

L'application est conçue comme une **Progressive Web App (PWA)** installable sur mobile et bureau, avec support hors-ligne.

---

## Fonctionnalités

### 🔐 Authentification & Autorisation
- Inscription et connexion par e-mail / mot de passe
- Connexion via Google OAuth 2.0
- Réinitialisation de mot de passe par lien e-mail
- Persistance de session Firebase
- Contrôle d'accès basé sur les rôles (RBAC) : `user`, `agendaManager`, `admin`

### 📅 Prise de rendez-vous en ligne
- Assistant de réservation en 4 étapes (service → date/heure → véhicule → confirmation)
- Calendrier interactif avec vérification de disponibilité en temps réel
- Prévention des doubles réservations par transactions Firestore
- Règle métier des 24 heures : annulation uniquement 24 h avant le RDV
- Rappels automatiques par notification push (FCM) et e-mail

### 💰 Gestion financière
- **Devis (DEV-YYYY-NNN)** : création, envoi par e-mail, lien d'acceptation sécurisé par token, conversion en bon de travail
- **Factures (FACT-YYYY-NNN)** : numérotation séquentielle annuelle, calcul TVA, suivi des paiements, envoi par e-mail
- **Bons de travail** : créés automatiquement à l'acceptation d'un devis, suivi d'avancement (en attente → en cours → terminé)
- **Export fiscal** : CSV (logiciel comptable) et PDF (déclaration auto-entrepreneur) avec filtrage par période

### 🎁 Programme de fidélité
- Attribution de points à chaque rendez-vous complété
- Catalogue de récompenses configurable (remises, services, produits)
- Interface de réclamation et de suivi pour le client
- Tableau de bord de gestion pour l'administrateur

### 🔔 Notifications
- **Push (FCM)** : rappels de RDV 24 h avant, alertes nouveaux véhicules
- **E-mail (Resend)** : bienvenue, confirmation RDV, factures, devis, réinitialisation mot de passe
- Préférences utilisateur granulaires (activation/désactivation par type)

### 👨‍💼 Tableau de bord administrateur
- **Utilisateurs** : CRUD complet, assignation de rôles
- **Calendrier global** : vue jour/semaine/mois de tous les RDV, gestion manuelle sans restriction
- **Véhicules d'occasion** : catalogue CRUD avec galerie d'images (Cloud Storage)
- **Devis & Factures** : gestion complète avec changement de statut
- **Bons de travail** : suivi de l'avancement et liaison aux factures
- **Chiffre d'affaires** : KPIs financiers (CA total, taux de paiement, factures en attente)
- **Déclaration fiscale** : export comptable par période
- **Avis Google** : lecture des avis Google Business Profile, réponse avec modèles pré-enregistrés (OAuth 2.0)
- **Programme de fidélité** : configuration des points et du catalogue de récompenses

### 📱 Progressive Web App (PWA)
- Installable sur iOS, Android et bureau
- Support hors-ligne avec Service Worker
- Stratégies de cache avancées (Cache First, Stale-While-Revalidate, Network First)
- Synchronisation en arrière-plan

### 🌐 Portail client
- Tableau de bord avec statistiques personnelles
- Historique des RDV avec possibilité d'annulation (règle 24 h)
- Gestion des véhicules personnels
- Suivi des devis et factures
- Suivi des bons de travail
- Points de fidélité et catalogue récompenses

---

## Stack technique

### Frontend

| Technologie | Version | Rôle |
|---|---|---|
| **Next.js** | 16.0.7 | Framework React, App Router, SSR/SSG |
| **React** | 19.2.0 | Bibliothèque UI |
| **TypeScript** | 5.9.3 | Typage statique strict |
| **Tailwind CSS** | 3.4.18 | Styles utility-first |
| **next-themes** | 0.4.6 | Thème clair / sombre |
| **React Icons** | 5.5.0 | Icônes (Feather) |
| **date-fns** | 4.1.0 | Manipulation de dates |
| **react-calendar** | 6.0.0 | Composant calendrier |
| **jsPDF** | 3.0.3 | Génération de PDF côté client |
| **@react-email** | 1.0.8 / 2.0.4 | Templates e-mail React |
| **next-pwa** | 5.6.0 | Progressive Web App |

### Backend & Services

| Service | Version | Rôle |
|---|---|---|
| **Firebase Auth** | 12.4.0 | Authentification |
| **Cloud Firestore** | 12.4.0 | Base de données NoSQL temps réel |
| **Cloud Storage** | 12.4.0 | Stockage d'images |
| **Firebase Cloud Messaging** | 12.4.0 | Notifications push |
| **Firebase Admin SDK** | 13.5.0 | Opérations serveur sécurisées |
| **Firebase Functions** | 6.6.0 | Backend serverless (Node.js 18) |
| **Resend** | 6.9.2 | E-mails transactionnels |
| **googleapis** | 144.0.0 | API Google Business Profile |

### Outils de développement

| Outil | Version | Rôle |
|---|---|---|
| **ESLint** | 9 | Linting |
| **sharp** | 0.34 | Optimisation d'images |
| **PostCSS + Autoprefixer** | 8.5 / 10.4 | Traitement CSS |
| **@axe-core/react** | 4.11 | Tests d'accessibilité |

---

## Architecture du projet

```
lcf/
├── public/                        # Assets statiques & PWA
│   ├── icons/                     # Icônes de l'application
│   ├── firebase-messaging-sw.js   # Service Worker FCM
│   └── manifest.json              # Manifeste PWA
│
├── src/
│   ├── app/                       # Pages (Next.js App Router)
│   │   ├── (auth)/                # Authentification
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset-password/
│   │   ├── admin/                 # Panneau d'administration (protégé)
│   │   │   ├── utilisateurs/
│   │   │   ├── vehicules/
│   │   │   ├── calendrier/
│   │   │   ├── factures/
│   │   │   ├── devis/
│   │   │   ├── suivi/
│   │   │   ├── avis/
│   │   │   ├── chiffre-affaires/
│   │   │   ├── declaration-fiscale/
│   │   │   └── loyalty/
│   │   ├── dashboard/             # Espace client (protégé)
│   │   ├── rendez-vous/           # Réservation (protégé)
│   │   ├── services/              # Pages publiques de services
│   │   │   ├── entretien/
│   │   │   ├── reparation/
│   │   │   └── reprogrammation/
│   │   ├── vehicules/             # Catalogue véhicules d'occasion
│   │   ├── contact/
│   │   └── api/                   # Routes API
│   │       ├── email/
│   │       ├── fiscal/
│   │       └── oauth/
│   │
│   ├── components/                # Composants React réutilisables
│   │   ├── ui/                    # Button, Input, Card, Select…
│   │   ├── layout/                # Header, Footer
│   │   ├── admin/                 # Composants administration
│   │   ├── calendar/              # Calendrier et modales RDV
│   │   ├── notifications/         # Préférences de notifications
│   │   ├── loyalty/               # Carte de fidélité
│   │   ├── vehicules/             # Galerie et fiches véhicules
│   │   ├── monitoring/            # Web Vitals Monitor
│   │   └── accessibility/         # Accessibility Checker
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx        # État d'authentification global
│   │
│   ├── hooks/
│   │   └── useRole.ts             # Helper de vérification des rôles
│   │
│   ├── lib/
│   │   ├── firebase/              # Initialisation Firebase & FCM & Storage
│   │   ├── firestore/             # Couche d'accès aux données (12 modules)
│   │   │   ├── appointments.ts
│   │   │   ├── invoices.ts
│   │   │   ├── quotations.ts
│   │   │   ├── users.ts
│   │   │   ├── vehicles.ts
│   │   │   ├── userVehicles.ts
│   │   │   ├── loyalty.ts
│   │   │   ├── notifications.ts
│   │   │   ├── reviews.ts
│   │   │   ├── workOrders.ts
│   │   │   └── revenue.ts
│   │   └── email/                 # Service e-mail (Resend + templates)
│   │
│   └── types/
│       └── index.ts               # Définitions TypeScript globales
│
├── functions/                     # Firebase Cloud Functions (Node.js 18)
│   └── src/
│       ├── appointmentReminders.ts
│       ├── vehicleNotifications.ts
│       ├── invoiceEmail.ts
│       ├── quotationEmail.ts
│       ├── googleReviews.ts
│       └── oauth.ts
│
├── doc/                           # Documentation technique détaillée
├── scripts/                       # Scripts utilitaires (icônes, images)
├── firestore.rules                # Règles de sécurité Firestore (RBAC)
├── firestore.indexes.json         # Index Firestore
├── firebase.json                  # Configuration déploiement Firebase
├── next.config.ts                 # Configuration Next.js + PWA
├── tailwind.config.js             # Design system
├── tsconfig.json                  # Configuration TypeScript
└── .env.local.example             # Template de variables d'environnement
```

---

## Démarrage rapide

### Prérequis

- Node.js ≥ 18
- npm ≥ 9
- Un projet [Firebase](https://console.firebase.google.com/) avec les services suivants activés :
  - Authentication (Email/Password + Google)
  - Cloud Firestore
  - Cloud Storage
  - Cloud Messaging (FCM)
  - Cloud Functions

### Installation

```bash
# 1. Cloner le dépôt
git clone <url-du-repo>
cd lcf

# 2. Installer les dépendances
npm install

# 3. Copier le template de configuration
cp .env.local.example .env.local

# 4. Renseigner les variables d'environnement (voir section suivante)
nano .env.local

# 5. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Cloud Functions (optionnel en développement)

```bash
cd functions
npm install
npm run serve   # Émulateur local Firebase Functions
```

---

## Configuration des environnements

Copiez `.env.local.example` en `.env.local` et renseignez les valeurs suivantes.

### Firebase (côté client)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=   # Clé publique VAPID pour les notifications push
```

### Firebase Admin SDK (serveur uniquement)

```env
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=       # Clé privée du compte de service (avec \n)
```

### Google OAuth (Avis Google Business)

```env
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=
```

### E-mail (Resend)

```env
RESEND_API_KEY=
EMAIL_TEST_RECIPIENT=             # Redirection des e-mails en développement
```

---

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (port 3000) |
| `npm run build` | Build de production (Webpack — requis pour PWA) |
| `npm start` | Serveur de production |
| `npm run lint` | Linting ESLint |
| `npm run generate-icons` | Génération des icônes PWA |
| `npm run optimize-images` | Optimisation des images |

---

## Déploiement

### Build de production

```bash
npm run build
npm start
```

> **Important :** Le build utilise Webpack (pas Turbopack) pour assurer la compatibilité avec `next-pwa`.

### Déploiement Firebase Hosting

```bash
# Tout déployer (Hosting + Functions + Rules + Indexes)
firebase deploy

# Déployer uniquement les Cloud Functions
firebase deploy --only functions

# Déployer uniquement les règles Firestore
firebase deploy --only firestore:rules
```

Pour le guide complet de déploiement des fonctions, consulter [`doc/functions/DEPLOYMENT.md`](doc/functions/DEPLOYMENT.md).

---

## Sécurité et rôles

L'application implémente un contrôle d'accès à plusieurs niveaux.

### Rôles utilisateurs

| Rôle | Description | Accès |
|---|---|---|
| `user` | Client standard | Portail client, réservation, devis/factures propres |
| `agendaManager` | Gestionnaire d'agenda | Calendrier global, gestion des RDV sans restriction de temps |
| `admin` | Administrateur | Accès complet à toutes les fonctionnalités |

### Règles Firestore

Les règles de sécurité ([`firestore.rules`](firestore.rules)) appliquent le RBAC directement au niveau de la base de données :

- Les clients ne peuvent lire et modifier **que leurs propres** données.
- La règle des 24 heures est **appliquée côté serveur** (règles Firestore + Cloud Function de validation).
- Les tokens UUID v4 permettent l'accès public aux devis sans authentification.
- Les transactions Cloud Functions sont les seules habilitées à écrire dans les collections de fidélité.

### Cloud Functions de validation

La Cloud Function `onAppointmentUpdate` agit comme second garde-fou côté serveur pour la règle des 24 heures, en complément des règles Firestore.

---

## Documentation

La documentation technique détaillée est disponible dans le dossier [`doc/`](doc/) :

| Fichier | Contenu |
|---|---|
| [`doc/specifications.md`](doc/specifications.md) | Cahier des charges fonctionnel et technique (version originale) |
| [`doc/PROJET.md`](doc/PROJET.md) | Roadmap et documentation technique |
| [`doc/ANALYSE.md`](doc/ANALYSE.md) | Analyse du projet et statut |
| [`doc/INVOICE_SYSTEM.md`](doc/INVOICE_SYSTEM.md) | Système de facturation et déclaration fiscale |
| [`doc/QUOTATIONS_MODULE.md`](doc/QUOTATIONS_MODULE.md) | Module devis |
| [`doc/LOYALTY_PROGRAM.md`](doc/LOYALTY_PROGRAM.md) | Programme de fidélité |
| [`doc/NOTIFICATIONS_SETUP.md`](doc/NOTIFICATIONS_SETUP.md) | Configuration des notifications push |
| [`doc/OAUTH_SETUP.md`](doc/OAUTH_SETUP.md) | Intégration Google OAuth |
| [`doc/PWA.md`](doc/PWA.md) | Progressive Web App |
| [`doc/FIRESTORE_RULES.md`](doc/FIRESTORE_RULES.md) | Règles de sécurité Firestore |
| [`doc/PERFORMANCE.md`](doc/PERFORMANCE.md) | Optimisation des performances |
| [`doc/ACCESSIBILITY.md`](doc/ACCESSIBILITY.md) | Standards d'accessibilité |

---

## Licence

© 2024 LCF Auto Performance — Tous droits réservés.
