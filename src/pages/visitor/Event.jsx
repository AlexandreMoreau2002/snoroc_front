import { FiMapPin } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/export'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatting'
import Pagination from '../../components/Pagination/Pagination'
import { getAllEvents } from '../../repositories/eventRepository'
import { useFeaturedPagination } from '../../hooks/useFeaturedPagination'

const EVENTS_PER_PAGE = 3

export default function Event() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [eventsData, setEventsData] = useState([])

  const {
    currentItems: currentEvents,
    currentPage,
    direction,
    handlePageChange,
    hasPagination,
    mainItem: mainEvent,
    restItems,
    totalPages,
  } = useFeaturedPagination(eventsData, EVENTS_PER_PAGE)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getAllEvents()
        if (response.length > 0) {
          const reversedEvents = [...response].reverse()
          setEventsData(reversedEvents)
        } else {
          setEventsData([])
        }
      } catch (error) {
        console.error('Erreur lors du chargement des events :', error)
        setEventsData([])
      }
    }

    fetchEvents()
  }, [])

  const openEvent = (eventId) => {
    navigate(`/events/${eventId}`)
  }

  useEffect(() => {
    const nextStartIndex = currentPage * EVENTS_PER_PAGE
    const nextEndIndex = nextStartIndex + EVENTS_PER_PAGE
    const nextEvents = restItems.slice(nextStartIndex, nextEndIndex)

    nextEvents.forEach((event) => {
      if (event.thumbnail) {
        const img = new Image()
        img.src = event.thumbnail
      } else {
        // No thumbnail to preload
      }
    })
  }, [currentPage, restItems])

  return (
    <>
      <Helmet>
        <title>Event</title>
      </Helmet>
      <div className="actus">
        <h1 className="page__title">Event</h1>
        {mainEvent && (
          <div
            className="main-actus"
            role="button"
            tabIndex={0}
            onClick={() => openEvent(mainEvent.id)}
          >
            <div className="main-actus-media">
              <img src={mainEvent.thumbnail} alt={mainEvent.title} />
            </div>
            <div className="main-actus-content">
              <div>
                <h2 className="main-actus-title">{mainEvent.title}</h2>
                {mainEvent.address && (
                  <p className="main-actus-address">
                    <FiMapPin aria-hidden="true" /> {mainEvent.address}
                  </p>
                )}
                <p className="main-actus-description">{mainEvent.content}</p>
              </div>
              <p className="main-actus-date">
                {formatDate(mainEvent.date || mainEvent.createdAt)}
              </p>
            </div>
          </div>
        )}
        <div key={currentPage} className={`news-list slide-${direction}`}>
          {currentEvents.map((event) => (
            <article
              key={event.id}
              className="news-item"
              style={{
                backgroundImage: `url(${event.thumbnail})`,
              }}
              role="button"
              tabIndex={0}
              onClick={() => openEvent(event.id)}
            >
              <div className="news-content">
                <h2 className="news-title">{event.title}</h2>
                {event.address && (
                  <p className="event-location">
                    <FiMapPin aria-hidden="true" /> {event.address}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
        <div className="news-controls">
          {hasPagination && (
            <button
              type="button"
              className="news-see-all news-see-all--ghost"
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
            className="news-see-all"
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
