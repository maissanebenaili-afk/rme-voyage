/** @jest-environment node */
/**
 * Hadak, questions MRE mesurées le 2026-10-04 sur la version prête à publier :
 * la météo répondait à « combien de temps… voiture » et à toute question
 * citant une ville ; l'IA (sans consigne) inventait des chiffres (« 250 USD »).
 */
import { NextRequest } from 'next/server'
import { POST } from '../app/api/hadak/route'
import { resetRouterForTests } from '../lib/hadakAiRouter'

function post(message: string, lang = 'fr') {
  return POST(new NextRequest('http://localhost/api/hadak', {
    method: 'POST',
    body: JSON.stringify({ message, lang }),
    headers: { 'content-type': 'application/json' },
  }))
}
const ask = async (message: string, lang = 'fr') => (await (await post(message, lang)).json()).response as string

describe('Hadak — sourced MRE answers', () => {
  const originalFetch = global.fetch
  beforeEach(() => {
    global.fetch = jest.fn(async () => { throw new Error('offline') }) as unknown as typeof fetch
  })
  afterEach(() => { global.fetch = originalFetch })

  it.each([
    'Combien de temps je peux laisser ma voiture française au Maroc ?',
    'Ma voiture peut rester combien de mois au Maroc ?',
    'Je dépasse le délai de ma voiture, je risque quoi ?',
  ])('answers the car stay rule from the ADII guide, never the weather: %s', async (q) => {
    const a = await ask(q)
    expect(a).toMatch(/6 mois par année civile/)
    expect(a).toMatch(/douane\.gov\.ma/)
    expect(a).not.toMatch(/Météo|°C/)
  })

  it.each(['es', 'da', 'ar'])('gives the car rule in %s too', async (lang) => {
    expect(await ask('Combien de temps je peux laisser ma voiture au Maroc ?', lang)).toMatch(/6/)
  })

  it.each([
    'Combien de temps en voiture de Paris à Tanger ?',
    'Je pars en voiture à Fès, prépare-moi le voyage',
    'Quels documents pour passer la frontière en voiture ?',
  ])('keeps a travel or documents question off the car stay rule: %s', async (q) => {
    expect(await ask(q)).not.toMatch(/6 mois par année civile/)
  })

  it('tells that a minor leaving France alone needs the AST', async () => {
    const a = await ask('Mon enfant mineur voyage seul au Maroc, il faut quel papier ?')
    expect(a).toMatch(/autorisation de sortie du territoire \(AST\)/)
    expect(a).toMatch(/service-public\.gouv\.fr/)
  })

  it('gives the EU 10 000 € declaration and the Moroccan limits for cash', async () => {
    const a = await ask("Combien d'euros je peux emporter en liquide en quittant la France ?")
    expect(a).toMatch(/10 000 €/)
    expect(a).toMatch(/DALIA/)
    expect(a).toMatch(/100 000 DH/)
  })

  it('keeps "argent liquide à la douane" on the customs answer (20 000 DH gifts)', async () => {
    expect(await ask("Combien d'argent liquide je peux passer à la douane ?")).toMatch(/20 000/)
  })

  it.each([
    'Combien coûte le péage Tanger Casablanca ?',
    'Combien de temps de trajet entre Tanger et Fès ?',
    'Je cherche un bon restaurant pas cher à Casablanca',
  ])('does not answer the weather to a question that only names a city: %s', async (q) => {
    expect(await ask(q)).not.toMatch(/Météo actuelle/)
  })

  it('still treats real weather questions as weather', async () => {
    global.fetch = jest.fn(async () => new Response(JSON.stringify({ current: { temperature_2m: 21, weather_code: 0, wind_speed_10m: 5 } }))) as unknown as typeof fetch
    expect(await ask('Quel temps fait-il à Tanger ?')).toMatch(/Tanger/)
    expect(await ask('Tanger ?')).toMatch(/21°C/)
  })
})

describe('Hadak — the AI is told never to invent', () => {
  const originalFetch = global.fetch
  const originalEnv = process.env
  beforeEach(() => resetRouterForTests())
  afterEach(() => {
    global.fetch = originalFetch
    process.env = originalEnv
  })

  it.each(['fr', 'es', 'ar', 'da'])('sends a no-invention rule to the model (%s)', async (lang) => {
    process.env = {
      ...Object.fromEntries(Object.entries(originalEnv).filter(([k, v]) => !/ANTHROPIC|GROQ|OPENAI|GEMINI|OPENROUTER/i.test(k) && !v?.startsWith('sk-') && !v?.startsWith('gsk_'))),
      OPENAI_API_KEY: 'test-key',
    } as unknown as NodeJS.ProcessEnv
    const systems: string[] = []
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (new URL(input.toString()).hostname === 'api.openai.com') {
        systems.push(JSON.parse(String(init?.body)).messages[0].content)
        return new Response(JSON.stringify({ choices: [{ message: { content: 'Je n’ai pas de source vérifiée.' } }] }), { status: 200 })
      }
      throw new Error('offline')
    }) as unknown as typeof fetch
    await post('Est-ce que je peux ramener un drone au Maroc ?', lang)
    expect(systems.length).toBeGreaterThan(0)
    expect(systems[0]).toMatch(/douane\.gov\.ma/)
    expect(systems[0]).toMatch(/service-public\.gouv\.fr/)
  })
})
