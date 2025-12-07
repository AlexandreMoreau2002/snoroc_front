import MediaDetails from '../visitor/MediaDetails'
import { HelmetProvider } from 'react-helmet-async'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'

const mockNavigate = jest.fn()
const mockUseParams = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
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
    mockUseParams.mockReturnValue({ id: '1' })
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

  test('affiche une date par défaut quand la date est absente', async () => {
    getMediaById.mockResolvedValue({
      id: 1,
      title: 'Sans date',
      description: 'Ligne 1\n\nLigne 2',
      createdAt: null,
      url: 'https://youtu.be/abcdefghijk',
    })

    renderPage()
    expect(await screen.findByText('Sans date')).toBeInTheDocument()
    expect(await screen.findByText('Date inconnue')).toBeInTheDocument()
    expect(screen.getAllByText(/Ligne/)).toHaveLength(2)
  })

  test('affiche un paragraphe vide quand la description est absente', async () => {
    getMediaById.mockResolvedValue({
      id: 3,
      title: 'Sans description',
      description: null,
      createdAt: '2024-02-02',
      url: 'https://youtu.be/abcdefghijk',
    })

    const { container } = renderPage()
    expect(await screen.findByText('Sans description')).toBeInTheDocument()

    const paragraphs = container.querySelectorAll('.media-detail__body p')
    expect(paragraphs).toHaveLength(1)
    expect(paragraphs[0].textContent).toBe('')
  })

  test('retour navigation avec historique', async () => {
    getMediaById.mockResolvedValue({
      id: 1,
      title: 'Live',
      description: 'Desc',
      createdAt: '2024-01-01',
      url: 'https://example.com',
    })
    
    // Mock history state with idx > 0 to cover line 40
    Object.defineProperty(window.history, 'state', {
      value: { idx: 1 },
      writable: true,
      configurable: true,
    })

    renderPage()
    const backBtn = await screen.findByText('Retour')
    await user.click(backBtn)
    expect(mockNavigate).toHaveBeenCalledWith(-1)
    
    // Reset history state
    Object.defineProperty(window.history, 'state', {
      value: null,
      writable: true,
      configurable: true,
    })
  })

  test('retour navigation sans historique', async () => {
    getMediaById.mockResolvedValue({
      id: 1,
      title: 'Live',
      description: 'Desc',
      createdAt: '2024-01-01',
      url: 'https://example.com',
    })
    
    // Ensure no history state
    Object.defineProperty(window.history, 'state', {
      value: null,
      writable: true,
      configurable: true,
    })

    renderPage()
    const backBtn = await screen.findByText('Retour')
    await user.click(backBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/media/all')
  })

  test('gère erreur chargement', async () => {
    getMediaById.mockRejectedValue(new Error('fail'))
    renderPage()

    await waitFor(() => expect(screen.getByText('Retour')).toBeInTheDocument())
  })

  test("ne tente pas de charger si pas d'id", async () => {
    mockUseParams.mockReturnValue({})
    renderPage()
    await waitFor(() => expect(getMediaById).not.toHaveBeenCalled())
  })
})
