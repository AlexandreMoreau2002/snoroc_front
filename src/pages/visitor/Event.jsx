import { Helmet } from 'react-helmet-async'
import WorkInProgress from '../../components/WorkInProgress.jsx'

export default function Event() {
  return (
    <>
      <Helmet>
        <title>Événements</title>
      </Helmet>
      <WorkInProgress
        title="Événements"
        message="On vous prépare une sélection d'événements à ne pas manquer. Revenez bientôt pour découvrir les prochaines dates."
      />
    </>
  )
}
