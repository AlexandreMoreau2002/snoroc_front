import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as router from 'react-router-dom'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import CreateNews from '../admin/CreateNews'

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return { ...actual, useNavigate: jest.fn() }
})

jest.mock('../../repositories/newsRepository', () => ({
  postNews: jest.fn().mockResolvedValue({ message: 'created' }),
  getNewsById: jest.fn().mockResolvedValue({ title: 'Loaded', content: 'Filled' }),
  updateNews: jest.fn().mockResolvedValue({ message: 'updated' }),
}))

const newsRepo = require('../../repositories/newsRepository')
const navigateSpy = jest.fn()

describe('CreateNews', () => {
  let user

  beforeEach(() => {
    jest.useFakeTimers()
    user =
      typeof userEvent.setup === 'function'
        ? userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
        : userEvent
    navigateSpy.mockReset()
    router.useNavigate.mockReturnValue(navigateSpy)
    newsRepo.postNews.mockResolvedValue({ message: 'created' })
    newsRepo.getNewsById.mockResolvedValue({ title: 'Loaded', content: 'Filled' })
    newsRepo.updateNews.mockResolvedValue({ message: 'updated' })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('validates and submits new news', async () => {
    render(
      <MemoryRouter>
        <CreateNews />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText(/Envoyer/i))
    expect(screen.getByText(/Veuillez mettre un titre/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Titre/i), 'My title')
    fireEvent.click(screen.getByText(/Envoyer/i))
    expect(screen.getByText(/Veuillez mettre une description/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Description/i), 'Desc')
    fireEvent.click(screen.getByText(/Envoyer/i))
    expect(screen.getByText(/Veuillez sélectionner une image/i)).toBeInTheDocument()

    const file = new File(['data'], 'image.png', { type: 'image/png' })
    const input = screen.getByLabelText(/Photo \*/i)
    await user.upload(input, file)

    await user.click(screen.getByText(/Envoyer/i))

    await waitFor(() => expect(newsRepo.postNews).toHaveBeenCalled())

    await waitFor(() => {
      expect(screen.getByLabelText(/Titre/i)).toHaveValue('')
      expect(screen.getByLabelText(/Description/i)).toHaveValue('')
      expect(screen.getByText('Aucun fichier sélectionné')).toBeInTheDocument()
    })
    
    // Run timers and verify navigation doesn't happen in create mode
    act(() => jest.runOnlyPendingTimers())
    
    // Explicitly verify navigate was NOT called (covering the false branch of line 88)
    expect(navigateSpy).not.toHaveBeenCalled()
  })

  it('navigates back to home when clicking Retour', async () => {
    render(
      <MemoryRouter>
        <CreateNews />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /Retour/i }))
    expect(navigateSpy).toHaveBeenCalledWith('/home')
  })

  it('surfaces submission errors when repository fails', async () => {
    newsRepo.postNews.mockRejectedValueOnce(new Error('oups'))
    render(
      <MemoryRouter>
        <CreateNews />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/Titre/i), 'Err title')
    await user.type(screen.getByLabelText(/Description/i), 'Err desc')
    const file = new File(['data'], 'image.png', { type: 'image/png' })
    const uploadInput = screen.getByLabelText(/Photo \*/i)
    await user.upload(uploadInput, file)

    await user.click(screen.getByRole('button', { name: /Envoyer/i }))

    await waitFor(() => expect(newsRepo.postNews).toHaveBeenCalled())

    expect(await screen.findByText('oups')).toBeInTheDocument()
  })

  it('keeps default filename when file input is cleared', async () => {
    render(
      <MemoryRouter>
        <CreateNews />
      </MemoryRouter>
    )

    const uploadInput = screen.getByLabelText(/Photo \*/i)
    fireEvent.change(uploadInput, { target: { files: [] } })
    expect(screen.getByText('Aucun fichier sélectionné')).toBeInTheDocument()
  })


  it('loads edit mode and updates news', async () => {
    newsRepo.getNewsById.mockReset()
    newsRepo.getNewsById.mockResolvedValueOnce({ title: 'Loaded', content: 'Filled' })
    render(
      <MemoryRouter initialEntries={[{ pathname: '/admin/actus/edit/42' }]}>
        <Routes>
          <Route path="/admin/actus/edit/:id" element={<CreateNews />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(newsRepo.getNewsById).toHaveBeenCalled())
    await screen.findByDisplayValue('Loaded')
    await user.type(screen.getByLabelText(/Titre/i), ' updated')
    await user.type(screen.getByLabelText(/Description/i), ' more')

    await user.click(screen.getByRole('button', { name: /Modifier/i }))
    await waitFor(() => expect(newsRepo.updateNews).toHaveBeenCalled())
    act(() => jest.runOnlyPendingTimers())
  })

  it('handles edit mode load failure gracefully', async () => {
    newsRepo.getNewsById.mockRejectedValueOnce(new Error('missing'))

    render(
      <MemoryRouter initialEntries={[{ pathname: '/admin/actus/edit/50' }]}> 
        <Routes>
          <Route path="/admin/actus/edit/:id" element={<CreateNews />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText(/Impossible de charger l'actualité/i)).toBeInTheDocument()
  })

  it('resets fileInputRef when it exists after successful submission', async () => {
    render(
      <MemoryRouter>
        <CreateNews />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/Titre/i), 'Test title')
    await user.type(screen.getByLabelText(/Description/i), 'Test description')
    
    const file = new File(['data'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText(/Photo \*/i)
    await user.upload(input, file)

    await user.click(screen.getByText(/Envoyer/i))

    await waitFor(() => expect(newsRepo.postNews).toHaveBeenCalled())
    
    // Verify form was reset (title and content should be empty)
    await waitFor(() => {
      expect(screen.getByLabelText(/Titre/i)).toHaveValue('')
      expect(screen.getByLabelText(/Description/i)).toHaveValue('')
    })

    act(() => jest.runOnlyPendingTimers())
  })

  it('navigates to /actus/all after successful edit in edit mode', async () => {
    newsRepo.getNewsById.mockResolvedValueOnce({ title: 'Edit Test', content: 'Content' })
    
    render(
      <MemoryRouter initialEntries={[{ pathname: '/admin/actus/edit/99' }]}>
        <Routes>
          <Route path="/admin/actus/edit/:id" element={<CreateNews />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(newsRepo.getNewsById).toHaveBeenCalled())
    await screen.findByDisplayValue('Edit Test')

    await user.click(screen.getByRole('button', { name: /Modifier/i }))
    await waitFor(() => expect(newsRepo.updateNews).toHaveBeenCalled())

    // Fast-forward timers to trigger navigation
    act(() => jest.runOnlyPendingTimers())
    
    expect(navigateSpy).toHaveBeenCalledWith('/actus/all')
  })

  it('displays success message after successful edit', async () => {
    newsRepo.getNewsById.mockResolvedValueOnce({ title: 'Edit Test', content: 'Content' })
    newsRepo.updateNews.mockResolvedValueOnce({ message: 'updated' })
    
    render(
      <MemoryRouter initialEntries={[{ pathname: '/admin/actus/edit/123' }]}>
        <Routes>
          <Route path="/admin/actus/edit/:id" element={<CreateNews />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(newsRepo.getNewsById).toHaveBeenCalled())
    await screen.findByDisplayValue('Edit Test')

    await user.click(screen.getByRole('button', { name: /Modifier/i }))
    await waitFor(() => expect(newsRepo.updateNews).toHaveBeenCalled())
    
    // Verify success message is displayed
    expect(await screen.findByText(/Actualité modifiée avec succès/i)).toBeInTheDocument()

    act(() => jest.runOnlyPendingTimers())
  })


  it('uploads new thumbnail in edit mode', async () => {
    newsRepo.getNewsById.mockResolvedValueOnce({ title: 'Edit Test', content: 'Content' })
    
    render(
      <MemoryRouter initialEntries={[{ pathname: '/admin/actus/edit/456' }]}>
        <Routes>
          <Route path="/admin/actus/edit/:id" element={<CreateNews />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(newsRepo.getNewsById).toHaveBeenCalled())
    await screen.findByDisplayValue('Edit Test')

    // Upload a new thumbnail
    const file = new File(['new-data'], 'new-image.png', { type: 'image/png' })
    const input = screen.getByLabelText(/Photo \(Optionnel\)/i)
    await user.upload(input, file)

    await user.click(screen.getByRole('button', { name: /Modifier/i }))
    await waitFor(() => expect(newsRepo.updateNews).toHaveBeenCalled())

    act(() => jest.runOnlyPendingTimers())
  })

})
