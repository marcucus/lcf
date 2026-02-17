# Guide de Configuration des Notifications Push FCM

Ce guide vous aidera à configurer Firebase Cloud Messaging (FCM) pour activer les notifications push dans l'application LCF Auto Performance.

## Prérequis

- Un projet Firebase configuré
- Accès à la console Firebase
- Firebase CLI installé (`npm install -g firebase-tools`)

## Étape 1 : Activer Firebase Cloud Messaging

1. Accédez à la [Console Firebase](https://console.firebase.google.com)
2. Sélectionnez votre projet
3. Dans le menu latéral, cliquez sur **Project Settings** (⚙️)
4. Allez dans l'onglet **Cloud Messaging**

## Étape 2 : Générer la clé VAPID

1. Dans l'onglet **Cloud Messaging**, trouvez la section **Web Push certificates**
2. Cliquez sur **Generate key pair** pour créer une nouvelle clé VAPID
3. Copiez la clé générée (elle ressemble à : `BKxyz...`)

## Étape 3 : Configuration des Variables d'Environnement

1. Ouvrez le fichier `.env.local` à la racine du projet
2. Ajoutez la clé VAPID :

```bash
# Firebase Cloud Messaging
NEXT_PUBLIC_FIREBASE_VAPID_KEY=votre_cle_vapid_ici
```

3. Vérifiez que toutes les autres variables Firebase sont configurées :

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## Étape 4 : Configuration du Service Worker

1. Ouvrez le fichier `public/firebase-messaging-sw.js`
2. Remplacez les valeurs de placeholder par votre configuration Firebase :

```javascript
const firebaseConfig = {
  apiKey: 'VOTRE_API_KEY',
  authDomain: 'VOTRE_AUTH_DOMAIN',
  projectId: 'VOTRE_PROJECT_ID',
  storageBucket: 'VOTRE_STORAGE_BUCKET',
  messagingSenderId: 'VOTRE_MESSAGING_SENDER_ID',
  appId: 'VOTRE_APP_ID'
};
```

⚠️ **Important** : Ces valeurs doivent correspondre exactement à votre configuration Firebase.

## Étape 5 : Déploiement des Cloud Functions

Les Cloud Functions sont nécessaires pour l'envoi automatique des notifications.

### Installation

```bash
cd functions
npm install
```

### Configuration Firebase Admin

Pour les Cloud Functions, Firebase Admin SDK est configuré automatiquement lors du déploiement.

### Build

```bash
npm run build
```

### Déploiement

```bash
# Connexion à Firebase (si pas encore fait)
firebase login

# Déployer toutes les fonctions
npm run deploy

# Ou déployer individuellement
firebase deploy --only functions:sendAppointmentReminders
firebase deploy --only functions:onAppointmentCreated
firebase deploy --only functions:onVehicleCreated
firebase deploy --only functions:onVehicleUpdated
```

## Étape 6 : Déploiement des Règles de Sécurité

Les règles Firestore doivent être déployées pour sécuriser l'accès aux tokens FCM :

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Étape 7 : Test de la Configuration

### Test Client

1. Lancez l'application en mode développement :
   ```bash
   npm run dev
   ```

2. Connectez-vous avec un compte utilisateur

3. Allez dans le **Dashboard**

4. Dans la section "Notifications Push" :
   - Cliquez sur **Activer**
   - Accordez les permissions dans le navigateur
   - Vérifiez que le statut passe à "Notifications activées"

5. Configurez vos préférences de notification

### Test des Cloud Functions

#### Test des rappels de rendez-vous

1. Créez un rendez-vous dans 24h
2. Attendez que la fonction planifiée s'exécute (ou testez manuellement)
3. Vérifiez la réception de la notification

#### Test des notifications de véhicules

1. Depuis l'interface admin, ajoutez un nouveau véhicule
2. Vérifiez que les utilisateurs abonnés reçoivent la notification

### Vérification des Logs

```bash
# Logs des Cloud Functions
firebase functions:log

# Logs d'une fonction spécifique
firebase functions:log --only sendAppointmentReminders
```

## Fonctionnalités des Notifications

### Types de Notifications

1. **Rappels de rendez-vous** (`appointmentReminders`)
   - Envoyée 24h avant le rendez-vous
   - Contient : date, heure, type de service
   - Lien direct vers le dashboard
   - Pour les clients uniquement

2. **Nouveaux rendez-vous** (`newAppointments`)
   - Envoyée aux admins/gestionnaires lors de la création d'un nouveau rendez-vous
   - Contient : nom du client, date, heure, type de service
   - Lien direct vers le calendrier admin
   - Pour les administrateurs et gestionnaires d'agenda uniquement

3. **Nouveaux véhicules** (`newVehicles`)
   - Envoyée lors de l'ajout d'un véhicule
   - Contient : marque, modèle, année, prix
   - Lien direct vers la fiche du véhicule

4. **Actualités générales** (`generalUpdates`)
   - Pour les promotions et actualités
   - À implémenter selon les besoins

### Préférences Utilisateur

Les utilisateurs peuvent :
- Activer/désactiver les notifications globalement
- Choisir les types de notifications à recevoir
- Gérer les permissions du navigateur

Les administrateurs et gestionnaires d'agenda ont également :
- Option pour recevoir les notifications de nouveaux rendez-vous (`newAppointments`)

## Dépannage

### Les notifications ne s'affichent pas

1. **Vérifier les permissions du navigateur**
   - Chrome : Paramètres → Confidentialité → Notifications
   - Firefox : Préférences → Vie privée → Notifications
   - Safari : Préférences → Sites web → Notifications

2. **Vérifier la clé VAPID**
   - Elle doit correspondre à celle de la console Firebase
   - Elle doit être dans `.env.local` avec le préfixe `NEXT_PUBLIC_`

3. **Vérifier le service worker**
   - Ouvrir DevTools → Application → Service Workers
   - Le service worker doit être actif
   - Configuration Firebase doit être correcte

4. **Vérifier les logs**
   - Console du navigateur pour les erreurs client
   - Firebase Functions logs pour les erreurs serveur

### La fonction planifiée ne s'exécute pas

1. Vérifier le fuseau horaire dans `appointmentReminders.ts` (Europe/Paris)
2. Vérifier que la fonction est déployée : `firebase functions:list`
3. Consulter les logs : `firebase functions:log`

### Les tokens FCM ne sont pas sauvegardés

1. Vérifier les règles Firestore
2. Vérifier que l'utilisateur est bien authentifié
3. Consulter les erreurs dans la console du navigateur

## Support

Pour plus d'informations :
- [Documentation Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Documentation Cloud Functions](https://firebase.google.com/docs/functions)
- [Guide des Web Push Notifications](https://web.dev/push-notifications-overview/)

## Sécurité

⚠️ **Bonnes pratiques** :
- Ne jamais commiter les clés Firebase dans le code
- Utiliser `.env.local` pour les variables sensibles
- `.env.local` est dans `.gitignore` par défaut
- Les Cloud Functions utilisent Firebase Admin SDK avec privilèges élevés
- Les règles Firestore protègent l'accès aux données

## Coûts

Les notifications push ont des implications de coûts :

- **FCM** : Gratuit pour les notifications push web
- **Cloud Functions** :
  - `sendAppointmentReminders` : ~730 invocations/mois (1x/heure)
  - Firestore triggers : selon le nombre de créations/modifications
  - Niveau gratuit Firebase : 2M invocations/mois

Le coût reste très raisonnable pour une utilisation normale.
