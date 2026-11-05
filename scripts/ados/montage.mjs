// Le minutage d'un épisode : carte de titre, un plan par réplique, carte de fin.
export const INTRO = 2.6;
export const FIN = 3.4;

export function construire(ep, durees, persos, fps = 24) {
  let t = INTRO;
  const shots = ep.plans.map((plan, index) => {
    const voixDuree = durees[index] ?? 3.5;
    const start = t;
    const voixDebut = start + 0.45;
    const end = voixDebut + voixDuree + 0.7;
    t = end;
    return { index, ...plan, start, end, voixDebut, voixDuree };
  });
  return {
    numero: ep.numero,
    titre: ep.titre,
    demain: ep.demain,
    noms: Object.fromEntries(Object.entries(persos).map(([k, v]) => [k, v.nom])),
    fps,
    introFin: INTRO,
    finDebut: t,
    total: t + FIN,
    shots,
  };
}
