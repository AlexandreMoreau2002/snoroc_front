import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import Signup from '../visitor/Signup'

jest.mock('../../repositories/userRepository', () => ({
  postSignUp: jest.fn(),
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

const userRepo = require('../../repositories/userRepository')
const authHook = require('../../context/AuthContext')

describe('Signup page', () => {
  let user
  let loginMock
  let setSignupEmailMock

  const renderSignup = () =>
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )

  const fillForm = async ({
    lastname = 'Doe',
    firstname = 'Jane',
    email = 'user@example.com',
    phone = '0123456789',
    civility = 'Mr',
    password = 'secret',
    confirm = 'secret',
    newsletter = true,
  } = {}) => {
    await user.type(screen.getByPlaceholderText('Nom'), lastname)
    await user.type(screen.getByPlaceholderText('Prénom'), firstname)
    await user.type(screen.getByPlaceholderText('Email'), email)
    await user.type(screen.getByPlaceholderText('Téléphone'), phone)

    await user.selectOptions(screen.getByRole('combobox'), civility)
    await user.type(screen.getByPlaceholderText('Mot de passe'), password)
    await user.type(screen.getByPlaceholderText('Confirmer le mot de passe'), confirm)

    const checkbox = screen.getByRole('checkbox', {
      name: /Souhaitez-vous recevoir les actualités/i,
    })

    if (!newsletter && checkbox.checked) {
      await user.click(checkbox)
    }
  }

  beforeEach(() => {
    jest.useFakeTimers()
    user =
      typeof userEvent.setup === 'function'
        ? userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
        : userEvent
    mockedNavigate.mockReset()
    loginMock = jest.fn()
    setSignupEmailMock = jest.fn()
    authHook.useAuth.mockReturnValue({ login: loginMock, setSignupEmail: setSignupEmailMock })
    userRepo.postSignUp.mockReset()
    localStorage.clear()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('blocks submission when passwords differ', async () => {
    renderSignup()

    await fillForm({ confirm: 'other' })
    await user.click(screen.getByRole('button', { name: "S'inscrire" }))

    expect(await screen.findByText(/ne correspondent pas/i)).toBeInTheDocument()
    expect(userRepo.postSignUp).not.toHaveBeenCalled()
  })

  it('shows invalid email message', async () => {
    renderSignup()

    await fillForm({ email: 'bad-email' })
    await user.click(screen.getByRole('button', { name: "S'inscrire" }))

    expect(
      await screen.findByText("L'email n’est pas valide, veuillez entrer un email correct."),
    ).toBeInTheDocument()
    expect(userRepo.postSignUp).not.toHaveBeenCalled()
  })

  it('logs in and navigates after successful signup with token', async () => {
    userRepo.postSignUp.mockResolvedValue({ accessToken: 'token', user: { isAdmin: false } })
    renderSignup()

    await fillForm({ email: ' new@example.com ', phone: '0123456789' })
    await user.click(screen.getByRole('button', { name: "S'inscrire" }))

    await waitFor(() => expect(userRepo.postSignUp).toHaveBeenCalledTimes(1))
    expect(userRepo.postSignUp).toHaveBeenCalledWith({
      civility: 'Mr',
      email: 'new@example.com',
      firstname: 'Jane',
      lastname: 'Doe',
      newsletter: true,
      password: 'secret',
      userPhone: '+33123456789',
    })
    expect(setSignupEmailMock).toHaveBeenCalledWith('new@example.com')
    expect(loginMock).toHaveBeenCalledWith({ accessToken: 'token', user: { isAdmin: false } })
    expect(
      await screen.findByText(/Inscription réussie ! Connexion automatique en cours.../i),
    ).toBeInTheDocument()

    act(() => jest.runOnlyPendingTimers())
    expect(mockedNavigate).toHaveBeenCalledWith('/verifyEmail')
  })

  it('shows fallback success when backend lacks tokens and respects newsletter toggle', async () => {
    userRepo.postSignUp.mockResolvedValue({})
    renderSignup()

    await fillForm({ email: 'alt@example.com', phone: '+33123456789', newsletter: false })
    await user.click(screen.getByRole('button', { name: "S'inscrire" }))

    await waitFor(() => expect(userRepo.postSignUp).toHaveBeenCalledTimes(1))
    expect(userRepo.postSignUp).toHaveBeenCalledWith({
      civility: 'Mr',
      email: 'alt@example.com',
      firstname: 'Jane',
      lastname: 'Doe',
      newsletter: false,
      password: 'secret',
      userPhone: '+33123456789',
    })
    expect(loginMock).not.toHaveBeenCalled()
    expect(await screen.findByText(/Inscription réussie ! Veuillez vérifier votre email./i)).toBeInTheDocument()

    act(() => jest.runOnlyPendingTimers())
    expect(mockedNavigate).toHaveBeenCalledWith('/verifyEmail')
  })

  it('shows backend error when signup fails', async () => {
    userRepo.postSignUp.mockRejectedValueOnce(new Error('server down'))
    renderSignup()

    await fillForm()
    await user.click(screen.getByRole('button', { name: "S'inscrire" }))

    expect(await screen.findByText(/server down/i)).toBeInTheDocument()
    expect(mockedNavigate).not.toHaveBeenCalled()
  })
})
