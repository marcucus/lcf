# Programme de Fidélité - Documentation

## Vue d'ensemble

Le programme de fidélité LCF Auto Performance permet aux clients de gagner des points pour chaque interaction avec le garage et d'échanger ces points contre des récompenses exclusives.

## Fonctionnalités

### Pour les Clients

#### Gagner des Points
- **Points par rendez-vous** : Les clients gagnent automatiquement des points lorsqu'un rendez-vous est marqué comme complété
- **Bonus de bienvenue** : Points offerts lors de la création d'un compte
- **Bonus spéciaux** : L'administrateur peut attribuer des points manuellement pour des occasions spéciales

#### Utiliser les Points
- Parcourir le catalogue de récompenses disponibles
- Échanger des points contre des récompenses (réductions, services gratuits, produits, etc.)
- Consulter l'historique complet des transactions de points
- Voir les récompenses réclamées et leur statut

#### Interface Utilisateur
- **Tableau de bord** : Carte affichant le solde actuel de points avec accès rapide
- **Page fidélité** (`/dashboard/loyalty`) : Vue d'ensemble du programme avec explications
- **Historique** (`/dashboard/loyalty/history`) : Liste détaillée de toutes les transactions
- **Récompenses** (`/dashboard/loyalty/rewards`) : Catalogue complet avec possibilité de réclamer

### Pour les Administrateurs

#### Gestion des Récompenses (`/admin/loyalty/rewards`)
- Créer de nouvelles récompenses
- Modifier les récompenses existantes
- Activer/désactiver des récompenses
- Définir le coût en points
- Gérer le stock (optionnel, pour récompenses limitées)
- Catégoriser les récompenses (réduction, service, produit, spécial)

#### Configuration du Programme (`/admin/loyalty/settings`)
- Points par rendez-vous complété
- Bonus de bienvenue pour nouveaux utilisateurs
- Bonus d'anniversaire (optionnel)
- Bonus de parrainage (optionnel)
- Points par euro dépensé (optionnel)
- Nombre minimum de points pour échanger une récompense

#### Gestion des Points Clients (`/admin/loyalty/users`)
- Voir tous les utilisateurs et leur solde de points
- Ajuster manuellement les points (ajouter ou retirer)
- Rechercher des clients par nom ou email
- Laisser une note pour chaque ajustement

## Architecture Technique

### Collections Firestore

#### `users` (étendue)
```typescript
{
  uid: string,
  email: string,
  firstName: string,
  lastName: string,
  role: 'user' | 'agendaManager' | 'admin',
  loyaltyPoints?: number,  // NOUVEAU
  createdAt: Timestamp
}
```

#### `loyaltyTransactions`
```typescript
{
  transactionId: string,
  userId: string,
  type: 'appointment_completed' | 'manual_adjustment' | 'reward_redemption' | 'bonus',
  points: number,  // Positif = gain, Négatif = dépense
  description: string,
  relatedAppointmentId?: string,
  relatedRewardId?: string,
  createdAt: Timestamp,
  createdBy?: string  // Pour ajustements manuels
}
```

#### `rewards`
```typescript
{
  rewardId: string,
  name: string,
  description: string,
  category: 'discount' | 'service' | 'product' | 'special',
  pointsCost: number,
  imageUrl?: string,
  isActive: boolean,
  stock?: number,  // Optionnel
  validUntil?: Timestamp,  // Optionnel
  createdAt: Timestamp
}
```

#### `userRewards`
```typescript
{
  userRewardId: string,
  userId: string,
  rewardId: string,
  rewardName: string,
  pointsSpent: number,
  status: 'available' | 'used' | 'expired',
  claimedAt: Timestamp,
  usedAt?: Timestamp,
  expiresAt?: Timestamp
}
```

#### `loyaltySettings` (document unique: `default`)
```typescript
{
  pointsPerAppointment: number,
  pointsPerEuroSpent?: number,
  welcomeBonusPoints?: number,
  birthdayBonusPoints?: number,
  referralBonusPoints?: number,
  minPointsForRedemption: number
}
```

### Fonctions Principales

#### Service Loyalty (`src/lib/firestore/loyalty.ts`)

##### Gestion des Points
- `getUserLoyaltyPoints(userId)` : Récupérer le solde de points
- `awardLoyaltyPoints(userId, points, type, description, ...)` : Attribuer des points
- `deductLoyaltyPoints(userId, points, rewardId, description)` : Déduire des points
- `getUserLoyaltyTransactions(userId, limit)` : Historique des transactions

##### Gestion des Récompenses
- `getActiveRewards()` : Liste des récompenses actives
- `getAllRewards()` : Toutes les récompenses (admin)
- `getRewardById(rewardId)` : Détails d'une récompense
- `createReward(rewardData)` : Créer une récompense
- `updateReward(rewardId, updates)` : Modifier une récompense

##### Réclamation de Récompenses
- `claimReward(userId, rewardId)` : Réclamer une récompense
- `getUserRewards(userId)` : Récompenses réclamées par l'utilisateur
- `markRewardAsUsed(userRewardId)` : Marquer comme utilisée

