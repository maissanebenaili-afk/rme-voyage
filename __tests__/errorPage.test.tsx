import { act, fireEvent, render, screen } from '@testing-library/react'
import ErrorPage from '../app/error'

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

  it('retente une seule fois toute seule, puis laisse le bouton', () => {
    const retry = jest.fn()
    const { rerender } = render(<ErrorPage error={new Error('boom')} retry={retry} />)
    act(() => { jest.advanceTimersByTime(700) })
    expect(retry).toHaveBeenCalledTimes(1)
    rerender(<ErrorPage error={new Error('boom')} retry={retry} />)
    act(() => { jest.advanceTimersByTime(5000) })
    expect(retry).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }))
    expect(retry).toHaveBeenCalledTimes(2)
  })
})
