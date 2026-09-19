import { AgentConfig, AgentResponse } from '../types/agent';
import { getRegionalKnowledge } from '../utils/regional-knowledge';

export class LocalizerAgent {
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  async processQuery(message: string): Promise<AgentResponse> {
    const { userId, lang } = this.config;

    // Detect query type
    if (this.isPrayerTimeQuery(message)) {
      return this.getPrayerTimes(message, lang);
    }

    if (this.isWeatherQuery(message)) {
      return this.getWeather(message, lang);
    }

    if (this.isLocalInfoQuery(message)) {
      return this.getLocalInfo(message, lang);
    }

    return {
      text: this.getDefaultMessage(lang),
      agent: 'LOCALIZER',
      confidence: 0.3,
      metadata: { queryType: 'generic' },
      followups: [
        `Ask about prayer times`,
        `Request weather information`,
        `Ask for local tips (halal food, SIM cards, etc.)`,
      ],
    };
  }

  private isPrayerTimeQuery(message: string): boolean {
    const keywords = ['prayer', 'prière', 'salat', 'صلاة', 'oración', 'heure'];
    return keywords.some((kw) => message.toLowerCase().includes(kw));
  }

  private isWeatherQuery(message: string): boolean {
    const keywords = ['weather', 'météo', 'temps', 'طقس', 'clima', 'température'];
    return keywords.some((kw) => message.toLowerCase().includes(kw));
  }

  private isLocalInfoQuery(message: string): boolean {
    const keywords = [
      'halal',
      'SIM',
      'food',
      'nourriture',
      'restaurant',
      'mosque',
      'mosquée',
      'gas',
      'essence',
      'pharmacie',
    ];
    return keywords.some((kw) => message.toLowerCase().includes(kw));
  }

  private async getPrayerTimes(message: string, lang: string): Promise<AgentResponse> {
    // Extract city from message
    const cityMatch = message.match(/(?:à|in|a)\s+([a-zA-Z]+)/i);
    const city = cityMatch ? cityMatch[1] : 'your location';

    // TODO: Integrate with Aladhan API or similar
    const prayerTimes = {
      Fajr: '05:45',
      Dhuhr: '12:30',
      Asr: '15:45',
      Maghrib: '18:20',
      Isha: '19:45',
    };

    return {
      text: this.formatPrayerTimes(prayerTimes, city, lang),
      agent: 'LOCALIZER',
      confidence: 0.9,
      metadata: { queryType: 'prayer', city, timestamp: new Date().toISOString() },
      followups: [
        `Ask for nearby mosques`,
        `Request adhan reminder setup`,
      ],
    };
  }

  private async getWeather(message: string, lang: string): Promise<AgentResponse> {
    const cityMatch = message.match(/(?:à|in|a)\s+([a-zA-Z]+)/i);
    const city = cityMatch ? cityMatch[1] : 'your location';

    // TODO: Integrate with OpenWeatherMap or similar
    const weather = {
      temp: 28,
      condition: 'sunny',
      humidity: 65,
      windSpeed: 12,
    };

    return {
      text: this.formatWeather(weather, city, lang),
      agent: 'LOCALIZER',
      confidence: 0.85,
      metadata: { queryType: 'weather', city, condition: weather.condition },
      followups: [
        `Ask for packing recommendations based on weather`,
        `Request weather forecast for trip duration`,
      ],
    };
  }

  private async getLocalInfo(message: string, lang: string): Promise<AgentResponse> {
    const cityMatch = message.match(/(?:à|in|a)\s+([a-zA-Z]+)/i);
    const city = cityMatch ? cityMatch[1] : 'your location';

    // Extract country from config if available
    const country = this.config.country || 'Morocco';
    const regional = getRegionalKnowledge(country);

    const localInfo = regional ? {
      halal: regional.halalServices ? regional.simProviders.slice(0, 2) : ['Not widely available'],
      simCards: regional.simProviders,
      pharmacies: regional.pharmacyChains,
      operator: regional,
    } : {
      halal: ['Local halal services available'],
      simCards: ['Check with locals'],
      pharmacies: ['Ask for local pharmacy'],
      operator: null,
    };

    return {
      text: this.formatLocalInfo(localInfo, city, lang, country),
      agent: 'LOCALIZER',
      confidence: 0.8,
      metadata: { queryType: 'local', city, country },
      followups: [
        `Get specific restaurant or pharmacy names`,
        `Ask for SIM card setup help`,
      ],
    };
  }

