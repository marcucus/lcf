# Cahier des Charges — Application Web LCF Auto Performance

**Version :** 1.0  
**Date :** 2024  
**Statut :** Document de référence

---

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Objectifs et périmètre](#2-objectifs-et-périmètre)
3. [Utilisateurs cibles et rôles](#3-utilisateurs-cibles-et-rôles)
4. [Fonctionnalités](#4-fonctionnalités)
   - 4.1 [Authentification](#41-authentification)
   - 4.2 [Pages publiques](#42-pages-publiques)
   - 4.3 [Portail client](#43-portail-client)
   - 4.4 [Prise de rendez-vous](#44-prise-de-rendez-vous)
   - 4.5 [Gestion des devis](#45-gestion-des-devis)
   - 4.6 [Gestion des factures](#46-gestion-des-factures)
   - 4.7 [Bons de travail](#47-bons-de-travail)
   - 4.8 [Programme de fidélité](#48-programme-de-fidélité)
   - 4.9 [Notifications](#49-notifications)
   - 4.10 [Panneau d'administration](#410-panneau-dadministration)
   - 4.11 [Progressive Web App](#411-progressive-web-app)
5. [Exigences non fonctionnelles](#5-exigences-non-fonctionnelles)
6. [Stack technique](#6-stack-technique)
7. [Architecture applicative](#7-architecture-applicative)
8. [Modèle de données](#8-modèle-de-données)
9. [API et Cloud Functions](#9-api-et-cloud-functions)
10. [Sécurité](#10-sécurité)
11. [Déploiement](#11-déploiement)
12. [Glossaire](#12-glossaire)

---

## 1. Présentation du projet

### 1.1 Contexte

**LCF Auto Performance** est un garage automobile spécialisé proposant des services d'entretien, de réparation et de reprogrammation moteur (ECU). Pour accompagner son développement et améliorer l'expérience client, le garage souhaite se doter d'une application web professionnelle accessible sur tous les supports (ordinateur, tablette, smartphone).

### 1.2 Objet du document

Ce cahier des charges définit l'ensemble des exigences fonctionnelles et techniques de l'application web LCF Auto Performance. Il constitue le document de référence pour les phases de développement, de recette et de maintenance.

### 1.3 Périmètre général

L'application couvre :

- La vitrine commerciale du garage (présentation des services, catalogue véhicules d'occasion, contact)
- Le portail client en ligne (réservation de RDV, suivi des prestations, fidélité)
- Le back-office administrateur (gestion opérationnelle complète du garage)

---

## 2. Objectifs et périmètre

### 2.1 Objectifs métier

| # | Objectif | Priorité |
|---|---|---|
| O1 | Permettre la réservation de rendez-vous en ligne 24h/24 | Critique |
| O2 | Réduire les tâches administratives manuelles (devis, factures) | Haute |
| O3 | Fidéliser la clientèle grâce à un programme de points | Haute |
| O4 | Améliorer la réputation en ligne via la gestion des avis Google | Moyenne |
| O5 | Proposer un catalogue de véhicules d'occasion en ligne | Moyenne |
| O6 | Fournir un outil d'export comptable pour la déclaration fiscale | Haute |

### 2.2 Hors périmètre

- Paiement en ligne des factures (prévu en version ultérieure)
- Application mobile native (iOS / Android) — la PWA couvre ce besoin
- Système de gestion de stock (pièces détachées)
- Intégration avec un logiciel comptable tiers

---

## 3. Utilisateurs cibles et rôles

### 3.1 Profils utilisateurs

| Profil | Description |
|---|---|
| **Visiteur anonyme** | Tout internaute accédant au site sans compte |
| **Client (user)** | Personne disposant d'un compte, utilisant le portail client |
| **Gestionnaire d'agenda (agendaManager)** | Employé du garage gérant le calendrier des RDV |
| **Administrateur (admin)** | Gérant ou responsable avec accès complet au back-office |

### 3.2 Matrice des droits d'accès

| Fonctionnalité | Visiteur | Client | Gestionnaire | Admin |
|---|:---:|:---:|:---:|:---:|
| Pages publiques (accueil, services, contact) | ✅ | ✅ | ✅ | ✅ |
| Catalogue véhicules d'occasion | ✅ | ✅ | ✅ | ✅ |
| Création de compte / connexion | ✅ | — | — | — |
| Prise de RDV en ligne | ❌ | ✅ | ✅ | ✅ |
| Annulation RDV (règle 24 h) | ❌ | ✅ | ✅ | ✅ |
| Consultation de ses factures et devis | ❌ | ✅ | ❌ | ✅ |
| Programme de fidélité | ❌ | ✅ | ❌ | ✅ |
| Calendrier global de tous les RDV | ❌ | ❌ | ✅ | ✅ |
| Gestion manuelle des RDV (sans règle 24 h) | ❌ | ❌ | ✅ | ✅ |
| Gestion utilisateurs (CRUD + rôles) | ❌ | ❌ | ❌ | ✅ |
| Gestion catalogue véhicules | ❌ | ❌ | ❌ | ✅ |
| Création / gestion des devis et factures | ❌ | ❌ | ❌ | ✅ |
| Dashboard financier et export fiscal | ❌ | ❌ | ❌ | ✅ |
| Gestion des avis Google | ❌ | ❌ | ❌ | ✅ |
| Configuration du programme de fidélité | ❌ | ❌ | ❌ | ✅ |

---

## 4. Fonctionnalités

### 4.1 Authentification

#### 4.1.1 Inscription
- Formulaire avec prénom, nom, adresse e-mail et mot de passe
- Validation des champs côté client et côté serveur
- Création du compte Firebase Authentication
- Création du document utilisateur dans Firestore (rôle `user` par défaut)
- Envoi d'un e-mail de bienvenue automatique (Resend)
- Bouton « Continuer avec Google » (OAuth 2.0) comme alternative

#### 4.1.2 Connexion
- Connexion par e-mail / mot de passe
- Connexion via Google OAuth 2.0
- Persistance de session (Firebase `setPersistence`)
- Redirection vers la page d'origine après connexion

#### 4.1.3 Réinitialisation du mot de passe
- Formulaire de demande de réinitialisation par e-mail
- E-mail de réinitialisation envoyé via Firebase Authentication
- Page de confirmation après envoi

#### 4.1.4 Déconnexion
- Bouton de déconnexion accessible depuis l'en-tête
- Suppression de la session et redirection vers l'accueil

#### 4.1.5 Routes protégées
- Les pages `/dashboard`, `/rendez-vous`, et `/admin/*` nécessitent une authentification
- L'accès à `/admin/*` requiert le rôle `agendaManager` ou `admin`
- Redirection automatique vers `/login` si non authentifié
- Redirection vers `/unauthorized` si rôle insuffisant

---

### 4.2 Pages publiques

#### 4.2.1 Page d'accueil
- Section héro avec appel à l'action (prise de RDV, catalogue véhicules)
- Présentation synthétique des trois services principaux
- Section de présentation du garage (valeurs, expérience)
- Affichage des derniers avis Google (note globale et extraits)
- Lien vers le catalogue véhicules d'occasion

#### 4.2.2 Pages de services
- **Vue d'ensemble des services** : liste des trois prestations avec liens
- **Entretien** : description détaillée (vidange, freins, pneumatiques, révision), tarifs indicatifs, appel à l'action RDV
- **Réparation** : types de réparations (moteur, transmission, électronique), signes d'alerte, devis en ligne
- **Reprogrammation ECU** : Stage 1 et Stage 2, bénéfices, avertissements légaux, appel à l'action RDV

#### 4.2.3 Catalogue véhicules d'occasion
- Galerie de cartes véhicules avec photo principale, marque/modèle, année, kilométrage et prix
- Filtres par marque, type de carburant, fourchette de prix
- Page de détail d'un véhicule : galerie photos, fiche technique complète, description, formulaire de contact
- Indicateur visuel « Vendu » pour les véhicules non disponibles

#### 4.2.4 Page contact
- Coordonnées complètes (adresse, téléphone, e-mail, horaires)
- Carte Google Maps intégrée
- Formulaire de contact (nom, e-mail, message)

---

### 4.3 Portail client

#### 4.3.1 Tableau de bord
- Indicateurs personnels : nombre de RDV à venir, RDV passés, points de fidélité
- Liste des prochains rendez-vous avec statut et option d'annulation
- Accès rapide aux sections : véhicules, devis, factures, fidélité
- Alerte sur les devis en attente d'acceptation

#### 4.3.2 Gestion des véhicules personnels
- Ajout d'un véhicule (marque, modèle, immatriculation, année, carburant)
- Modification et suppression d'un véhicule
- Sélection du véhicule lors de la prise de RDV

#### 4.3.3 Historique des rendez-vous
- Liste complète des RDV (passés et futurs)
- Statut coloré : confirmé (bleu), terminé (vert), annulé (rouge)
- Possibilité d'annuler un RDV à venir (règle 24 h — voir §4.4.4)

#### 4.3.4 Suivi des devis et factures
- Liste des devis avec statut (brouillon, envoyé, accepté, refusé, expiré, converti)
- Liste des factures avec statut (brouillon, envoyée, payée, annulée, en retard)
- Téléchargement de facture en PDF
- Lien d'acceptation / refus du devis par token sécurisé (sans connexion requise)

#### 4.3.5 Suivi des bons de travail
- Affichage des bons de travail liés aux devis acceptés
- Statut d'avancement : en attente, en cours, terminé
- Lien vers la facture générée à la completion

#### 4.3.6 Programme de fidélité
- Solde de points courant
- Historique des transactions de points (gain, dépense, ajustement)
- Catalogue des récompenses disponibles avec coût en points
- Bouton de réclamation d'une récompense
- Suivi des récompenses réclamées

---

### 4.4 Prise de rendez-vous

#### 4.4.1 Assistant de réservation (4 étapes)

**Étape 1 — Choix du service**
- Sélection parmi : Entretien, Réparation, Reprogrammation ECU
- Description courte de chaque service
- Sélection obligatoire pour continuer

**Étape 2 — Choix de la date et de l'heure**
- Calendrier interactif affichant les jours disponibles
- Sélection d'un créneau horaire parmi les créneaux disponibles du jour sélectionné
- Vérification en temps réel des disponibilités (requête Firestore)
- Affichage clair des créneaux indisponibles (déjà réservés)

**Étape 3 — Informations du véhicule**
- Sélection d'un véhicule personnel existant (si déjà enregistré)
- Ou saisie manuelle : marque, modèle, immatriculation, année
- Champ de notes additionnelles (description du problème, demande spécifique)

**Étape 4 — Confirmation**
- Récapitulatif complet : service, date/heure, véhicule, notes
- Bouton « Confirmer le rendez-vous »
- E-mail de confirmation envoyé automatiquement (Resend)
- Redirection vers le tableau de bord client

#### 4.4.2 Prévention des doubles réservations
- Utilisation de **transactions Firestore atomiques** lors de la création d'un RDV
- Vérification de la disponibilité du créneau dans la transaction
- En cas de conflit (créneau pris entre la consultation et la validation), affichage d'un message d'erreur et invitation à choisir un autre créneau

#### 4.4.3 Règle des 24 heures
- Un client ne peut annuler ou modifier son RDV que **plus de 24 heures avant** l'heure du RDV
- Cette règle est appliquée à **deux niveaux** :
  1. Interface utilisateur (bouton d'annulation désactivé si < 24 h)
  2. Règles de sécurité Firestore (refus de l'écriture côté base de données)
  3. Cloud Function de validation (`validateAppointmentModification`) pour la cohérence serveur
- Les rôles `agendaManager` et `admin` sont **exemptés** de cette règle

#### 4.4.4 Rappels automatiques
- Cloud Function planifiée (toutes les heures) : envoi d'une notification push FCM 24 h avant chaque RDV
- E-mail de rappel envoyé 24 h avant le RDV (si activé dans les préférences)

---

### 4.5 Gestion des devis

#### 4.5.1 Création d'un devis (Admin)
- Formulaire : nom client, e-mail, téléphone, adresse
- Lignes de prestation : désignation, quantité, prix unitaire HT, taux TVA
- Calcul automatique : sous-total HT, total TVA, total TTC
- Notes et conditions
- Numérotation automatique au format `DEV-YYYY-NNN` (remise à zéro chaque année)
- Statut initial : `brouillon`

#### 4.5.2 Envoi d'un devis
- Changement de statut vers `envoyé`
- Envoi d'un e-mail au client avec lien sécurisé (token UUID v4 unique)
- Le lien permet au client d'accepter ou refuser **sans connexion requise**

#### 4.5.3 Acceptation / Refus par le client
- Page publique accessible via le token : affichage du devis en lecture seule
- Bouton « Accepter le devis » → statut `accepté`, date d'acceptation enregistrée
- Bouton « Refuser le devis » → statut `refusé`, date de refus enregistrée
- Création automatique d'un **bon de travail** à l'acceptation

#### 4.5.4 Cycle de vie d'un devis

```
brouillon → envoyé → accepté → [converti en bon de travail]
                   ↘ refusé
                   ↘ expiré (date de validité dépassée)
```

---

### 4.6 Gestion des factures

#### 4.6.1 Création d'une facture (Admin)
- Formulaire similaire au devis : client, lignes de prestation, notes
- Numérotation automatique au format `FACT-YYYY-NNN` (remise à zéro chaque année)
- Origines possibles : rendez-vous, devis accepté, saisie manuelle
- Lien optionnel vers le RDV ou le devis d'origine

#### 4.6.2 Cycle de vie d'une facture

```
brouillon → envoyée → payée
          ↘ annulée
          ↘ en retard (date d'échéance dépassée, non payée)
```

#### 4.6.3 Suivi des paiements
- Changement de statut vers `payée` avec enregistrement de la date et du mode de paiement
- Date d'échéance configurable
- Indicateur visuel des factures en retard

#### 4.6.4 Génération PDF
- Export PDF de la facture depuis l'interface admin et le portail client
- En-tête avec logo, coordonnées du garage, numéro et date de facture
- Tableau des prestations, sous-total, TVA, total TTC
- Informations de paiement et mentions légales

#### 4.6.5 Export fiscal
- Filtrage par période (dates de début et de fin)
- **Export CSV** : lignes par facture (numéro, date, client, montant HT, TVA, TTC, statut, mode de paiement) — compatible tableurs et logiciels comptables
- **Export PDF** : rapport de synthèse imprimable pour déclaration auto-entrepreneur

---

### 4.7 Bons de travail

#### 4.7.1 Création
- Créé automatiquement à l'acceptation d'un devis
- Hérite des informations du devis (client, prestations, montant)
- Statut initial : `en attente`

#### 4.7.2 Suivi d'avancement
- L'admin peut mettre à jour le statut : `en attente` → `en cours` → `terminé`
- Ajout de notes de progression horodatées
- Enregistrement des dates de début et de fin

#### 4.7.3 Génération de facture
- À la completion du bon de travail, possibilité de générer automatiquement la facture correspondante
- Lien bidirectionnel bon de travail ↔ facture

---

### 4.8 Programme de fidélité

#### 4.8.1 Attribution de points
- Attribution automatique de points à chaque **RDV complété** (montant configurable par l'admin)
- Possibilité d'ajustement manuel par l'admin (bonus, correction)
- Toutes les transactions de points sont écrites par les **Cloud Functions uniquement** (pas directement par le client)

#### 4.8.2 Catalogue de récompenses
- L'admin crée et gère les récompenses : nom, description, catégorie, coût en points, image, stock, date de validité
- Catégories : `remise`, `service`, `produit`, `spécial`
- Activation / désactivation d'une récompense
- Gestion du stock disponible

#### 4.8.3 Réclamation de récompenses
- Le client peut réclamer une récompense si son solde de points est suffisant
- Vérification du stock disponible
- Débit des points et création d'un enregistrement `userRewards`
- Notification e-mail de confirmation de la réclamation

#### 4.8.4 Dashboard de fidélité
- Vue client : solde courant, historique des transactions, catalogue des récompenses disponibles, liste des récompenses réclamées
- Vue admin : liste des transactions par utilisateur, gestion du catalogue, configuration des règles d'attribution

---

### 4.9 Notifications

#### 4.9.1 Notifications push (FCM)
- Rappel de RDV : **24 heures avant** l'heure du RDV (Cloud Function planifiée toutes les heures)
- Nouveau véhicule : alerte aux clients abonnés lors de l'ajout d'un véhicule au catalogue
- Permission demandée à l'utilisateur lors de sa première connexion au dashboard
- Gestion du token FCM : enregistré dans le document utilisateur Firestore à chaque connexion

#### 4.9.2 E-mails transactionnels (Resend)
| Déclencheur | Destinataire | Contenu |
|---|---|---|
| Inscription | Client | Bienvenue, lien vers le portail |
| Création RDV | Client | Confirmation avec récapitulatif |
| Annulation RDV | Client + Admin | Notification d'annulation |
| Rappel RDV (J-1) | Client | Rappel avec détails |
| Nouveau devis envoyé | Client | Devis en pièce jointe + lien d'acceptation |
| Devis accepté | Admin | Notification + création du bon de travail |
| Nouvelle facture | Client | Facture en pièce jointe |
| Récompense réclamée | Client | Confirmation et instructions |
| Réinitialisation MDP | Client | Lien de réinitialisation |

#### 4.9.3 Préférences de notifications
- Le client peut activer / désactiver chaque type de notification push (RDV, véhicules)
- Paramètres stockés dans le document utilisateur Firestore (`notificationPreferences`)

---

### 4.10 Panneau d'administration

#### 4.10.1 Tableau de bord principal
- KPIs du jour et de la semaine : nombre de RDV, CA estimé
- Graphiques : évolution du CA, répartition des services
- Derniers avis Google reçus (note + extrait)
- Raccourcis vers les sections principales

#### 4.10.2 Calendrier global
- Vue par jour, semaine ou mois affichant **tous** les RDV de tous les clients
- Code couleur par type de service
- Clic sur un RDV pour afficher le détail (client, véhicule, notes)
- Création manuelle d'un RDV (sans restriction de temps)
- Modification et suppression d'un RDV existant (sans restriction de temps)

#### 4.10.3 Gestion des utilisateurs
- Liste paginée de tous les utilisateurs (nom, e-mail, rôle, date d'inscription)
- Création manuelle d'un utilisateur
- Modification : prénom, nom, e-mail, rôle (`user`, `agendaManager`, `admin`)
- Suppression d'un compte utilisateur
- Recherche et filtrage par nom / rôle

#### 4.10.4 Gestion des véhicules d'occasion
- Liste de tous les véhicules avec statut (en vente / vendu)
- Formulaire d'ajout : marque, modèle, année, prix, kilométrage, carburant, transmission, couleur, puissance (CV), équipements, description, photos multiples
- Modification d'un véhicule existant
- Marquer un véhicule comme vendu / supprimer de la liste
- Téléversement d'images vers Cloud Storage avec URL publiques

#### 4.10.5 Gestion des devis
- Liste de tous les devis avec statut
- Création, modification, envoi, archivage
- Vue détaillée avec historique du cycle de vie

#### 4.10.6 Gestion des factures
- Liste de toutes les factures avec statut
- Création, modification, envoi, marquage comme payée
- Génération et téléchargement du PDF
- Accès à l'export fiscal (CSV / PDF)

#### 4.10.7 Gestion des bons de travail
- Liste de tous les bons de travail avec statut d'avancement
- Mise à jour du statut et ajout de notes de progression
- Génération de la facture de clôture

#### 4.10.8 Dashboard financier
- Chiffre d'affaires total, mensuel, hebdomadaire
- Taux de factures payées vs en attente vs en retard
- Répartition du CA par type de service
- Filtrage par période

#### 4.10.9 Déclaration fiscale
- Sélection d'une période (date de début / fin)
- Aperçu des factures incluses dans la période
- Export CSV des données pour logiciel comptable
- Export PDF du rapport de synthèse

#### 4.10.10 Gestion des avis Google
- **Configuration OAuth** : flux de connexion OAuth 2.0 avec Google Business Profile (configuration unique)
- Affichage des avis récents (note, auteur, date, commentaire)
- Indication de réponse déjà envoyée ou non
- Saisie d'une réponse personnalisée
- **Modèles de réponse** : bibliothèque de réponses pré-enregistrées, gestion CRUD des modèles
- Envoi de la réponse via l'API Google Business Profile (Cloud Function)
- Gestion des erreurs API avec messages explicites

#### 4.10.11 Gestion de la fidélité
- Configuration globale : points par RDV, règles d'attribution
- Gestion du catalogue de récompenses (CRUD)
- Vue des transactions par utilisateur
- Ajustement manuel des points d'un utilisateur

---

### 4.11 Progressive Web App

- **Installable** : invite à l'installation sur iOS, Android et bureau (Chrome, Edge)
- **Hors-ligne** : les pages déjà visitées restent accessibles sans connexion
- **Manifeste PWA** (`manifest.json`) : nom, icônes 192×192 et 512×512, couleurs de thème
- **Service Worker** : stratégies de cache configurées par type de ressource :
  - `Cache First` (365 j) : Google Fonts
  - `Cache First` (30 j) : images statiques
  - `Stale While Revalidate` (24 h) : CSS, JS, HTML
  - `Network First` (24 h) : données dynamiques, routes API
- **Background sync** : file d'attente pour les actions effectuées hors-ligne

---

## 5. Exigences non fonctionnelles

### 5.1 Performance
- First Contentful Paint (FCP) < 2 s sur connexion 4G
- Largest Contentful Paint (LCP) < 2,5 s
- Cumulative Layout Shift (CLS) < 0,1
- Images servies en format AVIF / WebP avec `next/image`
- Code splitting automatique par Next.js (App Router)
- Lazy loading des composants et images hors viewport

### 5.2 Accessibilité
- Conformité WCAG 2.1 niveau AA
- Navigation au clavier complète
- Attributs ARIA sur tous les composants interactifs
- Contraste de couleurs ≥ 4,5:1 (texte normal), ≥ 3:1 (grand texte)
- Vérification automatique avec `@axe-core/react` en développement

### 5.3 Sécurité
- Authentification Firebase avec sessions sécurisées
- Règles de sécurité Firestore appliquant le RBAC au niveau base de données
- Variables d'environnement pour tous les secrets (jamais en dur dans le code)
- Validation des données côté client **et** côté serveur (Cloud Functions)
- Protection CSRF implicite par les tokens Firebase
- Tokens UUID v4 à usage unique pour l'accès public aux devis

### 5.4 Responsive design
- Design mobile-first avec Tailwind CSS
- Breakpoints : `sm` (640 px), `md` (768 px), `lg` (1024 px), `xl` (1280 px)
- Navigation adaptée : menu hamburger sur mobile

### 5.5 Compatibilité navigateurs
- Chrome / Edge ≥ 90
- Firefox ≥ 88
- Safari ≥ 14
- Safari iOS ≥ 14

### 5.6 Thème
- Thème clair et sombre avec basculement manuel
- Détection automatique des préférences système (`prefers-color-scheme`)
- Persistance de la préférence dans `localStorage`

### 5.7 Internationalisation
- Langue de l'interface : **français**
- Format de dates : `DD/MM/YYYY` (locale `fr-FR`)
- Format monétaire : euros (€)

---

## 6. Stack technique

### 6.1 Frontend

| Élément | Choix | Justification |
|---|---|---|
| Framework | **Next.js 16** (App Router) | SSR, SSG, routing, optimisation images |
| UI Library | **React 19** | Composants réutilisables, état local |
| Langage | **TypeScript 5.9** (strict) | Typage statique, sécurité du code |
| CSS | **Tailwind CSS 3.4** | Utility-first, dark mode, responsive |
| Icônes | **React Icons 5.5** (Feather) | Légèreté, cohérence visuelle |
| Dates | **date-fns 4.1** | Manipulation de dates légère |
| Calendrier | **react-calendar 6** | Composant calendrier interactif |
| PDF | **jsPDF 3** | Génération de PDF côté client |
| E-mail templates | **@react-email** | Templates React pour e-mails HTML |
| PWA | **next-pwa 5.6** | Service Worker, manifest, caching |
| Thème | **next-themes 0.4** | Dark/light mode avec SSR |

### 6.2 Backend

| Élément | Choix | Justification |
|---|---|---|
| Auth | **Firebase Authentication** | Email/password + OAuth, sessions, RBAC |
| BDD | **Cloud Firestore** | NoSQL temps réel, transactions, RBAC |
| Stockage | **Cloud Storage** | Images véhicules, documents |
| Push | **Firebase Cloud Messaging** | Notifications push cross-platform |
| Serverless | **Firebase Cloud Functions** (Node.js 18) | Logique métier serveur, planification |
| E-mail | **Resend** | E-mails transactionnels fiables |
| Google API | **googleapis 144** | API Google Business Profile (avis) |

### 6.3 Infrastructure

| Élément | Choix |
|---|---|
| Hosting | Firebase Hosting (CDN mondial) |
| Runtime | Node.js 18 LTS |
| Build | Webpack (PWA) |
| CI/CD | GitHub Actions (recommandé) |

---

## 7. Architecture applicative

### 7.1 Pattern général

L'application suit une architecture **BFF (Backend For Frontend)** :

- Le **frontend Next.js** gère les routes UI, les appels Firestore côté client et les routes API Next.js
- Les **Cloud Functions Firebase** gèrent la logique serveur sensible (emails, notifications, validation métier, intégrations tierces)
- **Firestore** est la source de vérité avec des règles de sécurité RBAC complètes

### 7.2 Flux de données

```
Navigateur (Next.js)
    │
    ├── SDK Firebase (Auth, Firestore, Storage, FCM)
    │       └── Cloud Firestore (règles RBAC)
    │
    ├── Routes API Next.js (/api/*)
    │       ├── /api/email/send   → Resend
    │       ├── /api/fiscal/*     → jsPDF / CSV
    │       └── /api/oauth/*      → Google OAuth
    │
    └── Firebase Cloud Functions (HTTPS callable + triggers + scheduled)
            ├── Appointment reminders → FCM
            ├── Vehicle notifications → FCM
            ├── Invoice / Quote emails → Resend
            └── Google Reviews → googleapis
```

### 7.3 Gestion de l'état

- **État global d'authentification** : `AuthContext` (React Context) — fournit `user`, `loading`, `login`, `logout`, etc.
- **État local** : hooks React (`useState`, `useEffect`) dans chaque composant
- **Données temps réel** : listeners Firestore (`onSnapshot`) pour le calendrier et le dashboard

---

## 8. Modèle de données

### 8.1 Collection `users`

| Champ | Type | Description |
|---|---|---|
| `uid` | `string` | Identifiant Firebase Authentication (clé primaire) |
| `email` | `string` | Adresse e-mail |
| `firstName` | `string` | Prénom |
| `lastName` | `string` | Nom de famille |
| `role` | `'user' \| 'agendaManager' \| 'admin'` | Rôle dans l'application |
| `loyaltyPoints` | `number` | Solde actuel de points de fidélité |
| `fcmToken` | `string?` | Token FCM pour les notifications push |
| `notificationPreferences` | `object` | Préférences de notifications (`appointments`, `newVehicles`) |
| `createdAt` | `Timestamp` | Date de création du compte |

### 8.2 Collection `appointments`

| Champ | Type | Description |
|---|---|---|
| `userId` | `string` | Référence au document `users` |
| `customerName` | `string` | Nom complet du client (dénormalisé) |
| `serviceType` | `'entretien' \| 'reparation' \| 'reprogrammation'` | Type de prestation |
| `dateTime` | `Timestamp` | Date et heure du rendez-vous |
| `vehicleInfo` | `object` | `{ make, model, year, plate }` |
| `customerNotes` | `string?` | Notes du client |
| `status` | `'confirmed' \| 'completed' \| 'cancelled'` | Statut du RDV |
| `amount` | `number?` | Montant estimé |
| `createdAt` | `Timestamp` | Date de création |

### 8.3 Collection `vehicles` (catalogue véhicules d'occasion)

| Champ | Type | Description |
|---|---|---|
| `make` | `string` | Marque |
| `model` | `string` | Modèle |
| `year` | `number` | Année de mise en circulation |
| `price` | `number` | Prix en euros |
| `mileage` | `number` | Kilométrage |
| `fuelType` | `string` | Type de carburant |
| `transmission` | `string` | Boîte de vitesses |
| `color` | `string` | Couleur |
| `doors` | `number` | Nombre de portes |
| `power` | `number` | Puissance en CV |
| `condition` | `string` | État général |
| `equipment` | `string[]` | Liste des équipements |
| `description` | `string` | Description complète |
| `imageUrls` | `string[]` | URLs des photos (Cloud Storage) |
| `isSold` | `boolean` | Véhicule vendu ou disponible |
| `createdAt` | `Timestamp` | Date d'ajout au catalogue |

### 8.4 Collection `quotations` (devis)

| Champ | Type | Description |
|---|---|---|
| `quotationNumber` | `string` | Numéro au format `DEV-YYYY-NNN` |
| `clientName` | `string` | Nom du client |
| `clientEmail` | `string` | E-mail du client |
| `clientPhone` | `string?` | Téléphone du client |
| `clientAddress` | `string?` | Adresse du client |
| `items` | `InvoiceItem[]` | Lignes de prestation |
| `subtotal` | `number` | Total HT |
| `totalTax` | `number` | Total TVA |
| `totalAmount` | `number` | Total TTC |
| `notes` | `string?` | Notes et conditions |
| `status` | `'draft' \| 'sent' \| 'accepted' \| 'rejected' \| 'expired' \| 'converted'` | Statut du devis |
| `acceptanceToken` | `string` | Token UUID v4 pour accès public |
| `acceptedAt` | `Timestamp?` | Date d'acceptation |
| `rejectedAt` | `Timestamp?` | Date de refus |
| `createdAt` | `Timestamp` | Date de création |
| `createdBy` | `string` | UID de l'admin créateur |

### 8.5 Collection `invoices` (factures)

| Champ | Type | Description |
|---|---|---|
| `invoiceNumber` | `string` | Numéro au format `FACT-YYYY-NNN` |
| `customerName` | `string` | Nom du client |
| `customerEmail` | `string` | E-mail du client |
| `customerPhone` | `string?` | Téléphone du client |
| `customerAddress` | `string?` | Adresse du client |
| `items` | `InvoiceItem[]` | Lignes de prestation |
| `subtotal` | `number` | Total HT |
| `taxAmount` | `number` | Montant TVA |
| `total` | `number` | Total TTC |
| `status` | `'draft' \| 'sent' \| 'paid' \| 'cancelled' \| 'overdue'` | Statut de la facture |
| `origin` | `'appointment' \| 'quote' \| 'user' \| 'manual'` | Origine de la facture |
| `relatedAppointmentId` | `string?` | Référence au RDV d'origine |
| `relatedQuoteId` | `string?` | Référence au devis d'origine |
| `dueDate` | `Timestamp?` | Date d'échéance |
| `paidDate` | `Timestamp?` | Date de paiement |
| `paymentMethod` | `string?` | Mode de paiement |
| `createdAt` | `Timestamp` | Date de création |
| `sentAt` | `Timestamp?` | Date d'envoi |

### 8.6 Collection `workOrders` (bons de travail)

| Champ | Type | Description |
|---|---|---|
| `quotationId` | `string` | Référence au devis |
| `quotationNumber` | `string` | Numéro du devis (dénormalisé) |
| `clientName` | `string` | Nom du client |
| `clientEmail` | `string` | E-mail du client |
| `clientPhone` | `string?` | Téléphone du client |
| `description` | `string` | Description des travaux |
| `items` | `InvoiceItem[]` | Lignes de prestation |
| `totalAmount` | `number` | Montant total |
| `status` | `'pending' \| 'in_progress' \| 'completed'` | Statut d'avancement |
| `progressNotes` | `string?` | Notes de progression |
| `startedAt` | `Timestamp?` | Date de début des travaux |
| `completedAt` | `Timestamp?` | Date de completion |
| `invoiceId` | `string?` | Référence à la facture générée |
| `createdAt` | `Timestamp` | Date de création |
| `createdBy` | `string` | UID de l'admin créateur |

### 8.7 Collection `loyaltyTransactions`

| Champ | Type | Description |
|---|---|---|
| `userId` | `string` | Référence à l'utilisateur |
| `type` | `'appointment_completed' \| 'manual_adjustment' \| 'reward_redemption' \| 'bonus'` | Type de transaction |
| `points` | `number` | Points crédités (positif) ou débités (négatif) |
| `description` | `string` | Libellé de la transaction |
| `relatedAppointmentId` | `string?` | RDV associé |
| `relatedRewardId` | `string?` | Récompense associée |
| `createdAt` | `Timestamp` | Date de la transaction |
| `createdBy` | `string` | UID créateur (admin ou Cloud Function) |

### 8.8 Collection `rewards` (catalogue récompenses)

| Champ | Type | Description |
|---|---|---|
| `name` | `string` | Nom de la récompense |
| `description` | `string` | Description |
| `category` | `'discount' \| 'service' \| 'product' \| 'special'` | Catégorie |
| `pointsCost` | `number` | Coût en points |
| `imageUrl` | `string?` | Image de la récompense |
| `isActive` | `boolean` | Disponibilité |
| `stock` | `number?` | Stock disponible (-1 = illimité) |
| `validUntil` | `Timestamp?` | Date d'expiration |
| `createdAt` | `Timestamp` | Date de création |

### 8.9 Autres collections

| Collection | Description |
|---|---|
| `userVehicles/{id}` | Véhicules personnels des clients |
| `userRewards/{id}` | Récompenses réclamées par les clients |
| `loyaltySettings/default` | Configuration globale du programme |
| `responseTemplates/{id}` | Modèles de réponse aux avis Google |
| `googleReviews/{id}` | Avis Google mis en cache |
| `googleOAuthConfig/{id}` | Tokens OAuth Google Business Profile |
| `services/{id}` | Définitions des services du garage |

### 8.10 Type `InvoiceItem`

```typescript
interface InvoiceItem {
  description: string;   // Désignation de la prestation
  quantity:    number;   // Quantité
  unitPrice:   number;   // Prix unitaire HT (€)
  taxRate:     number;   // Taux TVA (%)
  total:       number;   // Total TTC calculé
}
```

---

## 9. API et Cloud Functions

### 9.1 Routes API Next.js

| Endpoint | Méthode | Rôle |
|---|---|---|
| `/api/email/send` | `POST` | Envoi d'e-mails transactionnels via Resend |
| `/api/email/test` | `POST` | Test de la configuration e-mail (dev) |
| `/api/send-invoice-email` | `POST` | Envoi de la facture par e-mail |
| `/api/send-quote-email` | `POST` | Envoi du devis par e-mail |
| `/api/fiscal/export-csv` | `GET` | Export CSV des factures (comptabilité) |
| `/api/fiscal/export-pdf` | `GET` | Export PDF des factures (déclaration) |
| `/api/oauth/initiate` | `POST` | Démarrage du flux OAuth Google |
| `/api/oauth/refresh` | `POST` | Renouvellement du token OAuth |
| `/api/oauth/disconnect` | `POST` | Déconnexion OAuth Google |

### 9.2 Cloud Functions Firebase

#### Fonctions planifiées
| Fonction | Fréquence | Description |
|---|---|---|
| `sendAppointmentReminders` | Toutes les heures | Envoie des rappels FCM 24 h avant chaque RDV |

#### Triggers Firestore
| Fonction | Trigger | Description |
|---|---|---|
| `onAppointmentCreate` | `appointments/{id}` — create | Notifie les admins d'une nouvelle réservation |
| `onAppointmentUpdate` | `appointments/{id}` — update | Valide la règle des 24 h (côté serveur) |
| `onAppointmentDelete` | `appointments/{id}` — delete | Valide la règle des 24 h à la suppression |
| `onVehicleCreated` | `vehicles/{id}` — create | Notifie les clients abonnés (FCM) |
| `onVehicleUpdated` | `vehicles/{id}` — update | Notifie si véhicule à nouveau disponible |

#### Fonctions HTTPS Callable
| Fonction | Description |
|---|---|
| `validateAppointmentModification` | Pré-validation avant modification côté client |
| `getReviews` | Récupère les avis Google Business Profile |
| `postReply` | Publie une réponse à un avis Google |
| `initiateOAuth` | Démarre le flux OAuth Google |
| `handleOAuthCallback` | Traite le retour OAuth (échange du code) |
| `refreshOAuthToken` | Renouvelle le token d'accès Google |
| `disconnectOAuth` | Révoque et supprime les tokens Google |
| `sendInvoiceEmail` | Envoie une facture par e-mail |
| `sendQuotationEmail` | Envoie un devis par e-mail |

---

## 10. Sécurité

### 10.1 Authentification
- Firebase Authentication gère la création et validation des sessions JWT
- Les tokens ID Firebase sont vérifiés côté serveur via Firebase Admin SDK
- OAuth 2.0 pour l'intégration Google (avis) — tokens stockés dans Firestore (chiffré)

### 10.2 Autorisation (RBAC)
Les règles de sécurité Firestore (`firestore.rules`) appliquent le contrôle d'accès directement au niveau de la base de données :

```
Fonctions helper clés :
  isSignedIn()                   → Vérifie l'authentification
  isOwner(userId)                → Vérifie la propriété du document
  getUserRole()                  → Récupère le rôle (avec cache)
  isAdmin()                      → Vérifie le rôle admin
  isAgendaManager()              → Vérifie le rôle gestionnaire
  isAdminOrManager()             → Admin OU gestionnaire
  canClientModifyAppointment()   → Applique la règle des 24 h
```

### 10.3 Protection des données
- Les clients ne peuvent accéder qu'à **leurs propres** documents (`isOwner`)
- Les devis sont accessibles publiquement uniquement via un **token UUID v4** unique et opaque
- Les transactions Cloud Functions sont les seules habilitées à écrire dans `loyaltyTransactions`
- Les rôles utilisateurs ne peuvent être modifiés que par un admin (les utilisateurs ne peuvent pas se promouvoir eux-mêmes)

### 10.4 Secrets et variables d'environnement
- Toutes les clés API et secrets sont dans des variables d'environnement (`.env.local`)
- Aucun secret n'est inclus dans le code source
- Les variables `NEXT_PUBLIC_*` sont les seules exposées côté client

### 10.5 Validation des données
- Validation côté client (formulaires React)
- Validation côté serveur (Cloud Functions, règles Firestore)
- Protection contre les doubles réservations par **transactions Firestore atomiques**

---

## 11. Déploiement

### 11.1 Environnements

| Environnement | Usage | URL |
|---|---|---|
| Développement | `npm run dev` | `http://localhost:3000` |
| Production | Firebase Hosting | `https://<project-id>.web.app` |

### 11.2 Configuration Firebase

Services à activer dans la console Firebase :

1. **Authentication** — Email/Password + Google OAuth
2. **Cloud Firestore** — Mode production avec les règles du fichier `firestore.rules`
3. **Cloud Storage** — Bucket par défaut pour les images
4. **Cloud Messaging (FCM)** — Générer une paire de clés VAPID
5. **Cloud Functions** — Runtime Node.js 18

### 11.3 Commandes de déploiement

```bash
# Déploiement complet
firebase deploy

# Hosting uniquement (build requis au préalable)
npm run build
firebase deploy --only hosting

# Functions uniquement
firebase deploy --only functions

# Règles et index Firestore
firebase deploy --only firestore
```

### 11.4 Variables d'environnement en production

Les variables `FIREBASE_ADMIN_*` doivent être configurées dans les secrets Firebase Functions :

```bash
firebase functions:secrets:set FIREBASE_ADMIN_PRIVATE_KEY
firebase functions:secrets:set RESEND_API_KEY
firebase functions:secrets:set GOOGLE_OAUTH_CLIENT_SECRET
```

---

## 12. Glossaire

| Terme | Définition |
|---|---|
| **RDV** | Rendez-vous |
| **RBAC** | Role-Based Access Control — contrôle d'accès basé sur les rôles |
| **FCM** | Firebase Cloud Messaging — service de notifications push |
| **OAuth 2.0** | Protocole d'autorisation pour l'accès aux APIs tierces |
| **PWA** | Progressive Web App — application web installable avec support hors-ligne |
| **Service Worker** | Script JS s'exécutant en arrière-plan pour la gestion du cache et des notifications |
| **SSR** | Server-Side Rendering — rendu côté serveur |
| **SSG** | Static Site Generation — génération de pages statiques |
| **App Router** | Nouveau système de routage de Next.js 13+ basé sur le dossier `app/` |
| **Cloud Function** | Fonction serverless hébergée sur les serveurs Firebase |
| **Firestore** | Base de données NoSQL temps réel de Firebase |
| **VAPID** | Voluntary Application Server Identification — clés pour les notifications web push |
| **HT** | Hors Taxes |
| **TTC** | Toutes Taxes Comprises |
| **TVA** | Taxe sur la Valeur Ajoutée |
| **KPI** | Key Performance Indicator — indicateur clé de performance |
| **CRUD** | Create, Read, Update, Delete — opérations de base sur les données |
| **UUID** | Universally Unique Identifier — identifiant unique universel |
| **BFF** | Backend For Frontend — pattern d'architecture |
| **CDN** | Content Delivery Network — réseau de distribution de contenu |
| **ECU** | Electronic Control Unit — calculateur moteur (reprogrammation) |
