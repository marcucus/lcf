# LCF Auto Performance

Application web Next.js avec Tailwind CSS pour le garage LCF Auto Performance.

## Technologies

- **Next.js 16** - Framework React avec App Router
- **React 19** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS 3** - Framework CSS utility-first

## Installation

```bash
npm install
```

## Développement

Démarrer le serveur de développement :

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Production

Construire l'application pour la production :

```bash
npm run build
```

Démarrer le serveur de production :

```bash
npm start
```

## Structure du projet

```
├── src/
│   └── app/
│       ├── layout.tsx       # Layout principal de l'application
│       ├── page.tsx          # Page d'accueil
│       └── globals.css       # Styles globaux avec Tailwind
├── public/                   # Fichiers statiques
├── next.config.ts           # Configuration Next.js
├── tailwind.config.js       # Configuration Tailwind CSS
└── tsconfig.json            # Configuration TypeScript
```

## Fonctionnalités

- ✅ Interface moderne et responsive
- ✅ Support du mode sombre
- ✅ Optimisé pour les performances
- ✅ Configuration TypeScript stricte
- ✅ Styling avec Tailwind CSS