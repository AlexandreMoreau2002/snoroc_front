import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HelmetProvider } from 'react-helmet-async'
import AllEvents from '../visitor/AllEvents'

// Mocks
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}))

jest.mock('../../repositories/eventRepository', () => ({
  getAllEvents: jest.fn(),
  deleteEvent: jest.fn(),
}))

const { useAuth } = require('../../context/AuthContext')
const { getAllEvents, deleteEvent } = require('../../repositories/eventRepository')

const mockEvents = [
  { id: 1, title: 'Event 1', content: 'Contenu 1', address: 'Paris', createdAt: '2023-01-01', thumbnail: 'img1.jpg' },
  { id: 2, title: 'Event 2', content: 'Contenu 2', address: 'Lyon', createdAt: '2023-02-01', thumbnail: 'img2.jpg' },
]

describe('AllEvents Page', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    mockNavigate.mockReset()
    getAllEvents.mockReset()
    deleteEvent.mockReset()
    useAuth.mockReturnValue({ isAdmin: false })
    // Mock global Image for preload test
    global.Image = class { constructor() { this.src = '' } }
  })

  const renderPage = () => {
    return render(
      <HelmetProvider>
        <AllEvents />
      </HelmetProvider>
    )
  }

  test('affiche les événements et filtre', async () => {
    getAllEvents.mockResolvedValue(mockEvents)
    renderPage()

    expect(await screen.findByText('Event 1')).toBeInTheDocument()
    expect(screen.getByText('Event 2')).toBeInTheDocument()

    // Test preload image logic implicitly covered by render

    // Search
    const searchInput = screen.getByPlaceholderText(/Rechercher/i)
    await user.type(searchInput, 'Paris')
    expect(screen.getByText('Event 1')).toBeInTheDocument()
    expect(screen.queryByText('Event 2')).not.toBeInTheDocument()
  })

  test('triggers image preload logic with many events and handles missing data', async () => {
    // Need enough events to have a "next page" for preload logic
    // We also introduce missing fields to cover sorting and preload branches
    const manyEvents = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      title: `Event ${i + 1}`,
      content: 'Content',
      address: 'City',
      // Cover (createdAt || 0) in sort
      createdAt: i % 2 === 0 ? '2023-01-01' : null, 
      // Cover implicit else in if(event.thumbnail)
      thumbnail: i % 2 === 0 ? `img${i + 1}.jpg` : '' 
    }))
    
    getAllEvents.mockResolvedValue(manyEvents)
    renderPage()
    
    // Wait for render
    await screen.findByText('Event 1')
  })

  test('gère erreur chargement', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    getAllEvents.mockRejectedValue(new Error('Load fail'))
    renderPage()

    await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Erreur lors du chargement des events :', expect.any(Error)))
    consoleSpy.mockRestore()
  })

  test('navigation visiteur vers détail', async () => {
    getAllEvents.mockResolvedValue(mockEvents)
    renderPage()

    const article = await screen.findByText('Event 1')
    await user.click(article) // Le click est sur le texte mais bubbling vers l'article qui a onClick
    // Ou cibler l'article role="button"
    const articles = screen.getAllByRole('button')
    // Les articles sont des buttons (role="button")
    // event 1 is index 0
    await user.click(articles[0])

    expect(mockNavigate).toHaveBeenCalledWith('/events/1')
  })

  test('bouton retour', async () => {
    getAllEvents.mockResolvedValue([])
    renderPage()
    const backBtn = screen.getByText('Retour')
    await user.click(backBtn)
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  describe('Mode Admin', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ isAdmin: true })
      getAllEvents.mockResolvedValue(mockEvents)
    })

    test('affiche overlay admin et gère edit', async () => {
      renderPage()
      await screen.findByText('Event 2') // Event 2 is newer (Feb vs Jan), so first

      const editBtns = screen.getAllByTitle('Modifier')
      await user.click(editBtns[0])
      expect(mockNavigate).toHaveBeenCalledWith('/admin/events/edit/2')
    })

    test('gère view depuis overlay', async () => {
      renderPage()
      await screen.findByText('Event 2')

      const viewBtns = screen.getAllByTitle('Voir')
      await user.click(viewBtns[0])
      expect(mockNavigate).toHaveBeenCalledWith('/events/2')
    })

    test('gère suppression (succès)', async () => {
      renderPage()
      await screen.findByText('Event 2')

      const deleteBtns = screen.getAllByTitle('Supprimer')
      await user.click(deleteBtns[0])

      // Modal open
      expect(screen.getByText('Voulez-vous supprimer ce contenu ?')).toBeInTheDocument()
      
      const confirmBtn = screen.getByText('Oui')
      deleteEvent.mockResolvedValue({})
      await user.click(confirmBtn)
      
      expect(deleteEvent).toHaveBeenCalledWith(2)
      await waitFor(() => expect(screen.queryByText('Event 2')).not.toBeInTheDocument())
    })

    test('gère suppression (annulation)', async () => {
      renderPage()
      await screen.findByText('Event 1')
      await user.click(screen.getAllByTitle('Supprimer')[0])

      const cancelBtn = screen.getByText('Non')
      await user.click(cancelBtn)
      
      expect(deleteEvent).not.toHaveBeenCalled()
      expect(screen.getByText('Event 1')).toBeInTheDocument()
    })

    test('gère erreur suppression', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      renderPage()
      await screen.findByText('Event 1')
      await user.click(screen.getAllByTitle('Supprimer')[0])

      deleteEvent.mockRejectedValue(new Error('Delete fail'))
      await user.click(screen.getByText('Oui'))

      await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Erreur lors de la suppression :', expect.any(Error)))
      // Event still there
      expect(screen.getByText('Event 1')).toBeInTheDocument()
      consoleSpy.mockRestore()
    })
  })
})
