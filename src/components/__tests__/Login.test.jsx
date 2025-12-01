import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'

import Login from '../Login'
import { useAuth } from '../../context/AuthContext'
import { postLogin } from '../../repositories/userRepository'

jest.mock('../../context/AuthContext')
jest.mock('../../repositories/userRepository', () => ({
  postLogin: jest.fn(),
}))

describe('Login component', () => {
  const login = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useAuth.mockReturnValue({ login })
  })

  it('shows success message and calls login on valid credentials', async () => {
    postLogin.mockResolvedValue({
      accessToken: 'token',
      user: { isAdmin: true, name: 'Admin' },
    })

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await userEvent.type(screen.getByPlaceholderText('Email *'), 'user@test.com')
    await userEvent.type(
      screen.getByPlaceholderText('Mot de passe *'),
      'password123'
    )

    await userEvent.click(screen.getByRole('button', { name: 'Se connecter' }))

    await waitFor(() =>
      expect(
        screen.getByText('Connexion réussie ! Redirection en cours...')
      ).toBeInTheDocument()
    )

    expect(login).toHaveBeenCalledWith({
      accessToken: 'token',
      user: { isAdmin: true, name: 'Admin' },
    })
  })

  it('shows validation error when API returns invalid shape', async () => {
    postLogin.mockResolvedValue({})

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await userEvent.type(screen.getByPlaceholderText('Email *'), 'user@test.com')
    await userEvent.type(
      screen.getByPlaceholderText('Mot de passe *'),
      'password123'
    )

    await userEvent.click(screen.getByRole('button', { name: 'Se connecter' }))

    await waitFor(() =>
      expect(
        screen.getByText('Données de connexion invalides')
      ).toBeInTheDocument()
    )
  })

  it('surfaces API errors', async () => {
    postLogin.mockRejectedValue(new Error('Invalid credentials'))

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await userEvent.type(screen.getByPlaceholderText('Email *'), 'user@test.com')
    await userEvent.type(
      screen.getByPlaceholderText('Mot de passe *'),
      'password123'
    )

    await userEvent.click(screen.getByRole('button', { name: 'Se connecter' }))

    await waitFor(() =>
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    )
  })
})
