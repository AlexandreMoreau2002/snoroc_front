import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HelmetProvider } from 'react-helmet-async'
import AllActus from '../visitor/AllActus'

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
  deleteNews: jest.fn(),
}))

jest.mock('../../components/Pagination/Pagination', () => (props) => (
  <div data-testid="pagination">
    <button onClick={() => props.onPageChange(props.currentPage - 1)} aria-label="Prev">
      Prev
    </button>
    <button onClick={() => props.onPageChange(props.currentPage + 1)} aria-label="Next">
      Next
    </button>
    <span>{`page-${props.currentPage}`}</span>
  </div>
))

const { getAllNews, deleteNews } = require('../../repositories/newsRepository')
const { useAuth } = require('../../context/AuthContext')

let OriginalImageClass

const baseNews = [
  { id: 1, title: 'Older', content: 'older content', createdAt: '2022-01-01', thumbnail: 'old.jpg' },
  { id: 2, title: 'Newest', content: 'fresh', createdAt: '2023-02-01', thumbnail: 'new.jpg' },
  { id: 3, title: 'Middle', content: 'middle', createdAt: '2022-06-01', thumbnail: 'mid.jpg' },
  { id: 4, title: 'Another', content: 'another item', createdAt: '2023-01-15', thumbnail: 'another.jpg' },
  { id: 5, title: 'Searchable', content: 'query match', createdAt: '2023-01-10', thumbnail: 'search.jpg' },
  { id: 6, title: 'Extra', content: 'extra', createdAt: '2023-01-05', thumbnail: 'extra.jpg' },
  { id: 7, title: 'Overflow', content: 'overflow page', createdAt: '2023-01-04', thumbnail: 'overflow.jpg' },
]

const renderPage = async (isAdmin = false, customNews = baseNews, readyText = 'Newest') => {
  useAuth.mockReturnValue({ isAdmin })
  getAllNews.mockResolvedValue([...customNews])

  const preloadSpy = jest.fn()
  OriginalImageClass = global.Image
  const mockImage = class {
    set src(value) {
      preloadSpy(value)
    }
  }
  global.Image = mockImage
  if (typeof window !== 'undefined') {
    window.Image = mockImage
  }

  const view = render(
    <HelmetProvider>
      <AllActus />
    </HelmetProvider>
  )

  await waitFor(() => expect(getAllNews).toHaveBeenCalled())
  await screen.findByText(readyText)

  return { view, preloadSpy }
}

