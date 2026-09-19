import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, lang = 'da' } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // No key — component falls back to local keyword KB automatically
      return NextResponse.json({ response: '', fallback: true }, { status: 503 });
    }

    const systemPrompts: Record<string, string> = {
      da: `Nta Hadak, assistant dyalek dyal safari dyal diaspora maghribiya li katssafar bin Orouba w Maghrib.
Jaweb b darija maghribiya. Kun dafi2, sadiq, w mfid.
3awned f: route, prières, ferry, budget, documents, currency, customs, urgences, météo, 3iyad, halal, SIM, carburant, 3a2ila, Ramadan, packing.
Jawabatk tkoun qsirat w mhadddin lil-safari.`,
      fr: `Tu es Hadak, assistant de voyage pour les Marocains résidant à l'étranger qui voyagent entre l'Europe et le Maroc.
Réponds en français. Sois chaleureux, pratique, concis.
Aide avec : route, prières, ferry, budget, documents, monnaie, douane, urgences, météo, jours fériés, halal, SIM, carburant, famille, Ramadan, bagages.`,
      en: `You are Hadak, a travel assistant for Moroccan diaspora traveling between Europe and Morocco.
Reply in English. Be warm, practical, concise.
Help with: routes, prayer times, ferries, budget, documents, currency, customs, emergencies, weather, holidays, halal, SIM, fuel, family, Ramadan, packing.`,
      ar: `أنت حدّاك، مساعد سفر للشتات المغربي بين أوروبا والمغرب.
أجب باللغة العربية. كن دافئاً وعملياً وموجزاً.
ساعد في: الطرق، الصلاة، العبارة، الميزانية، الوثائق، العملة، الجمارك، الطوارئ، الطقس، الأعياد، الحلال، الشريحة، الوقود، العائلة، رمضان، الأمتعة.`,
      es: `Eres Hadak, asistente de viaje para la diáspora marroquí entre Europa y Marruecos.
Responde en español. Sé cálido, práctico y conciso.
Ayuda con: rutas, oraciones, ferry, presupuesto, documentos, moneda, aduana, emergencias, clima, festivos, halal, SIM, combustible, familia, Ramadán, equipaje.`,
    };

    const systemPrompt = systemPrompts[lang] ?? systemPrompts.fr;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!res.ok) {
      console.error('[hadak] Anthropic error:', res.status);
      return NextResponse.json({ response: '', fallback: true }, { status: 503 });
    }

    const data = (await res.json()) as {
      content?: Array<{ type: string; text: string }>;
    };

    const text = data.content?.find((b) => b.type === 'text')?.text ?? '';

    return NextResponse.json({ response: text, fallback: false });
  } catch (err) {
    console.error('[hadak] error:', err);
    return NextResponse.json({ response: '', fallback: true }, { status: 503 });
  }
}
