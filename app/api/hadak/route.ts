import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, lang = 'da' } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // No API key configured — fall back gracefully to keyword-based responses
    if (!apiKey) {
      return NextResponse.json(
        {
          response: 'Assistant hors ligne. Essayez les sujets suggérés.',
          fallback: true,
        },
        { status: 503 }
      );
    }

    const model = 'gpt-4o';

    // Build system prompt for Hadak in the user's language
    const systemPrompts: Record<string, string> = {
      da: `You are Hadak, a helpful travel assistant for Moroccan diaspora traveling between Europe and Morocco.
Speak in Darija (Moroccan Arabic) when possible. Be warm, friendly, and practical.
Help with: routes, prayer times, ferries, budgets, documents, currency, customs, emergencies, weather, holidays, halal food, SIM cards, fuel, family travel, Ramadan, and packing.
Keep answers concise and relevant to travel planning.`,
      fr: `Tu es Hadak, un assistant de voyage utile pour les Marocains de la diaspora voyageant entre l'Europe et le Maroc.
Sois chaleureux, amical et pratique. Aide avec : les routes, les heures de prière, les ferries, les budgets, les documents, la monnaie, la douane, les urgences, la météo, les jours fériés, la nourriture halal, les cartes SIM, le carburant, les voyages en famille, le Ramadan et le bagage.
Garde les réponses concises et pertinentes à la planification des voyages.`,
      en: `You are Hadak, a helpful travel assistant for Moroccan diaspora traveling between Europe and Morocco.
Be warm, friendly, and practical. Help with: routes, prayer times, ferries, budgets, documents, currency, customs, emergencies, weather, holidays, halal food, SIM cards, fuel, family travel, Ramadan, and packing.
Keep answers concise and relevant to travel planning.`,
      ar: `أنت حدّاك، مساعد سفر مفيد للشتات المغربي الذي يسافر بين أوروبا والمغرب.
كن دافئًا وودودًا وعمليًا. ساعد في: الطرق، أوقات الصلاة، العبارة، الميزانية، الوثائق، العملة، الجمارك، الطوارئ، الطقس، الأعياد، الحلال، بطاقات SIM، الوقود، السفر العائلي، رمضان والحقائب.
اجعل الإجابات موجزة وذات صلة بتخطيط السفر.`,
      es: `Eres Hadak, un asistente de viaje útil para la diáspora marroquí que viaja entre Europa y Marruecos.
Sé cálido, amable y práctico. Ayuda con: rutas, horas de oración, ferries, presupuestos, documentos, moneda, aduanas, emergencias, clima, festivos, comida halal, tarjetas SIM, combustible, viajes en familia, Ramadán y equipaje.
Mantén las respuestas concisas y relevantes para la planificación de viajes.`,
    };

    const systemPrompt = systemPrompts[lang] || systemPrompts.da;

    // Call OpenAI Chat Completions API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle rate limits
      if (response.status === 429) {
        return NextResponse.json(
          {
            error: 'Rate limit reached',
            fallback: true,
          },
          { status: 429 }
        );
      }

      // Handle auth errors
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          {
            error: 'Authentication failed',
            fallback: true,
          },
          { status: 503 }
        );
      }

      console.error('[hadak] Upstream error:', errorData);
      return NextResponse.json(
        {
          error: 'Service temporarily unavailable',
          fallback: true,
        },
        { status: 502 }
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const assistantMessage =
      data.choices?.[0]?.message?.content
        ? data.choices[0].message.content
        : 'No response generated';

    return NextResponse.json({
      response: assistantMessage,
      fallback: false,
    });
  } catch (error) {
    console.error('[hadak] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        fallback: true,
      },
      { status: 500 }
    );
  }
}
