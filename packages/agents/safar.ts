import { AgentConfig, AgentResponse, Intent, ConversationMessage } from '../types/agent';
import { NavigatorAgent } from './navigator';
import { LocalizerAgent } from './localizer';
import { CommunityAgent } from './community';
import { BudgetAgent } from './budget';
import { EmergencyAgent } from './emergency';
import { getRegionalKnowledge, getCountriesByLanguage } from '../utils/regional-knowledge';

class SafarAgent {
  private config: AgentConfig;
  private navigator: NavigatorAgent;
  private localizer: LocalizerAgent;
  private community: CommunityAgent;
  private budget: BudgetAgent;
  private emergency: EmergencyAgent;

  constructor(config: AgentConfig) {
    this.config = config;
    this.navigator = new NavigatorAgent(config);
    this.localizer = new LocalizerAgent(config);
    this.community = new CommunityAgent(config);
    this.budget = new BudgetAgent(config);
    this.emergency = new EmergencyAgent(config);
  }

  async processMessage(userMessage: string): Promise<AgentResponse> {
    // 1. Auto-detect country context if not set
    if (!this.config.country) {
      this.config.country = this.detectCountry(userMessage);
    }

    // 2. Extract intent & context
    const intentData = this.extractIntent(userMessage);
    const agentType = this.selectAgent(intentData.type);

    // 3. Route to appropriate sub-agent
    let response: AgentResponse;

    try {
      switch (agentType) {
        case 'navigate':
          response = await this.navigator.processQuery(userMessage);
          break;
        case 'localize':
          response = await this.localizer.processQuery(userMessage);
          break;
        case 'community':
          response = await this.community.processQuery(userMessage);
          break;
        case 'budget':
          response = await this.budget.processQuery(userMessage);
          break;
        case 'emergency':
          response = await this.emergency.processQuery(userMessage);
          break;
        default:
          return this.fallbackResponse(userMessage);
      }

      // 3. Update conversation history
      this.updateHistory({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      });

      this.updateHistory({
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toISOString(),
        agent: response.agent,
      });

      return response;
    } catch (error) {
      console.error(`[SafarAgent] Error routing to ${agentType}:`, error);
      return this.fallbackResponse(userMessage);
    }
  }

  private extractIntent(message: string): Intent {
    const lowerMsg = message.toLowerCase();

    // Intent detection with keyword matching
    const intentKeywords = {
      navigate: [
        'route',
        'direction',
        'map',
        'distance',
        'tariq',
        'path',
        'ferry',
        'bateau',
        'how to get',
        'comment aller',
      ],
      localize: [
        'prayer',
        'prière',
        'salat',
        'weather',
        'météo',
        'restaurant',
        'halal',
        'mosque',
        'pharmacie',
        'pharmacy',
      ],
      community: [
        'recommend',
        'tips',
        'advice',
        'travelers',
        'avis',
        'conseil',
        'other people',
      ],
      budget: ['budget', 'cost', 'price', 'how much', 'combien', 'exchange', 'currency'],
      emergency: [
        'emergency',
        'help',
        'police',
        'hospital',
        'urgence',
        'accident',
        'ambulance',
      ],
    };

    let detectedIntent: Intent['type'] = 'unknown';
    let maxMatches = 0;

    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      const matches = keywords.filter((kw) => lowerMsg.includes(kw)).length;
      if (matches > maxMatches) {
        detectedIntent = intent as Intent['type'];
        maxMatches = matches;
      }
    }

    const confidence = Math.min(maxMatches / 2, 0.95);

