import { useLoading } from '../context/LoadingContext'

export default function Loader() {
  const { isLoading } = useLoading()

  if (!isLoading) {
    return null
  }

  return (
    <section className="app-loader" role="status">
      <div className="app-loader__spinner"></div>
    </section>
  )
}
