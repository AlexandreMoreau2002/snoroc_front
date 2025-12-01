import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import VerifyEmail from '../visitor/VerifyEmail'

const mockNavigate = jest.fn()
const loginMock = jest.fn()

jest.mock('react-router-dom', () => {
  const actualRouter = jest.requireActual('react-router-dom')
  return {
    ...actualRouter,
    useNavigate: () => mockNavigate,
  }
})

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}))

jest.mock('../../repositories/userRepository', () => ({
  postVerifyEmail: jest.fn(),
}))

const { useAuth } = require('../../context/AuthContext')
const userRepo = require('../../repositories/userRepository')

const renderComponent = (email = 'user@example.com') => {
  useAuth.mockReturnValue({ email, login: loginMock })

  return render(
    <MemoryRouter>
      <VerifyEmail />
    </MemoryRouter>
  )
}

describe('VerifyEmail', () => {
  let user

  beforeEach(() => {
    jest.useFakeTimers()
    mockNavigate.mockReset()
    loginMock.mockReset()
    userRepo.postVerifyEmail.mockReset()
    user =
      typeof userEvent.setup === 'function'
        ? userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
        : userEvent
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const typeCode = async (code) => {
    const inputs = screen.getAllByRole('textbox')
    for (let i = 0; i < code.length; i += 1) {
      await user.type(inputs[i], code[i])
    }
    return inputs
  }

  it('logs in and redirects to news when backend returns access token', async () => {
    userRepo.postVerifyEmail.mockResolvedValue({
      data: { accessToken: 'token', user: { id: 1 } },
    })
    renderComponent()

    await typeCode('123456')

    await waitFor(() =>
      expect(userRepo.postVerifyEmail).toHaveBeenCalledWith({
        email: 'user@example.com',
        emailVerificationToken: '123456',
      })
    )

    expect(loginMock).toHaveBeenCalledWith({ accessToken: 'token', user: { id: 1 } })
    expect(
      await screen.findByText(/Email vérifié avec succès ! Connexion automatique/i)
    ).toBeInTheDocument()

    act(() => jest.advanceTimersByTime(2000))
    expect(mockNavigate).toHaveBeenCalledWith('/news')
  })

  it('shows fallback success message and redirects to login when no token is present', async () => {
    userRepo.postVerifyEmail.mockResolvedValue({ data: { message: 'custom message' } })
    renderComponent('other@example.com')

    const inputs = screen.getAllByRole('textbox')
    fireEvent.paste(inputs[0], {
      clipboardData: {
        getData: () => '987654',
      },
    })

    await waitFor(() =>
      expect(userRepo.postVerifyEmail).toHaveBeenCalledWith({
        email: 'other@example.com',
        emailVerificationToken: '987654',
      })
    )

    expect(loginMock).not.toHaveBeenCalled()
    expect(await screen.findByText(/custom message/i)).toBeInTheDocument()

    act(() => jest.advanceTimersByTime(3000))
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('falls back to default success messaging when backend is silent', async () => {
    userRepo.postVerifyEmail.mockResolvedValue({ data: {} })
    renderComponent('default@example.com')

    await typeCode('222222')

    await waitFor(() =>
      expect(userRepo.postVerifyEmail).toHaveBeenCalledWith({
        email: 'default@example.com',
        emailVerificationToken: '222222',
      })
    )

    expect(
      await screen.findByText(/Email vérifié avec succès ! Redirection en cours/i)
    ).toBeInTheDocument()

    act(() => jest.advanceTimersByTime(3000))
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('displays errors and keeps inputs enabled when verification fails', async () => {
    userRepo.postVerifyEmail.mockRejectedValue(new Error('invalid code'))
    renderComponent('error@example.com')

    const inputs = await typeCode('654321')
    await waitFor(() => expect(screen.getByText(/invalid code/i)).toBeInTheDocument())

    inputs.forEach((input) => expect(input).not.toBeDisabled())
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('ignores non-digit input and keeps focus progression logic intact', async () => {
    userRepo.postVerifyEmail.mockResolvedValue({ data: { message: 'ok' } })
    renderComponent()

    const inputs = screen.getAllByRole('textbox')
    await user.type(inputs[0], 'a')
    expect(inputs[0]).toHaveValue('')

    await user.type(inputs[0], '1')
    expect(inputs[1]).toHaveFocus()
  })

  it('ignores pasted values that are too short to trigger submission', () => {
    userRepo.postVerifyEmail.mockResolvedValue({})
    renderComponent('short@example.com')

    const inputs = screen.getAllByRole('textbox')
    fireEvent.paste(inputs[0], {
      clipboardData: {
        getData: () => '12',
      },
    })

    expect(userRepo.postVerifyEmail).not.toHaveBeenCalled()
    expect(inputs[0]).toHaveValue('')
  })
})
