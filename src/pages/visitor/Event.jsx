import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { FiMapPin } from 'react-icons/fi'
import Pagination from '../../components/Pagination/Pagination'
import { Button } from '../../components/export'
import { useAuth } from '../../context/AuthContext'
import { useFeaturedPagination } from '../../hooks/useFeaturedPagination'
import { formatDate } from '../../utils/formatting'
import { getAllEvents } from '../../repositories/eventRepository'

const EVENTS_PER_PAGE = 3

export default function Event() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [events, setEvents] = useState([])

  const {
    currentItems,
    currentPage,
    direction,
    handlePageChange,
    hasPagination,
    mainItem: mainEvent,
    restItems,
    totalPages,
  } = useFeaturedPagination(events, EVENTS_PER_PAGE)

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

  useEffect(() => {
    const nextStartIndex = currentPage * EVENTS_PER_PAGE
    const nextEndIndex = nextStartIndex + EVENTS_PER_PAGE
    const nextEvents = restItems.slice(nextStartIndex, nextEndIndex)

    if (typeof Image === 'undefined') return

    nextEvents.forEach((event) => {
      if (event.thumbnail) {
        const img = new Image()
        img.src = event.thumbnail
      }
    })
  }, [EVENTS_PER_PAGE, currentPage, restItems])

  const openEvent = (eventId) => {
    navigate(`/events/${eventId}`)
  }

  return (
    <>
      <Helmet>
        <title>Event</title>
      </Helmet>
      <div className="events">
        <h1 className="page__title">Event</h1>

        {mainEvent && (
          <div
            className="main-event"
            role="button"
            tabIndex={0}
            onClick={() => openEvent(mainEvent.id)}
          >
            <div className="main-event-media">
              <img src={mainEvent.thumbnail} alt={mainEvent.title} />
            </div>
            <div className="main-event-content">
              <div>
                <h2 className="main-event-title">{mainEvent.title}</h2>
                <p className="main-event-description">{mainEvent.content}</p>
              </div>
              <div className="main-event-meta">
                {mainEvent.address && (
                  <p className="main-event-address">
                    <FiMapPin aria-hidden="true" /> {mainEvent.address}
                  </p>
                )}
                <p className="main-event-date">{formatDate(mainEvent.createdAt)}</p>
              </div>
            </div>
          </div>
        )}

        <div key={currentPage} className={`events-list slide-${direction}`}>
          {currentItems.map((event) => (
            <article
              key={event.id}
              className="event-item"
              style={{ backgroundImage: `url(${event.thumbnail})` }}
              role="button"
              tabIndex={0}
              onClick={() => openEvent(event.id)}
            >
              <div className="event-content">
                <h2 className="event-title">{event.title}</h2>
                {event.address && (
                  <p className="event-location">
                    <FiMapPin aria-hidden="true" /> {event.address}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="events-controls">
          {hasPagination && (
            <button
              type="button"
              className="events-see-all events-see-all--ghost"
              aria-hidden="true"
              tabIndex={-1}
              disabled
            />
          )}
          {hasPagination && (
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              className="news-pagination"
            />
          )}
          <Button
            className="events-see-all"
            onClick={() => navigate('/events/all')}
            variant="secondary"
          >
            Tout voir
          </Button>
        </div>

        {isAdmin && (
          <Button
            className="admin-button"
            onClick={() => navigate('/createEvent')}
            variant="primary"
          >
            Ajouter
          </Button>
        )}
      </div>
    </>
  )
}
