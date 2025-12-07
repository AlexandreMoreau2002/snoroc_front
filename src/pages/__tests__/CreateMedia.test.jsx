import CreateMedia from '../admin/CreateMedia'
import userEvent from '@testing-library/user-event'
import { act, render, screen, waitFor } from '@testing-library/react'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useNavigate: jest.fn(),
    useParams: jest.fn(),
  }
})

jest.mock('../../repositories/mediaRepository', () => ({
  createMedia: jest.fn(),
  getMediaById: jest.fn(),
  updateMedia: jest.fn(),
}))

const { createMedia, getMediaById, updateMedia } = require('../../repositories/mediaRepository')
const { useNavigate, useParams } = require('react-router-dom')

describe('CreateMedia form', () => {
  let user
  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
    mockNavigate.mockReset()
    useNavigate.mockReturnValue(mockNavigate)
    useParams.mockReturnValue({})
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const renderForm = () => render(<CreateMedia />)

  test('valide les champs requis et crée un média', async () => {
    createMedia.mockResolvedValue({})
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

  test('affiche message succès et réinitialise le formulaire', async () => {
    jest.useFakeTimers()
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    createMedia.mockResolvedValue({ message: 'Bravo' })
    renderForm()

    await user.type(screen.getByLabelText('Titre *'), 'Live')
    await user.type(screen.getByLabelText('URL YouTube *'), 'https://youtu.be/abcdefghijk')
    await user.type(screen.getByLabelText('Description'), 'Texte')
    await user.click(screen.getByText('Envoyer'))

    expect(await screen.findByText('Bravo')).toBeInTheDocument()
    await waitFor(() => expect(createMedia).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByLabelText('Titre *')).toHaveValue(''))
    expect(screen.getByLabelText('Description')).toHaveValue('')
    expect(screen.getByLabelText('URL YouTube *')).toHaveValue('')

    await act(async () => {
      jest.advanceTimersByTime(2000)
    })
    expect(screen.queryByText('Bravo')).not.toBeInTheDocument()
    jest.useRealTimers()
  })

  test('affiche erreur si url invalide', async () => {
    renderForm()
    await user.type(screen.getByLabelText('Titre *'), 'Live')
    await user.type(screen.getByLabelText('URL YouTube *'), 'invalid')
    await user.click(screen.getByText('Envoyer'))
    expect(screen.getByText('URL YouTube invalide.')).toBeInTheDocument()
  })

  test('mode édition charge les données et met à jour', async () => {
    useParams.mockReturnValue({ id: '1' })
    getMediaById.mockResolvedValue({ id: 1, title: 'Edit', description: null, url: 'https://youtu.be/abcdefghijk' })
    updateMedia.mockResolvedValue({ updated: true })

    renderForm()

    expect(await screen.findByDisplayValue('Edit')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Titre *'), ' updated')
    await user.click(screen.getByText('Modifier'))

    await waitFor(() => expect(updateMedia).toHaveBeenCalled())
  })

  test('navigue vers la liste après mise à jour réussie', async () => {
    jest.useFakeTimers()
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    useParams.mockReturnValue({ id: '9' })
    getMediaById.mockResolvedValue({ id: 9, title: 'Edit', description: 'Desc', url: 'https://youtu.be/abcdefghijk' })
    updateMedia.mockResolvedValue({ ok: true })

    renderForm()

    await screen.findByDisplayValue('Edit')
    await user.click(screen.getByText('Modifier'))
    await waitFor(() => expect(updateMedia).toHaveBeenCalledWith('9', expect.any(Object)))

    await act(async () => {
      jest.advanceTimersByTime(2000)
    })
    expect(mockNavigate).toHaveBeenCalledWith('/media/all')
    jest.useRealTimers()
  })

  test('mode édition gère erreur chargement', async () => {
    useParams.mockReturnValue({ id: '1' })
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    getMediaById.mockRejectedValue(new Error('Load fail'))

    renderForm()

    await waitFor(() => expect(consoleSpy).toHaveBeenCalled())
    expect(await screen.findByText('Impossible de charger le média.')).toBeInTheDocument()
    consoleSpy.mockRestore()
  })

  test('modifie le champ description', async () => {
    createMedia.mockResolvedValue({ message: 'ok' })
    renderForm()

    await user.type(screen.getByLabelText('Description'), 'Une description')
    expect(screen.getByDisplayValue('Une description')).toBeInTheDocument()
  })

  test('affiche une erreur API quand la création échoue', async () => {
    createMedia.mockRejectedValue(new Error('Server down'))
    renderForm()

    await user.type(screen.getByLabelText('Titre *'), 'Live')
    await user.type(screen.getByLabelText('URL YouTube *'), 'https://youtu.be/abcdefghijk')
    await user.click(screen.getByText('Envoyer'))

    expect(await screen.findByText('Server down')).toBeInTheDocument()
  })

  test('le bouton retour redirige vers la liste des médias', async () => {
    renderForm()

    await user.click(screen.getByText('Retour'))
    expect(mockNavigate).toHaveBeenCalledWith('/media/all')
  })
})
