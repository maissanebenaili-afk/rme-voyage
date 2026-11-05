// Les voix de Kalimat : qui parle avec quelle voix, et ce qu'on fait dire.
//
// Comme dans les animés japonais, les enfants sont doublés par des voix de
// femmes rendues un peu plus aiguës. Les voix de synthèse servent à tester ;
// le mieux reste de vraies voix marocaines, enregistrées avec le même minutage.

import { LEXIQUE, cleDuMot } from './lexique';
import { ECRAN, morceaux, type Episode, type Humeur, type Langue, type PersoId } from './episodes';

export type Parleur = PersoId | 'narration';

export interface Casting {
  /** Identifiant de la voix chez ElevenLabs (modèle eleven_v3). */
  voix: string;
  /** Hauteur : 1 = voix d'origine, 1,2 = plus aiguë (plus jeune). */
  hauteur: number;
}

export const MODELE_VOIX = 'eleven_v3_conversational';

export const CASTING: Record<Parleur, Casting> = {
  ines: { voix: 'sQfOhaIRbFZ7R8bP1x9f', hauteur: 1.12 }, // Amelie
  nour: { voix: 'w85ZODduJOHPSdpVT1ia', hauteur: 1.06 }, // Sunshine
  adam: { voix: 'w85ZODduJOHPSdpVT1ia', hauteur: 1.3 }, // Sunshine, plus aiguë
  yassine: { voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 1.22 }, // Michael, plus aiguë
  mima: { voix: 'EXAVITQu4vr4xnSDxMaL', hauteur: 0.97 }, // Sarah
  marchand: { voix: 'jvSOBXJ1cP2sdvT5RgUP', hauteur: 0.9 }, // Richie Tekan, plus grave
  mchicha: { voix: 'w85ZODduJOHPSdpVT1ia', hauteur: 1.4 },
  narration: { voix: 'jvSOBXJ1cP2sdvT5RgUP', hauteur: 1 }, // Richie Tekan
};

/** La version espagnole : des voix qui parlent espagnol sans accent français. */
export const CASTING_ES: Record<Parleur, Casting> = {
  ines: { voix: 'NNuHMQa2acKEytgZ6uvw', hauteur: 1.12 }, // Carito
  nour: { voix: '2qdfPrvMqpD1KKo9k6Yv', hauteur: 1.06 }, // Zoey
  adam: { voix: '2qdfPrvMqpD1KKo9k6Yv', hauteur: 1.3 }, // Zoey, plus aiguë
  yassine: { voix: '4uvQjLPvqApx1dVzpNfM', hauteur: 1.22 }, // Johan, plus aiguë
  mima: { voix: 'EXAVITQu4vr4xnSDxMaL', hauteur: 0.97 }, // Sarah
  marchand: { voix: 'HRUUrQrYM9LfgDbWoMXS', hauteur: 0.9 }, // Mizael, plus grave
  mchicha: { voix: '2qdfPrvMqpD1KKo9k6Yv', hauteur: 1.4 },
  narration: { voix: 'HRUUrQrYM9LfgDbWoMXS', hauteur: 1 }, // Mizael
};

export function castingDe(langue: Langue): Record<Parleur, Casting> {
  return langue === 'es' ? CASTING_ES : CASTING;
}

/** Le ton, donné à la voix par une petite indication entre crochets. */
const TON: Record<Humeur, string> = {
  content: '[cheerful]',
  inquiet: '[worried]',
  surpris: '[surprised]',
  rire: '[laughing]',
};

/**
 * Le texte tel qu'on le fait dire : sans astérisques, et avec les mots de
 * darija écrits pour que la voix les prononce bien (« 3afak » → « âafak »).
 */
export function texteAParler(texte: string, langue: Langue): string {
  const remplacer = (bout: string, mot: string, dire: string) => bout.replace(new RegExp(mot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), dire);
  return morceaux(texte)
    .map((m) => {
      if (!m.fort) return m.texte;
      const entiere = LEXIQUE[cleDuMot(m.texte)];
      if (entiere) {
        const dire = entiere.dire?.[langue];
        return dire ? remplacer(m.texte, entiere.mot, dire) : m.texte;
      }
      return m.texte.replace(/[^\s,]+/g, (mot) => {
        const entree = LEXIQUE[cleDuMot(mot)];
        const dire = entree?.dire?.[langue];
        return entree && dire ? remplacer(mot, entree.mot, dire) : mot;
      });
    })
    .join('');
}

export interface ADire {
  /** Le nom du fichier : g (générique), p00, p01… (plans), m0 à m2 (mots du jour), f (fin). */
  cle: string;
  qui: Parleur;
  texte: string;
  voix: string;
  hauteur: number;
}

/** Toutes les répliques d'un épisode à faire dire, dans l'ordre. */
export function repliquesAParler(ep: Episode, langue: Langue): ADire[] {
  const e = ECRAN[langue];
  const casting = castingDe(langue);
  const ligne = (cle: string, qui: Parleur, texte: string): ADire => ({ cle, qui, texte, ...casting[qui] });
  const liste: ADire[] = [ligne('g', 'narration', `Kalimat ! ${e.episode} ${ep.numero} : ${ep.titre[langue]}`)];
  ep.plans.forEach((plan, i) => {
    const qui: Parleur = plan.parle ?? 'narration';
    const humeur = plan.persos.find((q) => q.id === plan.parle)?.humeur ?? 'content';
    const ton = plan.parle ? `${TON[humeur]} ` : '';
    liste.push(ligne(`p${String(i).padStart(2, '0')}`, qui, `${ton}${texteAParler(plan.texte[langue], langue)}`));
  });
  ep.mots.forEach((m, i) => {
    const mot = texteAParler(`*${m.mot}*`, langue);
    const sens = m.sens[langue];
    const fin = /[?!]$/.test(sens) ? sens : langue === 'es' ? `¡${sens}!` : `${sens} !`;
    liste.push(ligne(`m${i}`, 'yassine', `[cheerful] ${mot} … ${fin}`));
  });
  const fin = ep.fin?.[langue] ?? (langue === 'es' ? '¡*Bslama*!' : '*Bslama* !');
  liste.push(ligne('f', 'ines', `[cheerful] ${e.aDemain} ${texteAParler(fin, langue)}`));
  return liste;
}
