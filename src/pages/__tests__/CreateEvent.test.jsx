import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import * as router from 'react-router-dom'
import CreateEvent from '../admin/CreateEvent'

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return { ...actual, useNavigate: jest.fn() }
})

jest.mock('../../repositories/eventRepository', () => ({
  postEvent: jest.fn().mockResolvedValue({ message: 'created' }),
  getEventById: jest.fn().mockResolvedValue({ title: 'Loaded', content: 'Filled', address: 'Paris' }),
  updateEvent: jest.fn().mockResolvedValue({ message: 'updated' }),
}))

const eventRepo = require('../../repositories/eventRepository')
const navigateSpy = jest.fn()

describe('CreateEvent', () => {
  let user

  beforeEach(() => {
    jest.useFakeTimers()
    user =
      typeof userEvent.setup === 'function'
        ? userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
        : userEvent
    navigateSpy.mockReset()
    router.useNavigate.mockReturnValue(navigateSpy)
    eventRepo.postEvent.mockResolvedValue({ message: 'created' })
    eventRepo.getEventById.mockResolvedValue({ title: 'Loaded', content: 'Filled', address: 'Paris' })
    eventRepo.updateEvent.mockResolvedValue({ message: 'updated' })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('validates required fields and submits', async () => {
    render(
      <MemoryRouter>
        <CreateEvent />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText(/Envoyer/i))
    expect(screen.getByText(/Veuillez mettre un titre/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Titre/i), 'My event')
    fireEvent.click(screen.getByText(/Envoyer/i))
    expect(screen.getByText(/Veuillez mettre une description/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Description/i), 'Desc')
    fireEvent.click(screen.getByText(/Envoyer/i))
    expect(screen.getByText(/Veuillez renseigner l'adresse/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Adresse/i), 'Paris')
    fireEvent.click(screen.getByText(/Envoyer/i))
    expect(screen.getByText(/Veuillez sélectionner une image/i)).toBeInTheDocument()

    const file = new File(['data'], 'image.png', { type: 'image/png' })
    const input = screen.getByLabelText(/Photo \*/i)
    await user.upload(input, file)

    await user.click(screen.getByText(/Envoyer/i))
    await waitFor(() => expect(eventRepo.postEvent).toHaveBeenCalled())

    await waitFor(() => {
      expect(screen.getByLabelText(/Titre/i)).toHaveValue('')
      expect(screen.getByLabelText(/Description/i)).toHaveValue('')
      expect(screen.getByLabelText(/Adresse/i)).toHaveValue('')
    })

    act(() => jest.runOnlyPendingTimers())
    expect(navigateSpy).not.toHaveBeenCalled()
  })

  it('loads edit mode and updates event', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/admin/events/edit/42' }]}>
        <Routes>
          <Route path="/admin/events/edit/:id" element={<CreateEvent />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(eventRepo.getEventById).toHaveBeenCalled())
    await user.type(screen.getByLabelText(/Titre/i), ' updated')
    await user.click(screen.getByRole('button', { name: /Modifier/i }))

    await waitFor(() => expect(eventRepo.updateEvent).toHaveBeenCalled())
    act(() => jest.runOnlyPendingTimers())
  })

  it('shows load failure and error message', async () => {
    eventRepo.getEventById.mockRejectedValueOnce(new Error('missing'))

    render(
      <MemoryRouter initialEntries={[{ pathname: '/admin/events/edit/50' }]}>
        <Routes>
          <Route path="/admin/events/edit/:id" element={<CreateEvent />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText(/Impossible de charger l'évènement/i)).toBeInTheDocument()
  })
})