    return {
      type: detectedIntent || 'general',
      confidence,
      entities: this.extractEntities(message),
    };
  }

  private detectCountry(message: string): string {
    const lowerMsg = message.toLowerCase();
    const countryKeywords: Record<string, string> = {
      // West Africa
      senegal: 'Senegal',
      dakar: 'Senegal',
      guinea: 'Guinea',
      conakry: 'Guinea',
      mali: 'Mali',
      bamako: 'Mali',
      nigeria: 'Nigeria',
      lagos: 'Nigeria',
      abuja: 'Nigeria',
      // East Africa
      kenya: 'Kenya',
      nairobi: 'Kenya',
      mombasa: 'Kenya',
      tanzania: 'Tanzania',
      'dar es salaam': 'Tanzania',
      // Central Africa
      drc: 'DRC',
      'democratic republic': 'DRC',
      kinshasa: 'DRC',
      congo: 'DRC',
      // Current
      morocco: 'Morocco',
      marrakech: 'Morocco',
      casablanca: 'Morocco',
      tangier: 'Morocco',
      rabat: 'Morocco',
    };

    for (const [keyword, country] of Object.entries(countryKeywords)) {
      if (lowerMsg.includes(keyword)) {
        return country;
      }
    }

    // Fallback to user's language region
    const languageCountries: Record<string, string[]> = {
      da: ['Morocco'],
      fr: ['Senegal', 'Guinea', 'Mali', 'DRC', 'Morocco'],
      en: ['Kenya', 'Nigeria', 'Tanzania'],
      ar: ['Morocco'],
      es: ['Morocco'],
      wo: ['Senegal'],
      ff: ['Guinea', 'Mali', 'Senegal'],
      bm: ['Mali'],
      yo: ['Nigeria'],
      ig: ['Nigeria'],
      ha: ['Nigeria'],
      sw: ['Kenya', 'Tanzania'],
      ln: ['DRC'],
    };

    const countries = languageCountries[this.config.lang] || ['Morocco'];
    return countries[0];
  }

  private extractEntities(message: string): any[] {
    const entities: any[] = [];

    // Pan-African cities for routing
    const cities: Record<string, string> = {
      marrakech: 'Morocco',
      casablanca: 'Morocco',
      fes: 'Morocco',
      tangier: 'Morocco',
      rabat: 'Morocco',
      agadir: 'Morocco',
      taza: 'Morocco',
      dakar: 'Senegal',
      conakry: 'Guinea',
      bamako: 'Mali',
      lagos: 'Nigeria',
      abuja: 'Nigeria',
      nairobi: 'Kenya',
      mombasa: 'Kenya',
      kinshasa: 'DRC',
      'dar es salaam': 'Tanzania',
      zanzibar: 'Tanzania',
      kano: 'Nigeria',
      fez: 'Morocco',
      paris: 'France',
      london: 'UK',
      madrid: 'Spain',
      barcelona: 'Spain',
    };

    for (const city of Object.keys(cities)) {
      if (message.toLowerCase().includes(city)) {
        entities.push({ type: 'location', value: city });
      }
    }

    // Extract numbers (amounts, durations)
    const numbers = message.match(/\d+/g);
    if (numbers) {
      numbers.forEach((num) => {
        entities.push({ type: 'number', value: num });
      });
    }

    return entities;
  }

  private selectAgent(intentType: Intent['type']): string {
    const mapping: Record<Intent['type'], string> = {
      navigate: 'navigate',
      localize: 'localize',
      community: 'community',
      budget: 'budget',
      emergency: 'emergency',
      general: 'community',
      unknown: 'community',
    };
    return mapping[intentType] || 'community';
  }

  private fallbackResponse(message: string): AgentResponse {
    const responses: Record<string, string> = {
      // Current languages
      da: `Salam! Je n'ai pas bien compris. Je peux t'aider avec: routes, prière, weather, budget, urgences, conseils...`,
      fr: `Je n'ai pas bien compris. Tu peux reformuler? Je peux t'aider avec: routes, prière, météo, budget, urgences, conseils communauté...`,
      en: `I didn't understand well. Can you rephrase? I can help with: routes, prayer times, weather, budget, emergencies, community tips...`,
      ar: `لم أفهم جيدًا. هل يمكنك إعادة الصياغة؟ يمكنني المساعدة في: الطرق، أوقات الصلاة، الطقس، الميزانية، حالات الطوارئ، نصائح المجتمع...`,
      es: `No entendí bien. ¿Puedes reformular? Puedo ayudarte con: rutas, horarios de oración, clima, presupuesto, emergencias, consejos comunitarios...`,
      // African diaspora languages
      wo: `Salaam! Ma xamna ñu baaxul. Am roon ci yeneen: routal, jëm, weather, jafe, taaxataan, conseil...`,
      ff: `Assalamu alaikum! Ɓe a jidde hakkunde on. Ɓiyɗo ɓe mum haɗe: tariya, janga, weather, jafe, baŋka, laabi...`,
      bm: `Salaam! N'a gako cogo. Ɲinɛ fɛ, n'a gena: tariya, janga, weather, jafe, sonko, laabi...`,
      yo: `Pẹlẹ o! Emi ko ye ohun na dáradára. Mo lè ràn yin pẹ̀lú: ọ̀nà rin, isẹ̀ u, iké ẹjọ́, iye owó, ìjọ̀ , ìmọ̀ rán...`,
      ig: `Kedu! Aghọtaghị m nnọọ nke ọzọ. Enwere m ike inyere gị aka: okpoloeze, ụbọchị, ihu igwe, ego, mmadụ na ụkọ...`,
      ha: `Sannu! Ban gani shi kullun. Ina iya taimaki maka: hanyar, sa'allah, yaren sama, kudi, tabbaci, shawarwarin mutane...`,
      sw: `Habari! Sijasikia vizuri. Naweza kusaidia na: njia, sala, tabia, pesa, dharura, mwaliko...`,
      ln: `Ekende! Nabambi te. Nayeba kosalisa na: nzela, mbalaka, mafu, ndimba, molisa, sango...`,
      rw: `Mwaramutse! Ntibuteketse neza. Ndishobora gufasha na: inzira, imana, meteo, amafaranga, akabala, ikiganiro...`,
      mg: `Salama! Tsy nanto mahalala. Azoko manampy amin'ny: lalana, fady, zaza, pera, kajy, fampitsarana...`,
    };

    return {
      text: responses[this.config.lang] || responses.en,
      agent: 'SAFAR',
      confidence: 0.2,
      metadata: { queryType: 'unknown', country: this.config.country },
      followups: ['Ask your question differently', 'Get help with specific topic'],
    };
  }

  private updateHistory(message: ConversationMessage) {
    this.config.conversationHistory.push(message);
    // Keep only last 10 messages for context
    if (this.config.conversationHistory.length > 10) {
      this.config.conversationHistory.shift();
    }
  }
}

export default SafarAgent;
