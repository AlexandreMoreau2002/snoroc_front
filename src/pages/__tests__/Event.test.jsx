import userEvent from '@testing-library/user-event'
import { HelmetProvider } from 'react-helmet-async'
import { render, screen, waitFor } from '@testing-library/react'

import Event from '../visitor/Event'

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

jest.mock('../../repositories/eventRepository', () => ({
  getAllEvents: jest.fn(),
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
const { getAllEvents } = require('../../repositories/eventRepository')

const baseEvents = [
  { id: 1, title: 'Event 1', content: 'Oldest', address: 'Nice', thumbnail: 't1.jpg', createdAt: '2022-01-01' },
  { id: 2, title: 'Event 2', content: 'Older', address: 'Marseille', thumbnail: 't2.jpg', createdAt: '2022-02-01' },
  { id: 3, title: 'Event 3', content: 'Old', address: 'Lille', thumbnail: 't3.jpg', createdAt: '2022-03-01' },
  { id: 4, title: 'Event 4', content: 'Mid', address: 'Lyon', thumbnail: 't4.jpg', createdAt: '2022-04-01' },
  { id: 5, title: 'Event 5', content: 'Recent', address: 'Paris', thumbnail: 't5.jpg', createdAt: '2022-05-01' },
  { id: 6, title: 'Event 6', content: 'Newer', address: 'Bordeaux', thumbnail: 't6.jpg', createdAt: '2022-06-01' },
  { id: 7, title: 'Event 7', content: 'Newest', address: 'Grenoble', thumbnail: 't7.jpg', createdAt: '2022-07-01' },
]

const renderEvent = async ({ isAdmin = false, events = baseEvents, preloadSpy } = {}) => {
  useAuth.mockReturnValue({ isAdmin })
  getAllEvents.mockResolvedValue(events)

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
      <Event />
    </HelmetProvider>
  )

  await waitFor(() => expect(getAllEvents).toHaveBeenCalled())

  return { ...view, OriginalImage }
}

describe('Event page', () => {
  let user

  beforeEach(() => {
    user = typeof userEvent.setup === 'function' ? userEvent.setup() : userEvent
    mockNavigate.mockReset()
    getAllEvents.mockReset()
    useAuth.mockReset()
  })

  it('renders events, paginates, preloads next items, and supports admin actions', async () => {
    const preloadSpy = jest.fn()
    const { container, OriginalImage } = await renderEvent({ isAdmin: true, preloadSpy })

    expect(await screen.findByRole('heading', { name: /Event/i })).toBeInTheDocument()
    
    // Attendre que les données soient chargées et affichées
    // Event 7 est le mainEvent (donc affiché ailleurs), Event 6 est le premier de la liste paginée
    expect(await screen.findByText('Event 6')).toBeInTheDocument()

    expect(container.querySelectorAll('.news-item')).toHaveLength(3)
    expect(screen.getByText('Event 7')).toBeInTheDocument()
    expect(screen.getByText(/Grenoble/)).toBeInTheDocument()

    await user.click(screen.getByText('Event 7'))
    expect(mockNavigate).toHaveBeenCalledWith('/events/7')

    await user.click(screen.getByText('Event 4'))
    expect(mockNavigate).toHaveBeenCalledWith('/events/4')

    await user.click(screen.getByLabelText('Next'))
    expect(screen.getByText('page-2')).toBeInTheDocument()
    expect(container.querySelector('.news-list')?.className).toContain('slide-right')

    await user.click(screen.getByLabelText('Prev'))
    expect(container.querySelector('.news-list')?.className).toContain('slide-left')

    await user.click(screen.getByRole('button', { name: 'Tout voir' }))
    expect(mockNavigate).toHaveBeenCalledWith('/events/all')

    await user.click(screen.getByRole('button', { name: 'Ajouter' }))
    expect(mockNavigate).toHaveBeenCalledWith('/createEvent')

    await waitFor(() => expect(preloadSpy).toHaveBeenCalled())

    if (preloadSpy) {
      global.Image = OriginalImage
    }
  })

  it('handles fetch errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    getAllEvents.mockRejectedValueOnce(new Error('fail'))
    useAuth.mockReturnValue({ isAdmin: false })

    render(
      <HelmetProvider>
        <Event />
      </HelmetProvider>
    )

    await waitFor(() => expect(getAllEvents).toHaveBeenCalled())
    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith('Erreur lors du chargement des events :', expect.any(Error))
    )
    expect(screen.queryAllByRole('article')).toHaveLength(0)

    consoleSpy.mockRestore()
  })

  it('triggers preload logic for coverage', async () => {
     // Need enough events to have a "next page" with mixed thumbnails
     // EVENTS_PER_PAGE = 3, so with 7 events: mainEvent=1, page1=[2,3,4], nextPage=[5,6,7]
    const mixedEvents = [
      { id: 7, title: 'Event7', thumbnail: 't7.jpg', createdAt: '2022-01-01' },
      { id: 6, title: 'Event6', thumbnail: '', createdAt: '2022-02-01' }, // No thumbnail
      { id: 5, title: 'Event5', thumbnail: 't5.jpg', createdAt: '2022-03-01' },
      { id: 4, title: 'Event4', thumbnail: '', createdAt: '2022-04-01' }, // No thumbnail
      { id: 3, title: 'Event3', thumbnail: 't3.jpg', createdAt: '2022-05-01' },
      { id: 2, title: 'Event2', thumbnail: 't2.jpg', createdAt: '2022-06-01' },
      { id: 1, title: 'Main', thumbnail: 't1.jpg', createdAt: '2022-07-01' }
    ]
    const preloadSpy = jest.fn()
    getAllEvents.mockResolvedValue(mixedEvents)
    
    // Render and wait for Main to appear
    await renderEvent({ events: mixedEvents, preloadSpy })
    await screen.findByText('Main')
    
    // The useEffect calculates nextEvents for page 2 = [Event5, Event6, Event7]
    // Event6 has no thumbnail, so the else branch should execute
  })
})
