import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import * as router from 'react-router-dom'
import EventDetails from '../visitor/EventDetails'
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
        <MemoryRouter initialEntries={[{ pathname: '/events/5' }]}>
          <Routes>
            <Route path="/events/:id" element={<EventDetails />} />
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
        <MemoryRouter initialEntries={[{ pathname: '/events/5' }]}>
          <Routes>
            <Route path="/events/:id" element={<EventDetails />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )

    await waitFor(() => expect(getEventById).toHaveBeenCalledWith('5'))
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))

    expect(navigateSpy).toHaveBeenCalledWith('/events/all')
  })
})
