import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatting'
import { extractYoutubeId } from '../../utils/youtube'
import { FiEdit2, FiEye, FiTrash2 } from 'react-icons/fi'
import { usePaginatedSearch } from '../../hooks/usePaginatedSearch'
import { deleteMedia, getAllMedia } from '../../repositories/mediaRepository'
import { Button, ConfirmationModal, Pagination, SearchBar } from '../../components/export'

const ITEMS_PER_PAGE = 6

export default function AllMedia() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [medias, setMedias] = useState([])
  const [search, setSearch] = useState('')
  const [mediaToDelete, setMediaToDelete] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const {
    currentItems,
    currentPage,
    direction,
    filteredItems,
    handlePageChange,
    totalPages,
  } = usePaginatedSearch(medias, search, ITEMS_PER_PAGE, ['title', 'description'])

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await getAllMedia()
        const sortedMedias = [...response].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime()
          const dateB = new Date(b.createdAt || 0).getTime()
          return dateB - dateA
        })
        setMedias(sortedMedias)
      } catch (error) {
        console.error('Erreur lors du chargement des médias :', error)
        setMedias([])
      }
    }

    fetchMedia()
  }, [])

  const hasPagination = totalPages > 1

  const openMedia = (mediaId) => {
    navigate(`/media/${mediaId}`)
  }

  const handleEdit = (e, mediaId) => {
    e.stopPropagation()
    navigate(`/admin/media/edit/${mediaId}`)
  }

  const handleDeleteClick = (e, mediaId) => {
    e.stopPropagation()
    setMediaToDelete(mediaId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteMedia(mediaToDelete)
      setMedias(medias.filter((media) => media.id !== mediaToDelete))
      setShowDeleteModal(false)
      setMediaToDelete(null)
    } catch (error) {
      console.error('Erreur lors de la suppression :', error)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setMediaToDelete(null)
  }

  useEffect(() => {
    const nextStartIndex = currentPage * ITEMS_PER_PAGE
    const nextEndIndex = nextStartIndex + ITEMS_PER_PAGE
    const nextItems = filteredItems.slice(nextStartIndex, nextEndIndex)

    nextItems.forEach((media) => {
      const mediaId = extractYoutubeId(media.url)
      if (mediaId) {
        const img = new Image()
        img.src = `https://img.youtube.com/vi/${mediaId}/hqdefault.jpg`
      }
    })
  }, [currentPage, filteredItems])

  return (
    <>
      <Helmet>
        <title>Tous les médias</title>
      </Helmet>
      <div className="all-media">
        <div className="all-media__top">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <div key={currentPage} className={`all-media__grid slide-${direction}`}>
          {currentItems.map((media) => {
            const thumbnailId = extractYoutubeId(media.url)
            const thumbnailUrl = thumbnailId
              ? `https://img.youtube.com/vi/${thumbnailId}/hqdefault.jpg`
              : ''
            return (
              <article
                key={media.id}
                className="all-media__card"
                style={{ backgroundImage: `url(${thumbnailUrl})` }}
                role="button"
                tabIndex={0}
                onClick={() => !isAdmin && openMedia(media.id)}
              >
                {isAdmin && (
                  <div className="all-media__admin-overlay">
                    <button
                      className="all-media__admin-btn edit"
                      onClick={(e) => handleEdit(e, media.id)}
                      title="Modifier"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="all-media__admin-btn view"
                      onClick={(e) => {
                        e.stopPropagation()
                        openMedia(media.id)
                      }}
                      title="Voir"
                    >
                      <FiEye />
                    </button>
                    <button
                      className="all-media__admin-btn delete"
                      onClick={(e) => handleDeleteClick(e, media.id)}
                      title="Supprimer"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )}
                <div className="all-media__card-content">
                  <h2 className="all-media__card-title">{media.title}</h2>
                  <p className="all-media__card-description">{media.description}</p>
                  <span className="all-media__card-date">
                    {formatDate(media.createdAt)}
                  </span>
                </div>
              </article>
            )
          })}
          {currentItems.length === 0 && (
            <p className="all-media__empty">Aucun média trouvé.</p>
          )}
        </div>

        <div className="all-media__footer">
          <Button
            variant="secondary"
            className="all-media__back"
            onClick={() => navigate(-1)}
          >
            Retour
          </Button>
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            className="all-media__pagination"
          />
          {hasPagination && (
            <button
              type="button"
              className="all-media__back all-media__ghost"
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
