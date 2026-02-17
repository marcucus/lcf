

# **Cahier des Charges Fonctionnel et Technique – Application Web LCF AUTO PERFORMANCE**

## **Part I: Vision Stratégique et Cadre Technique**

### **1.0 Introduction et Objectifs du Projet**

#### **1.1 Contexte et Vision**

Ce document constitue le cahier des charges pour la conception, le développement et le déploiement d'une application web sur mesure pour le garage LCF AUTO PERFORMANCE. Le projet vise à établir une présence numérique forte et à moderniser l'interaction avec la clientèle. L'ambition dépasse la simple création d'un site vitrine ; il s'agit de construire un écosystème digital intégré qui sert de pilier central à la stratégie de l'entreprise. Cette plateforme unifiera la communication, la gestion opérationnelle et les activités commerciales, transformant ainsi l'expérience client et optimisant les processus internes.

La vision stratégique est de positionner LCF AUTO PERFORMANCE comme un acteur moderne et technologiquement avancé dans son secteur. L'application doit incarner les valeurs de professionnalisme, d'efficacité et de service client du garage. Elle ne sera pas seulement un outil, mais une extension de l'atelier, offrant une interface transparente et intuitive entre le garage et ses clients. La consolidation de la gestion des rendez-vous, de la vente de véhicules et de la réputation en ligne au sein d'une seule et même interface est un choix délibéré. Cette approche centralisée vise à éliminer les frictions et les silos d'information qui existent souvent entre les différentes fonctions d'une entreprise (marketing, opérations, ventes). Par exemple, en répondant à un avis Google, l'administrateur pourra potentiellement consulter l'historique des rendez-vous du client concerné, permettant une réponse plus personnalisée et contextuelle. Cette synergie transforme l'application d'un simple site web en une plateforme de gestion de la relation client (CRM) et un centre de commande opérationnel, constituant un avantage concurrentiel majeur.

#### **1.2 Objectifs Commerciaux (Business Goals)**

L'application web doit répondre à plusieurs objectifs commerciaux stratégiques :

* **Augmentation de la Visibilité et de l'Acquisition Client:** L'application servira de vitrine numérique professionnelle, accessible 24/7. En présentant de manière claire et attractive les services (Entretien, Réparation, Re-programmation) et le catalogue de véhicules d'occasion, elle a pour but de capter l'attention de nouveaux prospects et de les convertir en clients. Un référencement naturel (SEO) optimisé sera une composante implicite de son développement.  
* **Optimisation de l'Efficacité Opérationnelle:** L'un des objectifs principaux est de réduire drastiquement la charge administrative liée à la gestion des rendez-vous. En automatisant le processus de réservation via un calendrier interactif, l'application libérera du temps pour le personnel du garage, qui pourra se concentrer sur des tâches à plus forte valeur ajoutée. Cela minimise les interruptions téléphoniques et les risques d'erreurs de planification.  
* **Amélioration de la Rétention et de la Satisfaction Client:** En offrant un espace client personnel, sécurisé et facile à utiliser, l'application vise à renforcer la fidélité. Les clients pourront gérer leurs rendez-vous en toute autonomie (prise, report, annulation sous conditions), consulter leur historique et interagir avec le garage de manière fluide. Cette expérience utilisateur positive est un facteur clé de rétention.  
* **Gestion Proactive de la Réputation en Ligne:** L'intégration d'un module de gestion des avis Google directement dans le panneau d'administration est un objectif stratégique. Elle permettra de surveiller et de répondre rapidement aux retours clients, démontrant un engagement envers la satisfaction client et contribuant à maintenir une e-réputation positive, élément crucial dans la décision d'achat des consommateurs modernes.

#### **1.3 Publics Cibles**

L'application est conçue pour servir trois catégories d'utilisateurs distinctes :

* **Clients Particuliers:** Le cœur de la cible. Ce sont des propriétaires de véhicules à la recherche d'une solution simple, rapide et fiable pour l'entretien, la réparation ou l'optimisation de leur voiture. Ils attendent de la transparence, de la facilité d'utilisation et la possibilité de gérer leurs interactions avec le garage en ligne.  
* **Acheteurs de Véhicules d'Occasion:** Un segment spécifique intéressé par le catalogue de véhicules en vente. Ces utilisateurs ont besoin d'une interface de consultation claire, avec des filtres de recherche efficaces, des fiches produits détaillées et des photos de haute qualité pour évaluer les offres à distance.  
* **Personnel du Garage (Administrateurs, Gestionnaires):** Les utilisateurs internes de l'application. Ils requièrent des outils robustes, intuitifs et efficaces pour gérer l'ensemble des opérations : le calendrier des rendez-vous, le catalogue de véhicules, les comptes utilisateurs et la communication externe (avis Google). L'interface doit leur permettre de maximiser leur productivité.

