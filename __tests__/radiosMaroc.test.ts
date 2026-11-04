import { FREE_STREAMING, RADIOS, SNRT_RADIOS, SOCIAL_SANS_COMPTE, TV_CHANNELS, isAllowedStream, radioById } from '@/lib/radiosMaroc'

describe('radios et télé du Maroc', () => {
  it('lists stations with unique ids, https streams and https homepages', () => {
    expect(new Set(RADIOS.map((r) => r.id)).size).toBe(RADIOS.length)
    for (const r of RADIOS) {
      expect(r.stream).toMatch(/^https:\/\//)
      expect(r.homepage).toMatch(/^https:\/\//)
      expect(r.genre.trim()).not.toBe('')
    }
  })

  it('points the SNRT radios and channels to their official pages', () => {
    for (const link of [...SNRT_RADIOS, ...TV_CHANNELS]) expect(link.url).toMatch(/^https:\/\/(snrtlive\.ma\/fr\/|2m\.ma\/|www\.medi1tv\.com\/)/)
    expect(SNRT_RADIOS.find((r) => r.id === 'mohammed-6-coran')?.url).toBe('https://snrtlive.ma/fr/idaat-mohammed-assadiss')
  })

  it('only accepts https streams from the listed origins', () => {
    expect(isAllowedStream('https://radiomars.ice.infomaniak.ch/radiomars-128.mp3')).toBe(true)
    expect(isAllowedStream('http://radiomars.ice.infomaniak.ch/radiomars-128.mp3')).toBe(false)
    expect(isAllowedStream('https://evilice.infomaniak.ch/x.mp3')).toBe(false)
    expect(isAllowedStream('https://x.ice.infomaniak.ch.evil.example/x.mp3')).toBe(false)
    expect(isAllowedStream('https://stream.zeno.fm/abc')).toBe(false)
    expect(isAllowedStream('pas une adresse')).toBe(false)
  })

  it('lists only official free platforms for films and series, never a piracy aggregator', () => {
    const hosts = FREE_STREAMING.map((p) => new URL(p.url).host)
    expect(hosts).toEqual(
      expect.arrayContaining(['www.tv5mondeplus.com', 'www.arte.tv', 'pluto.tv', 'www.rakuten.tv', 'www.france.tv', 'www.tf1.fr', 'www.m6.fr']),
    )
    expect(hosts).toHaveLength(7)
    expect(hosts.some((h) => h.includes('miaw'))).toBe(false)
  })

  it('links the no-account video sites, with YouTube Kids and the TikTok age', () => {
    expect(SOCIAL_SANS_COMPTE.map((s) => new URL(s.url).host)).toEqual(['www.youtube.com', 'www.youtubekids.com', 'www.tiktok.com'])
    expect(SOCIAL_SANS_COMPTE.find((s) => s.id === 'tiktok')?.detail).toMatch(/13 ans/)
  })

  it('finds a station back from its id', () => {
    expect(radioById('radio-mars')?.name).toBe('Radio Mars')
    expect(radioById('inconnue')).toBeUndefined()
    expect(radioById(null)).toBeUndefined()
  })
})
