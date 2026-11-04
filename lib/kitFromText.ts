// Une phrase → le Kit Retour déjà réglé. Hadak lit dans la question ce que le
// voyageur a dit lui-même (voiture ou avion, enfant qui voyage seul, voiture
// d'un proche, nationalité) et ouvre /kit-retour avec ces réponses. Rien n'est
// deviné : ce qui n'est pas dit reste aux réglages par défaut du Kit, que le
// voyageur peut toujours changer.

import type { KitAnswers, Nationalite, Transport } from '@/lib/kitRetour';

export type KitHint = Partial<KitAnswers>;

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const PEDESTRIAN = /\b(a pied|pieton|sans (la |ma )?voiture|bla tomobil|on foot|a pie)\b/;
// « car » seul est écarté : en français c'est une conjonction (« je pars car… »).
const CAR = /\b(voiture|tomobil|tonobil|auto|camping[- ]?car|fourgon|by car|my car|the car|driving|coche|carro)\b|سيارة|طوموبيل/;
const PLANE = /\b(avion|en vol|vol pour|tiyara|tayara|plane|flight|fly|flying|vuelo)\b|طائرة|طيارة/;

// Un enfant qui part sans aucun de ses parents : le mot « seul » (ou « sans
// moi », « avec sa tante »…) doit suivre l'enfant. « Je pars seule avec mes
// enfants » parle d'une mère seule, pas d'un mineur non accompagné.
const CHILD_ALONE = new RegExp(
  [
    String.raw`\b(enfants?|fils|fille|filles|mineure?s?|neveu|niece|ado|ados)\b[^.?!]{0,30}\b(seule?s?|sans (moi|nous|ses parents|leurs parents|parents?)|non accompagnee?s?|avec (sa|son|ses|leur|leurs) (tante|oncle|grands?[- ]parents?|grand[- ]?mere|grand[- ]?pere|cousine?|frere|soeur))\b`,
    String.raw`\bmineure?s? non accompagnee?s?\b`,
    String.raw`\b(son|daughter|child|children|kids?|minor)\b[^.?!]{0,30}\b(alone|without (me|us|parents?)|unaccompanied|with (his|her|their) (aunt|uncle|grand\w*))\b`,
    String.raw`\b(hijos?|hijas?|menor|menores|ninos?|ninas?)\b[^.?!]{0,30}\b(solos?|solas?|sin (mi|nosotros|sus padres)|con su (tia|tio|abuel\w*))\b`,
    String.raw`\b(weldi|bnti|wlidi|bniti|wladi)\b[^.?!]{0,30}\b(bohdo|bohdha|wa7do|wa7dha|bla walidin|bla bih|bla mmo)\b`,
  ].join('|'),
);

// La carte grise n'est pas au nom du conducteur.
const SOMEONE_ELSES_CAR =
  /\b(voiture|tomobil|coche) (de |d')(mon |ma |mes |son |sa |un |une )?(pere|mere|frere|soeur|ami|amie|copain|copine|cousin|cousine|oncle|tante|beau[- ]?frere|belle[- ]?soeur|patron|voisin|voisine)\b|\b(pas|n'est pas) a mon nom\b|\bvoiture pretee\b|\b(on m'a|on me|qu'on me) prete\b|\bprocuration\b|\b(my )?(friend|brother|father|sister|mother)'?s car\b/;

const FRENCH = /\b(francaise?|fransawi|fransawiya|french|frances[a]?)\b/;
const MOROCCAN = /\b(marocaine?|maghribi|maghribiya|moroccan|marroqui)\b|مغربي|مغربية/;
const BINATIONAL = /\b(binationale?|double nationalite|deux nationalites|les deux nationalites|dual (citizen|national)|doble nacionalidad)\b/;

/** What the sentence says about the trip; an empty object when it says nothing useful. */
export function kitHintFromText(text: string): KitHint {
  const m = normalize(text);
  const hint: KitHint = {};

  let transport: Transport | undefined;
  if (PEDESTRIAN.test(m)) transport = 'ferry-pieton';
  else if (CAR.test(m) && !PLANE.test(m)) transport = 'voiture';
  else if (PLANE.test(m) && !CAR.test(m)) transport = 'avion';
  if (transport) hint.transport = transport;

  if (CHILD_ALONE.test(m)) hint.mineurSansParent = true;

  if (transport === 'voiture' && SOMEONE_ELSES_CAR.test(m)) hint.vehiculeAuNomDuConducteur = false;

  let nationalite: Nationalite | undefined;
  if (BINATIONAL.test(m) || (FRENCH.test(m) && MOROCCAN.test(m))) nationalite = 'binationale';
  else if (FRENCH.test(m)) nationalite = 'francaise';
  else if (MOROCCAN.test(m)) nationalite = 'marocaine';
  if (nationalite) hint.nationalite = nationalite;

  return hint;
}

/** /kit-retour with only the answers the sentence gave. */
export function kitHref(hint: KitHint): string {
  const params = new URLSearchParams();
  if (hint.transport) params.set('transport', hint.transport);
  if (hint.nationalite) params.set('nationalite', hint.nationalite);
  if (hint.mineurSansParent) params.set('mineur', 'oui');
  if (hint.vehiculeAuNomDuConducteur === false) params.set('vehicule', 'autre');
  const query = params.toString();
  return query ? `/kit-retour?${query}` : '/kit-retour';
}

const TRANSPORTS: readonly Transport[] = ['voiture', 'avion', 'ferry-pieton'];
const NATIONALITES: readonly Nationalite[] = ['francaise', 'marocaine', 'binationale'];

/** Reads back what kitHref wrote; unknown values are ignored. */
export function kitHintFromSearch(search: string): KitHint {
  const params = new URLSearchParams(search);
  const hint: KitHint = {};
  const transport = params.get('transport');
  if (transport && (TRANSPORTS as readonly string[]).includes(transport)) hint.transport = transport as Transport;
  const nationalite = params.get('nationalite');
  if (nationalite && (NATIONALITES as readonly string[]).includes(nationalite)) hint.nationalite = nationalite as Nationalite;
  if (params.get('mineur') === 'oui') hint.mineurSansParent = true;
  if (params.get('vehicule') === 'autre') hint.vehiculeAuNomDuConducteur = false;
  return hint;
}
