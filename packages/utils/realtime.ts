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
    const cityCoords: Record<string, { lat: number; lon: number }> = {
      Casablanca: { lat: 33.5731, lon: -7.5898 },
      Marrakech: { lat: 31.6295, lon: -8.0081 },
      Tangier: { lat: 35.7595, lon: -5.8336 },
      Fes: { lat: 34.0331, lon: -5.0033 },
      Dakar: { lat: 14.6928, lon: -17.0469 },
      Lagos: { lat: 6.5244, lon: 3.3792 },
      Nairobi: { lat: -1.2865, lon: 36.8172 },
      Cairo: { lat: 30.0444, lon: 31.2357 },
    };

    const coords = cityCoords[city] || (lat && lon ? { lat, lon } : cityCoords.Casablanca);
    const today = new Date().toISOString().split('T')[0];

    const url = new URL('https://api.aladhan.com/v1/timings/' + today);
    url.searchParams.set('latitude', coords.lat.toString());
    url.searchParams.set('longitude', coords.lon.toString());
    url.searchParams.set('method', '5');

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Aladhan API error');
    }

    const data = await response.json();
    const timings = data.data.timings;

    return {
      Fajr: timings.Fajr.split(' ')[0],
      Dhuhr: timings.Dhuhr.split(' ')[0],
      Asr: timings.Asr.split(' ')[0],
      Maghrib: timings.Maghrib.split(' ')[0],
      Isha: timings.Isha.split(' ')[0],
    };
  } catch {
    console.error('[getPrayerTimes] Error');
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
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;

    if (!apiKey) {
      throw new Error('OpenWeatherMap API key not configured');
    }

    const cityCoords: Record<string, { lat: number; lon: number }> = {
      Casablanca: { lat: 33.5731, lon: -7.5898 },
      Marrakech: { lat: 31.6295, lon: -8.0081 },
      Tangier: { lat: 35.7595, lon: -5.8336 },
      Fes: { lat: 34.0331, lon: -5.0033 },
      Dakar: { lat: 14.6928, lon: -17.0469 },
      Lagos: { lat: 6.5244, lon: 3.3792 },
      Nairobi: { lat: -1.2865, lon: 36.8172 },
      Cairo: { lat: 30.0444, lon: 31.2357 },
      Paris: { lat: 48.8566, lon: 2.3522 },
      London: { lat: 51.5074, lon: -0.1278 },
    };

    const coords = cityCoords[city] || (lat && lon ? { lat, lon } : cityCoords.Casablanca);

    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    url.searchParams.set('lat', coords.lat.toString());
    url.searchParams.set('lon', coords.lon.toString());
    url.searchParams.set('appid', apiKey);
    url.searchParams.set('units', 'metric');

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('OpenWeatherMap API error');
    }

    const data = await response.json();

    return {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      description: data.weather[0].description,
    };
  } catch {
    console.error('[getWeather] Error');
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
    const url = new URL('https://api.exchangerate-api.com/v4/latest/' + encodeURIComponent(from));
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Exchange rate API error');
    }

    const data = (await response.json()) as { rates?: Record<string, number> };
    const rate = data.rates?.[to] ?? 1;

    return {
      from,
      to,
      rate,
      timestamp: new Date().toISOString(),
    };
  } catch {
    console.error('[getExchangeRate] Error');
    const rates: Record<string, Record<string, number>> = {
      EUR: { USD: 1.08, MAD: 10.5, GBP: 0.83, XOF: 655.96, NGN: 1650.0, KES: 134.5, TZS: 2830.0 },
      USD: { EUR: 0.92, MAD: 9.8, GBP: 0.77, XOF: 607.26, NGN: 1530.0, KES: 124.6, TZS: 2620.0 },
      GBP: { EUR: 1.2, USD: 1.3, MAD: 12.3, XOF: 789.21, NGN: 1980.0, KES: 161.0, TZS: 3406.0 },
      MAD: { EUR: 0.095, USD: 0.1, GBP: 0.081, XOF: 64.17, NGN: 150.0, KES: 12.7, TZS: 273.0 },
      XOF: { EUR: 0.00153, USD: 0.00165, GBP: 0.00127, MAD: 0.0156, NGN: 2.34, KES: 0.204, TZS: 4.28 },
      NGN: { EUR: 0.00061, USD: 0.00065, GBP: 0.00051, MAD: 0.00654, XOF: 0.427, KES: 0.081, TZS: 1.69 },
      KES: { EUR: 0.0074, USD: 0.008, GBP: 0.0062, MAD: 0.0787, XOF: 4.9, NGN: 12.35, TZS: 21.0 },
      TZS: { EUR: 0.00035, USD: 0.00038, GBP: 0.0003, MAD: 0.00366, XOF: 0.233, NGN: 0.591, KES: 0.0476 },
    };

    const rate = rates[from]?.[to] || 1;

    return {
      from,
      to,
      rate,
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
  } catch {
    console.error('[getFerrySchedules] Error');
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
