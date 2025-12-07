import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/export'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatting'
import { extractYoutubeId } from '../../utils/youtube'
import Pagination from '../../components/Pagination/Pagination'
import { getAllMedia } from '../../repositories/mediaRepository'
import { useFeaturedPagination } from '../../hooks/useFeaturedPagination'

const MEDIA_PER_PAGE = 3

const getThumbnail = (url) => {
  const id = extractYoutubeId(url)
  if (!id) return ''
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

export default function Media() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [mediaData, setMediaData] = useState([])

  const {
    currentItems: currentMedia,
    currentPage,
    direction,
    handlePageChange,
    hasPagination,
    mainItem,
    restItems,
    totalPages,
  } = useFeaturedPagination(mediaData, MEDIA_PER_PAGE)

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await getAllMedia()
        if (response.length > 0) {
          const reversed = [...response].reverse()
          setMediaData(reversed)
        } else {
          setMediaData([])
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des médias :', error)
        setMediaData([])
      }
    }

    fetchMedia()
  }, [])

  const openMedia = (mediaId) => {
    navigate(`/media/${mediaId}`)
  }

  useEffect(() => {
    const nextStartIndex = currentPage * MEDIA_PER_PAGE
    const nextEndIndex = nextStartIndex + MEDIA_PER_PAGE
    const nextMedia = restItems.slice(nextStartIndex, nextEndIndex)

    nextMedia.forEach((media) => {
      const thumb = getThumbnail(media.url)
      if (thumb) {
        const img = new Image()
        img.src = thumb
      }
    })
  }, [currentPage, restItems])

  return (
    <>
      <Helmet>
        <title>Médias</title>
      </Helmet>
      <div className="actus media">
        <h1 className="page__title">Media</h1>
        {mainItem && (
          <div
            className="main-actus"
            role="button"
            tabIndex={0}
            onClick={() => openMedia(mainItem.id)}
          >
            <div className="main-actus-media">
              <img src={getThumbnail(mainItem.url)} alt={mainItem.title} />
            </div>
            <div className="main-actus-content">
              <div>
                <h2 className="main-actus-title">{mainItem.title}</h2>
                <p className="main-actus-description">{mainItem.description}</p>
              </div>
              <p className="main-actus-date">{formatDate(mainItem.createdAt)}</p>
            </div>
          </div>
        )}
        <div key={currentPage} className={`news-list slide-${direction}`}>
          {currentMedia.map((media) => (
            <article
              key={media.id}
              className="news-item"
              style={{
                backgroundImage: `url(${getThumbnail(media.url)})`,
              }}
              role="button"
              tabIndex={0}
              onClick={() => openMedia(media.id)}
            >
              <div className="news-content">
                <h2 className="news-title">{media.title}</h2>
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
            onClick={() => navigate('/media/all')}
            variant="secondary"
          >
            Tout voir
          </Button>
        </div>
        {isAdmin && (
          <Button
            className="admin-button"
            onClick={() => navigate('/createMedia')}
            variant="primary"
          >
            Ajouter
          </Button>
        )}
      </div>
    </>
  )
}
