# Configuration OAuth Google Business Profile

Ce document décrit la procédure de configuration de l'intégration OAuth 2.0 avec Google Business Profile pour permettre à l'application de gérer les avis Google.

## Prérequis

1. Un compte Google Business Profile actif
2. Un projet Google Cloud Platform (GCP)
3. Accès administrateur à l'application LCF

## Étape 1 : Configuration Google Cloud Platform

### 1.1 Créer un projet Google Cloud

1. Accédez à [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Notez l'ID du projet

### 1.2 Activer l'API Google Business Profile

1. Dans votre projet GCP, accédez à "APIs & Services" > "Library"
2. Recherchez "Google Business Profile API"
3. Cliquez sur "Enable" pour activer l'API

### 1.3 Configurer l'écran de consentement OAuth

1. Allez dans "APIs & Services" > "OAuth consent screen"
2. Sélectionnez "Internal" ou "External" selon vos besoins
3. Remplissez les informations requises :
   - Nom de l'application : "LCF Auto Performance"
   - Email de support utilisateur
   - Logo de l'application (optionnel)
4. Ajoutez les scopes nécessaires :
   - `https://www.googleapis.com/auth/business.manage`
5. Ajoutez les utilisateurs de test si nécessaire (en mode External)
6. Enregistrez et continuez

### 1.4 Créer les credentials OAuth 2.0

1. Allez dans "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" > "OAuth client ID"
3. Sélectionnez "Web application"
4. Configurez :
   - **Nom** : "LCF OAuth Client"
   - **URIs de redirection autorisées** :
     ```
     https://[REGION]-[PROJECT-ID].cloudfunctions.net/handleOAuthCallback
     ```
     Remplacez `[REGION]` et `[PROJECT-ID]` par vos valeurs Firebase
5. Cliquez sur "Create"
6. **IMPORTANT** : Notez le `Client ID` et `Client Secret` générés

## Étape 2 : Configuration Firebase

### 2.1 Configurer les variables d'environnement Cloud Functions

Utilisez Firebase CLI pour configurer les variables d'environnement :

```bash
firebase functions:config:set \
  google.client_id="VOTRE_CLIENT_ID" \
  google.client_secret="VOTRE_CLIENT_SECRET" \
  google.redirect_uri="https://[REGION]-[PROJECT-ID].cloudfunctions.net/handleOAuthCallback"
```

Ou ajoutez-les directement dans le fichier `.env` des Cloud Functions :

```env
GOOGLE_OAUTH_CLIENT_ID=votre_client_id_ici
GOOGLE_OAUTH_CLIENT_SECRET=votre_client_secret_ici
GOOGLE_OAUTH_REDIRECT_URI=https://[REGION]-[PROJECT-ID].cloudfunctions.net/handleOAuthCallback
```

### 2.2 Déployer les Cloud Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

Les fonctions suivantes seront déployées :
- `initiateOAuth` : Initie le flux OAuth
- `handleOAuthCallback` : Gère le callback OAuth
- `refreshOAuthToken` : Rafraîchit le token d'accès
- `disconnectOAuth` : Déconnecte l'application
- `autoRefreshTokens` : Rafraîchissement automatique toutes les 12h

### 2.3 Configurer les règles Firestore

Ajoutez les règles de sécurité pour la collection `googleOAuthConfig` :

```javascript
match /googleOAuthConfig/{configId} {
  // Seuls les administrateurs peuvent lire/écrire la configuration OAuth
  allow read, write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

## Étape 3 : Configuration dans l'application

### 3.1 Connexion initiale

1. Connectez-vous à l'application avec un compte administrateur
2. Accédez à la page `/admin/avis`
3. Cliquez sur "Se connecter avec Google"
4. Autorisez l'application à accéder à votre Google Business Profile
5. Vous serez redirigé vers l'application une fois l'autorisation accordée

### 3.2 Vérification de la connexion

Sur la page `/admin/avis`, vous devriez voir :
- **Statut** : "Connecté" (en vert)
- **Dernière synchronisation** : Date/heure
- **Expiration du token** : Date/heure d'expiration

### 3.3 Gestion de la connexion

- **Rafraîchir le token** : Cliquez sur "Rafraîchir le token" si le token est expiré
- **Déconnecter** : Cliquez sur "Déconnecter" pour révoquer l'accès

## Architecture technique

### Flux OAuth 2.0

```
1. Admin clique sur "Se connecter"
   ↓
2. API Route /api/oauth/initiate appelle la Cloud Function initiateOAuth
   ↓
3. Redirection vers Google OAuth avec scopes appropriés
   ↓
4. Utilisateur autorise l'application
   ↓
5. Google redirige vers handleOAuthCallback avec le code d'autorisation
   ↓
6. Cloud Function échange le code contre access_token et refresh_token
   ↓
7. Tokens stockés dans Firestore (collection: googleOAuthConfig)
   ↓
8. Redirection vers /admin/avis avec succès
```

### Sécurité

- **Tokens** : Stockés dans Firestore avec accès restreint aux admins
- **Refresh automatique** : Fonction planifiée qui rafraîchit le token toutes les 12h
- **Révocation** : Tokens révoqués auprès de Google lors de la déconnexion
- **Authentification** : Toutes les API vérifient le rôle admin avant toute opération

### Collection Firestore : googleOAuthConfig

```typescript
interface GoogleOAuthConfig {
  configId: string;              // ID du document (généralement "default")
  accessToken: string;           // Token d'accès Google
  refreshToken: string;          // Token de rafraîchissement
  tokenExpiresAt: Timestamp;     // Date d'expiration du token
  accountId?: string;            // ID du compte Google Business Profile
  locationId?: string;           // ID de la localisation
  isConnected: boolean;          // Statut de la connexion
  lastSync?: Timestamp;          // Dernière synchronisation
  createdAt: Timestamp;          // Date de création
  updatedAt: Timestamp;          // Dernière mise à jour
}
```

## Dépannage

### Le token a expiré

Si le token expire :
1. Cliquez sur "Rafraîchir le token" sur la page `/admin/avis`
2. Si cela ne fonctionne pas, déconnectez et reconnectez-vous

### Erreur lors de la connexion

- Vérifiez que l'API Google Business Profile est activée dans GCP
- Vérifiez que les credentials OAuth sont correctement configurés
- Vérifiez que l'URI de redirection est correctement configurée
- Vérifiez les logs Cloud Functions pour plus de détails

### Token rafraîchissement automatique ne fonctionne pas

- Vérifiez que la fonction `autoRefreshTokens` est déployée
- Vérifiez les logs de la fonction planifiée
- Assurez-vous que le refresh_token est stocké dans Firestore

## Maintenance

### Rotation des credentials

Si vous devez changer les credentials OAuth :
1. Créez de nouveaux credentials dans Google Cloud Console
2. Mettez à jour les variables d'environnement Firebase
3. Redéployez les Cloud Functions
4. Demandez aux administrateurs de se reconnecter

### Monitoring

Surveillez les logs Cloud Functions pour :
- Erreurs de rafraîchissement de token
- Tentatives d'accès non autorisées
- Expiration imminente des tokens

## Prochaines étapes

Une fois la configuration OAuth terminée, vous pourrez :
1. Récupérer et afficher les avis Google
2. Répondre aux avis directement depuis l'interface admin
3. Gérer des modèles de réponses
4. Automatiser certaines réponses (fonctionnalité future)
