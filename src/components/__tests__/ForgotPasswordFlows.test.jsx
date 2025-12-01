import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RequestEmail from '../forgotPassword/RequestEmail'
import ResetPassword from '../forgotPassword/ResetforgotPassword'
import { PasswordResetProvider } from '../../context/PasswordResetContext'

jest.mock('../../context/PasswordResetContext', () => {
  const React = require('react')
  const PasswordResetContext = React.createContext()

  const PasswordResetProvider = ({ children, initialEmail = '' }) => {
    const [email, setEmail] = React.useState(initialEmail)

    return (
      <PasswordResetContext.Provider value={{ email, setEmail }}>
        {children}
      </PasswordResetContext.Provider>
    )
  }

  const usePasswordReset = () => React.useContext(PasswordResetContext)

  return {
    __esModule: true,
    PasswordResetProvider,
    usePasswordReset,
  }
})

jest.mock('../../repositories/userRepository', () => ({
  postEmailForgotPassword: jest.fn().mockResolvedValue({ message: 'ok' }),
  postResetForgotPassword: jest.fn().mockResolvedValue({ message: 'done' }),
}))

const mockedNavigate = jest.fn()

jest.mock('react-router-dom', () => {
  const actualRouter = jest.requireActual('react-router-dom')

  return {
    ...actualRouter,
    useNavigate: () => mockedNavigate,
  }
})

const userRepo = require('../../repositories/userRepository')

const renderWithProvider = (ui, initialEntries = ['/']) =>
  render(
    <PasswordResetProvider>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </PasswordResetProvider>
  )

