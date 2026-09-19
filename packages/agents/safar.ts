/**
 * SAFAR - Main Conversational Agent Orchestrator
 * 
 * Responsibilities:
 * - Listen to user input (text/voice)
 * - Extract intent & context
 * - Route to specialized sub-agents
 * - Aggregate & format responses
 * - Handle multi-turn conversations
 */

import type { Message } from '../types/chat';

export interface AgentConfig {
  userId: string;
  lang: 'da' | 'fr' | 'en' | 'ar' | 'es';
  conversationHistory: Message[];
  timezone?: string;
  currentLocation?: { lat: number; lon: number };
}

export interface AgentResponse {
  text: string;
  agent: string;
  confidence: number;
  metadata?: Record<string, any>;
  followups?: string[];
}

class SafarAgent {
  private config: AgentConfig;
  private subAgents: Map<string, Function> = new Map();

  constructor(config: AgentConfig) {
    this.config = config;
    this.registerSubAgents();
  }

  private registerSubAgents() {
    // Register specialized sub-agents
    this.subAgents.set('navigator', this.delegateToNavigator);
    this.subAgents.set('localizer', this.delegateToLocalizer);
    this.subAgents.set('community', this.delegateToCommunity);
    this.subAgents.set('budget', this.delegateToBudget);
    this.subAgents.set('emergency', this.delegateToEmergency);
  }

  /**
   * Main entry point - process user message
   */
  async processMessage(userMessage: string): Promise<AgentResponse> {
    // 1. Extract intent & context
    const { intent, entities, confidence } = await this.extractIntent(userMessage);

    // 2. Route to appropriate sub-agent
    const agentKey = this.selectAgent(intent);
    const agentFn = this.subAgents.get(agentKey);

    if (!agentFn) {
      return this.fallbackResponse(userMessage);
    }

    // 3. Get response from sub-agent
    const response = await agentFn.call(this, {
      message: userMessage,
      intent,
      entities,
      lang: this.config.lang,
      history: this.config.conversationHistory,
    });

    // 4. Format & return
    return {
      text: response.text,
      agent: agentKey,
      confidence,
      metadata: response.metadata,
      followups: response.followups,
    };
  }

  /**
   * Extract intent from natural language
   */
  private async extractIntent(message: string): Promise<any> {
    const lowerMsg = message.toLowerCase();

    // Simple intent detection (can be enhanced with ML)
    const intents = {
      navigation: ['route', 'direction', 'map', 'distance', 'tariq', 'path', 'comment aller'],
      prayer: ['prayer', 'prière', 'salat', 'prayer time', 'wakt'],
      ferry: ['ferry', 'ferry ticket', 'bateau', 'port', 'crossing'],
      budget: ['budget', 'cost', 'price', 'how much', 'combien'],
      emergency: ['emergency', 'help', 'police', 'hospital', 'urgence'],
      greeting: ['hello', 'hi', 'salam', 'bonjour', 'salut'],
      community: ['recommend', 'tips', 'advice', 'other travelers', 'avis'],
    };

    let detectedIntent = 'general';
    let maxMatches = 0;

    for (const [intent, keywords] of Object.entries(intents)) {
      const matches = keywords.filter(kw => lowerMsg.includes(kw)).length;
      if (matches > maxMatches) {
        detectedIntent = intent;
        maxMatches = matches;
      }
    }

    return {
      intent: detectedIntent,
      confidence: Math.min(maxMatches / 2, 0.95),
      entities: this.extractEntities(message),
    };
  }

  /**
   * Extract relevant entities (place names, numbers, etc.)
   */
  private extractEntities(message: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // Extract cities/locations (basic)
    const cities = ['marrakech', 'casablanca', 'fes', 'tangier', 'rabat', 'agadir', 'taza'];
    for (const city of cities) {
      if (message.toLowerCase().includes(city)) {
        entities.location = city;
      }
    }

    // Extract dates/numbers
    const numbers = message.match(/\d+/g);
    if (numbers) {
      entities.numbers = numbers.map(Number);
    }

    return entities;
  }

  /**
   * Select best agent for intent
   */
  private selectAgent(intent: string): string {
    const mapping: Record<string, string> = {
      navigation: 'navigator',
      prayer: 'localizer',
      ferry: 'navigator',
      budget: 'budget',
      emergency: 'emergency',
      greeting: 'community',
      community: 'community',
    };
    return mapping[intent] || 'community';
  }

  /**
   * Sub-agent delegators
   */

  private async delegateToNavigator(params: any) {
    // TODO: Integrate with Google Maps / OSRM
    return {
      text: `🗺️ Navigateur: Je peux t'aider avec les routes, distances, et itinéraires entre ${params.entities.location || 'tes destinations'}`,
      metadata: { type: 'navigation' },
      followups: ['Quelle distance?', 'Mode de transport?'],
    };
  }

  private async delegateToLocalizer(params: any) {
    // TODO: Integrate prayer times API, weather API
    return {
      text: `📍 Localizer: Informations pratiques pour le Maroc et l'Afrique du Nord`,
      metadata: { type: 'localizer' },
      followups: ['Horaires prière?', 'Météo?'],
    };
  }

  private async delegateToCommunity(params: any) {
    // TODO: Query community tips from DB
    return {
      text: `👥 Communauté: Découvre les conseils d'autres voyageurs`,
      metadata: { type: 'community' },
      followups: ['Bons restaurants?', 'Hôtels recommandés?'],
    };
  }

  private async delegateToBudget(params: any) {
    // TODO: Calculate trip budget
    return {
      text: `💰 Budget: Je peux calculer les coûts de ton voyage`,
      metadata: { type: 'budget' },
      followups: ['Carburant?', 'Ferry?', 'Hébergement?'],
    };
  }

  private async delegateToEmergency(params: any) {
    // TODO: Emergency routing
    return {
      text: `🆘 Urgence: Numéros importants: Police 19, SAMU 15, Ambassade...`,
      metadata: { type: 'emergency', urgent: true },
      followups: [],
    };
  }

  /**
   * Fallback response
   */
  private fallbackResponse(message: string): AgentResponse {
    return {
      text: `Je n'ai pas bien compris. Tu peux reformuler? Je peux t'aider avec: routes, prière, ferry, budget, urgences, conseils communauté...`,
      agent: 'safar',
      confidence: 0.3,
    };
  }

  /**
   * Update conversation context
   */
  updateHistory(message: Message) {
    this.config.conversationHistory.push(message);
    // Keep only last 10 messages for context
    if (this.config.conversationHistory.length > 10) {
      this.config.conversationHistory.shift();
    }
  }
}

export default SafarAgent;
