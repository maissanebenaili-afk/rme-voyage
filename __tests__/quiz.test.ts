import { BANQUE, NB_QUESTIONS, aRepondu, etoiles, nouvellePartie, repondre, suivante, termine, type Niveau } from '@/lib/jeux/quiz';

const sansHasard = () => 0.5;

describe('quiz du voyageur', () => {
  it('chaque question a une bonne réponse unique parmi 4 propositions distinctes', () => {
    for (const niveau of Object.keys(BANQUE) as Niveau[]) {
      expect(BANQUE[niveau].length).toBeGreaterThanOrEqual(NB_QUESTIONS);
      for (const b of BANQUE[niveau]) {
        const toutes = [b.bonne, ...b.autres];
        expect(new Set(toutes).size).toBe(4);
        expect(b.q.length).toBeLessThanOrEqual(110);
      }
    }
  });
  it('retrouve la bonne réponse après mélange, sans doublon de question', () => {
    for (const niveau of Object.keys(BANQUE) as Niveau[]) {
      const p = nouvellePartie(niveau, Math.random);
      expect(p.questions).toHaveLength(NB_QUESTIONS);
      expect(new Set(p.questions.map((q) => q.q)).size).toBe(NB_QUESTIONS);
      p.questions.forEach((q) => {
        const brute = BANQUE[niveau].find((b) => b.q === q.q)!;
        expect(q.options[q.bonne]).toBe(brute.bonne);
      });
    }
  });
  it('compte les points et la série, et refuse une deuxième réponse', () => {
    let p = nouvellePartie('facile', sansHasard);
    p = repondre(p, p.questions[0].bonne);
    expect(p.score).toBe(1);
    expect(p.serie).toBe(1);
    const encore = repondre(p, p.questions[0].bonne);
    expect(encore).toBe(p);
    p = suivante(p);
    const faux = (p.questions[1].bonne + 1) % 4;
    p = repondre(p, faux);
    expect(p.serie).toBe(0);
    expect(p.meilleureSerie).toBe(1);
    expect(p.score).toBe(1);
  });
  it('ne passe pas à la suivante sans avoir répondu, et finit après la dernière', () => {
    let p = nouvellePartie('moyen', sansHasard);
    expect(suivante(p)).toBe(p);
    for (let i = 0; i < NB_QUESTIONS; i++) { p = repondre(p, p.questions[i].bonne); expect(aRepondu(p)).toBe(true); p = suivante(p); }
    expect(termine(p)).toBe(true);
    expect(p.score).toBe(NB_QUESTIONS);
    expect(etoiles(p)).toBe(3);
  });
  it('ignore un choix hors des propositions', () => {
    const p = nouvellePartie('facile', sansHasard);
    expect(repondre(p, 9)).toBe(p);
    expect(repondre(p, -1)).toBe(p);
  });
  it('attribue les étoiles selon le score', () => {
    const base = nouvellePartie('facile', sansHasard);
    expect([0, 1, 2, 3, 4, 5].map((score) => etoiles({ ...base, score }))).toEqual([0, 0, 1, 1, 2, 3]);
  });
});
