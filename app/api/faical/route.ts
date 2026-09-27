import { NextResponse } from 'next/server';
import { generatePrediction, type FormEntry } from '@/lib/faicalPrediction';

export const revalidate = 21600; // 6 hours

// TheSportsDB id of the Botola Pro ("Moroccan Championship"), checked on
// 27/09/2026. The former id 1159 does not exist there, so Faical never had a
// fixture to show.
const BOTOLA_PRO_LEAGUE_ID = '4520';

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
  idHomeTeam?: string;
  idAwayTeam?: string;
  strLeague?: string;
};

type SportsDBTeam = { idTeam: string; strTeam: string };


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
    // A match without both scores (not played, or not reported) is skipped:
    // counting it as 0-0 would invent a draw.
    const played = events.filter((e) => /^\d+$/.test(e.intHomeScore ?? '') && /^\d+$/.test(e.intAwayScore ?? ''));
    const last5 = played.slice(0, 5);
    let w = 0,
      d = 0,
      l = 0;
    const letters: string[] = [];
    for (const e of last5) {
      const isHome = e.idHomeTeam === teamId;
      const myScore = Number(isHome ? e.intHomeScore : e.intAwayScore);
      const oppScore = Number(isHome ? e.intAwayScore : e.intHomeScore);
      if (myScore > oppScore) {
        w++;
        letters.push('W');
      } else if (myScore === oppScore) {
        d++;
        letters.push('D');
      } else {
        l++;
        letters.push('L');
      }
    }
    return { w, d, l, last5: letters.join('') };
  } catch {
    return { w: 0, d: 0, l: 0, last5: '' };
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
      `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${BOTOLA_PRO_LEAGUE_ID}`,
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
          evt.idHomeTeam || getTeamId(evt.strHomeTeam),
          evt.idAwayTeam || getTeamId(evt.strAwayTeam),
        ]);
        const [homeForm, awayForm] = await Promise.all([
          homeId ? getTeamForm(homeId) : Promise.resolve({ w: 0, d: 0, l: 0, last5: '' }),
          awayId ? getTeamForm(awayId) : Promise.resolve({ w: 0, d: 0, l: 0, last5: '' }),
        ]);
        const prediction = await generatePrediction(
          evt.strHomeTeam,
          evt.strAwayTeam,
          homeForm,
          awayForm
        );
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