##### Paramètres
- `getLoyaltySettings()` : Récupérer les paramètres
- `updateLoyaltySettings(settings)` : Modifier les paramètres

##### Helpers
- `awardPointsForAppointment(userId, appointmentId)` : Attribution automatique
- `awardWelcomeBonus(userId)` : Bonus de bienvenue

### Intégrations

#### Avec l'Authentification
Dans `src/contexts/AuthContext.tsx` :
- Attribution automatique du bonus de bienvenue lors de la création de compte
- Initialisation du champ `loyaltyPoints` à 0

#### Avec les Rendez-vous
Dans `src/lib/firestore/appointments.ts` :
- Nouvelle fonction `completeAppointment(appointmentId)` qui :
  1. Marque le rendez-vous comme complété
  2. Attribue automatiquement les points au client

### Sécurité

#### Transactions Firestore
- Utilisation de transactions pour garantir l'intégrité des données
- Prévention des conditions de course lors de la réclamation de récompenses
- Vérification du solde avant déduction

#### Contrôle d'Accès
- Pages client : Accessibles uniquement aux utilisateurs authentifiés
- Pages admin : Protégées par `ProtectedRoute` avec `requiredRoles={['admin']}`

## Workflow Utilisateur

### Scénario 1 : Nouveau Client
1. Le client crée un compte
2. Il reçoit automatiquement le bonus de bienvenue (ex: 50 points)
3. Il peut consulter son solde sur le tableau de bord
4. Il prend un rendez-vous

### Scénario 2 : Rendez-vous Complété
1. Le client se rend au garage pour son rendez-vous
2. L'administrateur ou le gestionnaire marque le rendez-vous comme "complété"
3. Le client reçoit automatiquement les points configurés (ex: 10 points)
4. Une transaction est créée dans l'historique

### Scénario 3 : Réclamation de Récompense
1. Le client parcourt le catalogue de récompenses
2. Il sélectionne une récompense à 100 points
3. Il clique sur "Réclamer"
4. Le système vérifie qu'il a suffisamment de points
5. Les points sont déduits
6. La récompense apparaît dans "Mes récompenses"
7. Le client présente la récompense au garage

## Configuration Initiale

### Étape 1 : Créer le Document de Configuration
Créer manuellement dans Firestore le document `loyaltySettings/default` :
```json
{
  "pointsPerAppointment": 10,
  "welcomeBonusPoints": 50,
  "minPointsForRedemption": 100
}
```

### Étape 2 : Créer des Récompenses de Démo
Via l'interface admin `/admin/loyalty/rewards`, créer quelques récompenses :
- 10% de réduction sur le prochain service (100 points)
- Lavage gratuit (50 points)
- Inspection complète offerte (200 points)

### Étape 3 : Tester le Workflow
1. Créer un compte test
2. Vérifier le bonus de bienvenue
3. Créer et compléter un rendez-vous
4. Vérifier l'attribution des points
5. Réclamer une récompense

## Règles Firestore (À Implémenter)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Loyalty Transactions
    match /loyaltyTransactions/{transactionId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || hasRole('admin'));
      allow write: if false; // Seulement via les fonctions de service
    }
    
    // Rewards
    match /rewards/{rewardId} {
      allow read: if true; // Public pour consulter
      allow write: if hasRole('admin');
    }
    
    // User Rewards
    match /userRewards/{userRewardId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || hasRole('admin'));
      allow write: if false; // Seulement via les fonctions de service
    }
    
    // Loyalty Settings
    match /loyaltySettings/{settingId} {
      allow read: if true; // Public pour consulter les règles
      allow write: if hasRole('admin');
    }
  }
}
```

## Maintenance

### Surveiller
- Solde de points des utilisateurs
- Taux de réclamation des récompenses
- Stock des récompenses limitées

### Ajuster
- Augmenter/diminuer les points par rendez-vous selon l'engagement
- Créer des récompenses saisonnières
- Ajuster le stock des récompenses populaires

## Améliorations Futures Possibles

1. **Système de niveaux** : Bronze, Argent, Or avec avantages progressifs
2. **Points par euro dépensé** : Intégration avec système de facturation
3. **Bonus d'anniversaire** : Email automatique + points le jour de l'anniversaire
4. **Programme de parrainage** : Points bonus pour parrainer de nouveaux clients
5. **Notifications push** : Alertes pour points gagnés, nouvelles récompenses
6. **Expiration des points** : Points valables 12 mois pour encourager l'utilisation
7. **Récompenses limitées dans le temps** : Offres spéciales temporaires
8. **Statistiques avancées** : Tableau de bord analytics pour l'admin
9. **QR Code** : Scan pour utiliser une récompense en magasin
10. **Gamification** : Défis mensuels pour gagner des points bonus

## Support

Pour toute question sur le programme de fidélité, contacter l'équipe de développement.

---

**Dernière mise à jour** : 2024
**Version** : 1.0
