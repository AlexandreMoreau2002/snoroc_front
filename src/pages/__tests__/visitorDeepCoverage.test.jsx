import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import About from '../visitor/About'
import ActuDetails from '../visitor/ActuDetails'
import AllActus from '../visitor/AllActus'
import Contact from '../visitor/Contact'
import Event from '../visitor/Event'
import AllEvents from '../visitor/AllEvents'
import Home from '../visitor/Home'
import Media from '../visitor/Media'
import TermsOfService from '../visitor/TermsOfService'
import { useAuth } from '../../context/AuthContext'
import { deleteNews, getAllNews, getNewsById } from '../../repositories/newsRepository'
import { deleteEvent, getAllEvents } from '../../repositories/eventRepository'
import { createContactMessage } from '../../repositories/contactRepository'
import { getAbout } from '../../repositories/aboutRepository'

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
  getNewsById: jest.fn(),
  deleteNews: jest.fn(),
}))

jest.mock('../../repositories/eventRepository', () => ({
  getAllEvents: jest.fn(),
  deleteEvent: jest.fn(),
}))

jest.mock('../../repositories/contactRepository', () => ({
  createContactMessage: jest.fn(),
}))

jest.mock('../../repositories/aboutRepository', () => ({
  getAbout: jest.fn(),
}))

const renderWithRouter = (ui, initialEntries = ['/']) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </HelmetProvider>
  )

