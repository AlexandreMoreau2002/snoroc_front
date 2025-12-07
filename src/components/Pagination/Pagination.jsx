function PaginationItems(totalPages, currentPage) {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => ({
      type: 'page',
      value: index + 1,
    }))
  }

  if (currentPage <= 3) {
    return [
      { type: 'page', value: 1 },
      { type: 'page', value: 2 },
      { type: 'page', value: 3 },
      { type: 'ellipsis' },
      { type: 'page', value: totalPages },
    ]
  }

  if (currentPage >= totalPages - 2) {
    return [
      { type: 'page', value: 1 },
      { type: 'ellipsis' },
      { type: 'page', value: totalPages - 2 },
      { type: 'page', value: totalPages - 1 },
      { type: 'page', value: totalPages },
    ]
  }

  return [
    { type: 'page', value: 1 },
    { type: 'ellipsis' },
    { type: 'page', value: currentPage },
    { type: 'ellipsis' },
    { type: 'page', value: totalPages },
  ]
}

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  className,
}) {
  if (!totalPages || totalPages <= 1) return null

  const paginationItems = PaginationItems(totalPages, currentPage)
  const containerClassName = ['pagination', className].filter(Boolean).join(' ')

  const handleChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  return (
    <div className={containerClassName}>
      <button
        className="pagination__button pagination__nav"
        onClick={() => handleChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {'<'}
      </button>
      {paginationItems.map((item, index) =>
        item.type === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="pagination__ellipsis">
            ...
          </span>
        ) : (
          <button
            key={item.value}
            className={`pagination__button${
              currentPage === item.value ? ' is-active' : ''
            }`}
            onClick={() => handleChange(item.value)}
          >
            {item.value}
          </button>
        )
      )}
      <button
        className="pagination__button pagination__nav"
        onClick={() => handleChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {'>'}
      </button>
    </div>
  )
}
