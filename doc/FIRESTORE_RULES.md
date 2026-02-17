# Déploiement des règles Firestore

## Règles de sécurité actuelles

Le fichier `firestore.rules` définit les permissions suivantes :

### 1. **Users Collection** (`/users/{userId}`)
- ✅ Les utilisateurs peuvent lire et modifier uniquement leurs propres données
- ❌ Pas d'accès aux données des autres utilisateurs

### 2. **UserVehicles Collection** (`/userVehicles/{vehicleId}`)
- ✅ Les utilisateurs peuvent créer, lire, modifier et supprimer uniquement leurs propres véhicules
- 🔒 Sécurisé par `userId` dans les documents

### 3. **Appointments Collection** (`/appointments/{appointmentId}`)
- ✅ Les utilisateurs peuvent créer et voir leurs propres rendez-vous
- ✅ Les administrateurs peuvent voir et modifier tous les rendez-vous
- ✅ Seuls les admins peuvent supprimer des rendez-vous

### 4. **Services Collection** (`/services/{serviceId}`)
- ✅ Lecture publique (pour afficher les services disponibles)
- 🔒 Modification réservée aux administrateurs

---

## Déploiement des règles

### Option 1 : Via Firebase Console (Recommandé pour débutants)

1. **Connectez-vous à Firebase Console**
   - Allez sur https://console.firebase.google.com/
   - Sélectionnez votre projet **projectcar-2ee73**

2. **Accédez à Firestore**
   - Dans le menu de gauche, cliquez sur **Firestore Database**
   - Cliquez sur l'onglet **Règles** (Rules)

3. **Copiez-collez les règles**
   - Ouvrez le fichier `firestore.rules` de ce projet
   - Copiez tout le contenu
   - Collez-le dans l'éditeur de règles Firebase
   - Cliquez sur **Publier** (Publish)

### Option 2 : Via Firebase CLI

1. **Installez Firebase CLI** (si pas déjà installé)
   ```bash
   npm install -g firebase-tools
   ```

2. **Connectez-vous à Firebase**
   ```bash
   firebase login
   ```

3. **Initialisez Firebase dans le projet** (si pas déjà fait)
   ```bash
   firebase init firestore
   ```
   - Sélectionnez votre projet **projectcar-2ee73**
   - Utilisez `firestore.rules` comme fichier de règles

4. **Déployez les règles**
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## Vérification des règles

Après déploiement, testez les scénarios suivants :

### ✅ Tests à effectuer

1. **Véhicules**
   - Un utilisateur peut créer un véhicule ✓
   - Un utilisateur peut voir ses propres véhicules ✓
   - Un utilisateur NE PEUT PAS voir les véhicules d'un autre utilisateur ✗
   - Un utilisateur peut modifier/supprimer ses véhicules ✓

2. **Rendez-vous**
   - Un utilisateur peut créer un rendez-vous ✓
   - Un utilisateur peut voir ses rendez-vous ✓
   - Un admin peut voir tous les rendez-vous ✓
   - Un utilisateur NE PEUT PAS modifier les rendez-vous d'autres ✗

3. **Services**
   - Tout le monde peut lire les services ✓
   - Seuls les admins peuvent créer/modifier les services ✓

---

## Structure des données

### UserVehicles Document
```javascript
{
  vehicleId: "auto-generated-id",
  userId: "user-uid",           // IMPORTANT: doit correspondre à l'utilisateur
  plate: "AA-123-BB",
  make: "Renault",
  model: "Clio",
  year: 2021,                   // optionnel
  color: "Bleu",                // optionnel
  createdAt: Timestamp,
  lastUsed: Timestamp
}
```

### Appointments Document
```javascript
{
  appointmentId: "auto-generated-id",
  userId: "user-uid",           // IMPORTANT: doit correspondre à l'utilisateur
  serviceType: "entretien",
  date: Timestamp,
  vehicleInfo: {
    plate: "AA-123-BB",
    make: "Renault",
    model: "Clio"
  },
  // ... autres champs
}
```

---

## Troubleshooting

### Erreur : "Missing or insufficient permissions"

**Cause** : Les règles n'ont pas été déployées ou sont trop restrictives.

**Solution** :
1. Vérifiez que les règles sont bien déployées dans Firebase Console
2. Vérifiez que le `userId` est bien présent dans les documents
3. Vérifiez que l'utilisateur est bien authentifié (`request.auth != null`)

### Erreur : "Document doesn't exist"

**Cause** : Tentative de lecture d'un document qui n'existe pas.

**Solution** :
- Pour la création, utilisez `request.resource.data` au lieu de `resource.data`
- Pour la lecture/modification, assurez-vous que le document existe

---

## Bonnes pratiques

1. **Toujours inclure userId** dans les documents créés par les utilisateurs
2. **Tester les règles** dans l'onglet "Règles" de Firebase Console (simulateur intégré)
3. **Ne jamais utiliser** `allow read, write: if true` en production
4. **Limiter les requêtes** avec des index appropriés
5. **Monitorer les accès** via Firebase Console > Usage

---

## Prochaines étapes

1. ✅ Déployer les règles Firestore
2. ✅ Tester la création de véhicules
3. ✅ Tester la prise de rendez-vous
4. ⏳ Ajouter la page véhicules dans la navigation
5. ⏳ Créer les index Firestore si nécessaire
