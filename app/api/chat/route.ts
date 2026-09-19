import { NextRequest, NextResponse } from 'next/server';
import SafarAgent from '@/packages/agents/safar';
import { AgentConfig } from '@/packages/types/agent';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { message, userId, language = 'en', conversationHistory = [] } = await req.json();

    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate language - supports 15 panafricana languages
    const validLanguages = [
      'da', // Darija (Moroccan Arabic)
      'fr', // French
      'en', // English
      'ar', // Modern Standard Arabic
      'es', // Spanish
      'wo', // Wolof (Senegal)
      'ff', // Pulaar/Fula
      'bm', // Bambara (Mali)
      'yo', // Yoruba (Nigeria)
      'ig', // Igbo (Nigeria)
      'ha', // Hausa (Nigeria)
      'sw', // Swahili (Kenya/Tanzania)
      'ln', // Lingala (DRC)
      'rw', // Kinyarwanda (Rwanda)
      'mg', // Malagasy (Madagascar)
    ];
    const lang = validLanguages.includes(language) ? language : 'en';

    // Create agent config
    const config: AgentConfig = {
      userId,
      lang: lang as any,
      conversationHistory: conversationHistory || [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currentLocation: undefined,
    };

    // Initialize SAFAR agent
    const agent = new SafarAgent(config);

    // Process message
    const response = await agent.processMessage(message);

    // Return response
    return NextResponse.json({
      success: true,
      response: {
        text: response.text,
        agent: response.agent,
        confidence: response.confidence,
        metadata: response.metadata,
        followups: response.followups,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'SAFAR Chat API is running',
    endpoints: {
      chat: 'POST /api/chat',
      voice: 'POST /api/voice/upload',
      trips: 'GET/POST /api/trips',
      tips: 'GET /api/tips',
    },
  });
}
