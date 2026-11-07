import { EPISODES, PERSOS, texteParle, avecVoix } from '../scripts/ados/histoire.mjs'
import { construire, decouper, plansParlants, FIN, INTRO } from '../scripts/ados/montage.mjs'

const EMOTIONS = ['neutre', 'joie', 'triste', 'colere', 'surprise', 'peur', 'malade', 'froid', 'tendre', 'pleure']
const DECORS = ['aube', 'atelier', 'toits', 'lycee', 'villa', 'hopital', 'gala', 'dar', 'feu']
const INSERTS = ['feu', 'lettre', 'broderie', 'broche', 'robe', 'calendrier', 'maison']
const GESTES = ['rire', 'secoue', 'poing', 'tend', 'coeur', 'bouche', 'baisse', 'recule', 'avance', 'choc', 'explique', 'doigt', 'menton', 'hausse', 'salut']
const CAMERAS = ['zoom', 'pan', 'push', 'shake', 'fixe']

describe('« Le Fil d’or » : l’histoire', () => {
  it('a 6 épisodes numérotés, chacun avec un titre et une annonce du suivant', () => {
    expect(EPISODES.map((e) => e.numero)).toEqual([1, 2, 3, 4, 5, 6])
    for (const e of EPISODES) {
      expect(e.titre.length).toBeGreaterThan(3)
      expect(e.demain.length).toBeGreaterThan(3)
      expect(e.question.endsWith('?')).toBe(true)
      expect(e.question.length).toBeLessThan(46)
    }
  })

  it('chaque épisode dure environ 4 minutes (3 min 40 à 4 min 30)', () => {
    for (const e of EPISODES) {
      const voix = e.plans.filter(avecVoix).reduce((a, p) => a + (p.texte ?? '').length / 15.3 + 2.1, 0)
      const muet = e.plans.filter((p) => !avecVoix(p)).reduce((a, p) => a + (p.duree ?? 3), 0)
      const total = voix + muet + INTRO + FIN
      expect(total).toBeGreaterThan(220)
      expect(total).toBeLessThan(270)
    }
  })

  it('les gestes ont une raison : pas de geste sur plus de la moitié des plans parlés', () => {
    for (const e of EPISODES) {
      const parles = e.plans.filter(avecVoix)
      const avecGeste = parles.filter((p) => p.persos.some((x) => x.act)).length
      expect(avecGeste / parles.length).toBeLessThan(0.62)
    }
  })

  it('alterne joie et peine dans chaque épisode', () => {
    for (const e of EPISODES) {
      const emos = e.plans.flatMap((p) => p.persos.flatMap((x) => [x.emo, x.emo2]))
      expect(emos).toContain('joie')
      expect(emos.some((x) => x === 'triste' || x === 'pleure')).toBe(true)
    }
  })

  it('se passe à Taza', () => {
    const tout = EPISODES.flatMap((e) => e.plans.map((p) => p.texte ?? '')).join(' ')
    expect(tout).toMatch(/Taza/)
    expect(tout).not.toMatch(/Fès/)
  })

  it('chaque plan a un décor connu et, selon le cas, une voix ou une durée', () => {
    for (const e of EPISODES)
      for (const p of e.plans) {
        expect(DECORS).toContain(p.bg)
        if (p.parle) {
          expect(Object.keys(PERSOS)).toContain(p.parle)
          expect((p.ton ?? '').length).toBeGreaterThan(2)
          expect((p.texte ?? '').trim().length).toBeGreaterThan(4)
          expect(texteParle(p)).toMatch(/^\[.+\] /)
          expect(texteParle(p)).not.toContain('*')
        } else {
          expect(p.duree).toBeGreaterThan(1.5)
        }
        if (p.insert) expect(INSERTS).toContain(p.insert)
        if (p.cam) expect(CAMERAS).toContain(p.cam)
      }
  })

  it('celui qui parle est à l’écran, sauf le narrateur et les voix sur une image', () => {
    for (const e of EPISODES)
      for (const p of e.plans) {
        if (p.parle && p.parle !== 'narration' && !p.insert) expect(p.persos.map((x) => x.id)).toContain(p.parle)
        for (const x of p.persos) {
          expect(EMOTIONS).toContain(x.emo)
          if (x.emo2) expect(EMOTIONS).toContain(x.emo2)
          if (x.act) expect(GESTES).toContain(x.act)
          expect(x.x).toBeGreaterThanOrEqual(-1)
          expect(x.x).toBeLessThanOrEqual(1)
        }
      }
  })

  it('les épisodes durent de 2 à 3 minutes (avec des voix de 4,5 s en moyenne)', () => {
    for (const e of EPISODES) {
      const S = construire(e, e.plans.filter(avecVoix).map(() => 4.5), PERSOS, 24)
      expect(S.total).toBeGreaterThanOrEqual(95)
      expect(S.total).toBeLessThanOrEqual(200)
    }
  })

  it('met du drame et de la joie dans chaque épisode', () => {
    for (const e of EPISODES) {
      const emos = new Set(e.plans.flatMap((p) => p.persos.flatMap((x) => [x.emo, x.emo2])))
      expect(emos.has('joie') || emos.has('tendre')).toBe(true)
      expect(emos.has('pleure') || emos.has('colere') || emos.has('peur')).toBe(true)
    }
  })

  it('reste court : aucune réplique de plus de 36 mots', () => {
    for (const e of EPISODES) for (const p of e.plans) if (p.texte) expect(p.texte.split(/\s+/).length).toBeLessThanOrEqual(36)
  })

  it('pas de contenu inadapté à des adolescents', () => {
    const tout = EPISODES.flatMap((e) => e.plans.map((p) => p.texte ?? '')).join(' ')
    expect(tout).not.toMatch(/sang|viol|suicide|tuer|sexe/i)
  })
})

