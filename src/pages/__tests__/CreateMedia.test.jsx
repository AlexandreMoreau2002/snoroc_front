import CreateMedia from '../admin/CreateMedia'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'

jest.mock('../../repositories/mediaRepository', () => ({
  createMedia: jest.fn(),
  getMediaById: jest.fn(),
  updateMedia: jest.fn(),
}))

const { createMedia, getMediaById, updateMedia } = require('../../repositories/mediaRepository')

describe('CreateMedia form', () => {
  let user
  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  const renderForm = (initialEntries = ['/createMedia']) =>
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/createMedia" element={<CreateMedia />} />
          <Route path="/admin/media/edit/:id" element={<CreateMedia />} />
        </Routes>
      </MemoryRouter>
    )

  test('valide les champs requis et crée un média', async () => {
    createMedia.mockResolvedValue({ message: 'ok' })
    renderForm()

    await user.click(screen.getByText('Envoyer'))
    expect(screen.getByText('Veuillez mettre un titre.')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Titre *'), 'Live')
    await user.click(screen.getByText('Envoyer'))
    expect(screen.getByText('Veuillez fournir une URL YouTube.')).toBeInTheDocument()

    await user.type(screen.getByLabelText('URL YouTube *'), 'https://youtu.be/abcdefghijk')
    await user.click(screen.getByText('Envoyer'))

    await waitFor(() => expect(createMedia).toHaveBeenCalledWith({ title: 'Live', url: 'https://youtu.be/abcdefghijk', description: '' }))
  })

  test('affiche erreur si url invalide', async () => {
    renderForm()
    await user.type(screen.getByLabelText('Titre *'), 'Live')
    await user.type(screen.getByLabelText('URL YouTube *'), 'invalid')
    await user.click(screen.getByText('Envoyer'))
    expect(screen.getByText('URL YouTube invalide.')).toBeInTheDocument()
  })

  test('mode édition charge les données et met à jour', async () => {
    getMediaById.mockResolvedValue({ id: 1, title: 'Edit', description: 'Desc', url: 'https://youtu.be/abcdefghijk' })
    updateMedia.mockResolvedValue({ updated: true })

    renderForm(['/admin/media/edit/1'])

    expect(await screen.findByDisplayValue('Edit')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Titre *'), ' updated')
    await user.click(screen.getByText('Modifier'))

    await waitFor(() => expect(updateMedia).toHaveBeenCalled())
  })
})
