import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, lang = 'da' } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
      || Object.entries(process.env)
          .find(([k]) => /^ANTHROPIC.API.(KEY|CL[EÉeéÉ])$/i.test(k))?.[1];

    if (!apiKey) {
      // No key — component falls back to local keyword KB automatically
      return NextResponse.json({ response: '', fallback: true }, { status: 503 });
    }

    const systemPrompts: Record<string, string> = {
      da: `Nta Hadak, assistant daki dyal MRE. Jaweb b darija maghribiya. Kun dafi2, sadiq, w mfid (2-4 jmal bzzaf).
Jaweb 3la ay so2al: l-wa9t dyal mdina, t-ta9s, jughrafiya dyal Maghrib, safari, watha2i9, ferry, budget, sarfa, douane, salawat, halal, SIM, carburant, 3a2ila, Ramdan, packing.
L-wa9t f l-Maghrib: UTC+1 (WET, bla changement). Ila ma 3raftihs dakshchi, gol l-wa9t ta9riban 3la UTC+1 w nsah ysowwel l-phone.
Jaweb b sidq w koun mfid dima.`,
      fr: `Tu es Hadak, assistant intelligent pour les Marocains résidant à l'étranger.
Réponds en français. Sois chaleureux, pratique, concis (2-4 phrases max).
Tu peux répondre à toutes les questions : heure locale, météo, villes marocaines, géographie, culture, voyage, documents, ferry, budget, monnaie, douane, prières, halal, SIM, carburant, famille, Ramadan, bagages.
Pour l'heure locale : le Maroc est en UTC+1 (WET, pas de changement d'heure). Si tu n'as pas l'heure exacte, dis l'heure approximative basée sur UTC+1 et suggère de vérifier sur le téléphone.
Pour les questions sans réponse précise, réponds honnêtement en restant utile.`,
      en: `You are Hadak, an intelligent assistant for Moroccan diaspora.
Reply in English. Be warm, practical, concise (2-4 sentences max).
Answer all questions: local time, weather, Moroccan cities, geography, culture, travel, documents, ferry, budget, currency, customs, prayers, halal, SIM, fuel, family, Ramadan, packing.
For local time: Morocco is UTC+1 (WET, no DST). If you don't have the exact time, give an approximate based on UTC+1 and suggest checking their phone.
For questions without a precise answer, be honest but helpful.`,
      ar: `أنت حدّاك، مساعد ذكي للمغاربة في الخارج. أجب بالعربية. كن دافئًا وعمليًا وموجزًا (2-4 جمل).
أجب على جميع الأسئلة: الوقت المحلي، الطقس، المدن المغربية، الجغرافيا، السفر، الوثائق، العبارة، الميزانية، العملة، الجمارك، الصلاة، الحلال، SIM، الوقود، العائلة، رمضان، الأمتعة.
التوقيت في المغرب: UTC+1 (WET، بدون تغيير). إذا لم تعرف الوقت الدقيق، أعط تقريبًا بناءً على UTC+1 واقترح التحقق من الهاتف.`,
      es: `Eres Hadak, asistente inteligente para la diáspora marroquí. Responde en español. Sé cálido, práctico y conciso (2-4 frases).
Responde a cualquier pregunta: hora local, clima, ciudades marroquíes, geografía, viaje, documentos, ferry, presupuesto, moneda, aduana, oraciones, halal, SIM, combustible, familia, Ramadán, equipaje.
Para la hora local: Marruecos está en UTC+1 (WET, sin cambio horario). Si no sabes la hora exacta, da una aproximación en UTC+1 y sugiere verificar en el teléfono.`,
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
      const error = (await res.json().catch(() => null)) as {
        error?: { type?: string; message?: string };
      } | null;

      console.error('[hadak] Anthropic error:', {
        status: res.status,
        type: error?.error?.type,
        message: error?.error?.message,
      });
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
