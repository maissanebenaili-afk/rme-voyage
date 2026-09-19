import { AgentConfig, AgentResponse } from '../types/agent';

export class NavigatorAgent {
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  async processQuery(message: string): Promise<AgentResponse> {
    const { userId, lang, currentLocation } = this.config;

    // Extract route information from message
    const routeMatch = message.match(
      /(?:de|from|من|من|de)\s+(\w+)\s+(?:à|to|إلى|إلى|a)\s+(\w+)/i
    );

    if (!routeMatch) {
      return {
        text: this.getDefaultMessage(lang),
        agent: 'NAVIGATOR',
        confidence: 0.3,
        metadata: { queryType: 'generic' },
        followups: [
          `Ask for specific origin and destination`,
          `Provide information about ferry times`,
        ],
      };
    }

    const [, origin, destination] = routeMatch;

    // Mock route calculation (will integrate with OSRM/Google Maps)
    const routeInfo = await this.calculateRoute(origin, destination);

    return {
      text: this.formatRouteResponse(routeInfo, lang),
      agent: 'NAVIGATOR',
      confidence: 0.85,
      metadata: {
        queryType: 'route',
        origin,
        destination,
        distance: routeInfo.distance,
        duration: routeInfo.duration,
      },
      followups: [
        `Ask about specific transport modes (ferry, car, flight)`,
        `Request real-time traffic updates`,
      ],
    };
  }

  private async calculateRoute(
    origin: string,
    destination: string
  ): Promise<any> {
    // TODO: Integrate with OSRM or Google Maps API
    // For now, return mock data
    const routes: Record<string, Record<string, any>> = {
      'Paris-Tangier': {
        distance: 1600,
        duration: 7200,
        transport: ['ferry', 'flight', 'train'],
        ferryTime: '17h',
        flightTime: '2h',
      },
      'London-Casablanca': {
        distance: 1750,
        duration: 10800,
        transport: ['flight', 'ferry'],
        ferryTime: '40h',
        flightTime: '4h',
      },
      'Barcelona-Tangier': {
        distance: 400,
        duration: 14400,
        transport: ['ferry', 'flight'],
        ferryTime: '10h',
        flightTime: '1h',
      },
    };

    const key = `${origin}-${destination}`;
    return (
      routes[key] || {
        distance: 1200,
        duration: 3600,
        transport: ['multiple'],
      }
    );
  }

  private formatRouteResponse(routeInfo: any, lang: string): string {
    const responses: Record<string, string> = {
      da: `🗺️ Hnadak! L-ətibrar dyal ${routeInfo.distance}km, katsemel ${routeInfo.duration / 3600}h. Transport: ${routeInfo.transport.join(', ')}.`,
      fr: `🗺️ Voici votre itinéraire: ${routeInfo.distance}km, durée ${routeInfo.duration / 3600}h. Transports disponibles: ${routeInfo.transport.join(', ')}.`,
      en: `🗺️ Here's your route: ${routeInfo.distance}km, duration ${routeInfo.duration / 3600}h. Available transport: ${routeInfo.transport.join(', ')}.`,
      ar: `🗺️ إليك المسار: ${routeInfo.distance}كم، المدة ${routeInfo.duration / 3600}س. النقل المتاح: ${routeInfo.transport.join(', ')}.`,
      es: `🗺️ Aquí está tu ruta: ${routeInfo.distance}km, duración ${routeInfo.duration / 3600}h. Transporte disponible: ${routeInfo.transport.join(', ')}.`,
    };

    return responses[lang] || responses.en;
  }

  private getDefaultMessage(lang: string): string {
    const messages: Record<string, string> = {
      da: `Salam! Nshans n-nnavigator. Qullak menin kayna wa menin ktsemel?`,
      fr: `Bonjour! Je suis votre navigateur de voyage. D'où partez-vous et où allez-vous?`,
      en: `Hello! I'm your travel navigator. Where are you traveling from and to?`,
      ar: `مرحبا! أنا مساعد الملاحة الخاص بك. من أين تسافر وإلى أين؟`,
      es: `¡Hola! Soy tu navegador de viajes. ¿De dónde viajas y hacia dónde?`,
    };
    return messages[lang] || messages.en;
  }
}
