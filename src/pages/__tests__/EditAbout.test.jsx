import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import EditAbout from '../admin/EditAbout'

const mockedNavigate = jest.fn()

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return { ...actual, useNavigate: () => mockedNavigate }
})

jest.mock('../../repositories/aboutRepository', () => ({
  getAbout: jest.fn().mockResolvedValue({ title: 'About title', description: 'About description' }),
  updateAbout: jest.fn().mockResolvedValue({ message: 'saved' }),
}))

const aboutRepo = require('../../repositories/aboutRepository')

describe('EditAbout', () => {
  let user

  beforeEach(() => {
    jest.useFakeTimers()
    user =
      typeof userEvent.setup === 'function'
        ? userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
        : userEvent
    jest.clearAllMocks()
    aboutRepo.getAbout.mockResolvedValue({ title: 'About title', description: 'About description' })
    aboutRepo.updateAbout.mockResolvedValue({ message: 'saved' })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('handles fetch error and validation', async () => {
    aboutRepo.getAbout.mockRejectedValueOnce(new Error('boom'))

    render(
      <MemoryRouter>
        <EditAbout />
      </MemoryRouter>
    )

    expect(await screen.findByText(/Impossible de charger le contenu/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Modifier/i }))
    await waitFor(() => expect(aboutRepo.updateAbout).not.toHaveBeenCalled())

    await user.type(screen.getByLabelText(/Titre/i), 'About title')
    await user.type(screen.getByLabelText(/Description/i), 'Body')
    await user.click(screen.getAllByRole('button', { name: /Modifier/i })[0])
    await waitFor(() => expect(aboutRepo.updateAbout).toHaveBeenCalled())
  })

  it('shows success flow and clears after timeout', async () => {
    render(
      <MemoryRouter>
        <EditAbout />
      </MemoryRouter>
    )

    await screen.findByDisplayValue('About title')
    await user.click(screen.getByRole('button', { name: /Modifier/i }))
    await waitFor(() => expect(aboutRepo.updateAbout).toHaveBeenCalled())
    expect(await screen.findByText(/Contenu modifié avec succès/i)).toBeInTheDocument()
    act(() => jest.runOnlyPendingTimers())
  })

  it('requires description before submitting', async () => {
    render(
      <MemoryRouter>
        <EditAbout />
      </MemoryRouter>
    )

    await screen.findByDisplayValue('About title')
    const titleInput = await screen.findByLabelText(/Titre/i)
    const descriptionInput = screen.getByLabelText(/Description/i)

    await user.clear(titleInput)
    await user.type(titleInput, 'New title')
    await user.clear(descriptionInput)
    await user.click(screen.getByRole('button', { name: /Modifier/i }))

    expect(screen.getByText(/Veuillez mettre une description/i)).toBeInTheDocument()

    await user.type(descriptionInput, 'New description')
    await user.click(screen.getByRole('button', { name: /Modifier/i }))

    await waitFor(() => expect(aboutRepo.updateAbout).toHaveBeenCalled())
  })

  it('attaches optional image and surfaces backend errors', async () => {
    aboutRepo.updateAbout.mockRejectedValueOnce(new Error('upload failed'))

    render(
      <MemoryRouter>
        <EditAbout />
      </MemoryRouter>
    )

    await screen.findByDisplayValue('About title')

    const fileInput = screen.getByLabelText(/Photo/i)
    const file = new File(['data'], 'cover.png', { type: 'image/png' })
    await user.upload(fileInput, file)

    expect(screen.getByText('cover.png')).toBeInTheDocument()

    const titleInput = screen.getByLabelText(/Titre/i)
    const descriptionInput = screen.getByLabelText(/Description/i)

    await user.clear(titleInput)
    await user.type(titleInput, 'Updated title')
    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Updated description')
    await user.click(screen.getByRole('button', { name: /Modifier/i }))

    await waitFor(() => expect(aboutRepo.updateAbout).toHaveBeenCalled())

    const formData = aboutRepo.updateAbout.mock.calls[0][0]
    const entries = Array.from(formData.entries())
    const imageEntry = entries.find(([key]) => key === 'image')
    expect(imageEntry?.[1].name).toBe('cover.png')
    await waitFor(() => expect(screen.getByText(/upload failed/i)).toBeInTheDocument())
  })

  it('falls back to empty values when about data is missing', async () => {
    aboutRepo.getAbout.mockResolvedValueOnce({})

    render(
      <MemoryRouter>
        <EditAbout />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByLabelText(/Titre/i)).toHaveValue(''))
    expect(screen.getByLabelText(/Description/i)).toHaveValue('')
    expect(await screen.findByText(/Image actuelle conservée/i)).toBeInTheDocument()
  })

  it('keeps default filename when no file is chosen', async () => {
    render(
      <MemoryRouter>
        <EditAbout />
      </MemoryRouter>
    )

    await screen.findByDisplayValue('About title')
    const fileInput = screen.getByLabelText(/Photo/i)

    fireEvent.change(fileInput, { target: { files: [] } })

    expect(screen.getByText(/Aucun fichier sélectionné/i)).toBeInTheDocument()
  })

  it('returns to about page when clicking the back button', async () => {
    render(
      <MemoryRouter>
        <EditAbout />
      </MemoryRouter>
    )

    await screen.findByDisplayValue('About title')
    await user.click(screen.getByRole('button', { name: /Retour/i }))

    expect(mockedNavigate).toHaveBeenCalledWith('/A-propos')
  })
})
