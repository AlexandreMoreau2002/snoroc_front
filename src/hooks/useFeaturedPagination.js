import { useEffect, useMemo, useState } from 'react'

export function useFeaturedPagination(items, itemsPerPage) {
  const [mainItem, setMainItem] = useState(null)
  const [restItems, setRestItems] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [direction, setDirection] = useState('right')

  useEffect(() => {
    if (items && items.length > 0) {
      setMainItem(items[0])
      setRestItems(items.slice(1))
      setCurrentPage(1)
    } else {
      setMainItem(null)
      setRestItems([])
      setCurrentPage(1)
    }
  }, [items])

  const totalPages = useMemo(
    () => Math.ceil(restItems.length / itemsPerPage),
    [itemsPerPage, restItems.length]
  )

  const hasPagination = totalPages > 1

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return restItems.slice(startIndex, startIndex + itemsPerPage)
  }, [currentPage, itemsPerPage, restItems])

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > (totalPages || 1)) return

    if (pageNumber !== currentPage) {
      setDirection(pageNumber > currentPage ? 'right' : 'left')
      setCurrentPage(pageNumber)
    }
  }

  return {
    currentItems,
    currentPage,
    direction,
    handlePageChange,
    hasPagination,
    mainItem,
    restItems,
    totalPages,
  }
}
