import { render, screen, within } from '@testing-library/react'
import KitRetour from '@/components/KitRetour'

// Hadak ouvre /kit-retour?transport=…&vehicule=autre : les réponses de la
// phrase sont déjà cochées.
describe('KitRetour opened from Hadak', () => {
  afterEach(() => window.history.replaceState(null, '', '/'))

  it('starts from the answers in the link', () => {
    window.history.replaceState(null, '', '/kit-retour?transport=avion&mineur=oui')
    render(<KitRetour />)
    expect(screen.getByRole('radio', { name: 'En avion' })).toBeChecked()
    const minor = screen.getByRole('group', { name: /sans aucun de ses parents/ })
    expect(within(minor).getByRole('radio', { name: 'Oui' })).toBeChecked()
    expect(screen.queryByText(/Carte d'admission temporaire/)).not.toBeInTheDocument()
  })

  it('asks for the owner proxy when the car belongs to someone else', () => {
    window.history.replaceState(null, '', '/kit-retour?transport=voiture&vehicule=autre')
    render(<KitRetour />)
    expect(screen.getByText(/Procuration du propriétaire/)).toBeInTheDocument()
  })

  it('keeps the usual defaults without a link', () => {
    render(<KitRetour />)
    expect(screen.getByRole('radio', { name: 'En voiture (ferry)' })).toBeChecked()
    expect(screen.queryByText(/Procuration du propriétaire/)).not.toBeInTheDocument()
  })
})
