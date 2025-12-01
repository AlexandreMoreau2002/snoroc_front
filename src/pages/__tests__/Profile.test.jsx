import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import Profile from '../visitor/Profile'

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}))

jest.mock('../../repositories/userRepository', () => ({
  getProfile: jest.fn(),
  patchUpdateNewsletter: jest.fn(),
}))

const authHook = require('../../context/AuthContext')
const userRepo = require('../../repositories/userRepository')

const mockedNavigate = jest.fn()

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

describe('Profile page', () => {
  let user
  let logoutMock

  const renderPage = () =>
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

  beforeEach(() => {
    jest.useFakeTimers()
    user =
      typeof userEvent.setup === 'function'
        ? userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
        : userEvent
    logoutMock = jest.fn()
    mockedNavigate.mockReset()
    userRepo.getProfile.mockReset()
    userRepo.patchUpdateNewsletter.mockReset()
    authHook.useAuth.mockReturnValue({
      token: 'token',
      user: { id: 5 },
      logout: logoutMock,
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders login when token is missing', () => {
    authHook.useAuth.mockReturnValue({ token: null })

    renderPage()

    expect(screen.getByText(/Connexion/i)).toBeInTheDocument()
  })

  it('loads profile data and updates newsletter with success messaging', async () => {
    userRepo.getProfile.mockResolvedValueOnce({
      lastname: 'Doe',
      firstname: 'Jane',
      email: 'jane@example.com',
      userPhone: '123',
      newsletter: false,
    })
    userRepo.patchUpdateNewsletter.mockResolvedValueOnce({ ok: true })

    renderPage()

    expect(await screen.findByText('Doe')).toBeInTheDocument()

    await user.click(screen.getByLabelText(/actualités/i))
    await user.click(screen.getByRole('button', { name: /Mettre à jour/i }))

    await waitFor(() =>
      expect(userRepo.patchUpdateNewsletter).toHaveBeenCalledWith(5, true)
    )
    expect(
      await screen.findByText(/Préférences mises à jour avec succès/i)
    ).toBeInTheDocument()

    act(() => jest.runOnlyPendingTimers())
    expect(screen.queryByText(/Préférences mises à jour avec succès/i)).toBeNull()
  })

  it('handles newsletter update errors and clears message after timeout', async () => {
    userRepo.getProfile.mockResolvedValueOnce({
      lastname: 'Doe',
      firstname: 'Jane',
      email: 'jane@example.com',
      userPhone: '123',
      newsletter: true,
    })
    userRepo.patchUpdateNewsletter.mockRejectedValueOnce(new Error('fail'))

    renderPage()

    await screen.findByText('Doe')
    await user.click(screen.getByRole('button', { name: /Mettre à jour/i }))

    await waitFor(() => expect(userRepo.patchUpdateNewsletter).toHaveBeenCalled())
    expect(await screen.findByText(/fail/i)).toBeInTheDocument()

    act(() => jest.runOnlyPendingTimers())
    expect(screen.queryByText(/fail/i)).toBeNull()
  })

  it('shows fetch errors and keeps placeholders when profile load fails', async () => {
    userRepo.getProfile.mockRejectedValueOnce(new Error('load-error'))

    renderPage()

    expect(await screen.findByText(/load-error/i)).toBeInTheDocument()
    expect(screen.getAllByText('Non renseigné')).toHaveLength(4)
  })

  it('navigates to reset password and triggers logout', async () => {
    userRepo.getProfile.mockResolvedValueOnce({
      lastname: 'Doe',
      firstname: 'Jane',
      email: 'jane@example.com',
      userPhone: '123',
      newsletter: true,
    })

    renderPage()

    await screen.findByText('Doe')

    await user.click(
      screen.getByRole('button', { name: /Modifier mon mot de passe/i })
    )
    expect(mockedNavigate).toHaveBeenCalledWith('/ResetPassword')

    await user.click(screen.getByRole('button', { name: /Se déconnecter/i }))
    expect(logoutMock).toHaveBeenCalled()
  })
})
