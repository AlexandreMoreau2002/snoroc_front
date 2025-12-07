import React from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import ResetPassword from '../visitor/ResetPassword'

jest.mock('../../repositories/userRepository', () => ({
  patchUpdatePassword: jest.fn(),
}))

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}))

const mockedNavigate = jest.fn()

jest.mock('react-router-dom', () => {
  const actualRouter = jest.requireActual('react-router-dom')

  return {
    ...actualRouter,
    useNavigate: () => mockedNavigate,
  }
})

const repo = require('../../repositories/userRepository')
const authHook = require('../../context/AuthContext')

describe('ResetPassword page', () => {
  let user

  const renderPage = () =>
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    )

  const fillForm = async ({ current = 'old', next = 'new-pass', confirm = 'new-pass' } = {}) => {
    await user.type(screen.getByPlaceholderText('Ancien mot de passe *'), current)
    await user.type(screen.getByPlaceholderText('Nouveau mot de passe *'), next)
    await user.type(screen.getByPlaceholderText('Confirmer le mot de passe *'), confirm)
  }

  beforeEach(() => {
    jest.useFakeTimers()
    user =
      typeof userEvent.setup === 'function'
        ? userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
        : userEvent
    mockedNavigate.mockReset()
    repo.patchUpdatePassword.mockReset()
    authHook.useAuth.mockReturnValue({ user: { id: 123 } })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('blocks submission when confirmation differs', async () => {
    renderPage()

    await fillForm({ confirm: 'other' })
    await user.click(screen.getByRole('button', { name: 'Modifier' }))

    expect(await screen.findByText(/Les mots de passe ne correspondent pas/i)).toBeInTheDocument()
    expect(repo.patchUpdatePassword).not.toHaveBeenCalled()
  })

  it('shows backend error message', async () => {
    repo.patchUpdatePassword.mockRejectedValueOnce(new Error('boom'))
    renderPage()

    await fillForm()
    await user.click(screen.getByRole('button', { name: 'Modifier' }))

    expect(await screen.findByText(/boom/i)).toBeInTheDocument()
    expect(mockedNavigate).not.toHaveBeenCalled()
  })

  it('submits successfully, resets fields, and navigates after timeout', async () => {
    repo.patchUpdatePassword.mockResolvedValueOnce({ message: 'ok' })
    renderPage()

    await fillForm()
    await user.click(screen.getByRole('button', { name: 'Modifier' }))

    expect(await screen.findByText(/ok/i)).toBeInTheDocument()
    act(() => jest.runOnlyPendingTimers())

    expect(mockedNavigate).toHaveBeenCalledWith('/Profil')
    expect(screen.getByPlaceholderText('Ancien mot de passe *').value).toBe('')
    expect(screen.getByPlaceholderText('Nouveau mot de passe *').value).toBe('')
    expect(screen.getByPlaceholderText('Confirmer le mot de passe *').value).toBe('')
    expect(screen.queryByText(/ok/i)).not.toBeInTheDocument()
  })

  it('falls back to default success message when backend omits it', async () => {
    repo.patchUpdatePassword.mockResolvedValueOnce({})
    renderPage()

    await fillForm()
    await user.click(screen.getByRole('button', { name: 'Modifier' }))

    expect(await screen.findByText(/Mot de passe mis à jour avec succès/i)).toBeInTheDocument()
    act(() => jest.runOnlyPendingTimers())
  })

  it('navigates back when clicking Retour', async () => {
    renderPage()

    await fillForm()
    await user.click(screen.getByRole('button', { name: 'Retour' }))

    expect(mockedNavigate).toHaveBeenCalledWith('/Profil')
    expect(repo.patchUpdatePassword).not.toHaveBeenCalled()
  })
})
