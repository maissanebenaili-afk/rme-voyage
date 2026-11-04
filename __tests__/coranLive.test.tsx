import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import CoranLive from '@/components/CoranLive'
import { BASMALA, RESUME_KEY } from '@/lib/coran'

// jsdom ne joue pas de son : on simule lecture et pause.
let paused = true
beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, 'paused', { configurable: true, get: () => paused })
})
beforeEach(() => {
  paused = true
  localStorage.clear()
  jest.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
  jest.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
    paused = false
    this.dispatchEvent(new Event('play'))
    return Promise.resolve()
  })
  jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLMediaElement) {
    paused = true
    this.dispatchEvent(new Event('pause'))
  })
})
afterEach(() => jest.restoreAllMocks())

function edition(n: number, texts: string[]) {
  return { number: n, ayahs: texts.map((text, i) => ({ numberInSurah: i + 1, text })) }
}

const SURAHS_TEXT: Record<number, { ar: string[]; fr: string[] }> = {
  1: { ar: [BASMALA, 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'], fr: ['Au nom d’Allah', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7'] },
  2: { ar: Array.from({ length: 286 }, (_, i) => `b${i + 1}`), fr: Array.from({ length: 286 }, (_, i) => `g${i + 1}`) },
  112: {
    ar: [`${BASMALA} قُلْ هُوَ ٱللَّهُ أَحَدٌ`, 'ٱللَّهُ ٱلصَّمَدُ', 'لَمْ يَلِدْ', 'وَلَمْ يَكُن'],
    fr: ['Dis: «Il est Allah, Unique.', 'Allah, Le Seul à être imploré.', 'Il n’a jamais engendré.', 'Et nul n’est égal à Lui».'],
  },
}

// Les boutons « les plus écoutées » (le même nom figure aussi dans la liste).
function favourite(name: string): HTMLElement {
  return screen.getAllByText(name).find((el) => el.tagName === 'BUTTON')!
}

function mockApi() {
  global.fetch = jest.fn(async (input: RequestInfo | URL) => {
    const n = Number(String(input).match(/surah\/(\d+)\//)![1])
    const text = SURAHS_TEXT[n]
    return {
      ok: Boolean(text),
      json: async () => ({ code: 200, data: [edition(n, text.ar), edition(n, text.fr)] }),
    } as Response
  }) as unknown as typeof fetch
}

describe('Coran Live', () => {
  it('opens on Al-Fatiha with its Arabic text and French translation', async () => {
    mockApi()
    render(<CoranLive />)
    expect(await screen.findByText(/Au nom d’Allah/)).toBeInTheDocument()
    expect(screen.getByText('Al-Faatiha', { selector: 'h2' })).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.alquran.cloud/v1/surah/1/editions/quran-uthmani,fr.hamidullah',
      expect.anything(),
    )
  })

  it('plays a favourite surah in one tap, shows the basmala above it, and pauses', async () => {
    mockApi()
    const { container } = render(<CoranLive />)
    fireEvent.click(favourite('Al-Ikhlaas'))
    expect(await screen.findByText('Dis: «Il est Allah, Unique.')).toBeInTheDocument()
    expect(screen.getByText('قُلْ هُوَ ٱللَّهُ أَحَدٌ', { exact: false })).toBeInTheDocument()
    expect(screen.getByText(BASMALA)).toBeInTheDocument()

    const audio = container.querySelector('audio')!
    expect(audio.getAttribute('src')).toBe('https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/112.mp3')
    await waitFor(() => expect(screen.getByLabelText('Pause')).toBeInTheDocument())

    fireEvent.click(screen.getByLabelText('Pause'))
    expect(screen.getByLabelText('Écouter la récitation')).toBeInTheDocument()
  })

  it('finds a surah by its usual French spelling', async () => {
    mockApi()
    render(<CoranLive />)
    await screen.findByText(/Au nom d’Allah/)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'yassine' } })
    const list = screen.getByRole('list', { name: 'Sourates' })
    expect(within(list).getAllByRole('button')).toHaveLength(1)
    expect(within(list).getByRole('button')).toHaveTextContent('Yaseen')
  })

  it('goes to the next surah and keeps the French translation optional', async () => {
    mockApi()
    render(<CoranLive />)
    await screen.findByText(/Au nom d’Allah/)
    fireEvent.click(screen.getByLabelText('Sourate suivante'))
    expect(await screen.findByText((_, el) => el?.tagName === 'P' && el.textContent === 'b1 ﴿1﴾')).toBeInTheDocument()
    expect(screen.getByText((_, el) => el?.tagName === 'P' && el.textContent === '1. g1')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Masquer le français'))
    expect(screen.queryByText((_, el) => el?.tagName === 'P' && el.textContent === '1. g1')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Sourate précédente')).toBeEnabled()
  })

  it('offers to resume where the listening stopped', async () => {
    mockApi()
    localStorage.setItem(RESUME_KEY, JSON.stringify({ surah: 112, time: 65 }))
    render(<CoranLive />)
    const resume = await screen.findByText(/Reprendre : Al-Ikhlaas à 1:05/)
    fireEvent.click(resume)
    expect(await screen.findByText('Dis: «Il est Allah, Unique.')).toBeInTheDocument()
  })

  it('remembers the surah when the listening is paused', async () => {
    mockApi()
    const { container } = render(<CoranLive />)
    await screen.findByText(/Au nom d’Allah/)
    const audio = container.querySelector('audio')!
    fireEvent.click(screen.getByLabelText('Écouter la récitation'))
    Object.defineProperty(audio, 'currentTime', { configurable: true, value: 42, writable: true })
    act(() => {
      audio.pause()
    })
    expect(JSON.parse(localStorage.getItem(RESUME_KEY)!)).toEqual({ surah: 1, time: 42 })
  })

  it('says so and offers a retry when the text cannot be loaded', async () => {
    global.fetch = jest.fn(async () => ({ ok: false, json: async () => ({}) }) as Response) as unknown as typeof fetch
    render(<CoranLive />)
    expect(await screen.findByRole('alert')).toHaveTextContent(/n'a pas pu être chargé/)
    expect(screen.getByText('Réessayer')).toBeInTheDocument()
  })
})
