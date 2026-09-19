import { AgentConfig, AgentResponse, Intent, ConversationMessage } from '../types/agent';
import { NavigatorAgent } from './navigator';
import { LocalizerAgent } from './localizer';
import { CommunityAgent } from './community';
import { BudgetAgent } from './budget';
import { EmergencyAgent } from './emergency';

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
    // 1. Extract intent & context
    const intentData = this.extractIntent(userMessage);
    const agentType = this.selectAgent(intentData.type);

    // 2. Route to appropriate sub-agent
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

  private extractEntities(message: string): any[] {
    const entities: any[] = [];

    // Extract cities/locations
    const cities = [
      'marrakech',
      'casablanca',
      'fes',
      'tangier',
      'rabat',
      'agadir',
      'taza',
      'paris',
      'london',
      'madrid',
      'barcelona',
    ];
    for (const city of cities) {
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
      da: `Salam! Je n'ai pas bien compris. Je peux t'aider avec: routes, prière, weather, budget, urgences, conseils...`,
      fr: `Je n'ai pas bien compris. Tu peux reformuler? Je peux t'aider avec: routes, prière, météo, budget, urgences, conseils communauté...`,
      en: `I didn't understand well. Can you rephrase? I can help with: routes, prayer times, weather, budget, emergencies, community tips...`,
      ar: `لم أفهم جيدًا. هل يمكنك إعادة الصياغة؟ يمكنني المساعدة في: الطرق، أوقات الصلاة، الطقس، الميزانية، حالات الطوارئ، نصائح المجتمع...`,
      es: `No entendí bien. ¿Puedes reformular? Puedo ayudarte con: rutas, horarios de oración, clima, presupuesto, emergencias, consejos comunitarios...`,
    };

    return {
      text: responses[this.config.lang] || responses.en,
      agent: 'SAFAR',
      confidence: 0.2,
      metadata: { queryType: 'unknown' },
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
