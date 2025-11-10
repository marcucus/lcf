/**
 * API pour récupérer les informations d'un véhicule via sa plaque d'immatriculation
 * 
 * IMPORTANT : Ce fichier utilise actuellement des données mockées.
 * Pour la production, vous devez remplacer par une vraie API comme :
 * 
 * Options d'API en France :
 * 1. API SIV (Système d'Immatriculation des Véhicules) - Gouvernement français
 *    - Nécessite une autorisation officielle
 *    - https://immatriculation.ants.gouv.fr/
 * 
 * 2. API-SIV (Service commercial)
 *    - https://www.api-siv.fr/
 *    - Payant mais simple à intégrer
 * 
 * 3. AutoCheck / SIV-Auto
 *    - Autres alternatives commerciales
 * 
 * 4. API européenne (pour véhicules UE)
 *    - https://ec.europa.eu/growth/tools-databases/tris/
 */

export interface VehicleInfo {
  make: string;      // Marque
  model: string;     // Modèle
  year?: number;     // Année (optionnel)
  color?: string;    // Couleur (optionnel)
  fuelType?: string; // Type de carburant (optionnel)
}

/**
 * Récupère les informations d'un véhicule via sa plaque d'immatriculation
 * @param plate - Plaque d'immatriculation (format français: AA-123-BB)
 * @returns Informations du véhicule ou null si non trouvé
 */
export async function getVehicleByPlate(plate: string): Promise<VehicleInfo | null> {
  try {
    // Normalise la plaque (majuscules, supprime les espaces)
    const normalizedPlate = plate.toUpperCase().replace(/\s/g, '');

    // TODO: Remplacer par un vrai appel API
    // Exemple avec une vraie API :
    /*
    const response = await fetch(`https://api-siv.fr/v1/vehicle/${normalizedPlate}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SIV_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      make: data.marque,
      model: data.modele,
      year: data.annee,
      color: data.couleur,
      fuelType: data.energie,
    };
    */

    // MOCK DATA - Base de données locale pour le développement
    const mockDatabase: Record<string, VehicleInfo> = {
      'AA-123-BB': { 
        make: 'Renault', 
        model: 'Clio V',
        year: 2021,
        color: 'Bleu',
        fuelType: 'Essence',
      },
      'CD-456-EF': { 
        make: 'Peugeot', 
        model: '308',
        year: 2020,
        color: 'Gris',
        fuelType: 'Diesel',
      },
      'GH-789-IJ': { 
        make: 'Citroën', 
        model: 'C3',
        year: 2022,
        color: 'Rouge',
        fuelType: 'Essence',
      },
      'KL-012-MN': { 
        make: 'Volkswagen', 
        model: 'Golf 8',
        year: 2021,
        color: 'Noir',
        fuelType: 'Hybride',
      },
      'OP-345-QR': { 
        make: 'BMW', 
        model: 'Serie 3',
        year: 2023,
        color: 'Blanc',
        fuelType: 'Diesel',
      },
      'ST-678-UV': { 
        make: 'Mercedes', 
        model: 'Classe A',
        year: 2022,
        color: 'Argent',
        fuelType: 'Essence',
      },
      'WX-901-YZ': { 
        make: 'Audi', 
        model: 'A4',
        year: 2021,
        color: 'Bleu',
        fuelType: 'Diesel',
      },
    };

    // Simule un délai réseau
    await new Promise(resolve => setTimeout(resolve, 800));

    // Retourne les données mockées
    return mockDatabase[normalizedPlate] || null;

  } catch (error) {
    console.error('Error fetching vehicle data:', error);
    return null;
  }
}

/**
 * Valide le format d'une plaque d'immatriculation française
 * Format: AA-123-BB (2 lettres, 3 chiffres, 2 lettres)
 */
export function isValidFrenchPlate(plate: string): boolean {
  const frenchPlateRegex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;
  return frenchPlateRegex.test(plate.toUpperCase().replace(/\s/g, ''));
}

/**
 * Formate une plaque d'immatriculation au format français standard
 */
export function formatPlate(plate: string): string {
  const cleaned = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  if (cleaned.length >= 7) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5, 7)}`;
  }
  
  return plate.toUpperCase();
}
