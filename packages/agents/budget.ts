import { AgentConfig, AgentResponse } from '../types/agent';
import { getRegionalKnowledge } from '../utils/regional-knowledge';

export class BudgetAgent {
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  async processQuery(message: string): Promise<AgentResponse> {
    const { userId, lang } = this.config;

    // Detect budget query type
    if (this.isBudgetCalculationQuery(message)) {
      return this.calculateTripBudget(message, lang);
    }

    if (this.isExchangeRateQuery(message)) {
      return this.getExchangeRates(message, lang);
    }

    if (this.isCostQuery(message)) {
      return this.estimateItemCost(message, lang);
    }

    return {
      text: this.getDefaultMessage(lang),
      agent: 'BUDGET',
      confidence: 0.3,
      metadata: { queryType: 'generic' },
      followups: [
        `Ask for trip budget calculation`,
        `Request exchange rates`,
        `Ask for cost estimates for specific items`,
      ],
    };
  }

  private isBudgetCalculationQuery(message: string): boolean {
    const keywords = ['budget', 'cost', 'price', 'coût', 'prix', 'تكلفة', 'tarifa', 'trip cost'];
    return keywords.some((kw) => message.toLowerCase().includes(kw));
  }

  private isExchangeRateQuery(message: string): boolean {
    const keywords = ['exchange', 'conversion', 'change', 'taux', 'tipo de cambio', 'صرف'];
    return keywords.some((kw) => message.toLowerCase().includes(kw));
  }

  private isCostQuery(message: string): boolean {
    const keywords = ['hotel', 'flight', 'ferry', 'meal', 'food', 'restaurant', 'taxi', 'bus'];
    return keywords.some((kw) => message.toLowerCase().includes(kw));
  }

  private async calculateTripBudget(
    message: string,
    lang: string
  ): Promise<AgentResponse> {
    // Extract budget components from message
    const daysMatch = message.match(/(\d+)\s*(?:days?|jours?|d[ií]as)/i);
    const days = daysMatch ? parseInt(daysMatch[1]) : 7;

    // Regional cost estimates (USD per day)
    const regionalCosts: Record<string, any> = {
      Morocco: { accommodation: 45, food: 30, transport: 15, activities: 20, currency: 'MAD' },
      Senegal: { accommodation: 40, food: 25, transport: 12, activities: 15, currency: 'XOF' },
      Guinea: { accommodation: 35, food: 20, transport: 10, activities: 12, currency: 'GNF' },
      Mali: { accommodation: 30, food: 18, transport: 8, activities: 10, currency: 'XOF' },
      Nigeria: { accommodation: 50, food: 28, transport: 15, activities: 18, currency: 'NGN' },
      Kenya: { accommodation: 55, food: 32, transport: 18, activities: 25, currency: 'KES' },
      Tanzania: { accommodation: 48, food: 28, transport: 14, activities: 20, currency: 'TZS' },
      DRC: { accommodation: 35, food: 22, transport: 12, activities: 14, currency: 'CDF' },
    };

    const country = this.config.country || 'Morocco';
    const costData = regionalCosts[country] || { accommodation: 45, food: 30, transport: 15, activities: 20, currency: 'USD' };

    const budgetBreakdown = {
      accommodation: costData.accommodation * days,
      food: costData.food * days,
      transport: costData.transport * days + 50, // Add inter-city transport
      activities: costData.activities * days,
      contingency: Math.round((costData.accommodation + costData.food + costData.transport + costData.activities) * days * 0.1),
    };

    const total = Object.values(budgetBreakdown).reduce((a, b) => a + b, 0);

    return {
      text: this.formatBudgetResponse(budgetBreakdown, total, days, lang, country),
      agent: 'BUDGET',
      confidence: 0.8,
      metadata: {
        queryType: 'budget',
        days,
        estimatedTotal: total,
        currency: costData.currency,
        country,
      },
      followups: [
        `Adjust budget for premium accommodations`,
        `Ask about money-saving tips`,
        `Get cost breakdown by category`,
      ],
    };
  }

  private async getExchangeRates(message: string, lang: string): Promise<AgentResponse> {
    // Extract currency pairs from message
    const currencyMatch = message.match(/([A-Z]{3})\s*(?:to|vers|a)\s*([A-Z]{3})/i);

    // Comprehensive exchange rates for African diaspora
    const rates: Record<string, number> = {
      // Europe-Africa
      'EUR-MAD': 10.5,
      'USD-MAD': 9.8,
      'GBP-MAD': 12.3,
      'EUR-USD': 1.08,
      'USD-EUR': 0.92,
      // West African
      'EUR-XOF': 655.96,  // CFA Franc
      'USD-XOF': 607.26,
      'EUR-GNF': 9180.0,  // Guinean Franc
      'USD-GNF': 8500.0,
      // East African
      'EUR-KES': 134.5,   // Kenyan Shilling
      'USD-KES': 124.6,
      'EUR-TZS': 2830.0,  // Tanzanian Shilling
      'USD-TZS': 2620.0,
      // Central African
      'EUR-CDF': 2850.0,  // Congolese Franc
      'USD-CDF': 2640.0,
      // Nigerian
      'EUR-NGN': 1650.0,  // Nigerian Naira
      'USD-NGN': 1530.0,
      // Reverse rates
      'MAD-EUR': 0.095,
      'MAD-USD': 0.102,
      'XOF-EUR': 0.00153,
      'XOF-USD': 0.00165,
      'KES-EUR': 0.0074,
      'KES-USD': 0.008,
    };

    const from = currencyMatch ? currencyMatch[1].toUpperCase() : 'EUR';
    const to = currencyMatch ? currencyMatch[2].toUpperCase() : 'MAD';
    const rateKey = `${from}-${to}`;
    let rate = rates[rateKey];

    if (!rate) {
      rate = 10.5; // Default fallback
    }

    return {
      text: this.formatExchangeResponse(from, to, rate, lang),
      agent: 'BUDGET',
      confidence: 0.85,
      metadata: {
        queryType: 'exchange',
        from,
        to,
        rate,
        timestamp: new Date().toISOString(),
      },
      followups: [
        `Ask for conversion of specific amount`,
        `Request rates for other currency pairs`,
      ],
    };
  }

