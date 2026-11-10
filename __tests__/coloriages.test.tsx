import { existsSync, readFileSync } from 'fs'
import { render, screen } from '@testing-library/react'
import ColoriagesPage from '../app/coloriages/page'
import { PAGES, svgPage, rosace, zellige, hasard } from '../scripts/coloriages/pages.mjs'
import { PAGES_PERSO } from '../scripts/coloriages/personnages.mjs'
import { BOUTIQUES, BOUTIQUES_PAR_LIVRE, LIVRE, LIVRES, boutiquesActives, lienValide } from '../lib/coloriages'

describe('Coloriages du Maroc : les dessins', () => {
  it('compte au moins 24 dessins (minimum d’un livre broché) aux identifiants uniques', () => {
    expect(PAGES.length).toBeGreaterThanOrEqual(24)
    expect(new Set(PAGES.map((p) => p.id)).size).toBe(PAGES.length)
    expect(new Set(PAGES.map((p) => p.titre)).size).toBe(PAGES.length)
  })
  it('aucun dessin n’est un doublon d’un autre (règle de qualité d’Amazon)', () => {
    const corps = PAGES.map((p) => p.dessin())
    expect(new Set(corps).size).toBe(corps.length)
  })
  it('est reproductible : la même graine donne le même dessin', () => {
    expect(rosace(12, 5)).toBe(rosace(12, 5))
    expect(rosace(12, 5)).not.toBe(rosace(12, 6))
    expect(zellige(0)).toBe(zellige(0))
    const a = hasard(42), b = hasard(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
  it('produit des SVG au trait, sans remplissage noir, tenant dans la page 850 × 1100', () => {
    PAGES.forEach((p, i) => {
      const svg = svgPage(p, i + 1)
      expect(svg.startsWith('<svg')).toBe(true)
      expect(svg).toContain('viewBox="0 0 850 1100"')
      expect(svg.length).toBeGreaterThan(2000)
      expect(svg).not.toMatch(/fill="(#000|#111|black)"[^>]*>(?!.*<\/text>)/)
      expect(svg.match(/<svg/g)).toHaveLength(1)
      expect(svg.match(/<path/g)!.length).toBeGreaterThan(5)
    })
  })
})

describe('Coloriages de Nour, Joha et la fée : les dessins', () => {
  it('compte 25 dessins aux identifiants et titres uniques, tous différents', () => {
    expect(PAGES_PERSO).toHaveLength(25)
    expect(new Set(PAGES_PERSO.map((p) => p.id)).size).toBe(25)
    expect(new Set(PAGES_PERSO.map((p) => p.titre)).size).toBe(25)
    const corps = PAGES_PERSO.map((p) => p.dessin())
    expect(new Set(corps).size).toBe(25)
  })
  it('produit des SVG valides dans la page 850 × 1100, avec la marque du livre', () => {
    PAGES_PERSO.forEach((p, i) => {
      const svg = svgPage(p, i + 3, 'Nour, Joha et la fée')
      expect(svg).toContain('viewBox="0 0 850 1100"')
      expect(svg).toContain('Nour, Joha et la fée · ')
      expect(svg).not.toContain('NaN')
      expect(svg).not.toContain('undefined')
      expect(svg.match(/<svg/g)).toHaveLength(1)
    })
  })
  it('garde le décor du livre 1 inchangé par défaut', () => {
    expect(svgPage(PAGES[0], 3)).toContain('Coloriages du Maroc · 3')
  })
})

describe('Coloriages du Maroc : fichiers et boutiques', () => {
  it('publie un échantillon PDF valide et des aperçus', () => {
    for (const livre of LIVRES) {
      const pdf = readFileSync(`public${livre.echantillon}`)
      expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
      expect(pdf.length).toBeLessThan(500_000)
      for (const { id } of livre.apercus) expect(existsSync(`public/coloriages/${livre.prefixe}${id}.png`)).toBe(true)
      expect(existsSync(`public${livre.couverture}`)).toBe(true)
    }
  })
  it('n’affiche aucun lien tant que le livre n’est pas publié', () => {
    expect(boutiquesActives()).toEqual([])
    for (const livre of LIVRES) expect(boutiquesActives(BOUTIQUES_PAR_LIVRE[livre.id])).toEqual([])
    expect(BOUTIQUES.every((b) => b.url === '' || lienValide(b.url))).toBe(true)
  })
  it('n’accepte que des liens https vers des boutiques connues', () => {
    expect(lienValide('https://www.amazon.fr/dp/B0TEST')).toBe(true)
    expect(lienValide('https://amzn.to/abc')).toBe(true)
    expect(lienValide('https://tarek.gumroad.com/l/coloriages')).toBe(true)
    expect(lienValide('http://www.amazon.fr/dp/B0TEST')).toBe(false)
    expect(lienValide('https://amazon.evil.example/dp/x')).toBe(false)
    expect(lienValide('javascript:alert(1)')).toBe(false)
    expect(lienValide('pas une adresse')).toBe(false)
    expect(lienValide('')).toBe(false)
  })
})

describe('page /coloriages', () => {
  it('propose l’échantillon gratuit de chaque livre et dit honnêtement qu’ils arrivent bientôt', () => {
    render(<ColoriagesPage />)
    expect(screen.getByRole('heading', { level: 1, name: /Livres de coloriage/ })).toBeInTheDocument()
    for (const livre of LIVRES) {
      expect(screen.getByRole('heading', { level: 2, name: livre.titre })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: `Télécharger le PDF gratuit : ${livre.titre}` })).toHaveAttribute('href', livre.echantillon)
    }
    expect(screen.getAllByRole('status')).toHaveLength(LIVRES.length)
    screen.getAllByRole('status').forEach((s) => expect(s).toHaveTextContent(/Bientôt disponible/))
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(LIVRES.reduce((n, l) => n + l.apercus.length, 0))
  })
})
