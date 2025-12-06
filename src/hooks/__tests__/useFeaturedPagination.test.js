import { renderHook, act } from '@testing-library/react'

import { useFeaturedPagination } from '../useFeaturedPagination'

describe('useFeaturedPagination', () => {
  it('initializes with main and rest items and computes pagination data', () => {
    const items = ['main', 'second', 'third', 'fourth', 'fifth']

    const { result } = renderHook(() => useFeaturedPagination(items, 2))

    expect(result.current.mainItem).toBe('main')
    expect(result.current.restItems).toEqual(['second', 'third', 'fourth', 'fifth'])
    expect(result.current.currentItems).toEqual(['second', 'third'])
    expect(result.current.currentPage).toBe(1)
    expect(result.current.totalPages).toBe(2)
    expect(result.current.hasPagination).toBe(true)
    expect(result.current.direction).toBe('right')
  })

  it('resets state when items array is empty', () => {
    const { result, rerender } = renderHook(
      ({ entries }) => useFeaturedPagination(entries, 3),
      { initialProps: { entries: ['only'] } }
    )

    act(() => rerender({ entries: [] }))

    expect(result.current.mainItem).toBeNull()
    expect(result.current.restItems).toEqual([])
    expect(result.current.currentItems).toEqual([])
    expect(result.current.totalPages).toBe(0)
    expect(result.current.hasPagination).toBe(false)
    expect(result.current.hasPagination).toBe(false)
    expect(result.current.currentPage).toBe(1)

    act(() => result.current.handlePageChange(2))
    expect(result.current.currentPage).toBe(1)
  })

  it('guards against invalid page changes and updates direction', () => {
    const items = ['a', 'b', 'c']
    const { result } = renderHook(() => useFeaturedPagination(items, 1))

    act(() => result.current.handlePageChange(0))
    expect(result.current.currentPage).toBe(1)

    act(() => result.current.handlePageChange(1))
    expect(result.current.currentPage).toBe(1)
    expect(result.current.direction).toBe('right')

    act(() => result.current.handlePageChange(2))
    expect(result.current.currentPage).toBe(2)
    expect(result.current.direction).toBe('right')

    act(() => result.current.handlePageChange(1))
    expect(result.current.currentPage).toBe(1)
    expect(result.current.direction).toBe('left')

    act(() => result.current.handlePageChange(4))
    expect(result.current.currentPage).toBe(1)
    expect(result.current.direction).toBe('left')
  })
})
