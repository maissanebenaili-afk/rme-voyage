import { render, screen } from '@testing-library/react'
import DessinsAnimesPage from '../app/dessins-animes/page'
import FeuilletonsPage from '../app/feuilletons/page'
import { CHAINE_YOUTUBE } from '../lib/chaineYoutube'

jest.mock('../components/kalimat/LecteurKalimat', () => ({ __esModule: true, default: () => null }))
jest.mock('../components/feuilletons/LecteurFeuilletons', () => ({ __esModule: true, default: () => null }))

describe('lien vers la chaîne YouTube', () => {
  it('pointe vers une chaîne en https sur youtube.com', () => {
    const u = new URL(CHAINE_YOUTUBE)
    expect(u.protocol).toBe('https:')
    expect(u.hostname).toBe('www.youtube.com')
  })
  it.each([['dessins animés', DessinsAnimesPage], ['feuilletons', FeuilletonsPage]])('est affiché et sûr sur la page %s', (_nom, Page) => {
    render(<Page />)
    const lien = screen.getByRole('link', { name: /YouTube/ })
    expect(lien).toHaveAttribute('href', CHAINE_YOUTUBE)
    expect(lien).toHaveAttribute('target', '_blank')
    expect(lien.getAttribute('rel')).toContain('noopener')
  })
})
