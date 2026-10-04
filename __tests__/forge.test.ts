/** @jest-environment node */
// Red team of the Forge: feed it the lies RME actually showed and check that
// each one is caught, and that honest answers pass.
import { checkInvariants, loadCorpus, toMarkdown } from '../scripts/forge/core.mjs'

const corpus = loadCorpus()
const scenario = (id: string) => corpus.scenarios.find((s: { id: string }) => s.id === id)

describe('Forge catches the lies RME really showed', () => {
  it.each([
    ['H01', { status: 200, source: 'groq', text: 'La franchise douanière pour un voyageur est de 2 000 DH… 6 L de vin' }],
    ['H06', { status: 200, source: 'local', text: 'Météo actuelle à **Taza** : 30°C, nuageux' }],
    ['H08', { status: 200, source: 'groq', text: "Consulat du Maroc à Paris : 43 Rue de l'Université – +33 1 44 93 46 00" }],
    ['H04', { status: 200, source: 'local', text: 'Barcelona/Gênes → Nador (Grimaldi).' }],
    ['A02', { status: 404, text: '{"error":"Destination location not found"}' }],
    ['A04', { status: 502, text: '{"error":"Service de recherche indisponible."}' }],
    ['P01', { status: 200, text: '5 millions de MRE envoient €4,8 milliards par an' }],
    ['P02', { status: 200, text: 'Zahia Location 150 € Caution 200 € · la plateforme retient 10 %' }],
    ['B02', { status: 200, text: '', failures: ['résultat hors écran (haut à 912 px sur 844)'] }],
  ])('%s fails on the observed lie', (id, observed) => {
    expect(checkInvariants(scenario(id), observed, corpus).length).toBeGreaterThan(0)
  })

  it.each([
    ['H01', { status: 200, source: 'local', text: "cadeaux familiaux : moins de 20 000 DH par année civile… déclaration à partir de 100 000 DH" }],
    ['H06', { status: 200, source: 'local', text: '**Garages autour de Taza** (OpenStreetMap) : 1. Garage Atlas — 0,6 km' }],
    ['H08', { status: 200, source: 'local', text: "La recherche est indisponible. Je ne donne pas d'adresse de mémoire." }],
    ['A02', { status: 404, text: '{"error":"Destination introuvable."}' }],
  ])('%s passes on an honest answer', (id, observed) => {
    expect(checkInvariants(scenario(id), observed, corpus)).toEqual([])
  })

  it('an AI answer on a place or a regulation fails even when its wording looks right', () => {
    expect(checkInvariants(scenario('H09'), { status: 200, source: 'groq', text: 'Ambassade : voir le site officiel.' }, corpus))
      .toEqual([expect.stringMatching(/générée par l'IA/)])
  })

  it('every scenario has an id, a family and a known kind; ids are unique', () => {
    const ids = corpus.scenarios.map((s: { id: string }) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const s of corpus.scenarios) {
      expect(['truth', 'action', 'function', 'ux', 'commercial']).toContain(s.family)
      expect(['hadak', 'api', 'page', 'browser']).toContain(s.kind)
    }
  })

  it('the report lists changes between two runs and never counts SKIPPED as PASS', () => {
    const before = { label: 'baseline', results: [{ id: 'B02', verdict: 'FAIL' }] }
    const after = { label: 'after', base: 'x', at: 't', pass: 1, fail: 0, skipped: 1, families: { action: { PASS: 1, FAIL: 0, SKIPPED: 1 } },
      results: [{ id: 'B02', family: 'action', verdict: 'PASS', failures: [] }, { id: 'B03', family: 'action', verdict: 'SKIPPED', failures: ['navigateur non disponible'] }] }
    const md = toMarkdown(after, before)
    expect(md).toMatch(/B02 : FAIL → PASS/)
    expect(md).toMatch(/1 PASS · 0 FAIL · 1 SKIPPED/)
  })
})
