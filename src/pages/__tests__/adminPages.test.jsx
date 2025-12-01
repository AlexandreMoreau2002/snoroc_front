import { render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import CreateNews from '../admin/CreateNews'
import EditAbout from '../admin/EditAbout'
import { AuthProvider } from '../../context/AuthContext'
import { ThemeProvider } from '../../context/RoleContext'

jest.mock('../../repositories/newsRepository', () => ({
  postNews: jest.fn().mockResolvedValue({ message: 'created' }),
  getNewsById: jest.fn().mockResolvedValue({ id: 1, title: 'Loaded', content: 'content' }),
  updateNews: jest.fn().mockResolvedValue({ message: 'updated' }),
}))

jest.mock('../../repositories/aboutRepository', () => ({
  getAbout: jest.fn().mockResolvedValue({ title: 'About title', description: 'desc', image: null }),
  updateAbout: jest.fn().mockResolvedValue({ message: 'saved' }),
}))

const renderWithAuth = (ui, initialEntries = ['/']) =>
  render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  )

describe('Admin pages smoke tests', () => {
  it('renders CreateNews page', () => {
    renderWithAuth(
      <Routes>
        <Route path="/" element={<CreateNews />} />
      </Routes>
    )
    expect(screen.getByText(/Créer une actualité/i)).toBeInTheDocument()
  })

  it('renders EditAbout page', () => {
    renderWithAuth(
      <Routes>
        <Route path="/" element={<EditAbout />} />
      </Routes>
    )
    expect(screen.getByText(/Modifier le contenu/i)).toBeInTheDocument()
  })
})
