# Spécifications Fonctionnelles et Techniques - LCF AUTO PERFORMANCE

## 1. Vision du Projet
LCF AUTO PERFORMANCE est une plateforme numérique intégrée pour un garage automobile spécialisé dans l'entretien, la réparation, la reprogrammation moteur et la vente de véhicules d'occasion. L'objectif est de centraliser la gestion opérationnelle et d'offrir une expérience client moderne et fluide.

## 2. Architecture Technique
- **Framework Frontend** : Next.js 16 (App Router) avec TypeScript
- **Style** : Tailwind CSS 3 (Thème Clair/Sombre via `next-themes`)
- **Backend (BaaS)** : Google Firebase
  - **Authentication** : Email/Mot de passe & Google OAuth
  - **Firestore** : Base de données NoSQL temps réel
  - **Storage** : Stockage des photos de véhicules et documents
  - **Cloud Functions** : Logique métier critique (emails, validations, APIs tierces)
- **PWA** : Progressive Web App via `next-pwa` pour une installation sur mobile

## 3. Fonctionnalités Principales

### 3.1 Espace Client & Réservation
- **Authentification** : Inscription/Connexion sécurisée.
- **Prise de Rendez-vous** : Système en 4 étapes (Service > Date/Heure > Véhicule > Confirmation).
- **Règle métier** : Modification/Annulation impossible moins de 24h avant le rendez-vous.
- **Tableau de bord** : Historique des rendez-vous, devis et factures personnels.

### 3.2 Catalogue Véhicules d'Occasion
- Affichage des véhicules disponibles avec filtres.
- Fiches détaillées (Photos, Caractéristiques, Prix).
- Formulaire de contact dédié par véhicule.

### 3.3 Administration (Back-Office)
- **Gestionnaire d'Agenda** : Calendrier global des rendez-vous.
- **Gestion des Véhicules** : CRUD complet (Ajout, modification, suppression, statut "Vendu").
- **Système de Devis (DEV-YYYY-NNN)** : Création, gestion des statuts, envoi par email.
- **Système de Facturation (FAC-YYYY-NNN)** : Génération de factures, suivi des paiements.
- **Déclaration Fiscale** : Export CSV/PDF des revenus pour le régime auto-entrepreneur.
- **Gestion des Avis** : Interface pour répondre aux avis Google via API Business Profile.

## 4. Modèle de Données (Firestore)
- `users` : Profils, rôles (`admin`, `agendaManager`, `user`), préférences.
- `appointments` : Détails des RDV, statut, lien utilisateur.
- `vehicles` : Stock de vente, images, spécifications.
- `quotations` : Devis, articles, totaux HT/TTC, statut.
- `invoices` : Factures validées, historique de paiement.
- `revenue` : Agrégats pour les rapports fiscaux.

## 5. Objectifs de Performance (Core Web Vitals)
- **LCP** (Largest Contentful Paint) : < 2.5s
- **FID** (First Input Delay) : < 100ms
- **CLS** (Cumulative Layout Shift) : < 0.1
- **Accessibilité** : Conformité WCAG 2.1 niveau AA.
