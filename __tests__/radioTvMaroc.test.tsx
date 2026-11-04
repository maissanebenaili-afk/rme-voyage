import { fireEvent, render, screen } from '@testing-library/react'
import RadioTvMaroc from '@/components/RadioTvMaroc'
import { LAST_RADIO_KEY } from '@/lib/radiosMaroc'

let paused = true
beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, 'paused', { configurable: true, get: () => paused })
})
beforeEach(() => {
  paused = true
  localStorage.clear()
  jest.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
    paused = false
    this.dispatchEvent(new Event('playing'))
    return Promise.resolve()
  })
  jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLMediaElement) {
    paused = true
    this.dispatchEvent(new Event('pause'))
  })
})
afterEach(() => jest.restoreAllMocks())

describe('Radios et télé du Maroc', () => {
  it('plays a station in one tap and stops it with a second tap', () => {
    const { container } = render(<RadioTvMaroc />)
    fireEvent.click(screen.getByLabelText('Écouter Radio Mars'))
    expect(container.querySelector('audio')!.getAttribute('src')).toBe('https://radiomars.ice.infomaniak.ch/radiomars-128.mp3')
    expect(screen.getByLabelText('Arrêter Radio Mars')).toHaveAttribute('aria-pressed', 'true')
    expect(localStorage.getItem(LAST_RADIO_KEY)).toBe('radio-mars')
    fireEvent.click(screen.getByLabelText('Arrêter Radio Mars'))
    expect(screen.getByLabelText('Écouter Radio Mars')).toBeInTheDocument()
  })

  it('offers to resume the last station', () => {
    localStorage.setItem(LAST_RADIO_KEY, 'hit-radio')
    const { container } = render(<RadioTvMaroc />)
    fireEvent.click(screen.getByText('Reprendre Hit Radio'))
    expect(container.querySelector('audio')!.getAttribute('src')).toContain('hitradio-maroc')
  })

  it('says when a station does not answer', async () => {
    jest.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.reject(new Error('blocked')))
    render(<RadioTvMaroc />)
    fireEvent.click(screen.getByLabelText('Écouter Medina FM'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Indisponible pour le moment')
  })

  it('opens the TV channels and SNRT radios on their official sites, in a new tab', () => {
    render(<RadioTvMaroc />)
    const aoula = screen.getByText('Al Aoula').closest('a')!
    expect(aoula).toHaveAttribute('href', 'https://snrtlive.ma/fr/al-aoula')
    expect(aoula).toHaveAttribute('target', '_blank')
    expect(aoula.getAttribute('rel')).toContain('noopener')
    expect(screen.getByText('Radio Mohammed VI du Saint Coran').closest('a')).toHaveAttribute(
      'href',
      'https://snrtlive.ma/fr/idaat-mohammed-assadiss',
    )
  })
})
