import { render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import About from '../visitor/About'
import Home from '../visitor/Home'
import Contact from '../visitor/Contact'
import { AuthProvider } from '../../context/AuthContext'
import { LoadingProvider } from '../../context/LoadingContext'
import { PasswordResetProvider } from '../../context/PasswordResetContext'

jest.mock('../../context/RoleContext', () => ({
  useTheme: () => ({ toggleTheme: jest.fn() }),
  ThemeProvider: ({ children }) => <>{children}</>,
}))

jest.mock('../../repositories/aboutRepository', () => ({
  getAbout: jest.fn().mockResolvedValue({ title: 'À propos', description: 'desc', image: '' }),
}))

jest.mock('../../repositories/newsRepository', () => ({
  getAllNews: jest.fn().mockResolvedValue([]),
}))

jest.mock('../../repositories/contactRepository', () => ({
  createContactMessage: jest.fn().mockResolvedValue({ message: 'ok' }),
}))

describe('Visitor pages smoke tests', () => {
  const renderWithProviders = (ui, initialEntries = ['/']) =>
    render(
      <HelmetProvider>
        <AuthProvider>
          <PasswordResetProvider>
            <LoadingProvider>
              <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
            </LoadingProvider>
          </PasswordResetProvider>
        </AuthProvider>
      </HelmetProvider>
    )

  it('renders About page title', async () => {
    renderWithProviders(<About />)
    expect(await screen.findByText(/Snoroc/i)).toBeInTheDocument()
  })

  it('renders Home page sections', async () => {
    renderWithProviders(<Home />)
    expect(await screen.findByText(/Actus/i)).toBeInTheDocument()
  })

  it('renders Contact form fields', () => {
    renderWithProviders(
      <Routes>
        <Route path="/contact" element={<Contact />} />
      </Routes>,
      ['/contact']
    )
    expect(screen.getByText(/Contact/i)).toBeInTheDocument()
  })
})