  private formatPrayerTimes(
    times: Record<string, string>,
    city: string,
    lang: string
  ): string {
    const timesText = Object.entries(times)
      .map(([name, time]) => `${name}: ${time}`)
      .join(' • ');

    const responses: Record<string, string> = {
      da: `🕌 Tiqat l-qibla f ${city}: ${timesText}`,
      fr: `🕌 Horaires des prières à ${city}: ${timesText}`,
      en: `🕌 Prayer times in ${city}: ${timesText}`,
      ar: `🕌 أوقات الصلاة في ${city}: ${timesText}`,
      es: `🕌 Horarios de oración en ${city}: ${timesText}`,
    };

    return responses[lang] || responses.en;
  }

  private formatWeather(
    weather: any,
    city: string,
    lang: string
  ): string {
    const responses: Record<string, string> = {
      da: `☀️ F ${city}: ${weather.temp}°C, ${weather.condition}. Humidity: ${weather.humidity}%`,
      fr: `☀️ À ${city}: ${weather.temp}°C, ${weather.condition}. Humidité: ${weather.humidity}%`,
      en: `☀️ In ${city}: ${weather.temp}°C, ${weather.condition}. Humidity: ${weather.humidity}%`,
      ar: `☀️ في ${city}: ${weather.temp}°C، ${weather.condition}. الرطوبة: ${weather.humidity}%`,
      es: `☀️ En ${city}: ${weather.temp}°C, ${weather.condition}. Humedad: ${weather.humidity}%`,
    };

    return responses[lang] || responses.en;
  }

  private formatLocalInfo(
    info: any,
    city: string,
    lang: string,
    country: string = 'Morocco'
  ): string {
    const formatList = (items: string[]) => items.slice(0, 3).join(', ');

    const responses: Record<string, string> = {
      da: `🏘️ F ${city} (${country}): Halal: ${formatList(info.halal)} | SIM: ${formatList(info.simCards)} | Pharmacies: ${formatList(info.pharmacies)}`,
      fr: `🏘️ À ${city} (${country}): Halal: ${formatList(info.halal)} | Cartes SIM: ${formatList(info.simCards)} | Pharmacies: ${formatList(info.pharmacies)}`,
      en: `🏘️ In ${city} (${country}): Halal: ${formatList(info.halal)} | SIM cards: ${formatList(info.simCards)} | Pharmacies: ${formatList(info.pharmacies)}`,
      ar: `🏘️ في ${city} (${country}): حلال: ${formatList(info.halal)} | بطاقات SIM: ${formatList(info.simCards)} | الصيدليات: ${formatList(info.pharmacies)}`,
      es: `🏘️ En ${city} (${country}): Halal: ${formatList(info.halal)} | Tarjetas SIM: ${formatList(info.simCards)} | Farmacias: ${formatList(info.pharmacies)}`,
      wo: `🏘️ Ci ${city} (${country}): Halal: ${formatList(info.halal)} | SIM: ${formatList(info.simCards)} | Jëmandali: ${formatList(info.pharmacies)}`,
      ff: `🏘️ E ${city} (${country}): Halal: ${formatList(info.halal)} | SIM: ${formatList(info.simCards)} | Daakunde: ${formatList(info.pharmacies)}`,
      yo: `🏘️ Ni ${city} (${country}): Halal: ${formatList(info.halal)} | SIM: ${formatList(info.simCards)} | Òtèrà ìjòsun: ${formatList(info.pharmacies)}`,
      sw: `🏘️ Katika ${city} (${country}): Halal: ${formatList(info.halal)} | SIM: ${formatList(info.simCards)} | Duka la dawa: ${formatList(info.pharmacies)}`,
    };

    return responses[lang] || responses.en;
  }

  private getDefaultMessage(lang: string): string {
    const messages: Record<string, string> = {
      da: `Salam! Nshans n-localizer. Qullak shkun dyal lmadina lli ktsemel?`,
      fr: `Bonjour! Je suis votre guide local. Qu'aimeriez-vous savoir sur cette région?`,
      en: `Hello! I'm your local guide. What would you like to know about this area?`,
      ar: `مرحبا! أنا دليلك المحلي. ماذا تود أن تعرف عن هذه المنطقة؟`,
      es: `¡Hola! Soy tu guía local. ¿Qué te gustaría saber sobre esta área?`,
    };
    return messages[lang] || messages.en;
  }
}
