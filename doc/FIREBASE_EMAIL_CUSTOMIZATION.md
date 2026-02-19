# Guide de Personnalisation des Emails Firebase

Ce guide explique comment personnaliser les emails envoyés par Firebase Authentication (réinitialisation de mot de passe, vérification d'email, etc.) pour qu'ils correspondent à l'identité visuelle de LCF AUTO PERFORMANCE.

## 📋 Vue d'ensemble

Firebase Authentication envoie automatiquement des emails pour :
- Réinitialisation de mot de passe
- Vérification d'adresse email
- Changement d'adresse email

Ces emails peuvent être personnalisés via la Console Firebase pour améliorer l'expérience utilisateur et renforcer l'identité de marque.

## 🎨 Configuration dans Firebase Console

### Étape 1 : Accéder aux Templates d'Email

1. Connectez-vous à la [Console Firebase](https://console.firebase.google.com/)
2. Sélectionnez votre projet LCF AUTO PERFORMANCE
3. Dans le menu latéral, cliquez sur **Authentication**
4. Cliquez sur l'onglet **Templates** en haut de la page

### Étape 2 : Personnaliser le Template de Réinitialisation de Mot de Passe

1. Dans la liste des templates, sélectionnez **Réinitialisation de mot de passe** (Password reset)
2. Cliquez sur l'icône crayon (✏️) pour éditer

#### Configuration Recommandée

**Nom de l'expéditeur :**
```
LCF AUTO PERFORMANCE
```

**Adresse email de réponse (optionnel) :**
```
lcfautoperformance@outlook.fr
```

**Objet de l'email :**
```
Réinitialisation de votre mot de passe LCF AUTO PERFORMANCE
```

**Corps de l'email (HTML personnalisé) :**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', 'Poppins', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    
                    <!-- Header with Brand Color -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1CCEFF 0%, #0099CC 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; font-family: 'Poppins', Arial, sans-serif;">
                                LCF AUTO PERFORMANCE
                            </h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                                Garage automobile de confiance
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Icon Section -->
                    <tr>
                        <td align="center" style="padding: 30px 30px 10px 30px;">
                            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, rgba(28, 206, 255, 0.1) 0%, rgba(28, 206, 255, 0.2) 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1CCEFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 20px 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #212529; font-size: 24px; font-weight: 600; text-align: center;">
                                Réinitialisation de mot de passe
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; color: #495057; font-size: 16px; line-height: 1.6; text-align: center;">
                                Bonjour,
                            </p>
                            
                            <p style="margin: 0 0 20px 0; color: #495057; font-size: 16px; line-height: 1.6; text-align: center;">
                                Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte <strong>%EMAIL%</strong>.
                            </p>
                            
                            <p style="margin: 0 0 30px 0; color: #495057; font-size: 16px; line-height: 1.6; text-align: center;">
                                Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
                            </p>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="%LINK%" style="display: inline-block; background: linear-gradient(135deg, #1CCEFF 0%, #0099CC 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(28, 206, 255, 0.3);">
                                            Réinitialiser mon mot de passe
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                                Ce lien expirera dans <strong>1 heure</strong> pour des raisons de sécurité.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Important Notice -->
                    <tr>
                        <td style="padding: 20px 40px;">
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                                    <strong>⚠️ Vous n'avez pas demandé cette réinitialisation ?</strong><br>
                                    Si vous n'avez pas initié cette demande, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel reste inchangé.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Alternative Link -->
                    <tr>
                        <td style="padding: 0 40px 30px 40px;">
                            <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                                <a href="%LINK%" style="color: #1CCEFF; word-break: break-all;">%LINK%</a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #dee2e6;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0 0 10px 0; color: #212529; font-size: 16px; font-weight: 600;">
                                            LCF AUTO PERFORMANCE
                                        </p>
                                        <p style="margin: 0 0 5px 0; color: #6c757d; font-size: 13px;">
                                            📍 [Votre Adresse Complète]
                                        </p>
                                        <p style="margin: 0 0 5px 0; color: #6c757d; font-size: 13px;">
                                            📞 <a href="tel:+33123456789" style="color: #1CCEFF; text-decoration: none;">01 23 45 67 89</a>
                                        </p>
                                        <p style="margin: 0 0 15px 0; color: #6c757d; font-size: 13px;">
                                            📧 <a href="mailto:lcfautoperformance@outlook.fr" style="color: #1CCEFF; text-decoration: none;">lcfautoperformance@outlook.fr</a>
                                        </p>
                                        
                                        <!-- Social Links -->
                                        <div style="margin-top: 15px;">
                                            <a href="#" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                                                <span style="color: #1CCEFF;">Facebook</span>
                                            </a>
                                            <span style="color: #dee2e6;">|</span>
                                            <a href="#" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                                                <span style="color: #1CCEFF;">Instagram</span>
                                            </a>
                                        </div>
                                        
                                        <p style="margin: 20px 0 0 0; color: #adb5bd; font-size: 12px;">
                                            © 2024 LCF AUTO PERFORMANCE. Tous droits réservés.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

### Étape 3 : Configurer l'URL de Redirection

⚠️ **IMPORTANT** : Pour que les utilisateurs soient redirigés vers votre page personnalisée après avoir cliqué sur le lien, vous devez configurer l'URL d'action dans Firebase Console.

1. Dans Firebase Console, allez dans **Authentication** > **Settings** (Paramètres)
2. Cliquez sur **Authorized domains** (Domaines autorisés)
3. Ajoutez votre domaine personnalisé (ex: `lcf-auto-performance.fr`)
4. Dans l'onglet **Templates**, pour chaque template d'email :
   - Cliquez sur **Customize action URL** (Personnaliser l'URL d'action)
   - Entrez : `https://votre-domaine.fr/auth/action`
   - Cette URL doit pointer vers la page que nous avons créée dans `/src/app/auth/action/page.tsx`

### Étape 4 : Tester les Emails

1. Utilisez l'environnement de développement pour tester
2. Allez sur la page `/reset-password`
3. Entrez une adresse email de test
4. Vérifiez que l'email reçu :
   - Affiche correctement le design LCF
   - Le bouton d'action est stylisé
   - Le lien redirige vers votre page `/auth/action`

## 🎨 Personnalisations Supplémentaires

### Variables Dynamiques Disponibles

Firebase remplace automatiquement ces variables dans vos templates :

- `%EMAIL%` : L'adresse email de l'utilisateur
- `%LINK%` : Le lien d'action sécurisé généré par Firebase
- `%APP_NAME%` : Le nom de votre application (configuré dans Firebase)

### Conseils de Design

1. **Cohérence de marque** :
   - Utilisez la couleur accent (#1CCEFF) pour tous les boutons et liens
   - Gardez le logo LCF visible en haut de l'email
   - Utilisez les mêmes polices que le site web (Inter, Poppins)

2. **Responsive Design** :
   - Le template fourni est optimisé pour mobile
   - Testez sur différents clients email (Gmail, Outlook, Apple Mail)

3. **Accessibilité** :
   - Assurez-vous que le texte a un bon contraste
   - Fournissez toujours un lien texte alternatif au bouton

4. **Sécurité** :
   - Indiquez clairement l'expiration du lien (1 heure)
   - Expliquez quoi faire si l'utilisateur n'a pas fait la demande

## 📧 Templates Additionnels

### Template de Vérification d'Email

Suivez la même structure que le template de réinitialisation de mot de passe, mais adaptez :

**Objet :**
```
Vérifiez votre adresse email - LCF AUTO PERFORMANCE
```

**Titre principal :**
```
Vérification d'adresse email
```

**Message :**
```
Bienvenue chez LCF AUTO PERFORMANCE ! 

Pour activer votre compte et commencer à profiter de nos services, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.
```

### Template de Changement d'Email

**Objet :**
```
Confirmez votre nouvelle adresse email
```

**Message :**
```
Nous avons reçu une demande de modification d'adresse email pour votre compte LCF AUTO PERFORMANCE.

Cliquez sur le bouton ci-dessous pour confirmer votre nouvelle adresse email.
```

## 🔧 Développement Local

Pour tester les emails en développement local :

1. Utilisez [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite)
2. Les emails seront interceptés et affichés dans l'interface de l'émulateur
3. Vous pouvez visualiser le rendu HTML sans envoyer de vrais emails

```bash
# Installer l'émulateur
npm install -g firebase-tools

# Initialiser l'émulateur
firebase init emulators

# Démarrer l'émulateur
firebase emulators:start
```

## 📝 Checklist de Validation

Avant de mettre en production, vérifiez que :

- [ ] Le nom de l'expéditeur est "LCF AUTO PERFORMANCE"
- [ ] La couleur accent (#1CCEFF) est utilisée correctement
- [ ] Le logo ou l'en-tête LCF est visible
- [ ] Le bouton d'action est bien stylisé et cliquable
- [ ] Le lien alternatif fonctionne
- [ ] Les informations de contact sont correctes (téléphone, email, adresse)
- [ ] Le message de sécurité est présent
- [ ] L'URL de redirection pointe vers `/auth/action`
- [ ] Le template est responsive (testé sur mobile)
- [ ] L'email fonctionne sur les principaux clients (Gmail, Outlook, etc.)

## 🔐 Sécurité

### Bonnes Pratiques

1. **Ne jamais inclure de mot de passe** dans l'email
2. **Toujours indiquer l'expiration** du lien (Firebase : 1 heure par défaut)
3. **Inclure un avertissement** si l'utilisateur n'a pas fait la demande
4. **Utiliser HTTPS** pour tous les liens
5. **Vérifier l'identité** de l'expéditeur (SPF, DKIM, DMARC)

### Configuration DNS Recommandée

Pour améliorer la délivrabilité des emails, configurez :

```
SPF Record:
v=spf1 include:_spf.firebasemail.com ~all

DKIM:
(Configuré automatiquement par Firebase)

DMARC:
v=DMARC1; p=quarantine; rua=mailto:postmaster@lcf-auto-performance.fr
```

## 🆘 Support

En cas de problème :

1. Consultez les [logs Firebase Authentication](https://console.firebase.google.com/project/_/authentication/logs)
2. Vérifiez que les domaines sont autorisés
3. Testez avec différentes adresses email
4. Consultez la documentation officielle : [Firebase Email Templates](https://firebase.google.com/docs/auth/custom-email-handler)

---

**Dernière mise à jour** : Novembre 2024  
**Responsable** : Équipe Technique LCF AUTO PERFORMANCE
