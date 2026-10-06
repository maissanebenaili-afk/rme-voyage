import { render, screen } from '@testing-library/react'
import NewsFeed from '@/components/NewsFeed'

// 2026-10-06 : des conseils permanents s'affichaient comme des actualités
// datées (« Période de pointe estivale · 2026-06-01 » vu en octobre).
describe('NewsFeed', () => {
  it('shows evergreen advice without invented publication dates', () => {
    render(<NewsFeed />)
    expect(screen.getByRole('heading', { name: /Bons réflexes voyage/ })).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/20\d\d-\d\d-\d\d/)
    expect(document.body.textContent).toMatch(/Période de pointe estivale/)
  })
})
