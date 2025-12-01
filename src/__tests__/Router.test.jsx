import { render, screen } from '@testing-library/react'
import React from 'react'

import Router from '../Router'
import { useLoading } from '../context/LoadingContext'

jest.mock('../context/LoadingContext')

jest.mock('../components/export', () => {
  const React = require('react')
  const { Outlet } = require('react-router-dom')

  return {
    Header: () => <div data-testid="header" />,
    Footer: () => <div data-testid="footer" />,
    Loader: () => <div data-testid="loader" />,
    PrivateRoute: () => (
      <div data-testid="private-route">
        <Outlet />
      </div>
    ),
  }
})

jest.mock('../pages/admin/export', () => ({
  CreateNews: () => <div>Admin create news</div>,
  EditAbout: () => <div>Admin edit about</div>,
}))

jest.mock('../pages/visitor/export', () => ({
  Home: () => <div>Home page</div>,
  Event: () => <div>Event page</div>,
  Media: () => <div>Media page</div>,
  About: () => <div>About page</div>,
  Signup: () => <div>Signup page</div>,
  Contact: () => <div>Contact page</div>,
  Profile: () => <div>Profile page</div>,
  AllActus: () => <div>All actus</div>,
  ActuDetails: () => <div>Actu details</div>,
  LegalNotice: () => <div>Legal notice</div>,
  VerifyEmail: () => <div>Verify email</div>,
  ResetPassword: () => <div>Reset password</div>,
  ForgotPassword: () => <div>Forgot password</div>,
  TermsOfService: () => <div>Terms</div>,
}))

describe('Router shell', () => {
  it('renders header/footer and initial route without loader', () => {
    useLoading.mockReturnValue({ isLoading: false })

    render(<Router />)

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByText('Home page')).toBeInTheDocument()
    expect(screen.queryByTestId('loader')).toBeNull()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
    expect(document.querySelector('.app-loading')).not.toHaveClass(
      'app-loading--active'
    )
  })

  it('activates loader overlay when loading', () => {
    useLoading.mockReturnValue({ isLoading: true })

    render(<Router />)

    expect(screen.getByTestId('loader')).toBeInTheDocument()
    expect(document.querySelector('.app-loading')).toHaveClass(
      'app-loading--active'
    )
  })
})
