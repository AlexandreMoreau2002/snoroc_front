import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useMemo, useState } from 'react'
import { FiEdit2, FiEye, FiTrash2 } from 'react-icons/fi'
import Pagination from '../../components/Pagination/Pagination'
import { getAllNews, deleteNews } from '../../repositories/newsRepository'
import { SearchBar, ConfirmationModal, Button } from '../../components/export'

const ITEMS_PER_PAGE = 6

export default function AllActus() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [newsData, setNewsData] = useState([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [newsToDelete, setNewsToDelete] = useState(null)

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

  const [direction, setDirection] = useState('right')

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
      setDirection(pageNumber > currentPage ? 'right' : 'left')
      setCurrentPage(pageNumber)
    }
  }

  const openNews = (newsId) => {
    navigate(`/actus/${newsId}`)
  }

  const handleEdit = (e, newsId) => {
    e.stopPropagation()
    navigate(`/admin/actus/edit/${newsId}`)
  }

  const handleDeleteClick = (e, newsId) => {
    e.stopPropagation()
    setNewsToDelete(newsId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (newsToDelete) {
      try {
        await deleteNews(newsToDelete)
        setNewsData(newsData.filter(news => news.id !== newsToDelete))
        setShowDeleteModal(false)
        setNewsToDelete(null)
      } catch (error) {
        console.error('Erreur lors de la suppression :', error)
      }
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setNewsToDelete(null)
  }

  useEffect(() => {
    const nextStartIndex = currentPage * ITEMS_PER_PAGE
    const nextEndIndex = nextStartIndex + ITEMS_PER_PAGE
    const nextNews = filteredNews.slice(nextStartIndex, nextEndIndex)
    
    nextNews.forEach((news) => {
      if (news.thumbnail) {
        const img = new Image()
        img.src = news.thumbnail
      }
    })
  }, [currentPage, filteredNews])

  return (
    <>
      <Helmet>
        <title>Toutes les actus</title>
      </Helmet>
      <div className="all-actus">
        <div className="all-actus__top">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <div key={currentPage} className={`all-actus__grid slide-${direction}`}>
          {currentNews.map((news) => (
            <article
              key={news.id}
              className="all-actus__card"
              style={{ backgroundImage: `url(${news.thumbnail})` }}
              role="button"
              tabIndex={0}
              onClick={() => !isAdmin && openNews(news.id)}
            >
              {isAdmin && (
                <div className="all-actus__admin-overlay">
                  <button 
                    className="all-actus__admin-btn edit"
                    onClick={(e) => handleEdit(e, news.id)}
                    title="Modifier"
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    className="all-actus__admin-btn view"
                    onClick={(e) => {
                      e.stopPropagation()
                      openNews(news.id)
                    }}
                    title="Voir"
                  >
                    <FiEye />
                  </button>
                  <button 
                    className="all-actus__admin-btn delete"
                    onClick={(e) => handleDeleteClick(e, news.id)}
                    title="Supprimer"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              )}
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
          <Button
            variant="secondary"
            className="all-actus__back"
            onClick={() => navigate(-1)}
          >
            Retour
          </Button>
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
      
      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          message="Voulez-vous supprimer ce contenu ?"
        />
      )}
    </>
  )
}
