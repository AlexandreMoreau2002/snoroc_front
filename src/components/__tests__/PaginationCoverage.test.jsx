import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import Pagination from '../Pagination/Pagination'

describe('Pagination component coverage', () => {
  it('returns null when only one page is present', () => {
    const { container } = render(<Pagination totalPages={1} currentPage={1} onPageChange={jest.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('lists all pages when total pages are small', async () => {
    const onPageChange = jest.fn()
    render(<Pagination totalPages={3} currentPage={2} onPageChange={onPageChange} />)

    await userEvent.click(screen.getByText('1'))
    await userEvent.click(screen.getByText('3'))
    await userEvent.click(screen.getByText('2'))

    expect(onPageChange).toHaveBeenCalledTimes(2)
  })

  it('shows trailing ellipsis when near the start', async () => {
    const onPageChange = jest.fn()
    render(<Pagination totalPages={8} currentPage={2} onPageChange={onPageChange} />)

    expect(screen.getAllByText('...')).toHaveLength(1)
    await userEvent.click(screen.getByText('8'))
    await userEvent.click(screen.getByText('<'))

    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('shows leading ellipsis when near the end', async () => {
    const onPageChange = jest.fn()
    render(<Pagination totalPages={8} currentPage={7} onPageChange={onPageChange} />)

    expect(screen.getAllByText('...')).toHaveLength(1)
    await userEvent.click(screen.getByText('1'))
    await userEvent.click(screen.getByText('>'))

    expect(onPageChange).toHaveBeenCalledWith(8)
  })

  it('shows two ellipsis when in the middle range', async () => {
    const onPageChange = jest.fn()
    render(<Pagination totalPages={10} currentPage={5} onPageChange={onPageChange} />)

    expect(screen.getAllByText('...')).toHaveLength(2)

    await userEvent.click(screen.getByText('<'))
    await userEvent.click(screen.getByText('>'))
    await userEvent.click(screen.getByText('1'))

    expect(onPageChange).toHaveBeenCalledWith(4)
    expect(onPageChange).toHaveBeenCalledWith(6)
    expect(onPageChange).toHaveBeenCalledWith(1)
  })
})