  private async estimateItemCost(message: string, lang: string): Promise<AgentResponse> {
    // Extract item from message
    const itemMatch = message.match(/(?:cost|price|coût)\s+(?:of|de)\s+([a-z]+)/i);
    const item = itemMatch ? itemMatch[1] : 'hotel';

    // TODO: Integrate with cost database
    const costs: Record<string, number> = {
      hotel: 45,
      flight: 200,
      ferry: 150,
      meal: 8,
      bus: 5,
      taxi: 10,
      activity: 20,
    };

    const cost = costs[item.toLowerCase()] || 50;

    return {
      text: this.formatItemCostResponse(item, cost, lang),
      agent: 'BUDGET',
      confidence: 0.75,
      metadata: { queryType: 'itemCost', item, estimatedCost: cost },
      followups: [
        `Ask for price comparisons`,
        `Request tips to save money on this`,
      ],
    };
  }

  private formatBudgetResponse(
    breakdown: any,
    total: number,
    days: number,
    lang: string,
    country: string = 'Morocco'
  ): string {
    const perDay = (total / days).toFixed(0);
    const template = `
💰 ${days}-day trip budget (${country}):
- Accommodation: $${breakdown.accommodation}
- Food: $${breakdown.food}
- Transport: $${breakdown.transport}
- Activities: $${breakdown.activities}
- Contingency: $${breakdown.contingency}
---
Total: $${total} (~$${perDay}/day)`;

    const responses: Record<string, string> = {
      da: `💰 Budjet n ${days} yam (${country}):
- Accommodation: $${breakdown.accommodation}
- Food: $${breakdown.food}
- Transport: $${breakdown.transport}
- Activities: $${breakdown.activities}
- Contingency: $${breakdown.contingency}
Total: $${total}`,
      fr: `💰 Budget de ${days} jours (${country}):
- Hébergement: $${breakdown.accommodation}
- Nourriture: $${breakdown.food}
- Transport: $${breakdown.transport}
- Activités: $${breakdown.activities}
- Urgence: $${breakdown.contingency}
Total: $${total} (~$${perDay}/jour)`,
      en: template,
      ar: `💰 ميزانية ${days} يوم (${country}):
- الإقامة: $${breakdown.accommodation}
- الطعام: $${breakdown.food}
- النقل: $${breakdown.transport}
- الأنشطة: $${breakdown.activities}
- الطوارئ: $${breakdown.contingency}
الإجمالي: $${total}`,
      es: `💰 Presupuesto de ${days} días (${country}):
- Alojamiento: $${breakdown.accommodation}
- Comida: $${breakdown.food}
- Transporte: $${breakdown.transport}
- Actividades: $${breakdown.activities}
- Contingencia: $${breakdown.contingency}
Total: $${total} (~$${perDay}/día)`,
      wo: `💰 Budjet ${days} fan (${country}):
- Hébergement: $${breakdown.accommodation}
- Manger: $${breakdown.food}
- Transport: $${breakdown.transport}
- Activités: $${breakdown.activities}
- Urgence: $${breakdown.contingency}
Total: $${total}`,
      sw: `💰 Bajeti ya siku ${days} (${country}):
- Makazi: $${breakdown.accommodation}
- Chakula: $${breakdown.food}
- Usafiri: $${breakdown.transport}
- Shughuli: $${breakdown.activities}
- Dharura: $${breakdown.contingency}
Jumla: $${total}`,
    };

    return responses[lang] || responses.en;
  }

  private formatExchangeResponse(
    from: string,
    to: string,
    rate: number,
    lang: string
  ): string {
    const responses: Record<string, string> = {
      da: `💱 1 ${from} = ${rate.toFixed(2)} ${to}`,
      fr: `💱 1 ${from} = ${rate.toFixed(2)} ${to}`,
      en: `💱 1 ${from} = ${rate.toFixed(2)} ${to}`,
      ar: `💱 1 ${from} = ${rate.toFixed(2)} ${to}`,
      es: `💱 1 ${from} = ${rate.toFixed(2)} ${to}`,
    };

    return responses[lang] || responses.en;
  }

  private formatItemCostResponse(item: string, cost: number, lang: string): string {
    const responses: Record<string, string> = {
      da: `💵 Average cost of ${item}: ~$${cost}`,
      fr: `💵 Coût moyen d'${item}: ~$${cost}`,
      en: `💵 Average cost of ${item}: ~$${cost}`,
      ar: `💵 متوسط تكلفة ${item}: ~$${cost}`,
      es: `💵 Costo promedio de ${item}: ~$${cost}`,
    };

    return responses[lang] || responses.en;
  }

  private getDefaultMessage(lang: string): string {
    const messages: Record<string, string> = {
      da: `Salam! Nshans n-budget. Qullak shnu katatwas bslaffak?`,
      fr: `Bonjour! Je suis votre expert budgétaire. Quel est votre budget?`,
      en: `Hello! I'm your budget expert. What's your budget range?`,
      ar: `مرحبا! أنا خبير الميزانية الخاص بك. ما هي ميزانيتك؟`,
      es: `¡Hola! Soy tu experto en presupuesto. ¿Cuál es tu presupuesto?`,
    };
    return messages[lang] || messages.en;
  }
}
