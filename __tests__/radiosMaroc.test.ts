import { RADIOS, SNRT_RADIOS, TV_CHANNELS, isAllowedStream, radioById } from '@/lib/radiosMaroc'

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

  it('finds a station back from its id', () => {
    expect(radioById('radio-mars')?.name).toBe('Radio Mars')
    expect(radioById('inconnue')).toBeUndefined()
    expect(radioById(null)).toBeUndefined()
  })
})
