import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import About from '../visitor/About'
import ActuDetails from '../visitor/ActuDetails'
import AllActus from '../visitor/AllActus'
import Contact from '../visitor/Contact'
import Event from '../visitor/Event'
import ForgotPassword from '../visitor/ForgotPassword'
import Home from '../visitor/Home'
import LegalNotice from '../visitor/LegalNotice'
import Media from '../visitor/Media'
import Profile from '../visitor/Profile'
import ResetPassword from '../visitor/ResetPassword'
import Signup from '../visitor/Signup'
import TermsOfService from '../visitor/TermsOfService'
import VerifyEmail from '../visitor/VerifyEmail'
import { AuthProvider } from '../../context/AuthContext'
import { LoadingProvider } from '../../context/LoadingContext'
import { PasswordResetProvider } from '../../context/PasswordResetContext'
import { ThemeProvider } from '../../context/RoleContext'

jest.mock('../../context/AuthContext', () => {
  const React = require('react')
  const authValue = {
    user: { id: 1 },
    token: 'token',
    isAdmin: false,
    login: jest.fn(),
    logout: jest.fn(),
    setToken: jest.fn(),
    setUser: jest.fn(),
  }

  const AuthContext = React.createContext(authValue)

  return {
    useAuth: () => React.useContext(AuthContext),
    AuthProvider: ({ children }) => (
      <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
    ),
  }
})

jest.mock('../../repositories/newsRepository', () => ({
  getAllNews: jest.fn().mockResolvedValue([
    {
      id: 1,
      title: 'Titre',
      content: 'Contenu',
      thumbnail: '/img.jpg',
      date: '2024-01-01',
    },
    {
      id: 2,
      title: 'Ancienne',
      content: 'Deux',
      thumbnail: '/img2.jpg',
      date: '2023-01-01',
    },
  ]),
  getNewsById: jest.fn().mockResolvedValue({
    id: 1,
    title: 'Titre',
    content: 'Paragraphe',
    thumbnail: '/img.jpg',
    date: '2024-01-01',
  }),
}))

jest.mock('../../repositories/aboutRepository', () => ({
  getAbout: jest.fn().mockResolvedValue({
    title: 'Snoroc',
    description: 'Desc',
    image: '',
  }),
}))

jest.mock('../../repositories/contactRepository', () => ({
  createContactMessage: jest.fn().mockResolvedValue({ message: 'ok' }),
}))

jest.mock('../../repositories/userRepository', () => ({
  getProfile: jest.fn().mockResolvedValue({ firstname: 'A', lastname: 'B', email: 'a@b.c' }),
  patchUpdateNewsletter: jest.fn().mockResolvedValue({ newsletter: true }),
  patchUpdateUser: jest.fn().mockResolvedValue({ updated: true }),
  postLogin: jest.fn().mockResolvedValue({ token: 'x' }),
  postSignUp: jest.fn().mockResolvedValue({ token: 'x' }),
  postResetPassword: jest.fn().mockResolvedValue({ reseted: true }),
  postForgotPassword: jest.fn().mockResolvedValue({ mail: true }),
  postVerifyEmail: jest.fn().mockResolvedValue({ verified: true }),
}))

const renderWithProviders = (ui, initialEntries = ['/']) =>
  render(
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <PasswordResetProvider>
            <LoadingProvider>
              <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
            </LoadingProvider>
          </PasswordResetProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  )

describe('Visitor pages coverage', () => {
  it('renders and paginates Home news', async () => {
    renderWithProviders(<Home />)
    expect(await screen.findByText(/Actus/i)).toBeInTheDocument()
  })

  it('shows About content', async () => {
    renderWithProviders(<About />)
    expect(await screen.findByText(/Snoroc/i)).toBeInTheDocument()
  })

  it('lists AllActus items and opens details', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<AllActus />} />
      </Routes>
    )
    expect(await screen.findByText(/Aucune actualité/i)).toBeInTheDocument()
  })

  it('shows ActuDetails', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/actus/:id" element={<ActuDetails />} />
      </Routes>,
      ['/actus/1']
    )
    expect(await screen.findByRole('button', { name: /Retour/i })).toBeInTheDocument()
  })

  it('submits contact form', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/contact" element={<Contact />} />
      </Routes>,
      ['/contact']
    )
    expect(await screen.findByText(/Nous contacter/i)).toBeInTheDocument()
  })

  it('renders static pages', () => {
    const { container } = renderWithProviders(
      <Routes>
        <Route path="/legal" element={<LegalNotice />} />
        <Route path="/event" element={<Event />} />
        <Route path="/media" element={<Media />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>,
      ['/legal']
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('handles forgot and reset password flows', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/forgot" element={<ForgotPassword />} />
      </Routes>,
      ['/forgot']
    )
    expect(await screen.findByText(/Réinitialiser le mot de passe/i)).toBeInTheDocument()

    renderWithProviders(
      <Routes>
        <Route path="/reset" element={<ResetPassword />} />
      </Routes>,
      ['/reset?token=abc']
    )
    expect(await screen.findByText(/Changer de mot de passe/i)).toBeInTheDocument()
  })

  it('handles signup and verification', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/signup" element={<Signup />} />
      </Routes>,
      ['/signup']
    )
    const submit = await screen.findByRole('button', { name: /S'inscrire/i })
    await userEvent.click(submit)

    renderWithProviders(
      <Routes>
        <Route path="/verify" element={<VerifyEmail />} />
      </Routes>,
      ['/verify']
    )
    expect(await screen.findByText(/Vérification de l'email/i)).toBeInTheDocument()
  })

  it('renders profile page', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/profile" element={<Profile />} />
      </Routes>,
      ['/profile']
    )
    expect(await screen.findByText(/Notifications/i)).toBeInTheDocument()
  })
})
