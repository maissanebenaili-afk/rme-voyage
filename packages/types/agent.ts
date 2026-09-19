export interface AgentConfig {
  userId: string;
  lang: 'da' | 'fr' | 'en' | 'ar' | 'es';
  conversationHistory: ConversationMessage[];
  timezone?: string;
  currentLocation?: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agent?: string;
}

export interface AgentResponse {
  text: string;
  agent: 'SAFAR' | 'NAVIGATOR' | 'LOCALIZER' | 'COMMUNITY' | 'BUDGET' | 'EMERGENCY';
  confidence: number; // 0-1
  metadata: Record<string, any>;
  followups: string[];
}

export interface Intent {
  type:
    | 'navigate'
    | 'localize'
    | 'community'
    | 'budget'
    | 'emergency'
    | 'general'
    | 'unknown';
  confidence: number;
  entities: Entity[];
}

export interface Entity {
  type: 'location' | 'date' | 'number' | 'currency' | 'time' | 'person';
  value: string;
  raw: string;
}

export interface Trip {
  id: string;
  userId: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  status: 'planning' | 'ongoing' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CommunityTip {
  id: string;
  userId: string;
  location: string;
  category: string;
  content: string;
  rating: number;
  upvotes: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  lang: string;
  subscriptionTier: 'free' | 'premium';
  messagesUsedToday: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationLog {
  id: string;
  userId: string;
  messages: ConversationMessage[];
  summary: string;
  agentsUsed: string[];
  createdAt: string;
  updatedAt: string;
}
