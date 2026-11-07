// Téléchargement réel pour écouter sans réseau. Les fichiers sont copiés dans le Cache Storage du
// navigateur, seulement quand la personne appuie sur « Télécharger ». Une adresse distante n'est
// jamais comptée comme « téléchargée » : on vérifie que la copie est complète avant de la garder.

export const NOM_CACHE = 'rme-feuilletons-v1';

export interface Dependances {
  caches: Pick<CacheStorage, 'open' | 'delete'>;
  fetchFn: typeof fetch;
}

export interface Progression { recu: number; total: number }

export class ErreurTelechargement extends Error {}

const parDefaut = (): Dependances => {
  if (typeof caches === 'undefined') throw new ErreurTelechargement('Ce navigateur ne peut pas garder les épisodes hors ligne.');
  return { caches, fetchFn: (...a) => fetch(...a) };
};

/** Récupère un fichier avec suivi de progression. Rien n'est gardé si la copie est incomplète. */
async function lireComplet(url: string, octetsAttendus: number, dep: Dependances, signal?: AbortSignal, onProgress?: (p: Progression) => void): Promise<Blob> {
  const reponse = await dep.fetchFn(url, { signal, cache: 'no-store' });
  if (!reponse.ok) throw new ErreurTelechargement(`Téléchargement impossible (erreur ${reponse.status}).`);
  const type = reponse.headers.get('content-type') ?? '';
  const total = Number(reponse.headers.get('content-length')) || octetsAttendus;
  const morceaux: Uint8Array[] = [];
  let recu = 0;
  if (reponse.body) {
    const lecteur = reponse.body.getReader();
    for (;;) {
      const { done, value } = await lecteur.read();
      if (done) break;
      morceaux.push(value);
      recu += value.byteLength;
      onProgress?.({ recu, total });
    }
  } else {
    const tout = new Uint8Array(await reponse.arrayBuffer());
    morceaux.push(tout);
    recu = tout.byteLength;
    onProgress?.({ recu, total });
  }
  if (octetsAttendus > 0 && recu !== octetsAttendus && Number(reponse.headers.get('content-length')) !== recu) {
    throw new ErreurTelechargement('La copie est incomplète : rien n’a été gardé. Réessayez avec du réseau.');
  }
  return new Blob(morceaux as BlobPart[], { type });
}

/** Télécharge l'audio puis son texte, et ne garde les deux que si tout est complet. */
export async function telecharger(fichier: string, texte: string, octets: number, opts: { signal?: AbortSignal; onProgress?: (p: Progression) => void; dep?: Dependances } = {}): Promise<void> {
  const dep = opts.dep ?? parDefaut();
  const audio = await lireComplet(fichier, octets, dep, opts.signal, opts.onProgress);
  const sousTitres = await lireComplet(texte, 0, dep, opts.signal);
  const cache = await dep.caches.open(NOM_CACHE);
  await cache.put(fichier, new Response(audio, { headers: { 'Content-Type': audio.type || 'audio/mpeg', 'Content-Length': String(audio.size) } }));
  await cache.put(texte, new Response(sousTitres, { headers: { 'Content-Type': 'application/json' } }));
}

export async function estTelecharge(fichier: string, dep: Pick<Dependances, 'caches'> = parDefaut()): Promise<boolean> {
  const cache = await dep.caches.open(NOM_CACHE);
  return !!(await cache.match(fichier));
}

export async function supprimer(fichier: string, texte: string, dep: Pick<Dependances, 'caches'> = parDefaut()): Promise<void> {
  const cache = await dep.caches.open(NOM_CACHE);
  await cache.delete(fichier);
  await cache.delete(texte);
}

/** Lit la copie locale (audio en blob, pour que la lecture marche sans réseau, sans demande « Range »). */
export async function lireLocal(fichier: string, dep: Pick<Dependances, 'caches'> = parDefaut()): Promise<Blob | null> {
  const cache = await dep.caches.open(NOM_CACHE);
  const r = await cache.match(fichier);
  return r ? r.blob() : null;
}

export function formaterTaille(octets: number): string {
  return octets >= 1e6 ? `${(octets / 1e6).toFixed(1).replace('.', ',')} Mo` : `${Math.max(1, Math.round(octets / 1e3))} Ko`;
}

export function formaterDuree(secondes: number): string {
  const m = Math.floor(secondes / 60), s = Math.round(secondes % 60);
  return `${m} min ${String(s).padStart(2, '0')} s`;
}

/** Index de la réplique qui se dit à l'instant t (ou -1 avant la première). */
export function repliqueActive(repliques: { debut: number; fin: number }[], t: number): number {
  let actif = -1;
  for (let i = 0; i < repliques.length; i++) if (repliques[i].debut <= t) actif = i; else break;
  return actif;
}
