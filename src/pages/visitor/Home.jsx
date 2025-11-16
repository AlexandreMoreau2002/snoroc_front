import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import getAllNews from '../../services/news/getAllNews'
import Pagination from '../../components/Pagination/Pagination'

export default function Home() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [newsData, setNewsData] = useState([])
  const [mainActu, setMainActu] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const NEWS_PER_PAGE = 3
  const formatDate = (dateValue) => {
    if (!dateValue) return ''
    const parsedDate = new Date(dateValue)
    if (Number.isNaN(parsedDate.getTime())) return ''
    return parsedDate.toLocaleDateString('fr-FR')
  }

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await getAllNews()
        if (response.length > 0) {
          const reversedNews = [...response].reverse()

          const lastActu = reversedNews[0]
          setMainActu(lastActu)

          setNewsData(reversedNews.slice(1))
          setCurrentPage(1)
        } else {
          setMainActu(null)
          setNewsData([])
          setCurrentPage(1)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des actualités :', error)
        setMainActu(null)
        setNewsData([])
        setCurrentPage(1)
      }
    }

    fetchNews()
  }, [])

  const totalPages = Math.ceil(newsData.length / NEWS_PER_PAGE)
  const startIndex = (currentPage - 1) * NEWS_PER_PAGE
  const currentNews = newsData.slice(startIndex, startIndex + NEWS_PER_PAGE)

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }
  return (
    <>
      <Helmet>
        <title>Actus</title>
      </Helmet>
      <div className="actus">
        <h1 className="page__title">Actus</h1>
        {mainActu && (
          <div className="main-actus">
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
        <div className="news-list">
          {currentNews.map((news) => (
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
        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            className="news-pagination"
          />
        )}
        {isAdmin && (
          <button
            className="admin-button"
            onClick={() => navigate('/createNews')}
          >
            Ajouter
          </button>
        )}
      </div>
    </>
  )
}
