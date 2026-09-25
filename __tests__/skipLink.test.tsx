import { render } from '@testing-library/react'
import Accessibility from '@/components/Accessibility'

describe('Accessibility widget', () => {
  it('does not add a second "skip to content" link next to the one in the layout', () => {
    // app/layout.tsx pose déjà <a class="skip-link" href="#main-content">.
    document.body.innerHTML = '<a class="skip-link" href="#main-content">Aller au contenu principal</a>'
    render(<Accessibility />)
    expect(document.querySelectorAll('a[href="#main-content"]')).toHaveLength(1)
  })

  it('still styles the layout skip link in high-contrast mode', () => {
    render(<Accessibility />)
    const css = Array.from(document.head.querySelectorAll('style')).map((s) => s.textContent).join('\n')
    expect(css).toContain('.rme-high-contrast .skip-link')
    expect(css).not.toContain('rme-skip-link')
  })
})
