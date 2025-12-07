import Media from '../visitor/Media'
import userEvent from '@testing-library/user-event'
import { HelmetProvider } from 'react-helmet-async'
import { act, render, screen, waitFor } from '@testing-library/react'

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
    const mockMedias = [
      { id: 1, title: 'M1', description: 'desc1', createdAt: '2023-01-01', url: 'https://youtu.be/abcdefghijk' },
      { id: 2, title: 'M2', description: 'desc2', createdAt: '2023-01-02', url: 'https://youtu.be/lmnopqrstuv' },
      { id: 3, title: 'M3', description: 'desc3', createdAt: '2023-01-03', url: 'https://youtu.be/abcdefg1234' },
      { id: 4, title: 'M4', description: 'desc4', createdAt: '2023-01-04', url: 'https://youtu.be/hijklmn5678' },
      { id: 5, title: 'M5', description: 'desc5', createdAt: '2023-01-05', url: 'https://youtu.be/xyz123abc45' },
      { id: 6, title: 'M6', description: 'desc6', createdAt: '2023-01-06', url: 'https://youtu.be/def456ghi78' },
      { id: 7, title: 'M7', description: 'desc7', createdAt: '2023-01-07', url: 'https://youtu.be/jkl789mno01' },
    ]
    getAllMedia.mockResolvedValue(mockMedias)
    global.Image = class { constructor() { this.src = '' } }

    renderPage()
    
    // mainItem is displayed (M7 is the most recent after reverse)
    expect(await screen.findByText('M7')).toBeInTheDocument()
    
    // Click on mainItem triggers navigation (covers line 85)
    const mainMedia = screen.getByRole('button', { name: /M7/i })
    await user.click(mainMedia)
    expect(mockNavigate).toHaveBeenCalledWith('/media/7')
    
    mockNavigate.mockClear()
    
    // Click on article in the list (covers line 109)
    const mediaArticle = screen.getByRole('button', { name: /M6/ })
    await user.click(mediaArticle)
    expect(mockNavigate).toHaveBeenCalledWith('/media/6')
    
    mockNavigate.mockClear()
    
    // Navigate to "Tout voir"
    await user.click(screen.getByText('Tout voir'))
    expect(mockNavigate).toHaveBeenCalledWith('/media/all')
  })

  test('pagination déclenche le préchargement des thumbnails', async () => {
    const mockMedias = [
      { id: 1, title: 'M1', description: 'desc1', createdAt: '2023-01-01', url: 'https://youtu.be/abcdefghijk' },
      { id: 2, title: 'M2', description: 'desc2', createdAt: '2023-01-02', url: 'https://youtu.be/lmnopqrstuv' },
      { id: 3, title: 'M3', description: 'desc3', createdAt: '2023-01-03', url: 'https://youtu.be/abcdefg1234' },
      { id: 4, title: 'M4', description: 'desc4', createdAt: '2023-01-04', url: 'https://youtu.be/hijklmn5678' },
      { id: 5, title: 'M5', description: 'desc5', createdAt: '2023-01-05', url: 'https://youtu.be/xyz123abc45' },
      { id: 6, title: 'M6', description: 'desc6', createdAt: '2023-01-06', url: 'https://youtu.be/def456ghi78' },
      { id: 7, title: 'M7', description: 'desc7', createdAt: '2023-01-07', url: 'https://youtu.be/jkl789mno01' },
      { id: 8, title: 'M8', description: 'desc8', createdAt: '2023-01-08', url: 'https://youtu.be/pqr234stu56' },
    ]
    getAllMedia.mockResolvedValue(mockMedias)
    
    const mockImageInstances = []
    global.Image = class {
      constructor() {
        this.src = ''
        mockImageInstances.push(this)
      }
    }

    renderPage()
    
    await screen.findByText('M8')
    
    // Click page 2 to trigger thumbnail preloading (covers lines 65-68)
    const page2Button = screen.getByText('2')
    await user.click(page2Button)
    
    // Verify that Image instances were created for preloading
    expect(mockImageInstances.length).toBeGreaterThan(0)
  })

  test('gère les URLs YouTube invalides', async () => {
    const mockMedias = [
      { id: 1, title: 'M1', description: 'desc1', createdAt: '2023-01-01', url: 'https://invalid-url.com/notvideo' },
      { id: 2, title: 'M2', description: 'desc2', createdAt: '2023-01-02', url: 'https://youtu.be/validId1234' },
      { id: 3, title: 'M3', description: 'desc3', createdAt: '2023-01-03', url: '' },
      { id: 4, title: 'M4', description: 'desc4', createdAt: '2023-01-04', url: 'https://youtu.be/validId5678' },
      { id: 5, title: 'M5', description: 'desc5', createdAt: '2023-01-05', url: 'not-a-valid-url' },
    ]
    getAllMedia.mockResolvedValue(mockMedias)
    global.Image = class { constructor() { this.src = '' } }

    renderPage()
    
    // Should still render even with invalid URLs (covers line 16 - getThumbnail returns '')
    expect(await screen.findByText('M5')).toBeInTheDocument()
  })

  test('bouton admin disponible', async () => {
    useAuth.mockReturnValue({ isAdmin: true })
    getAllMedia.mockResolvedValue([])
    renderPage()

    await waitFor(() => expect(getAllMedia).toHaveBeenCalled())
    await act(async () => {})

    const adminButton = screen.getByText('Ajouter')
    await user.click(adminButton)
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
