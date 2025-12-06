import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatting'
import Pagination from '../../components/Pagination/Pagination'
import { FiEdit2, FiEye, FiMapPin, FiTrash2 } from 'react-icons/fi'
import { usePaginatedSearch } from '../../hooks/usePaginatedSearch'
import { Button, ConfirmationModal, SearchBar } from '../../components/export'
import { deleteEvent, getAllEvents } from '../../repositories/eventRepository'

const ITEMS_PER_PAGE = 6

export default function AllEvents() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)

  const {
    currentItems,
    currentPage,
    direction,
    filteredItems,
    handlePageChange,
    totalPages,
  } = usePaginatedSearch(events, search, ITEMS_PER_PAGE, [
    'title',
    'content',
    'address',
  ])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getAllEvents()
        const sortedEvents = [...response].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime()
          const dateB = new Date(b.createdAt || 0).getTime()
          return dateB - dateA
        })
        setEvents(sortedEvents)
      } catch (error) {
        console.error('Erreur lors du chargement des events :', error)
        setEvents([])
      }
    }

    fetchEvents()
  }, [])

  const hasPagination = totalPages > 1

  const openEvent = (eventId) => {
    navigate(`/events/${eventId}`)
  }

  const handleEdit = (e, eventId) => {
    e.stopPropagation()
    navigate(`/admin/events/edit/${eventId}`)
  }

  const handleDeleteClick = (e, eventId) => {
    e.stopPropagation()
    setEventToDelete(eventId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteEvent(eventToDelete)
      setEvents(events.filter((event) => event.id !== eventToDelete))
      setShowDeleteModal(false)
      setEventToDelete(null)
    } catch (error) {
      console.error('Erreur lors de la suppression :', error)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setEventToDelete(null)
  }

  useEffect(() => {
    const nextStartIndex = currentPage * ITEMS_PER_PAGE
    const nextEndIndex = nextStartIndex + ITEMS_PER_PAGE
    const nextEvents = filteredItems.slice(nextStartIndex, nextEndIndex)

    nextEvents.forEach((event) => {
      if (event.thumbnail) {
        const img = new Image()
        img.src = event.thumbnail
      }
    })
  }, [currentPage, filteredItems])

  return (
    <>
      <Helmet>
        <title>Tous les events</title>
      </Helmet>
      <div className="all-events">
        <div className="all-events__top">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <div key={currentPage} className={`all-events__grid slide-${direction}`}>
          {currentItems.map((event) => (
            <article
              key={event.id}
              className="all-events__card"
              style={{ backgroundImage: `url(${event.thumbnail})` }}
              role="button"
              tabIndex={0}
              onClick={() => !isAdmin && openEvent(event.id)}
            >
              {isAdmin && (
                <div className="all-events__admin-overlay">
                  <button
                    className="all-events__admin-btn edit"
                    onClick={(e) => handleEdit(e, event.id)}
                    title="Modifier"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="all-events__admin-btn view"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEvent(event.id)
                    }}
                    title="Voir"
                  >
                    <FiEye />
                  </button>
                  <button
                    className="all-events__admin-btn delete"
                    onClick={(e) => handleDeleteClick(e, event.id)}
                    title="Supprimer"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              )}
              <div className="all-events__card-content">
                <h2 className="all-events__card-title">{event.title}</h2>
                <p className="all-events__card-description">{event.content}</p>
                <span className="all-events__card-meta">
                  <span className="all-events__card-address">
                    <FiMapPin aria-hidden="true" /> {event.address}
                  </span>
                  <span className="all-events__card-date">
                    {formatDate(event.createdAt)}
                  </span>
                </span>
              </div>
            </article>
          ))}
          {currentItems.length === 0 && (
            <p className="all-events__empty">Aucun event trouvé.</p>
          )}
        </div>

        <div className="all-events__footer">
          <Button
            variant="secondary"
            className="all-events__back"
            onClick={() => navigate(-1)}
          >
            Retour
          </Button>
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            className="all-events__pagination"
          />
          {hasPagination && (
            <button
              type="button"
              className="all-events__back all-events__ghost"
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
