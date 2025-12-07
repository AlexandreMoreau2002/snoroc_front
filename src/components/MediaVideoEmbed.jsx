import PropTypes from 'prop-types'
import { extractYoutubeId } from '../utils/youtube'

export default function MediaVideoEmbed({ url, title }) {
  const videoId = extractYoutubeId(url)

  if (!videoId) {
    return <p className="media-embed__fallback">Vidéo indisponible.</p>
  }

  return (
    <div className="media-embed" aria-label={`Vidéo ${title}`}>
      <div className="media-embed__ratio">
        <iframe
          title={title || 'Vidéo média'}
          src={`https://www.youtube.com/embed/${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-presentation"
          loading="lazy"
        />
      </div>
    </div>
  )
}

MediaVideoEmbed.propTypes = {
  title: PropTypes.string,
  url: PropTypes.string,
}

MediaVideoEmbed.defaultProps = {
  title: '',
  url: '',
}
