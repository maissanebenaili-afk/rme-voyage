// Real-time data utilities for SAFAR platform
// Integrates with external APIs for prayer times, weather, exchange rates, etc.

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
}

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
}

/**
 * Get prayer times for a location using Aladhan API
 * Falls back to mock data if API fails
 */
export async function getPrayerTimes(
  city: string,
  lat?: number,
  lon?: number
): Promise<PrayerTimes> {
  try {
    // TODO: Integrate with Aladhan API
    // For now, return mock data based on city
    const mockTimes: Record<string, PrayerTimes> = {
      Casablanca: {
        Fajr: '05:15',
        Dhuhr: '12:45',
        Asr: '16:00',
        Maghrib: '18:30',
        Isha: '20:00',
      },
      Marrakech: {
        Fajr: '05:25',
        Dhuhr: '12:55',
        Asr: '16:10',
        Maghrib: '18:40',
        Isha: '20:10',
      },
      Tangier: {
        Fajr: '05:20',
        Dhuhr: '12:50',
        Asr: '16:05',
        Maghrib: '18:35',
        Isha: '20:05',
      },
      Fes: {
        Fajr: '05:10',
        Dhuhr: '12:40',
        Asr: '15:55',
        Maghrib: '18:25',
        Isha: '19:55',
      },
    };

    return mockTimes[city] || mockTimes.Casablanca;
  } catch (error) {
    console.error('[getPrayerTimes] Error:', error);
    // Return default times on error
    return {
      Fajr: '05:15',
      Dhuhr: '12:45',
      Asr: '16:00',
      Maghrib: '18:30',
      Isha: '20:00',
    };
  }
}

/**
 * Get weather data for a location
 * Falls back to mock data if API fails
 */
export async function getWeather(
  city: string,
  lat?: number,
  lon?: number
): Promise<WeatherData> {
  try {
    // TODO: Integrate with OpenWeatherMap or similar
    const mockWeather: Record<string, WeatherData> = {
      Casablanca: {
        temp: 22,
        condition: 'Partly Cloudy',
        humidity: 70,
        windSpeed: 15,
        description: 'Mild weather with occasional clouds',
      },
      Marrakech: {
        temp: 28,
        condition: 'Sunny',
        humidity: 45,
        windSpeed: 10,
        description: 'Hot and sunny',
      },
      Tangier: {
        temp: 18,
        condition: 'Cloudy',
        humidity: 75,
        windSpeed: 20,
        description: 'Cool and cloudy near coast',
      },
      Paris: {
        temp: 15,
        condition: 'Rainy',
        humidity: 80,
        windSpeed: 18,
        description: 'Typical Parisian weather',
      },
      London: {
        temp: 12,
        condition: 'Overcast',
        humidity: 85,
        windSpeed: 16,
        description: 'Typical London weather',
      },
    };

    return mockWeather[city] || mockWeather.Casablanca;
  } catch (error) {
    console.error('[getWeather] Error:', error);
    return {
      temp: 20,
      condition: 'Unknown',
      humidity: 60,
      windSpeed: 10,
      description: 'Weather data unavailable',
    };
  }
}

/**
 * Get current exchange rates
 * Falls back to mock data if API fails
 */
export async function getExchangeRate(
  from: string,
  to: string
): Promise<ExchangeRate> {
  try {
    // TODO: Integrate with real exchange rate API (OANDA, XE, etc.)
    const rates: Record<string, Record<string, number>> = {
      EUR: { USD: 1.08, MAD: 10.5, GBP: 0.83 },
      USD: { EUR: 0.92, MAD: 9.8, GBP: 0.77 },
      GBP: { EUR: 1.2, USD: 1.3, MAD: 12.3 },
      MAD: { EUR: 0.095, USD: 0.1, GBP: 0.081 },
    };

    const rate = rates[from]?.[to] || 1;

    return {
      from,
      to,
      rate,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[getExchangeRate] Error:', error);
    return {
      from,
      to,
      rate: 1,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get ferry schedules
 * Mock data for common routes
 */
export interface FerrySchedule {
  departure: string;
  arrival: string;
  operator: string;
  price: number;
  duration: string;
}

export async function getFerrySchedules(
  from: string,
  to: string
): Promise<FerrySchedule[]> {
  try {
    // TODO: Integrate with real ferry booking APIs
    const schedules: Record<string, FerrySchedule[]> = {
      'Tarifa-Tangier': [
        {
          departure: '08:00',
          arrival: '10:00',
          operator: 'FRS',
          price: 35,
          duration: '1h',
        },
        {
          departure: '14:00',
          arrival: '16:00',
          operator: 'Balearia',
          price: 38,
          duration: '1h',
        },
      ],
      'Barcelona-Tangier': [
        {
          departure: '23:00',
          arrival: '13:00',
          operator: 'Grandi Navi Veloci',
          price: 150,
          duration: '10h',
        },
      ],
      'Sete-Tangier': [
        {
          departure: '20:00',
          arrival: '08:00',
          operator: 'Comarit',
          price: 120,
          duration: '11h',
        },
      ],
    };

    const key = `${from}-${to}`;
    return schedules[key] || [];
  } catch (error) {
    console.error('[getFerrySchedules] Error:', error);
    return [];
  }
}

/**
 * Get nearby halal restaurants/services
 */
export interface HalalService {
  name: string;
  type: string;
  location: string;
  rating: number;
  distance?: number;
}

export async function getNearbyHalalServices(
  city: string,
  type: 'restaurant' | 'supermarket' | 'butcher' | 'all' = 'all'
): Promise<HalalService[]> {
  // TODO: Integrate with Google Places or local database
  const services: Record<string, HalalService[]> = {
    Marrakech: [
      {
        name: 'Restaurant Marrakech',
        type: 'restaurant',
        location: 'Medina',
        rating: 4.7,
      },
      {
        name: 'Halal Butcher Shop',
        type: 'butcher',
        location: 'Souk',
        rating: 4.5,
      },
    ],
    Casablanca: [
      {
        name: 'Halal Supermarket',
        type: 'supermarket',
        location: 'Anfa',
        rating: 4.6,
      },
      {
        name: 'Restaurant Hassan',
        type: 'restaurant',
        location: 'Ain Diab',
        rating: 4.8,
      },
    ],
  };

  return services[city] || [];
}

/**
 * Emergency contacts by country
 */
export interface EmergencyContact {
  country: string;
  police: string;
  ambulance: string;
  fire: string;
  embassy?: string;
  number?: string;
}

export function getEmergencyContacts(country: string): EmergencyContact {
  const contacts: Record<string, EmergencyContact> = {
    Morocco: {
      country: 'Morocco',
      police: '19',
      ambulance: '15',
      fire: '10',
      embassy: 'US Embassy Rabat',
      number: '+212 5 37 76 2265',
    },
    France: {
      country: 'France',
      police: '17',
      ambulance: '15',
      fire: '18',
      embassy: 'US Embassy Paris',
      number: '+33 1 43 12 22 22',
    },
    Spain: {
      country: 'Spain',
      police: '091',
      ambulance: '061',
      fire: '080',
      embassy: 'US Embassy Madrid',
      number: '+34 91 587 2200',
    },
    UK: {
      country: 'UK',
      police: '999',
      ambulance: '999',
      fire: '999',
      embassy: 'US Embassy London',
      number: '+44 20 7499 9000',
    },
  };

  return contacts[country] || contacts.Morocco;
}
