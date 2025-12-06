import { Helmet } from 'react-helmet-async'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatting'
import { FiEdit2, FiEye, FiTrash2 } from 'react-icons/fi'
import Pagination from '../../components/Pagination/Pagination'
import { usePaginatedSearch } from '../../hooks/usePaginatedSearch'
import { deleteNews, getAllNews } from '../../repositories/newsRepository'
import { Button, ConfirmationModal, SearchBar } from '../../components/export'

const ITEMS_PER_PAGE = 6

export default function AllActus() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [newsData, setNewsData] = useState([])
  const [newsToDelete, setNewsToDelete] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const {
    currentItems: currentNews,
    currentPage,
    direction,
    filteredItems,
    handlePageChange,
    totalPages,
  } = usePaginatedSearch(newsData, search, ITEMS_PER_PAGE)

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
      } catch (error) {
        console.error('Erreur lors du chargement des actualités :', error)
        setNewsData([])
      }
    }

    fetchNews()
  }, [])

  const hasPagination = totalPages > 1

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
    const nextNews = filteredItems.slice(nextStartIndex, nextEndIndex)
    
    nextNews.forEach((news) => {
      if (news.thumbnail) {
        const img = new Image()
        img.src = news.thumbnail
      }
    })
  }, [currentPage, filteredItems])

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
