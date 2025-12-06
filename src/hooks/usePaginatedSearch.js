import { useEffect, useMemo, useState } from 'react'

export const usePaginatedSearch = (
  items,
  searchTerm,
  itemsPerPage,
  searchableFields = ['title', 'content']
) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [direction, setDirection] = useState('right')

  useEffect(() => {
    setCurrentPage(1)
    setDirection('right')
  }, [items, searchTerm])

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return items

    return items.filter((item) =>
      searchableFields.some((field) =>
        (item?.[field]?.toLowerCase?.() || '').includes(term)
      )
    )
  }, [items, searchTerm, searchableFields])

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setDirection(pageNumber > currentPage ? 'right' : 'left')
      setCurrentPage(pageNumber)
    }
  }

  return {
    currentItems,
    filteredItems,
    currentPage,
    totalPages,
    direction,
    handlePageChange,
  }
}
