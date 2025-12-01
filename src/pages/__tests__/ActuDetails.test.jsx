import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import ActuDetails from '../visitor/ActuDetails'
import { getNewsById } from '../../repositories/newsRepository'

jest.mock('../../repositories/newsRepository', () => ({
  getNewsById: jest.fn(),
}))

const mockedNavigate = jest.fn()

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

const renderWithRoutes = (initialEntry) => (
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/actus" element={<ActuDetails />} />
          <Route path="/actus/:id" element={<ActuDetails />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  )
)

describe('ActuDetails', () => {
  beforeEach(() => {
    mockedNavigate.mockReset()
    getNewsById.mockReset()
  })

  it('renders fetched content with formatted date and paragraphs', async () => {
    const formattedDate = new Date('2024-01-02').toLocaleDateString('fr-FR')
    getNewsById.mockResolvedValueOnce({
      title: 'Hello',
      date: '2024-01-02',
      content: 'First paragraph\n\nSecond paragraph',
      thumbnail: '/thumb.jpg',
    })

    renderWithRoutes('/actus/42')

    await waitFor(() => expect(getNewsById).toHaveBeenCalledWith('42'))
    expect(await screen.findByRole('heading', { level: 1, name: 'Hello' })).toBeInTheDocument()
    expect(screen.getByText(formattedDate)).toBeInTheDocument()
    expect(screen.getAllByText(/paragraph/)).toHaveLength(2)
    expect(screen.getByRole('img', { name: 'Hello' })).toHaveAttribute('src', '/thumb.jpg')
  })

  it('avoids fetch when no id is provided and navigates back to listing', async () => {
    renderWithRoutes('/actus')

    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(getNewsById).not.toHaveBeenCalled()
    expect(mockedNavigate).toHaveBeenCalledWith('/actus/all')
  })

  it('uses history navigation when available', async () => {
    getNewsById.mockResolvedValueOnce({
      title: 'Back nav',
      date: '2024-02-10',
      content: 'Body',
      thumbnail: '/thumb.jpg',
    })
    window.history.replaceState({ idx: 2 }, '')

    renderWithRoutes('/actus/7')

    await waitFor(() => expect(screen.getByText('Back nav')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(mockedNavigate).toHaveBeenCalledWith(-1)
  })

  it('falls back to createdAt when date is missing and renders empty content', async () => {
    const formattedDate = new Date('2024-03-03').toLocaleDateString('fr-FR')
    getNewsById.mockResolvedValueOnce({
      title: 'Created only',
      createdAt: '2024-03-03',
      thumbnail: '/created.jpg',
    })

    renderWithRoutes('/actus/12')

    expect(await screen.findByText('Created only')).toBeInTheDocument()
    expect(screen.getByText(formattedDate)).toBeInTheDocument()
    const paragraphs = document.querySelectorAll('.news-detail__body p')
    expect(paragraphs).toHaveLength(1)
  })

  it('handles fetch errors gracefully and leaves details empty', async () => {
    getNewsById.mockRejectedValueOnce(new Error('fail'))

    renderWithRoutes('/actus/99')

    await waitFor(() => expect(getNewsById).toHaveBeenCalledWith('99'))
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retour' })).toBeInTheDocument()
  })

  it('omits the date meta when the provided value is invalid and falls back to simple content', async () => {
    getNewsById.mockResolvedValueOnce({
      title: 'No date',
      createdAt: 'invalid-date',
      content: '   ',
      thumbnail: '/thumb.jpg',
    })

    renderWithRoutes('/actus/5')

    await waitFor(() => expect(screen.getByText('No date')).toBeInTheDocument())
    expect(document.querySelector('.news-detail__date')).toBeNull()
    const paragraphs = document.querySelectorAll('.news-detail__body p')
    expect(paragraphs).toHaveLength(1)
  })
})
