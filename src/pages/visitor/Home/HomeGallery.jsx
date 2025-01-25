import { Helmet } from 'react-helmet-async'
import React, { useEffect, useState } from 'react'
import getAllNews from '../../../services/news/getAllNews'

export default function Home() {
  const [newsData, setNewsData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      try {
        const response = await getAllNews()
        if (response.length > 0) {
          const reversedNews = response.reverse()

          setNewsData(reversedNews)
        } else {
          setNewsData([])
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des actualités :', error)
        setNewsData([])
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  return (
    <>
      <Helmet>
        <title>Actus</title>
      </Helmet>
      <div className="actus">
        <h1 className="page__title">Actus</h1>
        {loading ? (
          <p>Chargement des actualités...</p>
        ) : (
          <>
            <div className="news-list">
              {newsData.map((news) => (
                <div
                  key={news.id}
                  className="news-item"
                  style={{
                    backgroundImage: `url(${news.thumbnail})`,
                  }}
                >
                  <div className="news-content">
                    <h2 className="news-title">{news.title}</h2>
                    <p className="news-description">{news.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
