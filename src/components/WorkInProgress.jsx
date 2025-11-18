import { Link } from 'react-router-dom'

export default function WorkInProgress({
  title = 'En cours de développement',
  message = 'Nous peaufinons encore cette page. Revenez très vite pour découvrir les nouveautés.',
  eyebrow = 'Bientôt disponible',
  className = '',
  ctaLabel = "Retour à l'accueil",
  ctaTo = '/',
}) {
  const containerClass = ['work-in-progress', className].filter(Boolean).join(' ')

  return (
    <main className={containerClass}>
      <div className="work-in-progress__glow"></div>
      <div className="work-in-progress__card">
        <div className="work-in-progress__badge">
          <span className="work-in-progress__dot"></span>
          {eyebrow}
        </div>
        <h1 className="work-in-progress__title">{title}</h1>
        <p className="work-in-progress__subtitle">
          En cours de développement
        </p>
        <p className="work-in-progress__text">{message}</p>
        <Link className="work-in-progress__cta" to={ctaTo}>
          {ctaLabel}
        </Link>
      </div>
    </main>
  )
}
