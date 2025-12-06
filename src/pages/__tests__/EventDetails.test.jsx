import * as router from 'react-router-dom'
import EventDetails from '../visitor/EventDetails'
import userEvent from '@testing-library/user-event'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { getEventById } from '../../repositories/eventRepository'

jest.mock('../../repositories/eventRepository', () => ({
  getEventById: jest.fn(),
}))

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return { ...actual, useNavigate: jest.fn() }
})

const navigateSpy = jest.fn()

describe('EventDetails', () => {
  beforeEach(() => {
    navigateSpy.mockReset()
    router.useNavigate.mockReturnValue(navigateSpy)
    getEventById.mockResolvedValue({
      id: 5,
      title: 'Gala d\'été',
      content: 'Programme complet\n\nTenue blanche',
      address: '12 rue des Fleurs',
      thumbnail: '/event.jpg',
      createdAt: '2024-05-01',
    })
  })

  it('renders details and splits paragraphs', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[{ pathname: '/Events/5' }]}>
          <Routes>
            <Route path="/Events/:id" element={<EventDetails />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )

    expect(await screen.findByText(/Gala d'été/)).toBeInTheDocument()
    expect(screen.getByText('Programme complet')).toBeInTheDocument()
    expect(screen.getByText('Tenue blanche')).toBeInTheDocument()
    expect(screen.getByText(/12 rue des Fleurs/)).toBeInTheDocument()
  })

  it('navigates back to list when history is empty', async () => {
    Object.defineProperty(window.history, 'state', { value: null, writable: true })

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[{ pathname: '/Events/5' }]}>
          <Routes>
            <Route path="/Events/:id" element={<EventDetails />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )

    await waitFor(() => expect(getEventById).toHaveBeenCalledWith('5'))
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))

    expect(navigateSpy).toHaveBeenCalledWith('/Events/all')
  })

  it('navigates -1 when history state exists', async () => {
    Object.defineProperty(window.history, 'state', { value: { idx: 1 }, writable: true })
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/Events/5']}>
          <Routes>
            <Route path="/Events/:id" element={<EventDetails />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )

    await waitFor(() => expect(screen.getByText('Retour')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Retour'))
    expect(navigateSpy).toHaveBeenCalledWith(-1)
  })

  it('handles fetch error gracefully', async () => {
    getEventById.mockRejectedValue(new Error('fail'))
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/Events/99']}>
          <Routes>
            <Route path="/Events/:id" element={<EventDetails />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )

    await waitFor(() => expect(getEventById).toHaveBeenCalled())
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('does nothing without ID', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/Events/']}>
          <Routes>
            <Route path="/Events/" element={<EventDetails />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )
  })

  it('renders raw content if no paragraphs detected', async () => {
    getEventById.mockResolvedValue({
      id: 6,
      title: 'EmptyContent',
      content: '', 
      address: 'Nowhere',
      thumbnail: '/img.jpg',
      createdAt: '2024-06-01',
    })

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/Events/6']}>
          <Routes>
            <Route path="/Events/:id" element={<EventDetails />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )

    expect(await screen.findByText('EmptyContent')).toBeInTheDocument()
  })
})
