import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Using mock data mode.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;

// Type definitions for database tables
export interface User {
  id: string;
  email: string;
  language: string;
  subscription_tier: 'free' | 'premium';
  messages_used_today: number;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget_usd: number | null;
  currency: string;
  status: 'planning' | 'ongoing' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CommunityTip {
  id: string;
  user_id: string;
  location: string;
  category: string;
  content: string;
  rating: number;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationLog {
  id: string;
  user_id: string;
  conversation_history: Record<string, any>;
  agents_used: string[];
  summary: string;
  created_at: string;
  updated_at: string;
}

// Helper function to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Helper function to get authenticated user ID from request headers
export function getUserIdFromHeaders(req: { headers?: { get?: (key: string) => string | null } }): string | null {
  const authHeader = req.headers?.get?.('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  // In a real implementation, decode the JWT and extract the user ID
  // For now, return null as a placeholder
  return null;
}
