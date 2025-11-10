# Module de Gestion des Devis (Quotations)

## Vue d'ensemble

Le module de gestion des devis permet aux administrateurs de créer, éditer, gérer et envoyer des devis aux clients. Ce module est intégré dans le panneau d'administration et suit les mêmes patterns architecturaux que les autres modules de l'application.

## Fonctionnalités

### 1. Création et Édition de Devis

Les administrateurs peuvent créer des devis avec les éléments suivants :

- **Informations client** :
  - Nom (requis)
  - Email (requis)
  - Téléphone (optionnel)
  - Adresse (optionnel)

- **Liens optionnels** :
  - Lier à un utilisateur existant
  - Lier à un rendez-vous existant
  - Ou créer un devis sans attache

- **Articles/Services** :
  - Description
  - Quantité
  - Prix unitaire (€)
  - Taux de TVA (%)
  - Total calculé automatiquement

- **Détails additionnels** :
  - Notes pour le client
  - Notes internes (visibles uniquement par les administrateurs)
  - Date de validité du devis

### 2. Gestion des Devis

Le module offre une vue complète de tous les devis avec :

- **Filtrage par statut** :
  - Brouillon (draft)
  - Envoyé (sent)
  - Accepté (accepted)
  - Refusé (rejected)
  - Expiré (expired)
  - Converti en facture (converted)

- **Actions disponibles** :
  - Modifier un devis
  - Supprimer un devis (avec confirmation)
  - Envoyer par email
  - Convertir en facture (prévu pour intégration future)

### 3. Numérotation Automatique

Chaque devis reçoit automatiquement un numéro unique au format :
```
DEV-YYYY-###
```
Exemple : `DEV-2024-001`, `DEV-2024-002`, etc.

Le système incrémente automatiquement le compteur pour chaque année.

### 4. Calculs Automatiques

Le système calcule automatiquement :
- **Sous-total HT** : Somme des prix de tous les articles
- **Total TVA** : Somme de toutes les taxes
- **Total TTC** : Sous-total HT + Total TVA

Les calculs sont effectués en temps réel lors de la saisie et arrondis à 2 décimales.

## Architecture Technique

### Structure des Données

#### Type `QuotationItem`
```typescript
{
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // en pourcentage (ex: 20 pour 20%)
  total: number; // quantity * unitPrice
}
```

#### Type `Quotation`
```typescript
{
  quotationId: string;
  quotationNumber: string; // DEV-YYYY-###
  status: QuotationStatus;
  
  // Liens optionnels
  userId?: string;
  appointmentId?: string;
  
  // Informations client
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress?: string;
  
  // Détails du devis
  items: QuotationItem[];
  subtotal: number;
  totalTax: number;
  totalAmount: number;
  
  // Détails optionnels
  notes?: string;
  internalNotes?: string;
  validUntil?: Timestamp;
  
  // Suivi de conversion
  convertedToInvoice?: boolean;
  invoiceId?: string;
  
  // Métadonnées
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  sentAt?: Timestamp;
}
```

### Firestore Operations

Toutes les opérations Firestore sont disponibles dans `/src/lib/firestore/quotations.ts` :

- `createQuotation()` - Créer un nouveau devis
- `getAllQuotations()` - Récupérer tous les devis
- `getQuotationById()` - Récupérer un devis par ID
- `getQuotationsByUserId()` - Récupérer les devis d'un utilisateur
- `getQuotationsByAppointmentId()` - Récupérer les devis d'un rendez-vous
- `updateQuotation()` - Mettre à jour un devis
- `updateQuotationStatus()` - Mettre à jour le statut
- `markQuotationAsConverted()` - Marquer comme converti en facture
- `deleteQuotation()` - Supprimer un devis

### Composants UI

1. **QuotationForm** (`/src/components/admin/QuotationForm.tsx`)
   - Formulaire complet de création/édition
   - Validation des données
   - Calculs automatiques en temps réel

