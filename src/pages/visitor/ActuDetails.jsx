import { Helmet } from 'react-helmet-async'
import { Button } from '../../components/export'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getNewsById } from '../../repositories/newsRepository'
import { formatDate, splitContentToParagraphs } from '../../utils/formatting'

export default function ActuDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [news, setNews] = useState(null)

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

  const bodyParagraphs = useMemo(
    () => splitContentToParagraphs(news?.content),
    [news]
  )

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

          <Button
            variant="secondary"
            className="news-detail__back"
            onClick={handleBack}
          >
            Retour
          </Button>
        </section>
      </main>
    </>
  )
}