describe('Forgot password flows', () => {
  let user

  beforeEach(() => {
    jest.useFakeTimers()
    user =
      typeof userEvent.setup === 'function'
        ? userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
        : userEvent
    localStorage.clear()
    mockedNavigate.mockReset()
    userRepo.postEmailForgotPassword.mockResolvedValue({ message: 'ok' })
    userRepo.postResetForgotPassword.mockResolvedValue({ message: 'done' })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('submits reset email and stores address', async () => {
    renderWithProvider(<RequestEmail />)
    await user.type(screen.getByPlaceholderText(/Adresse mail/i), 'a@example.com')
    await user.click(screen.getByRole('button', { name: /Envoyer le code/i }))

    await waitFor(() => expect(userRepo.postEmailForgotPassword).toHaveBeenCalledWith('a@example.com'))
    expect(localStorage.getItem('resetEmail')).toBe('a@example.com')
  })

  it('shows backend error on email submit failure', async () => {
    userRepo.postEmailForgotPassword.mockRejectedValueOnce(new Error('bad'))
    renderWithProvider(<RequestEmail />)

    await user.type(screen.getByPlaceholderText(/Adresse mail/i), 'b@example.com')
    await user.click(screen.getByRole('button', { name: /Envoyer le code/i }))

    await waitFor(() => expect(screen.getByText(/bad/)).toBeInTheDocument())
  })

  it('falls back to default success message when backend has none', async () => {
    userRepo.postEmailForgotPassword.mockResolvedValueOnce({})
    renderWithProvider(<RequestEmail />)

    await user.type(screen.getByPlaceholderText(/Adresse mail/i), 'fallback@example.com')
    await user.click(screen.getByRole('button', { name: /Envoyer le code/i }))

    expect(
      await screen.findByText(/Email de réinitialisation envoyé avec succès/i)
    ).toBeInTheDocument()
  })

  it('navigates back from request email screen', async () => {
    renderWithProvider(<RequestEmail />)
    await user.click(screen.getByRole('button', { name: /Retour/i }))
    expect(mockedNavigate).toHaveBeenCalledWith('/Profil')
  })

  it('validates token and password match before submission', async () => {
    localStorage.setItem('resetEmail', 'stored@example.com')

    renderWithProvider(<ResetPassword />, ['/?token=abc'])

    const [pwdInput, confirmInput] = screen.getAllByPlaceholderText(/mot de passe/i)

    await user.type(pwdInput, 'one')
    await user.type(confirmInput, 'two')
    await user.click(screen.getByRole('button', { name: /Changer le mot de passe/i }))

    expect(await screen.findByText(/Les mots de passe ne correspondent pas/i)).toBeInTheDocument()

    await user.clear(confirmInput)
    await user.type(confirmInput, 'one')
    await user.click(screen.getByRole('button', { name: /Changer le mot de passe/i }))

    await waitFor(() =>
      expect(userRepo.postResetForgotPassword).toHaveBeenCalledWith('stored@example.com', 'abc', 'one')
    )
    expect(await screen.findByText(/done/i)).toBeInTheDocument()
  })

  it('shows invalid token error', async () => {
    renderWithProvider(<ResetPassword />, ['/'])

    await user.type(screen.getAllByPlaceholderText(/mot de passe/i)[0], 'pass')
    await user.type(screen.getAllByPlaceholderText(/mot de passe/i)[1], 'pass')
    await user.click(screen.getByRole('button', { name: /Changer le mot de passe/i }))

    expect(await screen.findByText(/lien de réinitialisation est invalide/i)).toBeInTheDocument()
  })

  it('handles reset backend error and success navigation', async () => {
    userRepo.postResetForgotPassword.mockRejectedValueOnce(new Error('boom'))
    renderWithProvider(<ResetPassword />, ['/?token=valid'])

    const [pwdInput, confirmInput] = screen.getAllByPlaceholderText(/mot de passe/i)
    await user.type(pwdInput, 'secret')
    await user.type(confirmInput, 'secret')
    await user.click(screen.getByRole('button', { name: /Changer le mot de passe/i }))

    await waitFor(() => expect(userRepo.postResetForgotPassword).toHaveBeenCalledTimes(1))
    expect(await screen.findByText(/boom/i)).toBeInTheDocument()

    userRepo.postResetForgotPassword.mockResolvedValueOnce({ message: 'done' })
    await user.click(screen.getByRole('button', { name: /Changer le mot de passe/i }))
    await waitFor(() => expect(userRepo.postResetForgotPassword).toHaveBeenCalledTimes(2))
    expect(await screen.findByText(/done/i)).toBeInTheDocument()
    act(() => jest.advanceTimersByTime(2100))
    expect(mockedNavigate).toHaveBeenCalledWith('/Profil')
  })

  it('falls back to default message when backend omits text', async () => {
    userRepo.postResetForgotPassword.mockResolvedValueOnce({})
    renderWithProvider(<ResetPassword />, ['/?token=tokened'])

    const [pwdInput, confirmInput] = screen.getAllByPlaceholderText(/mot de passe/i)
    await user.type(pwdInput, 'secret')
    await user.type(confirmInput, 'secret')
    await user.click(screen.getByRole('button', { name: /Changer le mot de passe/i }))

    expect(
      await screen.findByText(/Mot de passe réinitialisé avec succès/i)
    ).toBeInTheDocument()
  })

  it('skips storage hydration when email already exists', async () => {
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem')

    render(
      <PasswordResetProvider initialEmail="preset@example.com">
        <MemoryRouter initialEntries={['/?token=preset']}>
          <ResetPassword />
        </MemoryRouter>
      </PasswordResetProvider>
    )

    const [pwdInput, confirmInput] = screen.getAllByPlaceholderText(/mot de passe/i)
    await user.type(pwdInput, 'secret')
    await user.type(confirmInput, 'secret')
    await user.click(screen.getByRole('button', { name: /Changer le mot de passe/i }))

    await waitFor(() =>
      expect(userRepo.postResetForgotPassword).toHaveBeenCalledWith('preset@example.com', 'preset', 'secret')
    )
    expect(getItemSpy).not.toHaveBeenCalled()
    getItemSpy.mockRestore()
  })
})