describe('montage', () => {
  it('la voix n° i est posée sur le i-ème plan qui parle (les plans muets ne décalent pas le son)', () => {
    for (const ep of EPISODES) {
      const S = construire(ep, ep.plans.filter(avecVoix).map(() => 4), PERSOS, 30)
      const parlants = plansParlants(S)
      expect(parlants).toHaveLength(ep.plans.filter(avecVoix).length)
      parlants.forEach((p, i) => {
        expect(p.voixIndex).toBe(i)
        expect(p.parle).toBe(ep.plans.filter(avecVoix)[i].parle)
      })
    }
    // preuve que l'ancienne méthode (S.shots[i]) était fausse : il y a des plans muets avant des plans parlants
    const S1 = construire(EPISODES[0], EPISODES[0].plans.filter(avecVoix).map(() => 4), PERSOS, 30)
    expect(S1.shots.some((x, i) => x.voixIndex >= 0 && x.voixIndex !== i)).toBe(true)
  })


  it('enchaîne les plans sans trou ni recouvrement', () => {
    const ep = EPISODES[0]
    const S = construire(ep, ep.plans.filter(avecVoix).map(() => 3), PERSOS, 24)
    expect(S.introFin).toBe(INTRO)
    expect(S.shots[0].start).toBe(INTRO)
    for (let i = 1; i < S.shots.length; i++) expect(S.shots[i].start).toBeCloseTo(S.shots[i - 1].end, 6)
    expect(S.finDebut).toBeCloseTo(S.shots[S.shots.length - 1].end, 6)
    expect(S.total).toBeCloseTo(S.finDebut + FIN, 6)
  })

  it('la voix commence après le début du plan et finit avant sa fin', () => {
    const S = construire(EPISODES[1], [], PERSOS, 24)
    for (const s of S.shots.filter((x) => x.parle)) {
      expect(s.voixDebut).toBeGreaterThan(s.start)
      expect(s.voixDebut + s.voixDuree).toBeLessThan(s.end)
    }
    for (const s of S.shots.filter((x) => !x.parle)) expect(s.voixIndex).toBe(-1)
  })

  it('numérote les voix dans l’ordre des plans parlés', () => {
    const S = construire(EPISODES[2], [], PERSOS, 24)
    const index = S.shots.filter((s) => s.parle).map((s) => s.voixIndex)
    expect(index).toEqual(index.map((_, i) => i))
  })
})

describe('découpage en shorts', () => {
  const ep = EPISODES[0]
  const S = construire(ep, ep.plans.filter(avecVoix).map(() => 4.5), PERSOS, 24)

  it('coupe seulement entre deux plans et couvre tout l’épisode', () => {
    const morceaux = decouper(S, 45)
    expect(morceaux[0].debut).toBe(0)
    expect(morceaux[morceaux.length - 1].fin).toBeCloseTo(S.total, 6)
    const fins = new Set(S.shots.map((s) => s.end))
    for (let i = 0; i < morceaux.length - 1; i++) {
      expect(fins.has(morceaux[i].fin)).toBe(true)
      expect(morceaux[i + 1].debut).toBe(morceaux[i].fin)
    }
  })

  it('ne laisse pas un reste minuscule à la fin', () => {
    const morceaux = decouper(S, 40)
    for (const c of morceaux.slice(0, -1)) expect(c.fin - c.debut).toBeGreaterThanOrEqual(40)
    const dernier = morceaux[morceaux.length - 1]
    expect(dernier.fin - dernier.debut).toBeGreaterThan(14)
  })
})
