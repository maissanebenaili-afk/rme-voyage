import { render } from '@testing-library/react'
import DemoPage, { generateStaticParams } from '../app/pro/demo/[categorie]/page'
import { DEMO_SLUGS, DEMOS, demoPour } from '@/lib/demoEtablissements'

describe('maquettes pour les établissements', () => {
  it('prépare une page par catégorie', () => {
    expect(generateStaticParams().map((p) => p.categorie).sort()).toEqual([...DEMO_SLUGS].sort())
    expect(DEMO_SLUGS).toHaveLength(5)
    expect(demoPour('inconnu')).toBeNull()
  })

  it('annonce que l’exemple est fictif et que rien n’est en ligne', async () => {
    for (const slug of DEMO_SLUGS) {
      const { container, unmount } = render(await DemoPage({ params: Promise.resolve({ categorie: slug }) }))
      const texte = container.textContent ?? ''
      expect(texte).toMatch(/fictif/i)
      expect(texte).toMatch(/pas encore en ligne/i)
      unmount()
    }
  })

  it('ne promet ni prix, ni chiffre de fréquentation, ni garantie', async () => {
    for (const slug of DEMO_SLUGS) {
      const { container, unmount } = render(await DemoPage({ params: Promise.resolve({ categorie: slug }) }))
      const texte = container.textContent ?? ''
      expect(texte).not.toMatch(/\d[\d\s]*€/)
      expect(texte).not.toMatch(/\d+\s*(clients|visiteurs|vues|utilisateurs)/i)
      expect(texte).not.toMatch(/garanti/i)
      unmount()
    }
    for (const d of Object.values(DEMOS)) expect(d.exemple).toMatch(/exemple/i)
  })
})
