import { AgentConfig, AgentResponse } from '../types/agent';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

export class CommunityAgent {
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  async processQuery(message: string): Promise<AgentResponse> {
    const { userId, lang } = this.config;

    // Extract location from message
    const locationMatch = message.match(/(?:à|in|a)\s+([a-zA-Z\s\-']+)/i);
    const location = locationMatch ? locationMatch[1].trim().slice(0, 100) : null;

    if (!location || !/^[a-zA-Z\s\-']+$/.test(location)) {
      return {
        text: this.getDefaultMessage(lang),
        agent: 'COMMUNITY',
        confidence: 0.3,
        metadata: { queryType: 'generic' },
        followups: [
          `Ask for tips about a specific destination`,
          `Request local recommendations`,
          `Share your own travel tips`,
        ],
      };
    }

    const tips = isSupabaseConfigured()
      ? await this.getSupabaseTips(location)
      : this.getMockTips(location);

    return {
      text: this.formatCommunityResponse(tips, location, lang),
      agent: 'COMMUNITY',
      confidence: 0.75,
      metadata: { queryType: 'tips', location, tipCount: tips.length },
      followups: [
        `Ask for specific category tips (food, accommodation, transport)`,
        `Request tips from a specific community`,
        `Share your own tip about this location`,
      ],
    };
  }

  private async getSupabaseTips(
    location: string
  ): Promise<Array<{ user: string; tip: string; rating: number }>> {
    try {
      if (!supabase) {
        return this.getMockTips(location);
      }
      const { data, error } = await supabase
        .from('community_tips')
        .select('content, rating, user_id')
        .eq('location', location)
        .order('rating', { ascending: false })
        .limit(3);

      if (error) {
        console.error('[CommunityAgent] Database error');
        return this.getMockTips(location);
      }

      return (
        data?.map((tip: any) => ({
          user: `User_${tip.user_id.slice(0, 8)}`,
          tip: tip.content,
          rating: tip.rating,
        })) || this.getMockTips(location)
      );
    } catch (error) {
      console.error('[CommunityAgent] Failed to fetch tips');
      return this.getMockTips(location);
    }
  }

  private getMockTips(location: string): Array<{ user: string; tip: string; rating: number }> {
    const tipsByLocation: Record<string, any[]> = {
      Marrakech: [
        {
          user: 'Fatima_Paris',
          tip: 'Riad Karmela has amazing tagine and free WiFi. Book ahead!',
          rating: 4.8,
        },
        {
          user: 'Hassan_London',
          tip: 'Don\'t miss the Souk near Bab Agnaou - best prices for leather goods',
          rating: 4.7,
        },
        {
          user: 'Leila_Brussels',
          tip: 'Use Maroc Telecom SIM for best coverage. Get it at the airport',
          rating: 4.9,
        },
      ],
      Tangier: [
        {
          user: 'Ahmed_Berlin',
          tip: 'Ferry from Tarifa (Spain) is cheaper than from Algeciras',
          rating: 4.6,
        },
        {
          user: 'Noor_Amsterdam',
          tip: 'Stay in the Medina for authentic experience. Avoid Ville Nouvelle at night',
          rating: 4.5,
        },
      ],
      Casablanca: [
        {
          user: 'Mohamed_Montreal',
          tip: 'Hassan II Mosque is stunning. Dress respectfully, modest clothing',
          rating: 4.9,
        },
        {
          user: 'Yasmin_Paris',
          tip: 'Take the train to Fez - faster and cheaper than bus',
          rating: 4.8,
        },
      ],
    };

    return tipsByLocation[location] || [
      {
        user: 'SafarUser',
        tip: 'Share your tips about this location with the community!',
        rating: 0,
      },
    ];
  }

  private formatCommunityResponse(
    tips: any[],
    location: string,
    lang: string
  ): string {
    const tipsText = tips
      .slice(0, 3)
      .map((t) => `💡 "${t.tip}" - ${t.user} (⭐${t.rating})`)
      .join('\n');

    const responses: Record<string, string> = {
      da: `🤝 Hassayat mn l-community f ${location}:\n${tipsText}`,
      fr: `🤝 Conseils de la communauté à ${location}:\n${tipsText}`,
      en: `🤝 Community tips for ${location}:\n${tipsText}`,
      ar: `🤝 نصائح المجتمع حول ${location}:\n${tipsText}`,
      es: `🤝 Consejos de la comunidad en ${location}:\n${tipsText}`,
    };

    return responses[lang] || responses.en;
  }

  private getDefaultMessage(lang: string): string {
    const messages: Record<string, string> = {
      da: `Salam! Nshans n-community. Shnu l-madina lli katbghit hassayat dwaliha?`,
      fr: `Bonjour! Je suis l'agent communautaire. Quelle ville vous intéresse?`,
      en: `Hello! I'm the community expert. Which destination interests you?`,
      ar: `مرحبا! أنا خبير المجتمع. أي وجهة تهمك؟`,
      es: `¡Hola! Soy el experto de la comunidad. ¿Qué destino te interesa?`,
    };
    return messages[lang] || messages.en;
  }
}
