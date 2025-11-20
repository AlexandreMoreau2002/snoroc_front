import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import Pagination from '../../components/Pagination/Pagination'
import { SearchBar } from '../../components/export'
import getAllNews from '../../services/news/getAllNews'

const ITEMS_PER_PAGE = 6

export default function AllActus() {
  const navigate = useNavigate()
  const [newsData, setNewsData] = useState([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const formatDate = (dateValue) => {
    if (!dateValue) return ''
    const parsedDate = new Date(dateValue)
    if (Number.isNaN(parsedDate.getTime())) return ''
    return parsedDate.toLocaleDateString('fr-FR')
  }

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await getAllNews()
        const sortedNews = [...response].sort((a, b) => {
          const dateA = new Date(a.date || a.createdAt || 0).getTime()
          const dateB = new Date(b.date || b.createdAt || 0).getTime()
          return dateB - dateA
        })
        setNewsData(sortedNews)
        setCurrentPage(1)
      } catch (error) {
        console.error('Erreur lors du chargement des actualités :', error)
        setNewsData([])
        setCurrentPage(1)
      }
    }

    fetchNews()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const filteredNews = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return newsData
    return newsData.filter((news) => {
      const title = news.title?.toLowerCase() || ''
      const content = news.content?.toLowerCase() || ''
      return title.includes(term) || content.includes(term)
    })
  }, [newsData, search])

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentNews = filteredNews.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  const hasPagination = totalPages > 1

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  const openNews = (newsId) => {
    navigate(`/actus/${newsId}`)
  }

  return (
    <>
      <Helmet>
        <title>Toutes les actus</title>
      </Helmet>
      <div className="all-actus">
        <div className="all-actus__top">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <div className="all-actus__grid">
          {currentNews.map((news) => (
            <article
              key={news.id}
              className="all-actus__card"
              style={{ backgroundImage: `url(${news.thumbnail})` }}
              role="button"
              tabIndex={0}
              onClick={() => openNews(news.id)}
            >
              <div className="all-actus__card-content">
                <h2 className="all-actus__card-title">{news.title}</h2>
                <p className="all-actus__card-description">{news.content}</p>
                <span className="all-actus__card-date">
                  {formatDate(news.date || news.createdAt)}
                </span>
              </div>
            </article>
          ))}
          {currentNews.length === 0 && (
            <p className="all-actus__empty">Aucune actualité trouvée.</p>
          )}
        </div>

        <div className="all-actus__footer">
          <button
            type="button"
            className="all-actus__back"
            onClick={() => navigate(-1)}
          >
            Retour
          </button>
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            className="all-actus__pagination"
          />
          {hasPagination && (
            <button
              type="button"
              className="all-actus__back all-actus__ghost"
              tabIndex={-1}
              disabled
            />
          )}
        </div>
      </div>
    </>
  )
}
