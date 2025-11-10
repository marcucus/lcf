# 🚗 Intégration API SIV - Récupération d'informations véhicules

Ce document explique comment intégrer une **vraie API** pour récupérer automatiquement les informations d'un véhicule via sa plaque d'immatriculation.

## 📋 État actuel

Actuellement, le système utilise des **données mockées** pour le développement. Le fichier `/src/lib/api/vehicleApi.ts` contient une base de données locale avec quelques exemples.

## 🔑 Options d'API disponibles

### 1. **API SIV Officielle** (Gouvernement Français)
- **URL**: https://immatriculation.ants.gouv.fr/
- **Avantages**: Données officielles, gratuit
- **Inconvénients**: Nécessite une autorisation officielle, processus long
- **Idéal pour**: Projets à grande échelle, entreprises

### 2. **API-SIV** (Service Commercial)
- **URL**: https://www.api-siv.fr/
- **Prix**: ~0,10€ par requête
- **Avantages**: Simple à intégrer, pas d'autorisation nécessaire
- **Inconvénients**: Payant
- **Idéal pour**: Startups, prototypes, PME

### 3. **SIV-Auto / AutoCheck**
- Alternatives commerciales similaires
- Prix variables selon le volume

### 4. **API Européenne**
- **URL**: https://ec.europa.eu/growth/tools-databases/tris/
- Pour les véhicules immatriculés dans l'UE

## 🛠️ Étapes d'intégration (exemple avec API-SIV)

### Étape 1: Inscription et obtention de la clé API

```bash
# 1. Créez un compte sur https://www.api-siv.fr/
# 2. Obtenez votre clé API
# 3. Ajoutez-la dans votre fichier .env.local
```

### Étape 2: Configuration des variables d'environnement

Ajoutez dans `.env.local` :

```bash
NEXT_PUBLIC_SIV_API_KEY=votre_clé_api_ici
NEXT_PUBLIC_SIV_API_URL=https://api-siv.fr/v1
```

### Étape 3: Mise à jour du code

Modifiez `/src/lib/api/vehicleApi.ts` :

```typescript
export async function getVehicleByPlate(plate: string): Promise<VehicleInfo | null> {
  try {
    const normalizedPlate = plate.toUpperCase().replace(/\s/g, '');
    
    // Appel à l'API réelle
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SIV_API_URL}/vehicle/${normalizedPlate}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SIV_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Véhicule non trouvé
      }
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Mapper les données de l'API vers notre format
    return {
      make: data.marque || data.make,
      model: data.modele || data.model,
      year: data.annee || data.year,
      color: data.couleur || data.color,
      fuelType: data.energie || data.fuelType,
    };
  } catch (error) {
    console.error('Error fetching vehicle data:', error);
    return null;
  }
}
```

### Étape 4: Gestion du cache (optionnel mais recommandé)

Pour éviter de payer plusieurs fois pour la même plaque :

```typescript
// Créer un cache simple avec localStorage
const CACHE_KEY = 'vehicle_cache';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 jours

function getCachedVehicle(plate: string): VehicleInfo | null {
  const cache = localStorage.getItem(CACHE_KEY);
  if (!cache) return null;
  
  const data = JSON.parse(cache);
  const entry = data[plate];
  
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data;
  }
  
  return null;
}

function setCachedVehicle(plate: string, data: VehicleInfo): void {
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  cache[plate] = {
    data,
    timestamp: Date.now(),
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}
```

## 📊 Exemple de réponse API

Voici un exemple de structure de données retournée par l'API-SIV :

```json
{
  "immatriculation": "AA-123-BB",
  "marque": "Renault",
  "modele": "Clio V",
  "annee": 2021,
  "couleur": "Bleu",
  "energie": "Essence",
  "puissance": 90,
  "cylindree": 1200,
  "co2": 105,
  "premiere_immatriculation": "2021-03-15",
  "vin": "VF1XXXXXXXXXXXXXXX"
}
```

## 🔒 Sécurité

⚠️ **Important** :

1. **Ne jamais exposer** votre clé API dans le code client
2. Créez une **route API Next.js** (`/api/vehicle/[plate].ts`) pour proxy les requêtes :

```typescript
// /src/app/api/vehicle/[plate]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { plate: string } }
) {
  const { plate } = params;
  
  // Clé API côté serveur (sécurisé)
  const apiKey = process.env.SIV_API_KEY; // Sans NEXT_PUBLIC_
  
  try {
    const response = await fetch(
      `https://api-siv.fr/v1/vehicle/${plate}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch vehicle data' },
      { status: 500 }
    );
  }
}
```

3. Puis appelez cette route depuis le client :

```typescript
// Dans vehicleApi.ts
const response = await fetch(`/api/vehicle/${normalizedPlate}`);
```

## 💰 Estimation des coûts

Pour un garage automobile typique :
- ~100 rendez-vous/mois
- Coût : 100 × 0,10€ = **10€/mois**
- Avec cache : ~5€/mois (car clients récurrents)

## 🧪 Test de l'intégration

Pour tester sans dépenser de crédit API, gardez le système mock actif et utilisez ces plaques de test :

- `AA-123-BB` → Renault Clio V
- `CD-456-EF` → Peugeot 308
- `GH-789-IJ` → Citroën C3

## 📝 Checklist avant production

- [ ] Compte API créé et clé obtenue
- [ ] Variables d'environnement configurées
- [ ] Route API proxy créée (sécurité)
- [ ] Cache implémenté (économies)
- [ ] Tests effectués avec vraies plaques
- [ ] Gestion d'erreur robuste
- [ ] Monitoring des coûts API
- [ ] Fallback vers saisie manuelle si API down

## 🆘 Support

En cas de problème :
1. Vérifiez la clé API dans `.env.local`
2. Consultez les logs réseau (DevTools)
3. Vérifiez le quota API restant
4. Contactez le support de l'API choisie

---

**Note**: Ce système fonctionne parfaitement en mode mock pour le développement. L'intégration d'une vraie API est recommandée uniquement pour la production.
