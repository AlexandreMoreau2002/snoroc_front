import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, useParams } from 'react-router-dom'
import { FiMapPin } from 'react-icons/fi'
import { Button } from '../../components/export'
import { formatDate, splitContentToParagraphs } from '../../utils/formatting'
import { getEventById } from '../../repositories/eventRepository'

export default function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return

      try {
        const response = await getEventById(id)
        setEvent(response)
      } catch (error) {
        setEvent(null)
      }
    }

    fetchEvent()
  }, [id])

  const eventDate = useMemo(() => {
    if (!event) return ''
    return formatDate(event.createdAt)
  }, [event])

  const bodyParagraphs = useMemo(
    () => splitContentToParagraphs(event?.content),
    [event]
  )

  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1)
    } else {
      navigate('/events/all')
    }
  }

  return (
    <>
      <Helmet>
        <title>{event?.title ? `${event.title} – Évènement` : 'Évènement'}</title>
      </Helmet>
      <main className="event-detail">
        <section className="event-detail__card">
          {event && (
            <>
              <div className="event-detail__header">
                <div className="event-detail__intro">
                  <h1 className="event-detail__title">{event.title}</h1>
                  {eventDate && (
                    <div className="event-detail__meta">
                      <p className="event-detail__date">{eventDate}</p>
                      <p className="event-detail__address">
                        <FiMapPin aria-hidden="true" /> {event.address}
                      </p>
                    </div>
                  )}
                </div>
                <div className="event-detail__media">
                  <img src={event.thumbnail} alt={event.title} loading="lazy" />
                </div>
              </div>

              <div className="event-detail__body">
                {bodyParagraphs.length > 0 ? (
                  bodyParagraphs.map((paragraph, index) => (
                    <p key={`paragraph-${index}`}>{paragraph}</p>
                  ))
                ) : (
                  <p>{event?.content}</p>
                )}
              </div>
            </>
          )}

          <Button
            variant="secondary"
            className="event-detail__back"
            onClick={handleBack}
          >
            Retour
          </Button>
        </section>
      </main>
    </>
  )
}
