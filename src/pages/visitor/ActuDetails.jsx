import { Helmet } from 'react-helmet-async'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getNewsById } from '../../repositories/newsRepository'

export default function ActuDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [news, setNews] = useState(null)

  const formatDate = (dateValue) => {
    if (!dateValue) return ''
    const parsedDate = new Date(dateValue)
    if (Number.isNaN(parsedDate.getTime())) return ''
    return parsedDate.toLocaleDateString('fr-FR')
  }

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) {
        return
      }

      try {
        const response = await getNewsById(id)
        setNews(response)
      } catch (fetchError) {
        setNews(null)
      }
    }

    fetchNews()
  }, [id])

  const newsDate = useMemo(() => {
    if (!news) return ''
    return formatDate(news.date || news.createdAt)
  }, [news])

  const bodyParagraphs = useMemo(() => {
    if (!news?.content) return []
    const paragraphs = news.content
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)

    if (paragraphs.length === 0) {
      return [news.content]
    }

    return paragraphs
  }, [news])

  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1)
    } else {
      navigate('/actus/all')
    }
  }

  return (
    <>
      <Helmet>
        <title>{news?.title ? `${news.title} – Actu` : 'Actu'}</title>
      </Helmet>
      <main className="news-detail">
        <section className="news-detail__card">
          {news && (
            <>
              <div className="news-detail__header">
                <div className="news-detail__intro">
                  <h1 className="news-detail__title">{news.title}</h1>
                  {newsDate && (
                    <div className="news-detail__meta">
                      <p className="news-detail__date">{newsDate}</p>
                    </div>
                  )}
                </div>
                <div className="news-detail__media">
                  <img src={news.thumbnail} alt={news.title} loading="lazy" />
                </div>
              </div>

              <div className="news-detail__body">
                {bodyParagraphs.length > 0 ? (
                  bodyParagraphs.map((paragraph, index) => (
                    <p key={`paragraph-${index}`}>{paragraph}</p>
                  ))
                ) : (
                  <p>{news.content}</p>
                )}
              </div>
            </>
          )}

          <button
            type="button"
            className="news-detail__back"
            onClick={handleBack}
          >
            Retour
          </button>
        </section>
      </main>
    </>
  )
}
