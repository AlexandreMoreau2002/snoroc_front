import { Helmet } from 'react-helmet-async'
import WorkInProgress from '../../components/WorkInProgress.jsx'

export default function Media() {
  return (
    <>
      <Helmet>
        <title>Médias</title>
      </Helmet>
      <WorkInProgress
        title="Médias"
        message="Nous finalisons encore les contenus médias : vidéos, photos et coulisses. Encore un peu de patience !"
      />
    </>
  )
}
