/** @jest-environment node */
import { CAFTANS, OCCASIONS, COMMISSION, getCaftan, similarCaftans } from '@/lib/caftans';
import { SILHOUETTES, bodyPath, deriveTones, folds } from '@/lib/caftanArt';

describe('catalogue caftan', () => {
  it('a des identifiants uniques', () => {
    const ids = CAFTANS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("n'utilise que des occasions listées dans le filtre", () => {
    for (const c of CAFTANS) {
      for (const o of c.occasion) expect(OCCASIONS).toContain(o);
    }
  });

  it('a des prix et cautions cohérents', () => {
    for (const c of CAFTANS) {
      expect(c.prixLocation).toBeGreaterThan(0);
      expect(c.caution).toBeGreaterThan(0);
      // Un achat coûte toujours plus qu'une semaine de location.
      expect(c.prixVente).toBeGreaterThan(c.prixLocation);
      expect(c.tailles.length).toBeGreaterThan(0);
    }
  });

  it('retrouve un modèle par son id, et rien pour un id inconnu', () => {
    expect(getCaftan('c1')?.name).toBe('Zahia');
    expect(getCaftan('nope')).toBeUndefined();
  });

  it('propose des modèles proches sans jamais se retourner lui-même', () => {
    for (const c of CAFTANS) {
      const s = similarCaftans(c);
      expect(s).toHaveLength(3);
      expect(s.map(x => x.id)).not.toContain(c.id);
    }
  });

  it('annonce une commission sans promettre d\'assurance', () => {
    expect(COMMISSION.pct).toBeGreaterThan(0);
    const texte = COMMISSION.couvre.join(' ').toLowerCase();
    expect(texte).not.toContain('assurance');
  });
});

describe('géométrie des illustrations', () => {
  it('produit un tracé fermé pour chaque silhouette utilisée', () => {
    for (const c of CAFTANS) {
      const d = bodyPath(SILHOUETTES[c.silhouette]);
      expect(d.startsWith('M ')).toBe(true);
      expect(d.trim().endsWith('Z')).toBe(true);
      expect(d).not.toContain('NaN');
    }
  });

  it('dérive quatre tons distincts depuis une seule couleur', () => {
    const t = deriveTones('#6b1a2e');
    expect(new Set(Object.values(t)).size).toBe(4);
  });

  it('génère des plis déterministes — même graine, même résultat', () => {
    expect(folds('c1', 5)).toEqual(folds('c1', 5));
    expect(folds('c1', 5)).not.toEqual(folds('c2', 5));
  });
});
