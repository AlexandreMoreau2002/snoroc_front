import MediaVideoEmbed from '../MediaVideoEmbed'
import { render, screen } from '@testing-library/react'

describe('MediaVideoEmbed', () => {
  it('renders an iframe when the URL contains a valid YouTube ID', () => {
    render(<MediaVideoEmbed url="https://youtu.be/abcdefghijk" title="Concert" />)

    const iframe = screen.getByTitle('Concert')
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/abcdefghijk')
    expect(screen.getByLabelText('Vidéo Concert')).toBeInTheDocument()
  })

  it('shows the fallback text when the URL is invalid', () => {
    render(<MediaVideoEmbed url="https://example.com/video" title="Live" />)

    expect(screen.getByText('Vidéo indisponible.')).toBeInTheDocument()
  })

  it('uses the default iframe title when none is provided', () => {
    render(<MediaVideoEmbed url="https://youtu.be/abcdefghijk" />)

    expect(screen.getByTitle('Vidéo média')).toBeInTheDocument()
  })
})
