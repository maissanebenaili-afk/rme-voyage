import { AgentConfig, AgentResponse } from '../types/agent';

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

    // TODO: Integrate with real cost APIs
    const budgetBreakdown = {
      accommodation: 45 * days,
      food: 30 * days,
      transport: 100,
      activities: 80,
      contingency: 50,
    };

    const total = Object.values(budgetBreakdown).reduce((a, b) => a + b, 0);

    return {
      text: this.formatBudgetResponse(budgetBreakdown, total, days, lang),
      agent: 'BUDGET',
      confidence: 0.8,
      metadata: {
        queryType: 'budget',
        days,
        estimatedTotal: total,
        currency: 'USD',
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

    // TODO: Integrate with exchange rate API
    const rates: Record<string, number> = {
      'EUR-MAD': 10.5,
      'USD-MAD': 9.8,
      'GBP-MAD': 12.3,
      'EUR-USD': 1.08,
      'USD-EUR': 0.92,
    };

    const from = currencyMatch ? currencyMatch[1].toUpperCase() : 'EUR';
    const to = currencyMatch ? currencyMatch[2].toUpperCase() : 'MAD';
    const rateKey = `${from}-${to}`;
    const rate = rates[rateKey] || 10.5;

    return {
      text: this.formatExchangeResponse(from, to, rate, lang),
      agent: 'BUDGET',
      confidence: 0.85,
      metadata: { queryType: 'exchange', from, to, rate, timestamp: new Date().toISOString() },
      followups: [
        `Ask for conversion of specific amount`,
        `Request historical rate trends`,
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
    lang: string
  ): string {
    const text = `
💰 ${days}-day trip budget:
- Accommodation: $${breakdown.accommodation}
- Food: $${breakdown.food}
- Transport: $${breakdown.transport}
- Activities: $${breakdown.activities}
- Contingency: $${breakdown.contingency}
---
Total: $${total} (${(total / days).toFixed(0)}/day)`;

    const responses: Record<string, string> = {
      da: `💰 Budjet n ${days} yam: ${text}`,
      fr: `${text}`,
      en: `${text}`,
      ar: `${text}`,
      es: `${text}`,
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