### **2.0 Architecture Générale et Spécifications Non-Fonctionnelles**

#### **2.1 Architecture Technologique : Écosystème Google Firebase**

Le projet sera entièrement bâti sur l'écosystème serverless de Google Firebase. Ce choix offre une solution intégrée, scalable et performante, tout en réduisant la complexité de la gestion de l'infrastructure.

* **Firebase Hosting:** Le déploiement du front-end de l'application (le site web visible par les utilisateurs) sera assuré par Firebase Hosting. Ce service garantit une diffusion mondiale via un CDN (Content Delivery Network), assurant des temps de chargement rapides et une haute disponibilité, le tout sécurisé par un certificat SSL fourni et géré automatiquement.  
* **Firebase Authentication:** La gestion des identités et des accès sera entièrement prise en charge par Firebase Authentication. Ce service robuste gérera la création de comptes par email/mot de passe (avec stockage sécurisé des informations d'identification) ainsi que l'authentification via des fournisseurs tiers, notamment Google (OAuth 2.0), comme spécifié. Il fournit les briques essentielles pour la gestion des sessions, la réinitialisation des mots de passe et la sécurisation des accès.  
* **Cloud Firestore:** La base de données principale de l'application sera Cloud Firestore. Il s'agit d'une base de données NoSQL, flexible et scalable, qui stockera toutes les données structurées : profils utilisateurs, rendez-vous, fiches des véhicules d'occasion, modèles de réponse aux avis, etc. Sa caractéristique fondamentale est sa capacité à synchroniser les données en temps réel. Cette fonctionnalité sera exploitée pour créer des interfaces dynamiques, notamment le calendrier de l'administrateur, qui se mettra à jour instantanément pour tous les gestionnaires connectés dès qu'un nouveau rendez-vous est pris par un client, sans nécessiter de rafraîchissement manuel de la page. Cette réactivité en temps réel est un atout majeur pour une gestion d'atelier fluide et collaborative.  
* **Cloud Storage for Firebase:** Tous les fichiers binaires, principalement les photographies des véhicules d'occasion, seront stockés dans Cloud Storage. Ce service offre un stockage d'objets sécurisé, performant et économique, parfaitement intégré avec le reste de l'écosystème Firebase.  
* **Cloud Functions for Firebase:** La logique métier complexe et les opérations nécessitant des privilèges élevés seront exécutées côté serveur via des Cloud Functions. Ces fonctions serverless seront déclenchées par des événements (ex: création d'un nouveau rendez-vous) ou des appels HTTP. Elles seront utilisées pour :  
  * Valider des règles métier critiques, comme la contrainte des 24 heures pour la modification d'un rendez-vous, assurant que cette règle ne puisse pas être contournée côté client.  
  * Envoyer des notifications (ex: email de confirmation de rendez-vous).  
  * Agir comme un proxy sécurisé pour interagir avec des API externes, notamment l'API Google Business Profile. Les clés d'API et les jetons d'authentification ne seront ainsi jamais exposés dans le code front-end, ce qui constitue une pratique de sécurité essentielle.

#### **2.2 Spécifications Non-Fonctionnelles (NFRs)**

Ces spécifications définissent les critères de qualité et de performance du système.

* **Performance:** L'application doit offrir une expérience utilisateur fluide et réactive. Les métriques cibles, basées sur les Core Web Vitals de Google, sont :  
  * **Largest Contentful Paint (LCP):** Le temps de chargement de l'élément le plus grand de la page visible doit être inférieur à 2.5 secondes.  
  * **First Input Delay (FID):** Le délai de réponse du navigateur à la première interaction de l'utilisateur (clic, saisie) doit être inférieur à 100 millisecondes.  
* **Sécurité:** La protection des données des utilisateurs et de l'entreprise est primordiale.  
  * **Règles de Sécurité Firestore:** Des règles de sécurité granulaires seront écrites et appliquées directement sur la base de données Firestore pour contrôler précisément qui peut lire, écrire ou modifier chaque document, en se basant sur le rôle et l'UID de l'utilisateur authentifié.  
  * **Protection contre les Vulnérabilités Web:** Le développement suivra les meilleures pratiques pour prévenir les attaques courantes telles que le Cross-Site Scripting (XSS) et le Cross-Site Request Forgery (CSRF).  
  * **Sécurisation des Clés API:** Comme mentionné, les Cloud Functions serviront de couche d'abstraction pour tous les appels aux API externes, garantissant que les informations sensibles ne quittent jamais l'environnement serveur sécurisé de Google.  
* **Scalabilité:** L'architecture entièrement serverless de Firebase est conçue pour une mise à l'échelle automatique. L'application pourra gérer des pics de trafic sans dégradation des performances et sans nécessiter d'intervention manuelle pour provisionner des serveurs.  
* **Maintenabilité:** Le code source devra être de haute qualité, clairement structuré et documenté. L'utilisation de conventions de nommage cohérentes et la décomposition du code en modules logiques sont requises pour faciliter la maintenance, les corrections de bugs et les évolutions futures de l'application.  
* **Accessibilité:** L'application doit être utilisable par le plus grand nombre, y compris les personnes en situation de handicap. Elle visera une conformité au niveau AA des Web Content Accessibility Guidelines (WCAG) 2.1. Une attention particulière sera portée aux contrastes de couleurs (pour les thèmes clair et sombre), à la navigation au clavier et à la sémantique HTML.

### **3.0 Identité Visuelle et Expérience Utilisateur (UI/UX)**

#### **3.1 Philosophie du Design : "Épuré et Artistique"**

L'esthétique de l'application doit refléter le professionnalisme et la modernité de LCF AUTO PERFORMANCE. Le design sera guidé par les principes suivants :

* **Minimalisme Fonctionnel:** L'interface privilégiera la clarté et la simplicité. L'utilisation généreuse de l'espace (blanc en mode clair, noir en mode sombre) permettra de faire respirer le contenu, d'améliorer la lisibilité et de focaliser l'attention de l'utilisateur sur les éléments essentiels. Chaque élément visuel doit avoir un but et contribuer à l'objectif de l'utilisateur.  
* **Hiérarchie Visuelle Claire:** La structure de chaque page sera conçue pour guider intuitivement l'œil de l'utilisateur. Une utilisation stratégique de la typographie (taille, graisse), des couleurs et de l'espacement établira un ordre de lecture logique, mettant en évidence les informations et les actions les plus importantes (comme les boutons "Prendre Rendez-vous").  
* **Micro-interactions et Raffinement:** Pour atteindre une expérience perçue comme "magnifique", des micro-interactions soignées seront intégrées. Des animations subtiles sur les survols de boutons, des transitions fluides entre les pages et des retours visuels instantanés lors des actions utilisateur (ex: affichage d'un spinner lors d'une sauvegarde) contribueront à une sensation de qualité et de réactivité.

#### **3.2 Système de Design (Design System)**

Pour garantir la cohérence visuelle et l'efficacité du développement, un système de design sera défini en amont. Il constituera la référence unique pour tous les aspects de l'interface.

* **Palette de Couleurs:** La palette est un élément central de l'identité visuelle.  
  * **Couleur d'Accent:** Le bleu clair, $\#1CCEFF$, est la couleur signature. Son utilisation doit être disciplinée et intentionnelle pour maximiser son impact. Elle sera réservée aux éléments interactifs primaires : boutons d'appel à l'action principaux (CTA), liens hypertextes, indicateurs de sélection active (ex: onglet actif, date sélectionnée dans le calendrier). Cette utilisation ciblée crée un guidage visuel fort sans surcharger l'interface, préservant ainsi l'aspect "épuré".  
  * **Thème Clair (Light Mode):** Conçu pour une lisibilité optimale en pleine journée.  
    * Fonds : Blancs et gris très clairs (ex: $\#FFFFFF$, $\#F8F9FA$).  
    * Texte : Gris foncé (ex: $\#212529$).  
    * Bordures et Séparateurs : Gris clair (ex: $\#DEE2E6$).  
  * **Thème Sombre (Dark Mode):** Offre un confort visuel dans des conditions de faible luminosité.  
    * Fonds : Gris très foncés, proches du noir (ex: $\#121212$, $\#1E1E1E$).  
    * Texte : Gris clairs et blancs cassés (ex: $\#EAEAEA$).  
    * Bordures et Séparateurs : Gris moyen (ex: $\#424242$).  
* **Typographie:** Le choix de la police de caractères est crucial pour la lisibilité et la personnalité de l'application. Une police sans-serif moderne et polyvalente, comme Inter ou Poppins, sera sélectionnée. Une échelle typographique stricte définira la taille et la graisse de la police pour chaque niveau de titre ($h1, h2, h3,...$), les paragraphes, les libellés de formulaire et autres éléments textuels, assurant une cohérence sur l'ensemble du site.  
* **Iconographie:** Un jeu d'icônes unique et cohérent (par exemple, Feather Icons ou Heroicons) sera utilisé pour renforcer la compréhension visuelle des actions et des fonctionnalités. Les icônes devront être stylisées pour s'intégrer harmonieusement au design général.  
* **Composants Réutilisables:** Une bibliothèque de composants d'interface (UI components) sera créée. Elle définira le style et le comportement des éléments fondamentaux comme les boutons (primaire, secondaire, désactivé), les champs de formulaire (texte, sélection, cases à cocher), les cartes (pour les véhicules, les services), les modales de confirmation, etc. Chaque composant sera conçu pour fonctionner parfaitement dans les deux thèmes (clair et sombre).

## **Part II: Spécifications Fonctionnelles Détaillées**

### **4.0 Gestion des Utilisateurs et Contrôle d'Accès Basé sur les Rôles (RBAC)**

Le système de gestion des utilisateurs est le fondement de la sécurité et de la personnalisation de l'application. Il repose sur un modèle de contrôle d'accès basé sur les rôles (RBAC) à trois niveaux.

#### **4.1 Flux d'Authentification**

Les processus d'authentification doivent être sécurisés, standards et fluides.

* **Création de Compte:** Un formulaire d'inscription demandera les informations essentielles : Nom, Prénom, Adresse email et Mot de passe. Le champ du mot de passe devra inclure une validation en temps réel de sa force (longueur minimale, présence de caractères variés). En parallèle, un bouton "S'inscrire avec Google" permettra une inscription en un clic en utilisant le fournisseur Google de Firebase Authentication.  
* **Connexion:** La page de connexion proposera un formulaire standard Email/Mot de passe, ainsi qu'un bouton "Se connecter avec Google" pour les utilisateurs ayant choisi cette méthode.  
* **Réinitialisation du Mot de Passe:** Un lien "Mot de passe oublié?" sur la page de connexion initiera un flux sécurisé. L'utilisateur saisira son adresse email et le système (via Firebase Authentication) enverra un email contenant un lien unique et à durée de vie limitée pour réinitialiser son mot de passe.  
* **Gestion de Session:** Une fois connecté, l'utilisateur restera authentifié sur son appareil (session persistante) jusqu'à ce qu'il choisisse de se déconnecter manuellement via un bouton dédié dans son espace personnel.

#### **4.2 Définition des Rôles**

Chaque utilisateur de la base de données se verra attribuer un des trois rôles suivants, qui déterminera ses permissions à travers toute l'application.

* **Utilisateur (User):** C'est le rôle attribué par défaut à tout nouveau client qui s'inscrit sur la plateforme. Ce rôle est conçu pour l'accès aux fonctionnalités client standard.  
* **Gestionnaire d'Agenda (AgendaManager):** Un rôle avec des privilèges étendus, spécifiquement pour la gestion des rendez-vous. Ce rôle ne peut être attribué que manuellement par un Administrateur depuis le panneau de contrôle.  
* **Administrateur (Admin):** Le rôle le plus élevé, disposant d'un accès complet à toutes les fonctionnalités de l'application, y compris la gestion des autres utilisateurs. Ce rôle est également attribué manuellement.

#### **4.3 Matrice des Permissions**

La matrice suivante définit de manière exhaustive les actions autorisées pour chaque rôle. Elle servira de référence pour l'implémentation des règles de sécurité Firestore et de la logique de contrôle d'accès dans l'application.

| Action / Fonctionnalité | Rôle: Utilisateur | Rôle: Gestionnaire d'Agenda | Rôle: Administrateur |
| :---- | :---- | :---- | :---- |
| **Gestion de Compte** |  |  |  |
| Modifier son propre profil (nom, etc.) | ✅ | ✅ | ✅ |
| Créer un nouvel utilisateur | ❌ | ❌ | ✅ |
| Voir la liste de tous les utilisateurs | ❌ | ❌ | ✅ |
| Modifier un utilisateur (rôle, informations) | ❌ | ❌ | ✅ |
| Supprimer un utilisateur | ❌ | ❌ | ✅ |
| **Gestion des Rendez-vous** |  |  |  |
| Créer un rendez-vous pour soi-même | ✅ | ✅ (pour un client) | ✅ (pour un client) |
| Voir ses propres rendez-vous | ✅ | ✅ (tous les RDV) | ✅ (tous les RDV) |
| Reporter/Annuler son propre RDV (\> 24h) | ✅ | N/A | N/A |
| Reporter/Annuler n'importe quel RDV (sans limite) | ❌ | ✅ | ✅ |
| **Gestion du Contenu** |  |  |  |
| Gérer les véhicules d'occasion (Ajouter/Modifier/Supprimer) | ❌ | ❌ | ✅ |
| **Gestion des Avis Google** |  |  |  |
| Voir les avis Google dans le back-office | ❌ | ❌ | ✅ |
| Répondre aux avis Google | ❌ | ❌ | ✅ |
| Gérer les modèles de réponse | ❌ | ❌ | ✅ |

### **5.0 Espace Public : Le Site Vitrine**

Cette section décrit les pages et fonctionnalités accessibles à tous les visiteurs, qu'ils soient connectés ou non.

#### **5.1 Page d'Accueil & Présentation**

La page d'accueil est le premier point de contact avec le visiteur. Elle doit être impactante et informative. Elle comprendra une section "héro" en haut de page, avec une image ou une courte vidéo de haute qualité représentant l'atelier ou une voiture de performance. Des appels à l'action clairs mèneront vers les services principaux ("Découvrir nos services") et la prise de rendez-vous ("Prendre rendez-vous"). Une brève section présentera la philosophie et l'expertise de LCF AUTO PERFORMANCE.

#### **5.2 Pages de Services**

Chaque service proposé par le garage (Entretien, Réparation, Re-programmation) disposera de sa propre page dédiée. Ces pages détailleront la nature de la prestation, les avantages pour le client et le véhicule, et les types de véhicules concernés. Chaque page se terminera par un bouton d'appel à l'action proéminent invitant l'utilisateur à prendre rendez-vous pour ce service spécifique.

#### **5.3 Catalogue des Véhicules d'Occasion**

Cette section est la vitrine numérique pour la vente de véhicules.

* **Page de Listing:** La page principale affichera tous les véhicules disponibles sous forme de grille ou de liste, au choix de l'utilisateur. Chaque véhicule sera présenté sur une "carte" cliquable affichant une photo principale, la marque, le modèle, l'année et le prix. Des outils de filtrage (par marque, par fourchette de prix, par année) et une barre de recherche permettront aux utilisateurs d'affiner leur sélection.  
* **Page de Détail:** Un clic sur une carte mènera à une page de détail complète pour le véhicule sélectionné. Cette page présentera une galerie de photos haute résolution, une description textuelle complète rédigée par le garage, une fiche technique détaillée (kilométrage, type de carburant, puissance, transmission, etc.), et un formulaire de contact permettant aux acheteurs potentiels de poser des questions ou de demander un essai.

#### **5.4 Page de Contact & Informations**

Cette page regroupera toutes les informations pratiques pour contacter ou se rendre au garage.

* **Carte Interactive:** Une carte dynamique, via l'intégration de l'API Google Maps, affichera un marqueur précis sur l'emplacement de LCF AUTO PERFORMANCE.  
* **Informations Clés:** L'adresse postale complète, le numéro de téléphone (cliquable sur mobile) et l'adresse e-mail de contact seront clairement visibles.  
* **Horaires d'Ouverture:** Les horaires seront affichés de manière lisible : Lundi au Vendredi : 10:00 – 12:00, 14:00 – 18:00.  
* **Réseaux Sociaux:** Des icônes "Suivez-nous" mèneront directement vers les profils sociaux du garage (Facebook, Instagram, etc.).

### **6.0 Espace Client : Le Portail Utilisateur**

Une fois connecté, le client accède à son espace personnel pour gérer ses interactions avec le garage.

#### **6.1 Processus de Prise de Rendez-vous**

Le processus de réservation sera décomposé en étapes simples et logiques pour minimiser les frictions.

* **Étape 1: Sélection du Service:** L'utilisateur choisit le motif de son rendez-vous parmi la liste des services proposés (Entretien, Réparation, Re-programmation).  
* **Étape 2: Sélection du Créneau Horaire:** Un calendrier interactif sera affiché. Le système interrogera en temps réel la base de données Firestore pour déterminer les disponibilités. Les jours et créneaux horaires déjà réservés, ainsi que les périodes en dehors des heures d'ouverture, seront visuellement désactivés (par exemple, grisés) et non cliquables.  
* **Étape 3: Informations Complémentaires:** L'utilisateur sera invité à fournir des informations sur son véhicule (marque, modèle, immatriculation) et pourra ajouter une note textuelle pour décrire plus précisément son besoin ou le problème rencontré.  
* **Étape 4: Confirmation:** Un écran récapitulatif présentera tous les détails du rendez-vous (service, date, heure, informations du véhicule) pour une dernière vérification. Après validation par l'utilisateur, le rendez-vous est enregistré en base de données et un e-mail de confirmation est automatiquement envoyé au client.

La fiabilité de ce système est critique. Pour éviter les conflits où deux utilisateurs tenteraient de réserver le même créneau simultanément (une condition de concurrence ou "race condition"), l'opération d'écriture du rendez-vous doit être atomique. Cela sera implémenté à l'aide d'une **Transaction Firestore**. La transaction lira d'abord les données pour vérifier que le créneau est toujours libre, puis écrira le nouveau rendez-vous dans la même opération indivisible. Si un autre utilisateur a réservé le créneau entre-temps, la transaction échouera et pourra être retentée ou annulée, garantissant ainsi l'intégrité parfaite du planning.

#### **6.2 Tableau de Bord Client**

La page d'accueil de l'espace client est un tableau de bord qui synthétise les informations importantes.

* **Mes Prochains Rendez-vous:** Une section mettra en évidence les rendez-vous à venir, avec la date, l'heure, le service, et les options de gestion (Reporter/Annuler, si applicable).  
* **Historique des Rendez-vous:** Une liste des rendez-vous passés permettra au client de consulter l'historique de ses visites au garage.

#### **6.3 Gestion des Rendez-vous (Logique Métier)**

La gestion des rendez-vous par le client est soumise à une règle métier stricte.

* **La Règle des 24 Heures:** Le système doit impérativement empêcher toute modification ou annulation par le client dans les 24 heures précédant l'heure du rendez-vous.  
* **Implémentation Technique:** Cette logique sera implémentée à deux niveaux pour une sécurité maximale.  
  * **Côté Front-end (UI):** L'interface utilisateur calculera la différence entre l'heure actuelle et l'heure du rendez-vous. Si cette différence est supérieure à 24 heures, les boutons "Reporter" et "Annuler" seront visibles et actifs. Si elle est inférieure ou égale à 24 heures, ces boutons seront désactivés ou masqués, et un message informatif expliquera la politique d'annulation tardive.  
  * **Côté Back-end (Sécurité):** Une vérification identique sera effectuée au niveau des Règles de Sécurité Firestore ou dans une Cloud Function. Cela garantit que même si un utilisateur malveillant tentait de contourner la logique de l'interface, la modification ou la suppression de la donnée serait rejetée par le serveur, assurant ainsi l'intégrité de la règle métier.

### **7.0 Panneau d'Administration : Le Cœur Opérationnel**

Le panneau d'administration est une interface sécurisée, accessible uniquement aux rôles Gestionnaire d'Agenda et Administrateur, conçue pour la gestion complète de l'application.

#### **7.1 Tableau de Bord Administratif**

La page d'accueil du panneau d'administration offrira une vue d'ensemble synthétique de l'activité du garage avec des indicateurs de performance clés (KPIs) : nombre de rendez-vous prévus pour la journée et la semaine, les derniers avis Google reçus, le nombre total de véhicules actuellement en vente.

#### **7.2 Gestion du Calendrier Global**

C'est l'outil central pour les gestionnaires. Il offrira une vue complète de l'agenda du garage.

* **Visualisation:** Le calendrier pourra être affiché par jour, par semaine ou par mois. Il affichera tous les rendez-vous de tous les clients. Un code couleur pourra être utilisé pour différencier visuellement les types de services (Entretien, Réparation, Re-programmation).  
* **Gestion Manuelle:** Les utilisateurs avec les rôles Gestionnaire d'Agenda et Administrateur pourront effectuer des opérations de gestion sans restriction de temps. Ils pourront créer manuellement un rendez-vous pour un client (par exemple, suite à un appel téléphonique), modifier les détails d'un rendez-vous existant, ou le supprimer, y compris dans le délai de 24 heures.

#### **7.3 Gestion des Utilisateurs (CRUD)**

Cette section, accessible uniquement au rôle Administrateur, permettra une gestion complète des comptes utilisateurs. Une interface tabulaire listera tous les utilisateurs avec des options pour :

* **Créer** un nouvel utilisateur manuellement.  
* **Lire** (Voir) les détails d'un utilisateur.  
* **Mettre à jour** (Éditer) les informations d'un utilisateur, y compris l'assignation de son rôle (Utilisateur, Gestionnaire d'Agenda, Administrateur).  
* **Supprimer** un compte utilisateur.

#### **7.4 Gestion du Parc de Véhicules d'Occasion (CRUD)**

Cette section, également réservée à l'Administrateur, est l'outil de gestion du catalogue de véhicules.

* **Ajout de Véhicule:** Un formulaire complet permettra d'ajouter un nouveau véhicule. Il inclura des champs pour toutes les caractéristiques (marque, modèle, année, prix, kilométrage, description, etc.) et un composant de téléversement d'images multiples qui enverra les fichiers directement vers Cloud Storage.  
* **Modification et Suppression:** Une interface listera tous les véhicules en vente, avec des options pour éditer les informations d'un véhicule existant ou pour le marquer comme vendu/le supprimer de la liste publique.

#### **7.5 Intégration et Gestion des Avis Google**

Cette fonctionnalité clé transforme le panneau d'administration en un outil de gestion de la réputation.

* **Connexion au Compte Google Business Profile:** Une procédure de configuration unique (one-time setup) sera mise en place. L'administrateur sera guidé à travers un flux d'authentification OAuth 2.0 pour autoriser l'application à accéder de manière sécurisée aux données de la fiche d'établissement Google du garage. Les jetons d'accès seront stockés de manière sécurisée côté serveur.  
* **Interface de Gestion des Avis:**  
  * Une section dédiée récupérera et affichera la liste des avis clients les plus récents via l'API Google Business Profile. Chaque avis montrera la note en étoiles, le nom du client, le commentaire et la date.  
  * Pour chaque avis n'ayant pas encore de réponse, un champ de texte permettra à l'administrateur de rédiger une réponse personnalisée.  
  * **Système de Modèles de Réponse:** Un bouton "Utiliser un modèle" ouvrira une liste de réponses pré-enregistrées. L'administrateur pourra gérer ces modèles (créer, modifier, supprimer) dans une sous-section dédiée. Exemples de modèles : "Merci beaucoup pour votre commentaire positif, nous sommes ravis que votre expérience chez LCF AUTO PERFORMANCE vous ait plu\!", "Nous sommes sincèrement désolés d'apprendre que votre visite n'a pas été à la hauteur de vos attentes. Pourriez-vous nous contacter à \[email/téléphone\] afin que nous puissions en discuter?".  
  * Un bouton "Envoyer la réponse" déclenchera une Cloud Function qui postera la réponse directement sur la fiche Google Business Profile via l'API.

Étant donné la dépendance critique à une API externe, une attention particulière sera portée à la robustesse de cette intégration. La Cloud Function effectuant les appels à l'API Google sera conçue pour gérer les erreurs potentielles (API indisponible, jeton d'authentification expiré, limites de taux atteintes). Des mécanismes de journalisation (logging) seront mis en place pour le débogage, et l'interface utilisateur affichera des messages clairs à l'administrateur en cas d'échec de la communication avec les serveurs de Google. Un système de surveillance pourrait également être envisagé pour alerter l'administrateur si le jeton d'authentification nécessite d'être renouvelé.

## **Part III: Modélisation des Données et Annexes**

### **8.0 Structure de la Base de Données (Cloud Firestore)**

#### **8.1 Philosophie de Modélisation NoSQL**

La structure des données dans Cloud Firestore sera optimisée pour les schémas de lecture de l'application. Contrairement aux bases de données relationnelles, une certaine dénormalisation des données sera appliquée de manière stratégique. Par exemple, le nom du client pourra être stocké directement dans le document du rendez-vous, en plus de son userId, afin d'éviter une requête supplémentaire pour afficher le calendrier, améliorant ainsi les performances.

#### **8.2 Schémas des Collections Principales**

Voici la structure envisagée pour les collections principales de la base de données.

##### **8.2.1 Collection users**

Cette collection stocke les informations de tous les comptes enregistrés. Le uid fourni par Firebase Authentication servira d'identifiant unique pour chaque document.

| Champ | Type de Données | Description | Exemple |
| :---- | :---- | :---- | :---- |
| uid | String | ID unique de Firebase Authentication (Clé primaire) | aBcDeFgHiJkLmNoPqRsT |
| email | String | Adresse email de l'utilisateur, utilisée pour la connexion | client@email.com |
| firstName | String | Prénom de l'utilisateur | Jean |
| lastName | String | Nom de l'utilisateur | Dupont |
| role | String | Rôle de l'utilisateur (user, agendaManager, admin) | user |
| createdAt | Timestamp | Date et heure de création du compte | 2023-10-27T10:00:00Z |

##### **8.2.2 Collection appointments**

Cette collection est le cœur opérationnel du garage, contenant tous les rendez-vous passés, présents et futurs.

| Champ | Type de Données | Description | Exemple |
| :---- | :---- | :---- | :---- |
| appointmentId | String | ID unique du document (généré automatiquement) | appt\_123456789 |
| userId | String | ID de l'utilisateur (référence à la collection users) | aBcDeFgHiJkLmNoPqRsT |
| customerName | String | Nom complet du client (dénormalisé pour affichage rapide) | Jean Dupont |
| serviceType | String | Type de service (entretien, reparation, reprogrammation) | entretien |
| dateTime | Timestamp | Date et heure exactes du rendez-vous (essentiel pour les requêtes) | 2023-11-15T14:30:00Z |
| vehicleInfo | Map | Objet contenant les informations sur le véhicule | { "make": "Renault", "model": "Clio", "plate": "AA-123-BB" } |
| customerNotes | String | Notes additionnelles fournies par le client lors de la réservation | "Bruit suspect au niveau du frein avant droit." |
| status | String | Statut du rendez-vous (confirmed, completed, cancelled) | confirmed |
| createdAt | Timestamp | Date et heure de création du rendez-vous | 2023-10-27T11:30:00Z |

##### **8.2.3 Collection vehicles**

Cette collection contient toutes les informations relatives aux véhicules d'occasion mis en vente.

| Champ | Type de Données | Description | Exemple |
| :---- | :---- | :---- | :---- |
| vehicleId | String | ID unique du document (généré automatiquement) | veh\_987654321 |
| make | String | Marque du véhicule | Peugeot |
| model | String | Modèle du véhicule | 208 |
| year | Number | Année de première mise en circulation | 2020 |
| price | Number | Prix de vente en euros | 15000 |
| mileage | Number | Kilométrage du véhicule | 45000 |
| fuelType | String | Type de carburant (ex: essence, diesel, electrique) | essence |
| description | String | Description textuelle complète pour la fiche produit | "Excellent état, première main, peu de kilomètres..." |
| imageUrls | Array of Strings | Liste des URL publiques des photos (stockées dans Cloud Storage) | \["https://storage.googleapis.com/...", "https://..."\] |
| isSold | Boolean | Indicateur pour filtrer les véhicules déjà vendus | false |
| createdAt | Timestamp | Date et heure d'ajout du véhicule au catalogue | 2023-10-26T15:00:00Z |

### **9.0 Annexes**

#### **9.1 Diagrammes de Flux Utilisateur (User Flow Diagrams)**

Pour clarifier les parcours utilisateurs les plus critiques, des diagrammes de flux seront produits durant la phase de conception. Ils détailleront visuellement, étape par étape, les interactions de l'utilisateur avec l'interface pour accomplir une tâche spécifique. Les deux flux prioritaires à modéliser sont :

* **Flux de Prise de Rendez-vous par un Client:** De la sélection du service à la confirmation finale, en incluant les choix de date et d'heure.  
* **Flux de Réponse à un Avis Google par l'Administrateur:** De la connexion au panneau d'administration à la publication de la réponse, en passant par l'utilisation potentielle d'un modèle.

#### **9.2 Wireframes de Haut Niveau (Optionnel)**

En complément des diagrammes de flux, la production de wireframes (maquettes fonctionnelles sans design) est fortement recommandée. Ces esquisses de bas niveau permettront de valider la structure et l'agencement des informations pour les écrans clés avant d'entamer le design visuel détaillé. Les interfaces à maquetter en priorité incluent :

* La Page d'accueil.  
* L'interface de sélection de créneau (calendrier de réservation).  
* Le Tableau de bord client.  
* Le Tableau de bord administrateur avec la vue du calendrier global.  
* L'interface de gestion des avis Google.