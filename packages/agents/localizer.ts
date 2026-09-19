import { AgentConfig, AgentResponse } from '../types/agent';

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

    // TODO: Integrate with local database or APIs
    const localInfo = {
      halal: ['Restaurant Marrakech', 'Cafe Berber', 'Tagine House'],
      simCards: ['Orange Morocco', 'Maroc Telecom', 'Free Morocco'],
      pharmacies: ['Pharmacie du Centre', 'Pharmacie Moderne'],
    };

    return {
      text: this.formatLocalInfo(localInfo, city, lang),
      agent: 'LOCALIZER',
      confidence: 0.8,
      metadata: { queryType: 'local', city },
      followups: [
        `Get more specific recommendations`,
        `Ask for phone numbers and addresses`,
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
    lang: string
  ): string {
    const responses: Record<string, string> = {
      da: `🏘️ F ${city}: Halal: ${info.halal.join(', ')} | SIM: ${info.simCards.join(', ')}`,
      fr: `🏘️ À ${city}: Halal: ${info.halal.join(', ')} | Cartes SIM: ${info.simCards.join(', ')}`,
      en: `🏘️ In ${city}: Halal: ${info.halal.join(', ')} | SIM cards: ${info.simCards.join(', ')}`,
      ar: `🏘️ في ${city}: حلال: ${info.halal.join(', ')} | بطاقات SIM: ${info.simCards.join(', ')}`,
      es: `🏘️ En ${city}: Halal: ${info.halal.join(', ')} | Tarjetas SIM: ${info.simCards.join(', ')}`,
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