describe('Visitor flows deep coverage', () => {
  beforeEach(() => {
    jest.useRealTimers()
    mockNavigate.mockReset()
    useAuth.mockReturnValue({ user: null, isAdmin: false })
    getAllNews.mockReset()
    getNewsById.mockReset()
    deleteNews.mockReset()
    getAllEvents.mockReset()
    deleteEvent.mockReset()
    createContactMessage.mockReset()
    getAbout.mockReset()
    getAllEvents.mockResolvedValue([])
  })

  it('paginates Home news and triggers navigation actions', async () => {
    getAllNews.mockResolvedValue(
      Array.from({ length: 7 }, (_, index) => ({
        id: index + 1,
        title: `News ${index + 1}`,
        content: 'Body',
        thumbnail: `/img-${index + 1}.jpg`,
        createdAt: `2024-01-0${index + 1}`,
      }))
    )
    useAuth.mockReturnValue({ user: { isAdmin: true }, isAdmin: true })

    renderWithRouter(<Home />)

    expect(await screen.findByText('Actus')).toBeInTheDocument()
    expect(await screen.findByText('News 7')).toBeInTheDocument()

    await userEvent.click(screen.getByText('2'))
    expect(screen.getByText('News 1')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Tout voir'))
    expect(mockNavigate).toHaveBeenCalledWith('/actus/all')

    await userEvent.click(screen.getByText('Ajouter'))
    expect(mockNavigate).toHaveBeenCalledWith('/createNews')
  })

  it('resets Home state when news loading fails', async () => {
    getAllNews.mockRejectedValueOnce(new Error('network'))

    renderWithRouter(<Home />)

    await waitFor(() => expect(getAllNews).toHaveBeenCalled())
    expect(screen.queryAllByRole('article')).toHaveLength(0)
    expect(screen.getByText('Actus')).toBeInTheDocument()
  })

  it('filters and deletes news in AllActus as admin', async () => {
    const sampleNews = [
      { id: 1, title: 'Alpha story', content: 'First', thumbnail: '/a.jpg', date: '2024-01-01' },
      { id: 2, title: 'Beta news', content: 'Second', thumbnail: '/b.jpg', date: '2024-02-01' },
    ]
    getAllNews.mockResolvedValue(sampleNews)
    deleteNews.mockResolvedValue({ ok: true })
    useAuth.mockReturnValue({ user: { isAdmin: true }, isAdmin: true })

    renderWithRouter(<AllActus />)

    await waitFor(() => expect(getAllNews).toHaveBeenCalled())
    expect(await screen.findByText('Beta news')).toBeInTheDocument()

    await userEvent.type(screen.getByPlaceholderText('Rechercher'), 'beta')
    expect(screen.getByText('Beta news')).toBeInTheDocument()

    await userEvent.click(screen.getAllByTitle('Supprimer')[0])
    await userEvent.click(await screen.findByText('Oui'))

    await waitFor(() => expect(deleteNews).toHaveBeenCalledWith(2))
  })

  it('renders events and lets admins delete them', async () => {
    getAllEvents.mockResolvedValue([
      {
        id: 1,
        title: 'Concert',
        content: 'Live set',
        address: 'Paris',
        thumbnail: '/concert.jpg',
        createdAt: '2024-03-10',
      },
      {
        id: 2,
        title: 'Atelier photo',
        content: 'Techniques avancées',
        address: 'Lyon',
        thumbnail: '/photo.jpg',
        createdAt: '2024-04-01',
      },
    ])
    deleteEvent.mockResolvedValue({ ok: true })
    useAuth.mockReturnValue({ user: { isAdmin: true }, isAdmin: true })

    renderWithRouter(
      <Routes>
        <Route path="/events/all" element={<AllEvents />} />
      </Routes>,
      ['/events/all']
    )

    expect(await screen.findByText('Atelier photo')).toBeInTheDocument()

    await userEvent.click(screen.getAllByTitle('Supprimer')[0])
    await userEvent.click(await screen.findByText('Oui'))

    await waitFor(() => expect(deleteEvent).toHaveBeenCalledWith(2))
  })

  it('shows empty state on AllActus fetch error', async () => {
    getAllNews.mockRejectedValueOnce(new Error('boom'))

    renderWithRouter(<AllActus />)

    expect(await screen.findByText(/Aucune actualité trouvée/i)).toBeInTheDocument()
  })

  it('handles ActuDetails navigation history branches', async () => {
    getNewsById.mockResolvedValue({
      id: 5,
      title: 'Single news',
      content: 'Line one\n\nLine two',
      thumbnail: '/img.png',
      date: '2024-05-05',
    })

    window.history.pushState({ idx: 1 }, '')
    const { unmount } = renderWithRouter(
      <Routes>
        <Route path="/actus/:id" element={<ActuDetails />} />
      </Routes>,
      ['/actus/5']
    )

    expect(await screen.findByText('Single news')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Retour'))
    expect(mockNavigate).toHaveBeenCalledWith(-1)

    mockNavigate.mockClear()
    Object.defineProperty(window.history, 'state', { value: null, writable: true })

    unmount()

    renderWithRouter(
      <Routes>
        <Route path="/actus/:id" element={<ActuDetails />} />
      </Routes>,
      ['/actus/5']
    )

    await userEvent.click(await screen.findByText('Retour'))
    expect(mockNavigate).toHaveBeenCalledWith('/actus/all')
  })

  it('validates, submits, and handles errors on Contact form', async () => {
    const user = userEvent
    createContactMessage
      .mockRejectedValueOnce(new Error('server'))
      .mockResolvedValueOnce({ ok: true })

    renderWithRouter(
      <Routes>
        <Route path="/contact" element={<Contact />} />
      </Routes>,
      ['/contact']
    )

    await user.click(screen.getByText('Envoyer'))
    expect(await screen.findAllByText(/obligatoire/i)).toHaveLength(3)
    expect(screen.getByText(/adresse email valide/i)).toBeInTheDocument()
    expect(screen.getByText(/Merci de saisir votre message/i)).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('Nom'), 'Doe')
    await user.type(screen.getByPlaceholderText('Prenom'), 'Jane')
    await user.type(screen.getByPlaceholderText('Mail'), 'jane@example.com')
    await user.type(screen.getByPlaceholderText('Sujet'), 'Hello')
    await user.type(screen.getByPlaceholderText('Message'), 'Content')
    await user.click(screen.getByText('Envoyer'))

    await waitFor(() => expect(createContactMessage).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.getByText('server')).toBeInTheDocument())
    await act(async () => {})

    await user.click(screen.getByText('Envoyer'))
    expect(await screen.findByText(/Merci pour votre message/i)).toBeInTheDocument()
    expect(createContactMessage).toHaveBeenCalledWith({
      email: 'jane@example.com',
      message: 'Content',
      name: 'Jane Doe',
      phone: null,
      subject: 'Hello',
    })
  })

  it('loads About content and shows admin action', async () => {
    getAbout.mockResolvedValue({
      title: 'Snoroc Club',
      description: 'Intro\nBody',
      image: '/img.jpg',
    })
    useAuth.mockReturnValue({ user: { isAdmin: true }, isAdmin: true })

    renderWithRouter(
      <Routes>
        <Route path="/about" element={<About />} />
      </Routes>,
      ['/about']
    )

    await waitFor(() => expect(getAbout).toHaveBeenCalled())
    expect(await screen.findByText('Snoroc Club')).toBeInTheDocument()
    expect(screen.getByText('Intro')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Modifier'))
    expect(mockNavigate).toHaveBeenCalledWith('/admin/about/edit')
  })

  it('handles error when loading About content fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    getAbout.mockRejectedValueOnce(new Error('About load failed'))
    
    renderWithRouter(
      <Routes>
        <Route path="/about" element={<About />} />
      </Routes>,
      ['/about']
    )

    await waitFor(() => expect(getAbout).toHaveBeenCalled())
    expect(consoleSpy).toHaveBeenCalledWith('Erreur chargement About:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('renders static informational visitor pages', () => {
    renderWithRouter(
      <Routes>
        <Route path="/event" element={<Event />} />
      </Routes>,
      ['/event']
    )
    expect(screen.getByRole('heading', { name: /Événements/i })).toBeInTheDocument()

    renderWithRouter(
      <Routes>
        <Route path="/media" element={<Media />} />
      </Routes>,
      ['/media']
    )
    expect(screen.getByRole('heading', { name: /Médias/i })).toBeInTheDocument()

    renderWithRouter(
      <Routes>
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>,
      ['/terms']
    )
    expect(screen.getByText(/Terms Of Service page/i)).toBeInTheDocument()
  })
})
