import { fireEvent, render, screen } from '@testing-library/react'
import LecteurKalimat from '@/components/kalimat/LecteurKalimat'

describe('Lecteur Kalimat', () => {
  beforeEach(() => {
    // jsdom ne dessine pas : le lecteur doit rester utilisable sans canvas.
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  })
  afterEach(() => jest.restoreAllMocks())

  it('choisit un épisode, lance la lecture et montre le texte', () => {
    render(<LecteurKalimat />)
    expect(screen.getByRole('img', { name: /épisode 1 : Salam, Yassine/ })).toBeInTheDocument()
    fireEvent.click(screen.getByText('Atay chez Mima'))
    expect(screen.getByRole('img', { name: /épisode 2 : Atay chez Mima/ })).toBeInTheDocument()
    expect(screen.getByText('Atay chez Mima').closest('button')).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByLabelText('Lecture'))
    expect(screen.getByLabelText('Pause')).toBeInTheDocument()
    expect(screen.getByText(/Qui veut de l’atay/)).toBeInTheDocument()
  })

  it('peut avancer dans l’épisode avec la barre', () => {
    render(<LecteurKalimat />)
    const barre = screen.getByLabelText('Avancer dans l’épisode')
    fireEvent.change(barre, { target: { value: '59.9' } })
    expect(screen.getByLabelText('Revoir l’épisode')).toBeInTheDocument()
  })
})
