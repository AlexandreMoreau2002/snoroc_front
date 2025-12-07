import MediaDetails from '../visitor/MediaDetails'
import { HelmetProvider } from 'react-helmet-async'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' }),
}))

jest.mock('../../repositories/mediaRepository', () => ({
  getMediaById: jest.fn(),
}))

const { getMediaById } = require('../../repositories/mediaRepository')

describe('MediaDetails', () => {
  let user
  beforeEach(() => {
    user = userEvent.setup()
    mockNavigate.mockReset()
  })

  const renderPage = () =>
    render(
      <HelmetProvider>
        <MediaDetails />
      </HelmetProvider>
    )

  test('affiche le média et l’embed', async () => {
    getMediaById.mockResolvedValue({
      id: 1,
      title: 'Live',
      description: 'Desc',
      createdAt: '2024-01-01',
      url: 'https://youtu.be/abcdefghijk',
    })

    renderPage()
    expect(await screen.findByText('Live')).toBeInTheDocument()
    expect(screen.getByTitle('Live')).toBeInTheDocument()
  })

  test('fallback iframe si url invalide', async () => {
    getMediaById.mockResolvedValue({
      id: 1,
      title: 'Live',
      description: 'Desc',
      createdAt: '2024-01-01',
      url: 'https://example.com',
    })

    renderPage()
    expect(await screen.findByText('Vidéo indisponible.')).toBeInTheDocument()
  })

  test('retour navigation', async () => {
    getMediaById.mockResolvedValue({
      id: 1,
      title: 'Live',
      description: 'Desc',
      createdAt: '2024-01-01',
      url: 'https://example.com',
    })

    renderPage()
    const backBtn = await screen.findByText('Retour')
    await user.click(backBtn)
    expect(mockNavigate).toHaveBeenCalled()
  })

  test('gère erreur chargement', async () => {
    getMediaById.mockRejectedValue(new Error('fail'))
    renderPage()

    await waitFor(() => expect(screen.getByText('Retour')).toBeInTheDocument())
  })
})
