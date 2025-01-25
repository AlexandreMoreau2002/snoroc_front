import { Helmet } from 'react-helmet-async'
import React, { useEffect, useState } from 'react'
import getAllNews from '../../../services/news/getAllNews'

export default function Home() {
  const [mainActu, setMainActu] = useState(null)
  const [newsData, setNewsData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      try {
        const response = await getAllNews()
        if (response.length > 0) {
          const reversedNews = response.reverse()

          const lastActu = reversedNews[0]
          setMainActu(lastActu)

          setNewsData(reversedNews.slice(1, 4))
        } else {
          setMainActu(null)
          setNewsData([])
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des actualités :', error)
        setMainActu(null)
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
            {mainActu && (
              <div
                className="main-actus"
                style={{
                  backgroundImage: `url(${mainActu.thumbnail})`,
                }}
              >
                <div className="main-actus-content">
                  <h2 className="main-actus-title">{mainActu.title}</h2>
                  <p className="main-actus-description">{mainActu.content}</p>
                </div>
              </div>
            )}
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
