import { Helmet } from 'react-helmet-async'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, MediaVideoEmbed } from '../../components/export'
import { getMediaById } from '../../repositories/mediaRepository'
import { formatDate, splitContentToParagraphs } from '../../utils/formatting'

export default function MediaDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [media, setMedia] = useState(null)

  useEffect(() => {
    const fetchMedia = async () => {
      if (!id) return

      try {
        const response = await getMediaById(id)
        setMedia(response)
      } catch (error) {
        setMedia(null)
      }
    }

    fetchMedia()
  }, [id])

  const mediaDate = useMemo(() => {
    if (!media) return ''
    return formatDate(media.createdAt)
  }, [media])

  const bodyParagraphs = useMemo(
    () => splitContentToParagraphs(media?.description),
    [media]
  )

  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1)
    } else {
      navigate('/media/all')
    }
  }

  return (
    <>
      <Helmet>
        <title>{media?.title ? `${media.title} – Media` : 'Media'}</title>
      </Helmet>
      <main className="media-detail">
        <section className="media-detail__card">
          {media && (
            <>
              <div className="media-detail__header">
                <div className="media-detail__intro">
                  <h1 className="media-detail__title">{media.title}</h1>
                  {mediaDate ? (
                    <div className="media-detail__meta">
                      <p className="media-detail__date">{mediaDate}</p>
                    </div>
                  ) : (
                    <div className="media-detail__meta">
                      <p className="media-detail__date">Date inconnue</p>
                    </div>
                  )}
                </div>
                <div className="media-detail__media">
                  <MediaVideoEmbed url={media.url} title={media.title} />
                </div>
              </div>

              <div className="media-detail__body">
                {bodyParagraphs.length > 0 ? (
                  bodyParagraphs.map((paragraph, index) => (
                    <p key={`paragraph-${index}`}>{paragraph}</p>
                  ))
                ) : (
                  <p>{media?.description}</p>
                )}
              </div>
            </>
          )}

          <Button
            variant="secondary"
            className="media-detail__back"
            onClick={handleBack}
          >
            Retour
          </Button>
        </section>
      </main>
    </>
  )
}
