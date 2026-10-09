import { act, fireEvent, render, screen } from '@testing-library/react'
import ErrorPage from '../app/error'

// Le garde « une seule relance » vit au niveau du module (voir app/error.tsx) :
// il n'est consommé que lorsqu'une relance part vraiment. Le premier test ne
// laisse donc pas partir le délai ; le second le consomme, une seule fois.
describe("page d'erreur", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })
  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('affiche un message français et un bouton, jamais le message brut de Next', () => {
    render(<ErrorPage error={new Error('boom')} retry={jest.fn()} />)
    expect(screen.getByRole('alert').textContent).toMatch(/réessayez/i)
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/couldn't load/i)
  })

  it('retente une seule fois toute seule, même si la page replante et que le composant est recréé', () => {
    const retry = jest.fn()
    const first = render(<ErrorPage error={new Error('boom')} retry={retry} />)
    act(() => { jest.advanceTimersByTime(700) })
    expect(retry).toHaveBeenCalledTimes(1)

    // La page replante : l'erreur est de nouveau affichée par un composant neuf.
    first.unmount()
    render(<ErrorPage error={new Error('boom')} retry={retry} />)
    act(() => { jest.advanceTimersByTime(5000) })
    expect(retry).toHaveBeenCalledTimes(1)

    // Le bouton, lui, reste toujours disponible.
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }))
    expect(retry).toHaveBeenCalledTimes(2)
  })
})
