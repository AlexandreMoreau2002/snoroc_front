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
      expect(mockNavigate).toHaveBeenCalledWith('/admin/media/edit/1')
    })

    test('gère view depuis overlay', async () => {
      renderPage()
      await screen.findByText('Media 2')

      const viewBtns = screen.getAllByTitle('Voir')
      await user.click(viewBtns[0])
      expect(mockNavigate).toHaveBeenCalledWith('/media/1')
    })

    test('gère suppression (succès)', async () => {
      renderPage()
      await screen.findByText('Media 2')

      const deleteBtns = screen.getAllByTitle('Supprimer')
      await user.click(deleteBtns[0])

      expect(screen.getByText('Voulez-vous supprimer ce contenu ?')).toBeInTheDocument()

      deleteMedia.mockResolvedValue({})
      await user.click(screen.getByText('Oui'))

      expect(deleteMedia).toHaveBeenCalledWith(1)
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
  })
})