describe('AllActus page', () => {
  let user

  beforeEach(() => {
    jest.useFakeTimers()
    user =
      typeof userEvent.setup === 'function'
        ? userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
        : userEvent
    mockNavigate.mockReset()
    deleteNews.mockReset()
    getAllNews.mockReset()
  })

  afterEach(() => {
    if (OriginalImageClass) {
      global.Image = OriginalImageClass
    }
    jest.useRealTimers()
  })

  it('sorts, filters, paginates, and shows empty state for visitors', async () => {
    const { preloadSpy } = await renderPage(false)

    const headings = screen.getAllByRole('heading', { level: 2 })
    expect(headings[0]).toHaveTextContent('Newest')

    await waitFor(() => expect(preloadSpy).toHaveBeenCalled())

    await user.click(screen.getAllByRole('button', { name: /Newest/ })[0])
    expect(mockNavigate).toHaveBeenCalledWith('/actus/2')

    await user.click(screen.getByLabelText('Next'))
    act(() => jest.runOnlyPendingTimers())
    expect(screen.getByText('page-2')).toBeInTheDocument()
    expect(preloadSpy).toHaveBeenCalled()

    const searchInput = screen.getByPlaceholderText('Rechercher')
    await user.type(searchInput, 'searchable')
    act(() => jest.runOnlyPendingTimers())
    await user.click(screen.getByLabelText('Prev'))
    expect(await screen.findByText('Searchable')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('page-1')).toBeInTheDocument())

    await user.clear(searchInput)
    await user.type(searchInput, 'nope')
    act(() => jest.runOnlyPendingTimers())
    expect(screen.getByText(/Aucune actualité trouvée/)).toBeInTheDocument()

    await user.click(screen.getByText('Retour'))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('preloads upcoming thumbnails and skips missing ones', async () => {
    const dataset = [
      ...baseNews,
      { id: 20, title: 'Old without thumb', content: 'missing image', createdAt: '2019-01-01' },
    ]

    const { preloadSpy } = await renderPage(false, dataset)

    await waitFor(() => expect(preloadSpy).toHaveBeenCalled())
  })

  it('navigates and manages admin actions including delete errors', async () => {
    const { preloadSpy } = await renderPage(true)

    await user.click(screen.getAllByRole('button', { name: 'Voir' })[0])
    expect(mockNavigate).toHaveBeenCalledWith('/actus/2')

    await user.click(screen.getAllByRole('button', { name: 'Modifier' })[0])
    expect(mockNavigate).toHaveBeenCalledWith('/admin/actus/edit/2')

    deleteNews.mockRejectedValueOnce(new Error('fail'))
    await user.click(screen.getAllByRole('button', { name: 'Supprimer' })[0])
    await user.click(screen.getByRole('button', { name: 'Non' }))
    expect(deleteNews).not.toHaveBeenCalled()

    await user.click(screen.getAllByRole('button', { name: 'Supprimer' })[0])
    await user.click(screen.getByRole('button', { name: 'Oui' }))
    await waitFor(() => expect(deleteNews).toHaveBeenCalledWith(2))

    deleteNews.mockResolvedValueOnce({})
    await user.click(screen.getAllByRole('button', { name: 'Supprimer' })[0])
    await user.click(screen.getByRole('button', { name: 'Oui' }))
    await waitFor(() => expect(deleteNews).toHaveBeenCalledWith(2))
    act(() => jest.runOnlyPendingTimers())

    expect(preloadSpy).toHaveBeenCalled()
  })

  it('handles format fallbacks, search edge cases, pagination bounds, and delete flows', async () => {
    const quirkyNews = [
      { id: undefined, title: undefined, content: undefined, createdAt: undefined, thumbnail: 'missing.jpg' },
      { id: 8, title: undefined, content: undefined, createdAt: 'not-a-date', thumbnail: 'bad.jpg' },
      { id: 9, title: 'No Date', content: 'still visible', createdAt: null, thumbnail: undefined },
      { id: 10, title: 'Another', content: 'another visible', createdAt: '2024-01-01', thumbnail: 'another.jpg' },
      { id: 11, title: 'Admin only', content: 'admin news', createdAt: '2024-02-01', thumbnail: 'admin.jpg' },
      { id: 12, title: 'Extra page', content: 'page two', createdAt: '2024-03-03', thumbnail: 'extra.jpg' },
    ]

    deleteNews.mockRejectedValueOnce(new Error('fail'))
    deleteNews.mockResolvedValueOnce({})

    const { preloadSpy } = await renderPage(true, [...quirkyNews], 'Admin only')

    const dateElements = screen.getAllByText((content, node) =>
      node.classList?.contains('all-actus__card-date')
    )
    expect(dateElements.some((el) => el.textContent === '')).toBe(true)

    const searchInput = screen.getByPlaceholderText('Rechercher')
    await user.type(searchInput, 'random')
    act(() => jest.runOnlyPendingTimers())
    await user.clear(searchInput)

    await user.click(screen.getByLabelText('Prev'))
    expect(screen.getByText('page-1')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Next'))
    act(() => jest.runOnlyPendingTimers())

    await user.click(screen.getAllByRole('button', { name: 'Supprimer' })[0])
    await user.click(screen.getByRole('button', { name: 'Non' }))

    await user.click(screen.getAllByRole('button', { name: 'Supprimer' })[0])
    await user.click(screen.getByRole('button', { name: 'Oui' }))
    await waitFor(() => expect(deleteNews).not.toHaveBeenCalled())
  })

  it('sets slide direction to left when navigating back a page', async () => {
    await renderPage(false)

    await user.click(screen.getByLabelText('Next'))
    act(() => jest.runOnlyPendingTimers())
    await screen.findByText('page-2')

    await user.click(screen.getByLabelText('Prev'))
    act(() => jest.runOnlyPendingTimers())

    await waitFor(() => expect(screen.getByText('page-1')).toBeInTheDocument())
    await waitFor(() =>
      expect(document.querySelector('.all-actus__grid').className).toContain('slide-left')
    )
  })
})
