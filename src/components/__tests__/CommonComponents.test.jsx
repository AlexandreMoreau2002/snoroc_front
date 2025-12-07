import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'

import Button from '../Button'
import ConfirmationModal from '../ConfirmationModal'
import Footer from '../Footer'
import Loader from '../Loader'
import Pagination from '../Pagination/Pagination'
import SearchBar from '../SearchBar'
import WorkInProgress from '../WorkInProgress'
import { useLoading } from '../../context/LoadingContext'

jest.mock('../../context/LoadingContext')

describe('Shared components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders Button variants and forwards events', async () => {
    const handleClick = jest.fn()

    render(
      <Button variant="secondary" className="extra" onClick={handleClick}>
        Action
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Action' })

    expect(button).toHaveClass('btn btn--secondary extra')

    await userEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders SearchBar with clear and change handling', async () => {
    const handleChange = jest.fn()

    render(<SearchBar value="abc" onChange={handleChange} placeholder="Search" />)

    const input = screen.getByPlaceholderText('Search')
    expect(input).toHaveValue('abc')

    await userEvent.type(input, 'd')
    expect(handleChange).toHaveBeenLastCalledWith('abcd')

    await userEvent.click(screen.getByRole('button', { name: 'Effacer la recherche' }))
    expect(handleChange).toHaveBeenLastCalledWith('')
  })

  it('renders pagination layouts and triggers page changes', async () => {
    const handleChange = jest.fn()

    const { rerender } = render(
      <Pagination totalPages={5} currentPage={3} onPageChange={handleChange} />
    )

    await userEvent.click(screen.getByRole('button', { name: '2' }))
    await userEvent.click(screen.getByRole('button', { name: '4' }))

    expect(handleChange).toHaveBeenNthCalledWith(1, 2)
    expect(handleChange).toHaveBeenNthCalledWith(2, 4)

    rerender(<Pagination totalPages={1} currentPage={1} onPageChange={handleChange} />)
    expect(screen.queryByRole('button', { name: '<' })).toBeNull()
  })

  it('shows Loader only when the app is loading', () => {
    useLoading.mockReturnValueOnce({ isLoading: false })
    const { rerender } = render(<Loader />)

    expect(screen.queryByRole('status')).toBeNull()

    useLoading.mockReturnValueOnce({ isLoading: true })
    rerender(<Loader />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('displays footer links and logo navigation', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    expect(screen.getByRole('img', { name: 'Logo Snoroc' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mentions légales' })).toHaveAttribute(
      'href',
      '/Mentions-legales'
    )
    expect(screen.getByRole('link', { name: 'Facebook' })).toHaveAttribute(
      'href',
      'https://facebook.com'
    )
  })

  it('renders WorkInProgress with provided call-to-action', () => {
    render(
      <MemoryRouter>
        <WorkInProgress
          title="Bientôt"
          message="Mise à jour en cours"
          eyebrow="En test"
          className="custom"
          ctaLabel="Retour"
          ctaTo="/home"
        />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Bientôt' })).toBeInTheDocument()
    expect(screen.getByText('Mise à jour en cours')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Retour' })).toHaveAttribute('href', '/home')
  })

  it('opens the confirmation modal and routes button clicks', async () => {
    const onConfirm = jest.fn()
    const onCancel = jest.fn()

    const { rerender } = render(
      <ConfirmationModal
        isOpen={false}
        onConfirm={onConfirm}
        onCancel={onCancel}
        message="Confirmer"
      />
    )

    expect(screen.queryByText('Confirmer')).toBeNull()

    rerender(
      <ConfirmationModal
        isOpen
        onConfirm={onConfirm}
        onCancel={onCancel}
        message="Confirmer"
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Non' }))
    await userEvent.click(screen.getByRole('button', { name: 'Oui' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})
