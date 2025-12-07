import AllMedia from '../visitor/AllMedia'
import userEvent from '@testing-library/user-event'
import { HelmetProvider } from 'react-helmet-async'
import { render, screen, waitFor } from '@testing-library/react'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}))

jest.mock('../../repositories/mediaRepository', () => ({
  getAllMedia: jest.fn(),
  deleteMedia: jest.fn(),
}))

const { useAuth } = require('../../context/AuthContext')
const { getAllMedia, deleteMedia } = require('../../repositories/mediaRepository')

const mockMedias = [
  { id: 1, title: 'Media 1', description: 'Desc 1', createdAt: '2023-01-01', url: 'https://youtu.be/abcdefghijk' },
  { id: 2, title: 'Media 2', description: 'Desc 2', createdAt: '2023-02-01', url: 'https://www.youtube.com/watch?v=lmnopqrstuv' },
]

describe('AllMedia Page', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    mockNavigate.mockReset()
    getAllMedia.mockReset()
    deleteMedia.mockReset()
    useAuth.mockReturnValue({ isAdmin: false })
    global.Image = class { constructor() { this.src = '' } }
  })

  const renderPage = () =>
    render(
      <HelmetProvider>
        <AllMedia />
      </HelmetProvider>
    )

  test('affiche les médias et filtre', async () => {
    getAllMedia.mockResolvedValue(mockMedias)
    renderPage()

    expect(await screen.findByText('Media 1')).toBeInTheDocument()
    expect(screen.getByText('Media 2')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText(/Rechercher/i)
    await user.type(searchInput, 'Media 1')
    expect(screen.getByText('Media 1')).toBeInTheDocument()
    expect(screen.queryByText('Media 2')).not.toBeInTheDocument()
  })

  test('gère erreur chargement', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    getAllMedia.mockRejectedValue(new Error('Load fail'))
    renderPage()

    await waitFor(() => expect(consoleSpy).toHaveBeenCalled())
    consoleSpy.mockRestore()
  })

  test('navigation visiteur vers détail', async () => {
    getAllMedia.mockResolvedValue(mockMedias)
    renderPage()

    const article = await screen.findByText('Media 1')
    await user.click(article.closest('article'))
    expect(mockNavigate).toHaveBeenCalledWith('/media/1')
  })

  test('bouton retour', async () => {
    getAllMedia.mockResolvedValue([])
    renderPage()
    const backBtn = screen.getByText('Retour')
    await user.click(backBtn)
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  describe('Mode Admin', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ isAdmin: true })
      getAllMedia.mockResolvedValue(mockMedias)
    })

    test('affiche overlay admin et gère edit', async () => {
      renderPage()
      await screen.findByText('Media 2')

      const editBtns = screen.getAllByTitle('Modifier')
      await user.click(editBtns[0])
      expect(mockNavigate).toHaveBeenCalledWith('/admin/media/edit/2')
    })

    test('gère view depuis overlay', async () => {
      renderPage()
      await screen.findByText('Media 2')

      const viewBtns = screen.getAllByTitle('Voir')
      await user.click(viewBtns[0])
      expect(mockNavigate).toHaveBeenCalledWith('/media/2')
    })

    test('gère suppression (succès)', async () => {
      renderPage()
      await screen.findByText('Media 2')

      const deleteBtns = screen.getAllByTitle('Supprimer')
      await user.click(deleteBtns[0])

      expect(screen.getByText('Voulez-vous supprimer ce contenu ?')).toBeInTheDocument()

      deleteMedia.mockResolvedValue({})
      await user.click(screen.getByText('Oui'))

      expect(deleteMedia).toHaveBeenCalledWith(2)
    })

    test('gère erreur suppression', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      renderPage()
      await screen.findByText('Media 1')
      await user.click(screen.getAllByTitle('Supprimer')[0])

      deleteMedia.mockRejectedValue(new Error('Delete fail'))
      await user.click(screen.getByText('Oui'))

      await waitFor(() => expect(consoleSpy).toHaveBeenCalled())
      consoleSpy.mockRestore()
    })

    test('annuler suppression ferme la modal (couvre cancelDelete)', async () => {
      renderPage()
      await screen.findByText('Media 2')

      const deleteBtns = screen.getAllByTitle('Supprimer')
      await user.click(deleteBtns[0])

      expect(screen.getByText('Voulez-vous supprimer ce contenu ?')).toBeInTheDocument()
      
      await user.click(screen.getByText('Non'))
      
      await waitFor(() => {
        expect(screen.queryByText('Voulez-vous supprimer ce contenu ?')).not.toBeInTheDocument()
      })
    })
  })

  test('préchargement thumbnails avec URLs invalides', async () => {
    const mediasWithInvalidUrl = [
      { id: 1, title: 'Media 1', description: 'Desc 1', createdAt: '2023-01-01', url: 'https://youtu.be/abcdefghijk' },
      { id: 2, title: 'Media 2', description: 'Desc 2', createdAt: '2023-02-01', url: 'invalid-url' },
      { id: 3, title: 'Media 3', description: 'Desc 3', createdAt: '2023-03-01', url: '' },
      { id: 4, title: 'Media 4', description: 'Desc 4', createdAt: '2023-04-01', url: 'https://youtu.be/lmnopqrstuv' },
      { id: 5, title: 'Media 5', description: 'Desc 5', createdAt: '2023-05-01', url: 'https://youtu.be/xyz123abc45' },
      { id: 6, title: 'Media 6', description: 'Desc 6', createdAt: '2023-06-01', url: 'not-a-youtube-url' },
      { id: 7, title: 'Media 7', description: 'Desc 7', createdAt: '2023-07-01', url: 'https://youtu.be/def456ghi78' },
      { id: 8, title: 'Media 8', description: 'Desc 8', createdAt: '2023-08-01', url: 'https://youtu.be/validid12345' },
      { id: 9, title: 'Ancien invalide', description: 'Desc 9', createdAt: '2022-01-01', url: 'invalid-old-url' },
    ]
    getAllMedia.mockResolvedValue(mediasWithInvalidUrl)
    useAuth.mockReturnValue({ isAdmin: false })
    
    const mockImageInstances = []
    global.Image = class {
      constructor() {
        this.src = ''
        mockImageInstances.push(this)
      }
    }

    renderPage()
    await screen.findByText('Media 7')
    
    // Trigger pagination to cover preloading (lines 88-94)
    const page2Button = screen.getByText('2')
    await user.click(page2Button)
    
    // Should handle invalid URLs gracefully (line 90 - if(mediaId) check)
    expect(screen.getByText('Media 1')).toBeInTheDocument()
  })

  test('gère les médias sans date et affiche un état vide quand aucune correspondance', async () => {
    const mediasWithoutDates = [
      { id: 1, title: 'Sans date', description: 'Desc', createdAt: null, url: 'https://youtu.be/abcdefghijk' },
      { id: 2, title: 'Encore sans date', description: 'Desc', createdAt: undefined, url: 'invalid-url' },
      { id: 3, title: 'Avec date', description: 'Desc', createdAt: '2023-08-01', url: 'https://youtu.be/xyz123abc45' },
    ]
    getAllMedia.mockResolvedValue(mediasWithoutDates)
    useAuth.mockReturnValue({ isAdmin: false })

    renderPage()

    expect(await screen.findByText('Avec date')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText(/Rechercher/i)
    await user.type(searchInput, 'Nope')

    expect(screen.getByText('Aucun média trouvé.')).toBeInTheDocument()
  })
})
