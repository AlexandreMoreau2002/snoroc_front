import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { AuthProvider, useAuth } from '../AuthContext'
import { mockToggleTheme as toggleThemeMock } from '../RoleContext'

jest.mock('../RoleContext', () => {
  const mockToggleTheme = jest.fn()
  return {
    __esModule: true,
    useTheme: () => ({ toggleTheme: mockToggleTheme }),
    ThemeProvider: ({ children }) => <>{children}</>,
    mockToggleTheme,
  }
})

afterEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
})

const AuthConsumer = () => {
  const { token, user, isAdmin, email, login, logout, setSignupEmail } = useAuth()
  return (
    <div>
      <p data-testid="token">{token || 'none'}</p>
      <p data-testid="user">{user ? user.name : 'guest'}</p>
      <p data-testid="isAdmin">{isAdmin ? 'admin' : 'user'}</p>
      <p data-testid="email">{email || 'none'}</p>
      <button
        type="button"
        onClick={() => login({ accessToken: 'abc', user: { name: 'Alice', isAdmin: true } })}
      >
        login-admin
      </button>
      <button
        type="button"
        onClick={() => login({ accessToken: 'xyz', user: { name: 'Bob', isAdmin: false } })}
      >
        login-user
      </button>
      <button type="button" onClick={logout}>
        logout
      </button>
      <button type="button" onClick={() => setSignupEmail('signup@example.com')}>
        set-email
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  it('hydrates from localStorage and toggles theme for admin', () => {
    localStorage.setItem('token', 'persisted')
    localStorage.setItem('user', JSON.stringify({ name: 'Stored', isAdmin: true }))

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    expect(screen.getByTestId('token')).toHaveTextContent('persisted')
    expect(screen.getByTestId('user')).toHaveTextContent('Stored')
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('admin')
    expect(toggleThemeMock).toHaveBeenCalledWith('red')
  })

  it('handles login, logout, and signup email while switching themes', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    expect(screen.getByTestId('token')).toHaveTextContent('none')
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('user')
    expect(toggleThemeMock).toHaveBeenCalledWith('blue')

    await userEvent.click(screen.getByText('login-admin'))
    expect(screen.getByTestId('token')).toHaveTextContent('abc')
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('admin')
    expect(toggleThemeMock).toHaveBeenLastCalledWith('red')
    expect(localStorage.getItem('token')).toBe('abc')

    await userEvent.click(screen.getByText('set-email'))
    expect(screen.getByTestId('email')).toHaveTextContent('signup@example.com')
    expect(localStorage.getItem('email')).toBe('signup@example.com')

    await userEvent.click(screen.getByText('logout'))
    expect(screen.getByTestId('token')).toHaveTextContent('none')
    expect(screen.getByTestId('user')).toHaveTextContent('guest')
    expect(toggleThemeMock).toHaveBeenLastCalledWith('blue')
    expect(localStorage.getItem('token')).toBeNull()

    await userEvent.click(screen.getByText('login-user'))
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('user')
    expect(toggleThemeMock).toHaveBeenLastCalledWith('blue')
  })
})
