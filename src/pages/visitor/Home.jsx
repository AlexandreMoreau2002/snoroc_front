import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/export'
import { useAuth } from '../../context/AuthContext'
import { getAllNews } from '../../repositories/newsRepository'
import Pagination from '../../components/Pagination/Pagination'
import { formatDate } from '../../utils/formatting'
import { useFeaturedPagination } from '../../hooks/useFeaturedPagination'

export default function Home() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [newsData, setNewsData] = useState([])
  const NEWS_PER_PAGE = 3

  const {
    currentItems: currentNews,
    currentPage,
    direction,
    handlePageChange,
    hasPagination,
    mainItem: mainActu,
    restItems,
    totalPages,
  } = useFeaturedPagination(newsData, NEWS_PER_PAGE)
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await getAllNews()
        if (response.length > 0) {
          const reversedNews = [...response].reverse()
          setNewsData(reversedNews)
        } else {
          setNewsData([])
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des actualités :', error)
        setNewsData([])
      }
    }

    fetchNews()
  }, [])

  const openNews = (newsId) => {
    navigate(`/actus/${newsId}`)
  }
  useEffect(() => {
    const nextStartIndex = currentPage * NEWS_PER_PAGE
    const nextEndIndex = nextStartIndex + NEWS_PER_PAGE
    const nextNews = restItems.slice(nextStartIndex, nextEndIndex)

    nextNews.forEach((news) => {
      if (news.thumbnail) {
        const img = new Image()
        img.src = news.thumbnail
      }
    })
  }, [NEWS_PER_PAGE, currentPage, restItems])

  return (
    <>
      <Helmet>
        <title>Actus</title>
      </Helmet>
      <div className="actus">
        <h1 className="page__title">Actus</h1>
        {mainActu && (
          <div
            className="main-actus"
            role="button"
            tabIndex={0}
            onClick={() => openNews(mainActu.id)}
          >
            <div className="main-actus-media">
              <img src={mainActu.thumbnail} alt={mainActu.title} />
            </div>
            <div className="main-actus-content">
              <div>
                <h2 className="main-actus-title">{mainActu.title}</h2>
                <p className="main-actus-description">{mainActu.content}</p>
              </div>
              <p className="main-actus-date">
                {formatDate(mainActu.date || mainActu.createdAt)}
              </p>
            </div>
          </div>
        )}
        <div key={currentPage} className={`news-list slide-${direction}`}>
          {currentNews.map((news) => (
            <article
              key={news.id}
              className="news-item"
              style={{
                backgroundImage: `url(${news.thumbnail})`,
              }}
              role="button"
              tabIndex={0}
              onClick={() => openNews(news.id)}
            >
              <div className="news-content">
                <h2 className="news-title">{news.title}</h2>
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
            onClick={() => navigate('/actus/all')}
            variant="secondary"
          >
            Tout voir
          </Button>
        </div>
        {isAdmin && (
          <Button
            className="admin-button"
            onClick={() => navigate('/createNews')}
            variant="primary"
          >
            Ajouter
          </Button>
        )}
      </div>
    </>
  )
}
