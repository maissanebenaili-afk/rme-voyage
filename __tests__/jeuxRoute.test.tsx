import { act, fireEvent, render, screen } from '@testing-library/react'
import JeuxRoute from '@/components/jeux/JeuxRoute'
import Memoire from '@/components/jeux/Memoire'
import Zellige from '@/components/jeux/Zellige'
import Rouleau from '@/components/jeux/Rouleau'
import { nouvellePartie } from '@/lib/jeux/memoire'

describe('Jeux pour la route', () => {
  it('offers three games and goes back to the list', () => {
    render(<JeuxRoute />)
    expect(screen.getByText('Mémoire des souks')).toBeInTheDocument()
    expect(screen.getByText('Skate à la corniche')).toBeInTheDocument()
    expect(screen.getByText('Déroule !')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Zellige'))
    expect(screen.getByLabelText('Tourner')).toBeInTheDocument()
    fireEvent.click(screen.getByText('← Autres jeux'))
    expect(screen.getByText('Mémoire des souks')).toBeInTheDocument()
  })

  it('memory: a wrong pair flips back after a moment, a right pair stays', () => {
    jest.useFakeTimers()
    try {
      jest.spyOn(Math, 'random').mockReturnValue(0.5)
      // Même tirage que le composant (Math.random figé) : on connaît la disposition.
      const { cartes } = nouvellePartie(4, () => 0.5)
      const autre = cartes.findIndex((c) => c.symbole !== cartes[0].symbole)
      const jumelle = cartes.findIndex((c, i) => i > 0 && c.symbole === cartes[0].symbole)
      render(<Memoire />)
      const boutons = () => screen.getAllByRole('button').filter((b) => /^Carte|^\p{Extended_Pictographic}/u.test(b.getAttribute('aria-label') ?? ''))

      fireEvent.click(boutons()[0])
      fireEvent.click(boutons()[autre])
      expect(boutons()[autre]).toHaveAttribute('aria-label', cartes[autre].symbole)
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(boutons()[0]).toHaveAttribute('aria-label', 'Carte 1, cachée')

      fireEvent.click(boutons()[0])
      fireEvent.click(boutons()[jumelle])
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(boutons()[0]).toHaveAttribute('aria-label', cartes[0].symbole)
      expect(screen.getByText('2 coups')).toBeInTheDocument()
    } finally {
      jest.useRealTimers()
      jest.restoreAllMocks()
    }
  })

  it('rouleau: a swipe down unrolls paper and starts the 10-second clock', () => {
    // jsdom n'a pas PointerEvent : on prend MouseEvent, qui porte clientY et buttons.
    const avant = window.PointerEvent
    window.PointerEvent = class extends MouseEvent {} as unknown as typeof PointerEvent
    jest.useFakeTimers()
    try {
      render(<Rouleau />)
      const zone = screen.getByLabelText('Glissez vers le bas pour dérouler le papier')
      fireEvent.pointerDown(zone, { clientY: 100 })
      fireEvent.pointerMove(zone, { clientY: 500, buttons: 1 })
      expect(screen.getByText('1.06 m')).toBeInTheDocument() // 6 cm + 400 px × 0,25 cm
      act(() => {
        jest.advanceTimersByTime(11_000)
      })
      expect(screen.getByRole('status')).toHaveTextContent('khoya')
      expect(screen.getByText('Encore un rouleau')).toBeInTheDocument()
    } finally {
      jest.useRealTimers()
      window.PointerEvent = avant
    }
  })

  it('zellige: the piece falls by itself and the board can pause', () => {
    jest.useFakeTimers()
    try {
      render(<Zellige />)
      expect(screen.getByText('Score : 0')).toBeInTheDocument()
      fireEvent.click(screen.getByText('Pause'))
      expect(screen.getAllByText('Pause').length).toBeGreaterThan(0)
      fireEvent.click(screen.getAllByText('Reprendre')[0])
      const plateau = screen.getByRole('img', { name: 'Plateau de jeu' })
      const carreauxColores = () => plateau.querySelectorAll('[style*="background-color"]').length
      // au départ, seule la pièce en cours est colorée (3 ou 4 carreaux)
      expect([3, 4]).toContain(carreauxColores())
      act(() => {
        jest.advanceTimersByTime(700 * 30)
      })
      // après 30 pas, au moins une pièce s'est posée au fond : plus de carreaux colorés
      expect(carreauxColores()).toBeGreaterThan(4)
    } finally {
      jest.useRealTimers()
    }
  })
})
