import { NextResponse } from 'next/server';

export const revalidate = 21600; // 6 hours

type SportsDBLastEvent = {
  idHomeTeam: string;
  idAwayTeam: string;
  intHomeScore?: string;
  intAwayScore?: string;
};

type SportsDBFixture = {
  idEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  dateEvent: string;
  strTime?: string;
  strLeague?: string;
};

type SportsDBTeam = { idTeam: string; strTeam: string };

type FormEntry = { w: number; d: number; l: number; last5: string };

async function getTeamId(name: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(name)}`,
      { next: { revalidate: 86400 } }
    );
    const data = await res.json();
    const team: SportsDBTeam | undefined = data?.teams?.[0];
    return team?.idTeam ?? null;
  } catch {
    return null;
  }
}

async function getTeamForm(teamId: string): Promise<FormEntry> {
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=${teamId}`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    const events: SportsDBLastEvent[] = data?.results ?? [];
    const last5 = events.slice(0, 5);
    let w = 0, d = 0, l = 0;
    const letters: string[] = [];
    for (const e of last5) {
      const isHome = e.idHomeTeam === teamId;
      const myScore  = parseInt(isHome ? (e.intHomeScore ?? '0') : (e.intAwayScore ?? '0'));
      const oppScore = parseInt(isHome ? (e.intAwayScore ?? '0') : (e.intHomeScore ?? '0'));
      if (myScore > oppScore)       { w++; letters.push('W'); }
      else if (myScore === oppScore) { d++; letters.push('D'); }
      else                           { l++; letters.push('L'); }
    }
    return { w, d, l, last5: letters.join('') };
  } catch {
    return { w: 0, d: 0, l: 0, last5: '' };
  }
}

async function generatePrediction(
  homeTeam: string,
  awayTeam: string,
  homeForm: FormEntry,
  awayForm: FormEntry
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_CLE ?? '';
  if (!apiKey) return '';

  const prompt = `Tu es Faical Arrayah, le pronostiqueur football le plus charismatique du Maghreb. Tu parles avec confiance, tu es direct, tu donnes UN résultat probable (score ou issue) et UNE raison principale en 2 phrases max. Pas de "peut-être", pas de "difficile à dire" — Faical Arrayah tranche toujours.

Match: ${homeTeam} vs ${awayTeam}
Forme ${homeTeam} (5 derniers): ${homeForm.last5 || 'inconnue'} (${homeForm.w}V ${homeForm.d}N ${homeForm.l}D)
Forme ${awayTeam} (5 derniers): ${awayForm.last5 || 'inconnue'} (${awayForm.w}V ${awayForm.d}N ${awayForm.l}D)

Donne ton pronostic en français, 2 phrases max, style direct et confiant.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 120,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    return (data?.content?.[0]?.text ?? '') as string;
  } catch {
    return '';
  }
}

export type FaicalPick = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  league: string;
  prediction: string;
  homeForm: FormEntry;
  awayForm: FormEntry;
};

export async function GET() {
  try {
    const fixtRes = await fetch(
      'https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=1159',
      { next: { revalidate: 21600 } }
    );
    const fixtData = await fixtRes.json();
    const events: SportsDBFixture[] = fixtData?.events ?? [];
    const top3 = events.slice(0, 3);

    if (top3.length === 0) {
      return NextResponse.json({ picks: [], source: 'thesportsdb', cached: true });
    }

    const picks: FaicalPick[] = await Promise.all(
      top3.map(async (evt) => {
        const [homeId, awayId] = await Promise.all([
          getTeamId(evt.strHomeTeam),
          getTeamId(evt.strAwayTeam),
        ]);
        const [homeForm, awayForm] = await Promise.all([
          homeId ? getTeamForm(homeId) : Promise.resolve({ w: 0, d: 0, l: 0, last5: '' }),
          awayId ? getTeamForm(awayId) : Promise.resolve({ w: 0, d: 0, l: 0, last5: '' }),
        ]);
        const prediction = await generatePrediction(evt.strHomeTeam, evt.strAwayTeam, homeForm, awayForm);
        return {
          id: evt.idEvent,
          homeTeam: evt.strHomeTeam,
          awayTeam: evt.strAwayTeam,
          date: evt.dateEvent,
          time: evt.strTime ?? '',
          league: evt.strLeague ?? 'Botola Pro',
          prediction,
          homeForm,
          awayForm,
        };
      })
    );

    return NextResponse.json({ picks, source: 'thesportsdb', cached: true });
  } catch {
    return NextResponse.json({ picks: [], source: 'error', cached: false }, { status: 200 });
  }
}
