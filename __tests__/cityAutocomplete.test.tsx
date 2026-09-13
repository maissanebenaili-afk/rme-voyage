import { render, screen, fireEvent } from '@testing-library/react'
import CityAutocomplete from '@/components/CityAutocomplete'

describe('CityAutocomplete', () => {
  it('never calls fetch/network while typing (local suggestions only)', () => {
    const fetchMock = jest.fn()
    ;(global as unknown as { fetch: typeof fetchMock }).fetch = fetchMock
    const onChange = jest.fn()
    const onSelect = jest.fn()

    render(
      <CityAutocomplete label="Départ" value="" onChange={onChange} onSelect={onSelect} />
    )

    const input = screen.getByLabelText('Départ')
    fireEvent.change(input, { target: { value: 'Tan' } })
    fireEvent.change(input, { target: { value: 'Tang' } })
    fireEvent.change(input, { target: { value: 'Tanger' } })

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('calls onChange with the typed value on every keystroke', () => {
    const onChange = jest.fn()
    render(<CityAutocomplete label="Départ" value="" onChange={onChange} onSelect={jest.fn()} />)

    fireEvent.change(screen.getByLabelText('Départ'), { target: { value: 'Par' } })
    expect(onChange).toHaveBeenCalledWith('Par')
  })

  it('shows local suggestions instantly and selecting one calls onChange before onSelect (order matters)', () => {
    const calls: string[] = []
    const onChange = jest.fn(() => calls.push('onChange'))
    const onSelect = jest.fn(() => calls.push('onSelect'))

    render(<CityAutocomplete label="Départ" value="" onChange={onChange} onSelect={onSelect} />)

    fireEvent.change(screen.getByLabelText('Départ'), { target: { value: 'Tanger' } })
    const option = screen.getByText('Tanger, Maroc')
    fireEvent.click(option)

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: 'Tanger, Maroc' })
    )
    expect(calls.indexOf('onChange')).toBeLessThan(calls.indexOf('onSelect'))
  })

  it('supports ArrowDown/Enter keyboard selection with aria-activedescendant', () => {
    const onSelect = jest.fn()
    render(<CityAutocomplete label="Départ" value="" onChange={jest.fn()} onSelect={onSelect} />)

    const input = screen.getByLabelText('Départ')
    fireEvent.change(input, { target: { value: 'Tanger' } })

    expect(input).not.toHaveAttribute('aria-activedescendant')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input.getAttribute('aria-activedescendant')).toBeTruthy()

    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: 'Tanger, Maroc' })
    )
  })

  it('closes the suggestion list on Escape', () => {
    render(<CityAutocomplete label="Départ" value="" onChange={jest.fn()} onSelect={jest.fn()} />)
    const input = screen.getByLabelText('Départ')
    fireEvent.change(input, { target: { value: 'Tanger' } })
    expect(input).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('mentions local suggestions and free text, with no Nominatim/network reference', () => {
    render(<CityAutocomplete label="Départ" value="" onChange={jest.fn()} onSelect={jest.fn()} />)
    expect(screen.getByText(/Suggestions locales/i)).toBeInTheDocument()
    expect(screen.getByText(/saisie libre/i)).toBeInTheDocument()
    expect(screen.queryByText(/Nominatim/i)).not.toBeInTheDocument()
  })
})
