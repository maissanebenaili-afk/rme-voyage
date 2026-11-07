/** @jest-environment node */
import { existsSync, readFileSync, statSync } from 'fs';
import { resolve } from 'path';
import { EPISODES_AUDIO } from '@/lib/feuilletons/catalogue.generated';
import { NOM_CACHE, ErreurTelechargement, estTelecharge, formaterDuree, formaterTaille, lireLocal, repliqueActive, supprimer, telecharger, type Dependances } from '@/lib/feuilletons/horsLigne';

/** Faux Cache Storage en mémoire : on vérifie ce qui est vraiment rangé ou non. */
function faux(octets: Uint8Array, opts: { statut?: number; entete?: boolean } = {}) {
  const magasin = new Map<string, Response>();
  const dep: Dependances = {
    caches: { open: async (nom: string) => { expect(nom).toBe(NOM_CACHE); return { put: async (k: string, r: Response) => { magasin.set(k, r); }, match: async (k: string) => magasin.get(k)?.clone(), delete: async (k: string) => magasin.delete(k) } as unknown as Cache; }, delete: async () => true },
    fetchFn: (async (url: string) => {
      const corps = String(url).endsWith('.json') ? new TextEncoder().encode('{"repliques":[]}') : octets;
      return new Response(corps as BodyInit, { status: opts.statut ?? 200, headers: opts.entete === false ? {} : { 'content-length': String(corps.length), 'content-type': String(url).endsWith('.json') ? 'application/json' : 'audio/mpeg' } });
    }) as typeof fetch,
  };
  return { dep, magasin };
}

describe('téléchargement hors ligne', () => {
  it('garde audio + texte seulement après une copie complète', async () => {
    const { dep, magasin } = faux(new Uint8Array(1000));
    const progres: number[] = [];
    await telecharger('/feuilletons/a.mp3', '/feuilletons/a.json', 1000, { dep, onProgress: (p) => progres.push(p.recu) });
    expect([...magasin.keys()]).toEqual(['/feuilletons/a.mp3', '/feuilletons/a.json']);
    expect(progres.at(-1)).toBe(1000);
    expect(await estTelecharge('/feuilletons/a.mp3', dep)).toBe(true);
    expect((await lireLocal('/feuilletons/a.mp3', dep))?.size).toBe(1000);
  });
  it('ne garde rien si le serveur répond une erreur', async () => {
    const { dep, magasin } = faux(new Uint8Array(10), { statut: 404 });
    await expect(telecharger('/x.mp3', '/x.json', 10, { dep })).rejects.toBeInstanceOf(ErreurTelechargement);
    expect(magasin.size).toBe(0);
  });
  it('ne garde rien si la copie est incomplète', async () => {
    const { dep, magasin } = faux(new Uint8Array(500), { entete: false });
    await expect(telecharger('/x.mp3', '/x.json', 1000, { dep })).rejects.toThrow(/incompl/);
    expect(magasin.size).toBe(0);
  });
  it('supprime audio et texte', async () => {
    const { dep, magasin } = faux(new Uint8Array(100));
    await telecharger('/a.mp3', '/a.json', 100, { dep });
    await supprimer('/a.mp3', '/a.json', dep);
    expect(magasin.size).toBe(0);
    expect(await estTelecharge('/a.mp3', dep)).toBe(false);
  });
  it('un téléchargement arrêté ne laisse rien', async () => {
    const { dep, magasin } = faux(new Uint8Array(100));
    const c = new AbortController();
    const base = dep.fetchFn;
    dep.fetchFn = (async (u: string, i?: RequestInit) => { c.abort(); if (i?.signal?.aborted) throw new DOMException('stop', 'AbortError'); return base(u, i); }) as typeof fetch;
    await expect(telecharger('/a.mp3', '/a.json', 100, { dep, signal: c.signal })).rejects.toThrow();
    expect(magasin.size).toBe(0);
  });
});

describe('texte synchronisé', () => {
  const r = [{ debut: 2, fin: 5 }, { debut: 7, fin: 9 }, { debut: 12, fin: 15 }];
  it('trouve la réplique en cours', () => {
    expect(repliqueActive(r, 0)).toBe(-1);
    expect(repliqueActive(r, 2)).toBe(0);
    expect(repliqueActive(r, 8)).toBe(1);
    expect(repliqueActive(r, 100)).toBe(2);
  });
  it('formate poids et durée', () => {
    expect(formaterTaille(1_700_000)).toBe('1,7 Mo');
    expect(formaterDuree(247)).toBe('4 min 07 s');
  });
});

describe('fichiers publiés', () => {
  it('chaque épisode du catalogue existe avec son vrai poids et des répliques ordonnées', () => {
    expect(EPISODES_AUDIO.length).toBeGreaterThanOrEqual(7);
    for (const e of EPISODES_AUDIO) {
      const mp3 = resolve(process.cwd(), 'public', e.fichier.slice(1)), json = resolve(process.cwd(), 'public', e.texte.slice(1));
      expect(existsSync(mp3)).toBe(true);
      expect(statSync(mp3).size).toBe(e.octets);
      expect(e.octets).toBeLessThan(3_000_000);
      const { repliques } = JSON.parse(readFileSync(json, 'utf8'));
      expect(repliques.length).toBeGreaterThan(10);
      repliques.forEach((q: { debut: number; fin: number }, i: number) => {
        expect(q.fin).toBeGreaterThan(q.debut);
        if (i) expect(q.debut).toBeGreaterThanOrEqual(repliques[i - 1].fin - 0.01);
        expect(q.fin).toBeLessThanOrEqual(e.duree + 1);
      });
    }
  });
  it('le service worker précharge la page et ne touche pas aux téléchargements de l’utilisateur', () => {
    const sw = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8');
    expect(sw).toContain("'/feuilletons'");
    expect(sw).not.toContain('rme-feuilletons');
    expect(NOM_CACHE.startsWith('rme-voyage-')).toBe(false); // le nettoyage du service worker ne doit jamais supprimer les épisodes téléchargés
  });
});

describe('traductions du texte', () => {
  it('chaque traduction a autant de lignes que de répliques, sans ligne vide', () => {
    const d = JSON.parse(readFileSync(resolve(process.cwd(), 'public/feuilletons/atlas-01.json'), 'utf8'));
    expect(Object.keys(d.traductions).sort()).toEqual(['en', 'es', 'nl']);
    for (const lignes of Object.values(d.traductions) as string[][]) {
      expect(lignes).toHaveLength(d.repliques.length);
      lignes.forEach((l) => expect(l.trim().length).toBeGreaterThan(5));
    }
    expect(d.traductionsNote).toMatch(/non relue/);
  });
});
