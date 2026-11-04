import { fireEvent, render, screen } from '@testing-library/react'
import LecteurKalimat from '@/components/kalimat/LecteurKalimat'

describe('Lecteur Kalimat', () => {
  beforeEach(() => {
    // jsdom ne dessine pas et n’a pas de son : le lecteur doit rester utilisable.
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

  it('passe en version espagnole', () => {
    render(<LecteurKalimat />)
    fireEvent.click(screen.getByText('Español'))
    expect(screen.getByText('Español')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('img', { name: /¡Salam, Yassine!/ })).toBeInTheDocument()
    expect(screen.getByText(/el mar brilla/)).toBeInTheDocument()
  })

  it('propose l’épisode suivant à la fin', async () => {
    render(<LecteurKalimat />)
    fireEvent.change(screen.getByLabelText('Avancer dans l’épisode'), { target: { value: '1000' } })
    expect(await screen.findByLabelText('Revoir l’épisode')).toBeInTheDocument()
    fireEvent.click(screen.getByText(/Épisode suivant : Atay chez Mima/))
    expect(screen.getByRole('img', { name: /épisode 2/ })).toBeInTheDocument()
  })

  it('peut couper le son et afficher les sous-titres', async () => {
    render(<LecteurKalimat />)
    expect(await screen.findByLabelText('Lecture')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Sous-titres'))
    expect(screen.getByLabelText('Sous-titres')).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByLabelText('Couper le son'))
    expect(screen.getByLabelText('Mettre le son')).toHaveAttribute('aria-pressed', 'false')
  })
})
