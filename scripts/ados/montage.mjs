// Le minutage d'un épisode : carte de titre, un plan par réplique (ou par silence),
// carte de fin. `durees` : la durée de chaque voix, dans l'ordre des plans parlés.
export const INTRO = 1.6; // courte : sur un Short, on ne laisse pas le temps de glisser
export const FIN = 4.6;
export const AVANT_VOIX = 0.8;
export const APRES_VOIX = 1.3;

export function construire(ep, durees, persos, fps = 24) {
  let t = INTRO;
  let v = 0;
  const shots = ep.plans.map((plan, index) => {
    const start = t;
    if (plan.parle) {
      const voixDuree = durees[v] ?? 3.5;
      const voixDebut = start + AVANT_VOIX;
      const end = voixDebut + voixDuree + APRES_VOIX;
      t = end;
      return { index, voixIndex: v++, ...plan, start, end, voixDebut, voixDuree };
    }
    const end = start + (plan.duree ?? 3);
    t = end;
    return { index, voixIndex: -1, ...plan, start, end, voixDebut: start, voixDuree: 0 };
  });
  return {
    numero: ep.numero,
    titre: ep.titre,
    demain: ep.demain,
    fin: !!ep.fin,
    question: ep.question ?? "",
    noms: Object.fromEntries(Object.entries(persos).map(([k, v2]) => [k, v2.nom])),
    fps,
    introFin: INTRO,
    finDebut: t,
    total: t + FIN,
    shots,
  };
}

/** Les plans qui parlent, dans l'ordre : la voix n° i va avec le i-ème de cette liste (pas avec le i-ème plan). */
export const plansParlants = (S) => S.shots.filter((x) => x.voixIndex >= 0);

/**
 * Découpe un épisode monté en morceaux d'environ `cible` secondes, toujours
 * aux limites d'un plan (jamais au milieu d'une réplique). Le premier morceau
 * commence à la carte de titre, le dernier finit sur la carte de fin.
 * Retourne [{ debut, fin }] en secondes.
 */
export function decouper(S, cible = 60) {
  const coupes = [];
  let debut = 0;
  for (let i = 0; i < S.shots.length; i++) {
    const fin = S.shots[i].end;
    const dernier = i === S.shots.length - 1;
    if (!dernier && fin - debut >= cible) {
      // ne pas laisser un reste trop court à la fin
      if (S.finDebut - fin < cible * 0.4) continue;
      coupes.push({ debut, fin });
      debut = fin;
    }
  }
  coupes.push({ debut, fin: S.total });
  return coupes;
}
