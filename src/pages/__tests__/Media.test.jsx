import Media from '../visitor/Media'
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
}))

const { useAuth } = require('../../context/AuthContext')
const { getAllMedia } = require('../../repositories/mediaRepository')

describe('Media main page', () => {
  let user
  beforeEach(() => {
    user = userEvent.setup()
    mockNavigate.mockReset()
    useAuth.mockReturnValue({ isAdmin: false })
  })

  const renderPage = () =>
    render(
      <HelmetProvider>
        <Media />
      </HelmetProvider>
    )

  test('affiche les médias avec pagination et navigation', async () => {
    getAllMedia.mockResolvedValue([
      { id: 1, title: 'M1', description: 'desc', createdAt: '2023-01-01', url: 'https://youtu.be/abcdefghijk' },
      { id: 2, title: 'M2', description: 'desc', createdAt: '2023-01-02', url: 'https://youtu.be/lmnopqrstuv' },
      { id: 3, title: 'M3', description: 'desc', createdAt: '2023-01-03', url: 'https://youtu.be/abcdefg1234' },
      { id: 4, title: 'M4', description: 'desc', createdAt: '2023-01-04', url: 'https://youtu.be/hijklmn5678' },
    ])

    renderPage()
    expect(await screen.findByText('M4')).toBeInTheDocument()
    await user.click(screen.getByText('Tout voir'))
    expect(mockNavigate).toHaveBeenCalledWith('/media/all')
  })

  test('bouton admin disponible', async () => {
    useAuth.mockReturnValue({ isAdmin: true })
    getAllMedia.mockResolvedValue([])
    renderPage()

    await waitFor(() => expect(screen.getByText('Ajouter')).toBeInTheDocument())
    await user.click(screen.getByText('Ajouter'))
    expect(mockNavigate).toHaveBeenCalledWith('/createMedia')
  })

  test('gère erreur chargement', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    getAllMedia.mockRejectedValue(new Error('fail'))
    renderPage()

    await waitFor(() => expect(consoleSpy).toHaveBeenCalled())
    consoleSpy.mockRestore()
  })
})
