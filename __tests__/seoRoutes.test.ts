/** @jest-environment node */
import { readdirSync } from 'node:fs'
import sitemap from '../app/sitemap'
import robots from '../app/robots'
import { ROUTE_PAGES } from '@/lib/routePages'

describe('sitemap and robots', () => {
  it('is not shadowed by a static file in public/', () => {
    // public/sitemap.xml et public/robots.txt masquaient app/sitemap.ts et
    // app/robots.ts : seules 4 URL figées étaient servies.
    const files = readdirSync(new URL('../public', import.meta.url))
    expect(files).not.toContain('sitemap.xml')
    expect(files).not.toContain('robots.txt')
  })

  it('lists every published route page, once, with a real last-modified date', () => {
    const entries = sitemap()
    const urls = entries.map((entry) => entry.url)
    expect(new Set(urls).size).toBe(urls.length)
    expect(urls).toContain(`${urls[0]}/trajet`)
    for (const route of ROUTE_PAGES.routes) {
      expect(urls).toContain(`${urls[0]}/trajet/${route.slug}`)
    }
    const expected = new Date(`${ROUTE_PAGES.generatedAt}T00:00:00Z`).toISOString()
    for (const entry of entries) {
      expect(new Date(entry.lastModified as Date).toISOString()).toBe(expected)
    }
  })

  it('points robots at the sitemap on the same origin', () => {
    const { sitemap: sitemapUrl } = robots()
    expect(sitemapUrl).toBe(`${sitemap()[0].url}/sitemap.xml`)
  })
})