2. **QuotationCard** (`/src/components/admin/QuotationCard.tsx`)
   - Affichage d'un devis en carte
   - Badges de statut
   - Actions rapides

3. **QuotationsPage** (`/src/app/admin/devis/page.tsx`)
   - Page principale de gestion
   - Liste/grille des devis
   - Filtrage et recherche

### Sécurité Firestore

Règles de sécurité définies dans `firestore.rules` :

```javascript
match /quotations/{quotationId} {
  // Seuls les administrateurs peuvent gérer les devis
  allow read, write: if isAdmin();
  
  // Les utilisateurs peuvent lire leurs propres devis
  allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
}
```

### Cloud Functions

Une Cloud Function placeholder est disponible pour l'envoi d'emails :
- Fichier : `/functions/src/quotations/sendQuotationEmail.ts`
- Fonction : `sendQuotationEmail`
- TODO : Configuration du service d'email (SendGrid, Nodemailer, etc.)
- TODO : Génération de PDF

## Accès au Module

### Navigation
- **Dashboard Admin** : Lien "📄 Devis"
- **Sidebar Admin** : Section "Devis"
- **URL directe** : `/admin/devis`

### Permissions
- **Lecture/Écriture** : Admin uniquement
- **Lecture propre** : Utilisateurs (si le devis leur est lié)

## Intégrations Futures

### 1. Envoi par Email
- Configuration d'un service d'email (SendGrid recommandé)
- Génération de template HTML
- Génération de PDF avec pdfkit ou puppeteer
- Envoi avec pièce jointe PDF

### 2. Conversion en Facture
- Création du module facture
- Fonction de conversion : copie des données du devis vers une nouvelle facture
- Mise à jour du statut du devis vers "converted"
- Lien bidirectionnel devis ↔ facture

### 3. Envoi aux Clients (Frontend)
- Espace client pour consulter les devis
- Acceptation/refus en ligne
- Téléchargement PDF

## Exemples d'Utilisation

### Créer un Devis Simple

```typescript
import { createQuotation } from '@/lib/firestore/quotations';

await createQuotation(
  adminUid,
  'Jean Dupont',
  'jean.dupont@email.com',
  [
    {
      description: 'Vidange complète',
      quantity: 1,
      unitPrice: 80.00,
      taxRate: 20,
      total: 80.00
    },
    {
      description: 'Filtre à huile',
      quantity: 1,
      unitPrice: 15.00,
      taxRate: 20,
      total: 15.00
    }
  ],
  {
    notes: 'Prévoir 1h d\'intervention',
    validUntil: new Date('2024-12-31'),
    status: 'draft'
  }
);
```

### Lier à un Utilisateur et un Rendez-vous

```typescript
await createQuotation(
  adminUid,
  'Marie Martin',
  'marie.martin@email.com',
  items,
  {
    userId: 'user123',
    appointmentId: 'appt456',
    status: 'sent'
  }
);
```

## Tests

Aucun test automatisé n'a été créé dans cette première implémentation. Les tests devraient couvrir :

1. Génération de numéros de devis
2. Calculs de totaux
3. Validation des données
4. Règles de sécurité Firestore
5. Fonctions Cloud

## Maintenance et Support

Pour toute question ou bug, référez-vous au cahier des charges (`specifications.md`) et aux patterns existants dans les modules similaires (véhicules, rendez-vous).

## Changelog

### Version 1.0.0 (2024-11-10)
- ✅ Création du module de base
- ✅ CRUD complet des devis
- ✅ Interface d'administration
- ✅ Calculs automatiques
- ✅ Liens optionnels (utilisateurs/rendez-vous)
- ✅ Système de statuts
- ✅ Règles de sécurité Firestore
- ⏳ Envoi par email (placeholder)
- ⏳ Conversion en facture (en attente du module facture)
- ⏳ Génération PDF (à implémenter)
