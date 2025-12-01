import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ForgotPassword from '../visitor/ForgotPassword'

jest.mock('../../components/forgotPassword/RequestEmail', () => () => (
  <div data-testid="request-email">RequestEmail</div>
))

jest.mock('../../components/forgotPassword/ResetforgotPassword', () => ({ token }) => (
  <div data-testid="reset-password">Reset-{token}</div>
))

describe('ForgotPassword page', () => {
  const renderWithRoute = (route = '/forgot') =>
    render(
      <MemoryRouter initialEntries={[route]}>
        <ForgotPassword />
      </MemoryRouter>
    )

  it('shows the email request form when no token is present', () => {
    renderWithRoute('/forgot')
    expect(screen.getByTestId('request-email')).toBeInTheDocument()
  })

  it('renders the reset form when a token is provided', () => {
    renderWithRoute('/forgot?token=my-token')
    expect(screen.getByTestId('reset-password')).toHaveTextContent('Reset-my-token')
  })
})
