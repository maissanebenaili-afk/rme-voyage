import { AgentConfig, AgentResponse } from '../types/agent';
import { getRegionalKnowledge } from '../utils/regional-knowledge';

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

  private async calculateRoute(origin: string, destination: string): Promise<any> {
    const routes: Record<string, Record<string, any>> = {
      // Europe-Africa routes
      'Paris-Tangier': { distance: 1600, duration: 7200, transport: ['ferry', 'flight', 'train'], operators: ['Royal Air Maroc', 'Balearia'] },
      'London-Casablanca': { distance: 1750, duration: 10800, transport: ['flight', 'ferry'], operators: ['Royal Air Maroc'] },
      'Barcelona-Tangier': { distance: 400, duration: 14400, transport: ['ferry', 'flight'], operators: ['Balearia'] },
      'Paris-Dakar': { distance: 2000, duration: 14400, transport: ['flight'], operators: ['Air Senegal', 'Air France'] },
      'London-Lagos': { distance: 5000, duration: 21600, transport: ['flight'], operators: ['British Airways', 'Air Peace'] },
      'Brussels-Kinshasa': { distance: 3500, duration: 28800, transport: ['flight'], operators: ['Kenya Airways', 'Brussels Airlines'] },

      // West African routes
      'Dakar-Conakry': { distance: 800, duration: 7200, transport: ['bus', 'flight', 'car_hire'], operators: ['Air Senegal'] },
      'Dakar-Bamako': { distance: 1100, duration: 10800, transport: ['bus', 'flight'], operators: ['Air Mali'] },
      'Conakry-Bamako': { distance: 850, duration: 7200, transport: ['bus', 'flight', 'car_hire'], operators: ['Air Guinea'] },
      'Dakar-Lagos': { distance: 1500, duration: 12000, transport: ['flight', 'bus'], operators: ['Air Peace', 'Air Senegal'] },
      'Lagos-Abuja': { distance: 600, duration: 5400, transport: ['flight', 'bus', 'car_hire'], operators: ['Air Peace', 'Dana Air'] },
      'Lagos-Kano': { distance: 800, duration: 7200, transport: ['flight', 'bus'], operators: ['Air Peace', 'Arik Air'] },

      // East African routes
      'Nairobi-Dar es Salaam': { distance: 1000, duration: 9000, transport: ['flight', 'bus', 'car_hire'], operators: ['Kenya Airways', 'Precision Air'] },
      'Nairobi-Mombasa': { distance: 500, duration: 5400, transport: ['flight', 'bus', 'train', 'car_hire'], operators: ['Kenya Airways', 'Jambojet'] },
      'Dar es Salaam-Zanzibar': { distance: 50, duration: 3600, transport: ['ferry', 'flight'], operators: ['Azam Marine', 'Tanzania Airlines'] },
      'Dar es Salaam-Mbeya': { distance: 900, duration: 8100, transport: ['bus', 'car_hire'], operators: ['Various operators'] },

      // Central African routes
      'Kinshasa-Lubumbashi': { distance: 2100, duration: 18000, transport: ['flight', 'river_ferry', 'bus'], operators: ['Congo Airways'] },
      'Kinshasa-Kisangani': { distance: 1700, duration: 14400, transport: ['river_ferry', 'flight'], operators: ['Various operators'] },
      'Kinshasa-Bukavu': { distance: 1500, duration: 12000, transport: ['flight', 'bus'], operators: ['Congo Airways'] },

      // Intra-African diaspora routes
      'Marrakech-Dakar': { distance: 1800, duration: 14400, transport: ['flight', 'bus'], operators: ['Royal Air Maroc', 'Air Senegal'] },
      'Casablanca-Lagos': { distance: 2000, duration: 16200, transport: ['flight'], operators: ['Royal Air Maroc', 'Air Peace'] },
      'Tangier-Dakar': { distance: 1600, duration: 12600, transport: ['flight', 'ferry', 'bus'], operators: ['Royal Air Maroc', 'Air Senegal'] },
    };

    const normalize = (city: string) => city.toLowerCase().trim();
    const originNorm = normalize(origin);
    const destNorm = normalize(destination);

    for (const [route, data] of Object.entries(routes)) {
      const [routeFrom, routeTo] = route.split('-');
      if ((normalize(routeFrom) === originNorm && normalize(routeTo) === destNorm) ||
          (normalize(routeTo) === originNorm && normalize(routeFrom) === destNorm)) {
        return data;
      }
    }

    return {
      distance: 1200,
      duration: 3600,
      transport: ['multiple'],
      operators: ['Various'],
    };
  }

  private formatRouteResponse(routeInfo: any, lang: string): string {
    const hours = (routeInfo.duration / 3600).toFixed(1);
    const response = (template: string) => template
      .replace('{distance}', routeInfo.distance)
      .replace('{duration}', hours)
      .replace('{transport}', routeInfo.transport.join(', '))
      .replace('{operators}', routeInfo.operators?.join(', ') || 'Various');

    const templates: Record<string, string> = {
      da: `🗺️ Hnadak! L-ətibrar dyal {distance}km, katsemel {duration}h. Transport: {transport}. Operateurs: {operators}.`,
      fr: `🗺️ Voici votre itinéraire: {distance}km, durée {duration}h. Transports: {transport}. Opérateurs: {operators}.`,
      en: `🗺️ Here's your route: {distance}km, duration {duration}h. Transport modes: {transport}. Operators: {operators}.`,
      ar: `🗺️ إليك المسار: {distance}كم، المدة {duration}س. النقل: {transport}. المشغلون: {operators}.`,
      es: `🗺️ Aquí está tu ruta: {distance}km, duración {duration}h. Transportes: {transport}. Operadores: {operators}.`,
      wo: `🗺️ Wala reew: {distance}km, xarit {duration}h. Kaas: {transport}. Potentialeel: {operators}.`,
      ff: `🗺️ Ndee innde: {distance}km, yare {duration}h. Karalte: {transport}. Daakunde: {operators}.`,
      yo: `🗺️ Ọ̀nà yi: {distance}km, ìgbà {duration}h. Ire: {transport}. Àwọn olùpèsè: {operators}.`,
      sw: `🗺️ Njia yako: {distance}km, muda {duration}h. Usafiri: {transport}. Waendeshaji: {operators}.`,
    };

    const template = templates[lang] || templates.en;
    return response(template);
  }

  private getDefaultMessage(lang: string): string {
    const messages: Record<string, string> = {
      da: `Salam! Nshans n-navigator. Qullak menin kayna wa menin ktsemel?`,
      fr: `Bonjour! Je suis votre navigateur de voyage. D'où partez-vous et où allez-vous?`,
      en: `Hello! I'm your travel navigator. Where are you traveling from and to?`,
      ar: `مرحبا! أنا مساعد الملاحة الخاص بك. من أين تسافر وإلى أين؟`,
      es: `¡Hola! Soy tu navegador de viajes. ¿De dónde viajas y hacia dónde?`,
      wo: `Salaam! Maa joge tajaaxe. Xarit na toog?`,
      ff: `Assalamu alaikum! Mi jogi daandumaa. Innde ka haan?`,
      yo: `Pẹlẹ o! Mo jẹ ẹlòmìíràn ìrinájọ. Níbo ni o wá àti níbo ni o máa lọ?`,
      ig: `Kedu! Abụ m onye ịgba aka na njem. Ebe a si ebe na ebe ọ gaa?`,
      sw: `Habari! Mimi ni msaada wa kusafiri. Unakosafiri kutoka wapi na kwenda wapi?`,
    };
    return messages[lang] || messages.en;
  }
}
