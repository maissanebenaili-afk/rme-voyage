import {
  buildGoogleMapsDirectionsUrl,
  buildShareUrl,
  isDateNotPast,
  parseShareParams,
  shareTripLink,
  validateRoute,
  SHARE_FIELD_MAX_LENGTH,
} from '@/lib/tripShare'

describe('validateRoute', () => {
  it('rejects empty origin/destination', () => {
    const result = validateRoute('', '', undefined, new Date('2026-09-11'))
    expect(result.valid).toBe(false)
    expect(result.errors.origin).toBeDefined()
    expect(result.errors.destination).toBeDefined()
  })

  it('rejects identical origin and destination (case-insensitive)', () => {
    const result = validateRoute('Paris, France', 'paris, france', undefined, new Date('2026-09-11'))
    expect(result.valid).toBe(false)
    expect(result.errors.destination).toMatch(/différente/i)
  })

  it('rejects a past date (local date)', () => {
    const result = validateRoute('Paris', 'Tanger', '2020-01-01', new Date('2026-09-11'))
    expect(result.valid).toBe(false)
    expect(result.errors.date).toBeDefined()
  })

  it('accepts a valid, distinct, future route', () => {
    const result = validateRoute('Paris, France', 'Tanger, Maroc', '2026-12-01', new Date('2026-09-11'))
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('accepts today as a non-past date', () => {
    const now = new Date(2026, 8, 11) // local date, no time component
    const result = validateRoute('Paris', 'Tanger', '2026-09-11', now)
    expect(result.valid).toBe(true)
  })
})

describe('isDateNotPast', () => {
  it('rejects malformed date strings', () => {
    expect(isDateNotPast('not-a-date')).toBe(false)
    expect(isDateNotPast('2026-13-40')).toBe(false)
    expect(isDateNotPast('2026-02-31')).toBe(false)
  })

  it('rejects yesterday, accepts today and tomorrow', () => {
    const now = new Date(2026, 8, 11)
    expect(isDateNotPast('2026-09-10', now)).toBe(false)
    expect(isDateNotPast('2026-09-11', now)).toBe(true)
    expect(isDateNotPast('2026-09-12', now)).toBe(true)
  })
})

describe('buildGoogleMapsDirectionsUrl', () => {
  it('uses the standard api=1 Directions URL syntax', () => {
    const url = buildGoogleMapsDirectionsUrl('Paris, France', 'Tanger, Maroc')
    expect(url).toContain('https://www.google.com/maps/dir/?')
    expect(url).toContain('api=1')
    expect(url).toContain('origin=Paris%2C+France')
    expect(url).toContain('destination=Tanger%2C+Maroc')
    expect(url).toContain('travelmode=driving')
  })
})

describe('buildShareUrl / parseShareParams roundtrip', () => {
  it('roundtrips from/to/date through the share URL', () => {
    const url = buildShareUrl(
      { from: 'Paris, France', to: 'Tanger, Maroc', date: '2026-12-01' },
      'https://rme-voyage.example'
    )
    expect(url.startsWith('https://rme-voyage.example/?')).toBe(true)
    expect(url).toContain('#planifier')

    const parsed = parseShareParams(url)
    expect(parsed.from).toBe('Paris, France')
    expect(parsed.to).toBe('Tanger, Maroc')
    expect(parsed.date).toBe('2026-12-01')
  })

  it('omits the date param entirely when not provided', () => {
    const url = buildShareUrl({ from: 'Paris', to: 'Tanger' }, 'https://rme-voyage.example')
    expect(url).not.toContain('date=')
    const parsed = parseShareParams(url)
    expect(parsed.date).toBeUndefined()
  })

  it('never includes GPS coordinates in the share URL', () => {
    const url = buildShareUrl({ from: 'Paris, France', to: 'Tanger, Maroc' }, 'https://rme-voyage.example')
    expect(url).not.toMatch(/lat=|lon=|\d+\.\d{3,}/)
  })

  it('truncates from/to to ~120 characters before encoding when building a link', () => {
    const longName = 'A'.repeat(500)
    const url = buildShareUrl({ from: longName, to: 'Tanger' }, 'https://rme-voyage.example')
    expect(url).toContain(`from=${'A'.repeat(SHARE_FIELD_MAX_LENGTH)}`)
  })

  it('ignores (does not truncate) an incoming from/to that exceeds the length limit', () => {
    const tooLong = 'B'.repeat(SHARE_FIELD_MAX_LENGTH + 1)
    const parsed = parseShareParams(
      `https://rme-voyage.example/?from=${tooLong}&to=Tanger#planifier`
    )
    expect(parsed.from).toBe('')
    expect(parsed.to).toBe('Tanger')
  })

  it('rejects control characters in from/to on parse', () => {
    const parsed = parseShareParams(
      'https://rme-voyage.example/?from=Paris%00evil&to=Tanger#planifier'
    )
    expect(parsed.from).toBe('')
    expect(parsed.to).toBe('Tanger')
  })

  it('ignores malformed / invalid query parameters instead of throwing', () => {
    expect(() => parseShareParams('not a valid url at all ???')).not.toThrow()
    const parsed = parseShareParams('not a valid url at all ???')
    expect(parsed).toEqual({ from: '', to: '' })
  })

  it('ignores an invalid or past date parameter on parse', () => {
    const parsed = parseShareParams('https://rme-voyage.example/?from=Paris&to=Tanger&date=not-a-date#planifier')
    expect(parsed.from).toBe('Paris')
    expect(parsed.to).toBe('Tanger')
    expect(parsed.date).toBeUndefined()
  })

  it('ignores unknown/extra parameters', () => {
    const parsed = parseShareParams(
      'https://rme-voyage.example/?from=Paris&to=Tanger&lat=48.85&evil=<script>#planifier'
    )
    expect(parsed.from).toBe('Paris')
    expect(parsed.to).toBe('Tanger')
    expect(parsed).not.toHaveProperty('lat')
  })
})

describe('shareTripLink', () => {
  const originalShare = (navigator as unknown as { share?: unknown }).share
  const originalClipboard = (navigator as unknown as { clipboard?: unknown }).clipboard

  afterEach(() => {
    Object.defineProperty(navigator, 'share', { value: originalShare, configurable: true })
    Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true })
  })

  it('uses navigator.share when available', async () => {
    const share = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })

    const result = await shareTripLink('https://rme-voyage.example/?from=Paris#planifier')
    expect(share).toHaveBeenCalled()
    expect(result).toEqual({ method: 'web-share' })
  })

  it('falls back to clipboard when navigator.share is unavailable', async () => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    const result = await shareTripLink('https://rme-voyage.example/?from=Paris#planifier')
    expect(writeText).toHaveBeenCalledWith('https://rme-voyage.example/?from=Paris#planifier')
    expect(result).toEqual({ method: 'clipboard' })
  })

  it('falls back to manual entry when clipboard permission is refused', async () => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    const writeText = jest.fn().mockRejectedValue(new Error('permission denied'))
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    const result = await shareTripLink('https://rme-voyage.example/?from=Paris#planifier')
    expect(result).toEqual({ method: 'manual' })
  })

  it('treats a cancelled native share sheet (AbortError) as cancelled, without copying to clipboard afterwards', async () => {
    const abortError = new DOMException('The user aborted a request.', 'AbortError')
    const share = jest.fn().mockRejectedValue(abortError)
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    const result = await shareTripLink('https://rme-voyage.example/?from=Paris#planifier')
    expect(result).toEqual({ method: 'cancelled' })
    expect(writeText).not.toHaveBeenCalled()
  })
})
