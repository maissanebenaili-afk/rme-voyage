export interface RegionalKnowledge {
  country: string;
  region: string;
  languages: string[];
  capital: string;
  timezone: string;
  currency: string;
  currencyCode: string;
  emergencyNumbers: {
    police: string;
    ambulance: string;
    fire: string;
  };
  majorCities: string[];
  transportModes: string[];
  airlines: string[];
  ferryRoutes?: Array<{ from: string; to: string; operator: string }>;
  halalServices: boolean;
  mosqueMajorCities: string[];
  simProviders: string[];
  pharmacyChains: string[];
}

export const REGIONAL_KNOWLEDGE: Record<string, RegionalKnowledge> = {
  // West Africa - Senegal cluster
  Senegal: {
    country: 'Senegal',
    region: 'West Africa',
    languages: ['wo', 'ff', 'fr', 'en'],
    capital: 'Dakar',
    timezone: 'GMT+0',
    currency: 'CFA Franc',
    currencyCode: 'XOF',
    emergencyNumbers: {
      police: '17',
      ambulance: '15',
      fire: '18',
    },
    majorCities: ['Dakar', 'Thiès', 'Kaolack', 'Saint-Louis', 'Ziguinchor'],
    transportModes: ['bus', 'car_hire', 'ferry', 'air'],
    airlines: ['Air Senegal', 'Senegal Airlines'],
    ferryRoutes: [
      { from: 'Dakar', to: 'Cape Verde', operator: 'Agence des Ferry' },
    ],
    halalServices: true,
    mosqueMajorCities: ['Dakar', 'Thiès', 'Saint-Louis'],
    simProviders: ['Sonatel', 'Maroc Telecom', 'Expresso'],
    pharmacyChains: ['Pharmacie Keur Serigne', 'Pharmacie du Peuple'],
  },
  Guinea: {
    country: 'Guinea',
    region: 'West Africa',
    languages: ['ff', 'fr', 'en'],
    capital: 'Conakry',
    timezone: 'GMT+0',
    currency: 'Guinean Franc',
    currencyCode: 'GNF',
    emergencyNumbers: {
      police: '221',
      ambulance: '111',
      fire: '112',
    },
    majorCities: ['Conakry', 'Kindia', 'Mamou', 'Faranah', 'Guéckédou'],
    transportModes: ['bus', 'car_hire', 'air'],
    airlines: ['Air Guinée', 'Air Côte d\'Ivoire'],
    halalServices: true,
    mosqueMajorCities: ['Conakry', 'Mamou', 'Faranah'],
    simProviders: ['Sotelgui', 'MTN Guinea', 'Cellcom'],
    pharmacyChains: ['Pharmacie Centrale', 'Pharmacie Conakry'],
  },
  Mali: {
    country: 'Mali',
    region: 'West Africa',
    languages: ['bm', 'ff', 'fr', 'en'],
    capital: 'Bamako',
    timezone: 'GMT+0',
    currency: 'CFA Franc',
    currencyCode: 'XOF',
    emergencyNumbers: {
      police: '17',
      ambulance: '15',
      fire: '18',
    },
    majorCities: ['Bamako', 'Ségou', 'Mopti', 'Timbuktu', 'Gao'],
    transportModes: ['bus', 'car_hire', 'river_ferry', 'air'],
    airlines: ['Air Mali', 'Air Senegal'],
    ferryRoutes: [
      { from: 'Koulikoro', to: 'Timbuktu', operator: 'Niger River Ferries' },
    ],
    halalServices: true,
    mosqueMajorCities: ['Bamako', 'Timbuktu', 'Mopti'],
    simProviders: ['Malitel', 'Orange Mali', 'Sotelma'],
    pharmacyChains: ['Pharmacie Bamako', 'Pharmacie Centrale'],
  },

  // Nigeria cluster
  Nigeria: {
    country: 'Nigeria',
    region: 'West Africa',
    languages: ['yo', 'ig', 'ha', 'en', 'fr'],
    capital: 'Abuja',
    timezone: 'GMT+1',
    currency: 'Nigerian Naira',
    currencyCode: 'NGN',
    emergencyNumbers: {
      police: '112',
      ambulance: '112',
      fire: '112',
    },
    majorCities: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Accra'],
    transportModes: ['bus', 'car_hire', 'air', 'ferry'],
    airlines: ['Air Peace', 'Dana Air', 'Arik Air', 'Nigerian Airways'],
    ferryRoutes: [
      { from: 'Lagos', to: 'Calabar', operator: 'Seaboot Ferry' },
    ],
    halalServices: true,
    mosqueMajorCities: ['Kano', 'Katsina', 'Lagos', 'Abuja'],
    simProviders: ['MTN Nigeria', 'Airtel', 'Glo Mobile', '9mobile'],
    pharmacyChains: ['MedPlus', 'Clicks', 'HealthPlus Pharmacy'],
  },

  // East Africa - Kenya/Tanzania cluster
  Kenya: {
    country: 'Kenya',
    region: 'East Africa',
    languages: ['sw', 'en', 'fr'],
    capital: 'Nairobi',
    timezone: 'GMT+3',
    currency: 'Kenyan Shilling',
    currencyCode: 'KES',
    emergencyNumbers: {
      police: '999',
      ambulance: '912',
      fire: '998',
    },
    majorCities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
    transportModes: ['bus', 'car_hire', 'air', 'ferry'],
    airlines: ['Kenya Airways', 'Precision Air', 'Jambojet'],
    ferryRoutes: [
      { from: 'Mombasa', to: 'Zanzibar', operator: 'Azam Marine' },
    ],
    halalServices: true,
    mosqueMajorCities: ['Nairobi', 'Mombasa', 'Kisumu'],
    simProviders: ['Safaricom', 'Airtel Kenya', 'Telkom Kenya'],
    pharmacyChains: ['Pharmacy Plus', 'Amana Pharmacy', 'Jevanje Pharmacy'],
  },
  Tanzania: {
    country: 'Tanzania',
    region: 'East Africa',
    languages: ['sw', 'en', 'fr'],
    capital: 'Dar es Salaam',
    timezone: 'GMT+3',
    currency: 'Tanzanian Shilling',
    currencyCode: 'TZS',
    emergencyNumbers: {
      police: '112',
      ambulance: '112',
      fire: '112',
    },
    majorCities: ['Dar es Salaam', 'Dodoma', 'Arusha', 'Mwanza', 'Mbeya'],
    transportModes: ['bus', 'car_hire', 'air', 'ferry'],
    airlines: ['Tanzania Airlines', 'Precision Air', 'Coastal Aviation'],
    ferryRoutes: [
      { from: 'Dar es Salaam', to: 'Zanzibar', operator: 'Azam Marine' },
      { from: 'Dar es Salaam', to: 'Pemba', operator: 'Azam Marine' },
    ],
    halalServices: true,
    mosqueMajorCities: ['Dar es Salaam', 'Zanzibar', 'Mombasa'],
    simProviders: ['Vodacom', 'Airtel Tanzania', 'Tigo Tanzania'],
    pharmacyChains: ['Med Plus Pharmacy', 'Pharmacy Dar', 'Kikwete Pharmacy'],
  },

  // Central Africa - DRC cluster
  DRC: {
    country: 'Democratic Republic of Congo',
    region: 'Central Africa',
    languages: ['ln', 'fr', 'sw', 'en'],
    capital: 'Kinshasa',
    timezone: 'GMT+1',
    currency: 'Congolese Franc',
    currencyCode: 'CDF',
    emergencyNumbers: {
      police: '1',
      ambulance: '99',
      fire: '112',
    },
    majorCities: ['Kinshasa', 'Lubumbashi', 'Goma', 'Kisangani', 'Bukavu'],
    transportModes: ['bus', 'car_hire', 'river_ferry', 'air'],
    airlines: ['Congo Airways', 'Hewa Bora Airways'],
    ferryRoutes: [
      { from: 'Kinshasa', to: 'Matadi', operator: 'SNCC Ferry' },
    ],
    halalServices: true,
    mosqueMajorCities: ['Kinshasa', 'Bukavu', 'Goma'],
    simProviders: ['Vodacom Congo', 'Airtel Congo', 'Orange DRC'],
    pharmacyChains: ['Pharmacie Kinshasa', 'Pharmacie Lubumbashi'],
  },

  // Current presence
  Morocco: {
    country: 'Morocco',
    region: 'North Africa',
    languages: ['da', 'fr', 'ar', 'en'],
    capital: 'Rabat',
    timezone: 'GMT+0',
    currency: 'Moroccan Dirham',
    currencyCode: 'MAD',
    emergencyNumbers: {
      police: '19',
      ambulance: '15',
      fire: '15',
    },
    majorCities: ['Casablanca', 'Fez', 'Marrakech', 'Tangier', 'Agadir', 'Rabat'],
    transportModes: ['bus', 'car_hire', 'ferry', 'train', 'air'],
    airlines: ['Royal Air Maroc', 'Air Arabia Maroc'],
    ferryRoutes: [
      { from: 'Tangier', to: 'Algeciras', operator: 'Balearia' },
      { from: 'Tangier', to: 'Barcelona', operator: 'Balearia' },
      { from: 'Nador', to: 'Almería', operator: 'Acciona Trasmediterranea' },
    ],
    halalServices: true,
    mosqueMajorCities: ['Fez', 'Marrakech', 'Tangier', 'Casablanca'],
    simProviders: ['Maroc Telecom', 'Orange Maroc', 'Inwi'],
    pharmacyChains: ['Pharmacie du Centre', 'Pharmacie Moderne'],
  },
};

export function getRegionalKnowledge(country: string): RegionalKnowledge | null {
  return REGIONAL_KNOWLEDGE[country] || null;
}

export function getCountriesByRegion(region: string): string[] {
  return Object.keys(REGIONAL_KNOWLEDGE).filter(
    (country) => REGIONAL_KNOWLEDGE[country].region === region
  );
}

export function getCountriesByLanguage(language: string): string[] {
  return Object.keys(REGIONAL_KNOWLEDGE).filter(
    (country) => REGIONAL_KNOWLEDGE[country].languages.includes(language)
  );
}

export function getEmergencyContactForCountry(country: string, type: 'police' | 'ambulance' | 'fire'): string | null {
  const knowledge = getRegionalKnowledge(country);
  return knowledge ? knowledge.emergencyNumbers[type] : null;
}
