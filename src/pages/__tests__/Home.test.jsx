import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HelmetProvider } from 'react-helmet-async'

import Home from '../visitor/Home'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}))

jest.mock('../../repositories/newsRepository', () => ({
  getAllNews: jest.fn(),
}))

jest.mock('../../components/Pagination/Pagination', () => (props) => (
  <div data-testid="pagination">
    <button aria-label="Prev" onClick={() => props.onPageChange(props.currentPage - 1)}>
      Prev
    </button>
    <button aria-label="Next" onClick={() => props.onPageChange(props.currentPage + 1)}>
      Next
    </button>
    <span>{`page-${props.currentPage}`}</span>
  </div>
))

const { useAuth } = require('../../context/AuthContext')
const { getAllNews } = require('../../repositories/newsRepository')

const baseNews = [
  { id: 1, title: 'One', content: 'older', createdAt: '2022-01-01', thumbnail: 'thumb1.jpg' },
  { id: 2, title: 'Two', content: 'older-two', createdAt: '2022-02-01', thumbnail: 'thumb2.jpg' },
  { id: 3, title: 'Three', content: 'older-three', createdAt: '2022-03-01', thumbnail: 'thumb3.jpg' },
  { id: 4, title: 'Four', content: 'older-four', createdAt: '2022-04-01', thumbnail: 'thumb4.jpg' },
  { id: 5, title: 'Five', content: 'newest', createdAt: '2022-05-01', thumbnail: 'thumb5.jpg' },
]

const renderHome = async ({ isAdmin = false, news = baseNews, preloadSpy } = {}) => {
  useAuth.mockReturnValue({ isAdmin })
  getAllNews.mockResolvedValue(news)

  const OriginalImage = global.Image
  if (preloadSpy) {
    global.Image = class {
      set src(value) {
        preloadSpy(value)
      }
    }
  }

  const view = render(
    <HelmetProvider>
      <Home />
    </HelmetProvider>
  )

  await waitFor(() => expect(getAllNews).toHaveBeenCalled())

  return { ...view, OriginalImage }
}

describe('Home page', () => {
  let user

  beforeEach(() => {
    user = typeof userEvent.setup === 'function' ? userEvent.setup() : userEvent
    mockNavigate.mockReset()
    getAllNews.mockReset()
  })

  it('renders news, paginates, preloads images, and handles admin navigation', async () => {
    const preloadSpy = jest.fn()
    const { container, OriginalImage } = await renderHome({ isAdmin: true, preloadSpy })

    expect(await screen.findByText('Five')).toBeInTheDocument()
    await waitFor(() => expect(container.querySelectorAll('.news-item')).toHaveLength(3))
    await waitFor(() => expect(preloadSpy).toHaveBeenCalledWith('thumb1.jpg'))

    await user.click(screen.getByText('Five'))
    expect(mockNavigate).toHaveBeenCalledWith('/actus/5')

    await user.click(screen.getByLabelText('Next'))
    expect(screen.getByText('page-2')).toBeInTheDocument()
    expect(container.querySelector('.news-list')?.className).toContain('slide-right')

    await user.click(screen.getByLabelText('Prev'))
    expect(container.querySelector('.news-list')?.className).toContain('slide-left')

    await user.click(screen.getByRole('button', { name: 'Tout voir' }))
    expect(mockNavigate).toHaveBeenCalledWith('/actus/all')

    await user.click(screen.getByRole('button', { name: 'Ajouter' }))
    expect(mockNavigate).toHaveBeenCalledWith('/createNews')

    if (preloadSpy) {
      global.Image = OriginalImage
    }
  })

  it('formats invalid dates as empty strings when only one news exists', async () => {
    const { container } = await renderHome({
      news: [{ id: 99, title: 'Only', content: 'single', createdAt: 'invalid-date', thumbnail: 'one.jpg' }],
    })

    expect(await screen.findByText('Only')).toBeInTheDocument()
    const dateElement = container.querySelector('.main-actus-date')
    expect(dateElement?.textContent).toBe('')
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
  })

  it('clears state when no news are returned', async () => {
    await renderHome({ news: [] })

    expect(getAllNews).toHaveBeenCalled()
    expect(screen.queryAllByRole('article')).toHaveLength(0)
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tout voir' })).toBeInTheDocument()
  })

  it('handles fetch errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    getAllNews.mockRejectedValueOnce(new Error('fail'))
    useAuth.mockReturnValue({ isAdmin: false })

    render(
      <HelmetProvider>
        <Home />
      </HelmetProvider>
    )

    await waitFor(() => expect(getAllNews).toHaveBeenCalled())
    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith('Erreur lors de la récupération des actualités :', expect.any(Error))
    )
    expect(screen.queryAllByRole('article')).toHaveLength(0)

    consoleSpy.mockRestore()
  })

  it('navigates to news details when clicking on a news item in the list', async () => {
    await renderHome()
    
    // Click on a news item in the list (e.g., "One" which is in the list, not the main actu)
    // Note: "Five" is the main actu (newest), so "Four", "Three", "Two" are in the first page list
    // Let's click on "Four"
    await user.click(await screen.findByText('Four'))
    
    expect(mockNavigate).toHaveBeenCalledWith('/actus/4')
  })

  it('does not change page when clicking Prev on first page or Next on last page', async () => {
    const { container } = await renderHome({ isAdmin: true })
    
    // On page 1, click Prev (should do nothing)
    await user.click(await screen.findByLabelText('Prev'))
    expect(screen.getByText('page-1')).toBeInTheDocument()
    
    // Navigate to last page (Page 2)
    await user.click(screen.getByLabelText('Next'))
    expect(screen.getByText('page-2')).toBeInTheDocument()
    
    // On last page, click Next (should do nothing)
    await user.click(screen.getByLabelText('Next'))
    expect(screen.getByText('page-2')).toBeInTheDocument()
  })

  it('handles news items without thumbnails', async () => {
    const newsWithoutThumb = [
      { id: 1, title: 'Oldest-NoThumb', content: 'content', createdAt: '2022-01-01', thumbnail: null }, // This will be at the end of reversed list (index 4)
      { id: 2, title: 'Page1-3', content: 'content', createdAt: '2022-01-02', thumbnail: 'p1-3.jpg' },
      { id: 3, title: 'Page1-2', content: 'content', createdAt: '2022-01-03', thumbnail: 'p1-2.jpg' },
      { id: 4, title: 'Page1-1', content: 'content', createdAt: '2022-01-04', thumbnail: 'p1-1.jpg' },
      { id: 5, title: 'Newest-1', content: 'content', createdAt: '2022-01-05', thumbnail: 'n1.jpg' },
      { id: 6, title: 'Main', content: 'content', createdAt: '2022-01-06', thumbnail: 'main.jpg' }
    ]
    
    await renderHome({ news: newsWithoutThumb })
    
    expect(await screen.findByText('Main')).toBeInTheDocument()
    // The useEffect should run and try to preload Page2 items
    // We just ensure no error is thrown
  })
})
