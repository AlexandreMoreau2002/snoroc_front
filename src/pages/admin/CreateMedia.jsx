import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/export'
import { createMedia, getMediaById, updateMedia } from '../../repositories/mediaRepository'
import { extractYoutubeId } from '../../utils/youtube'

export default function CreateMedia() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (isEditMode) {
      const fetchMedia = async () => {
        try {
          const media = await getMediaById(id)
          setTitle(media.title)
          setDescription(media.description || '')
          setUrl(media.url)
        } catch (error) {
          console.error("Erreur lors du chargement du média :", error)
          setErrorMessage("Impossible de charger le média.")
        }
      }
      fetchMedia()
    }
  }, [id, isEditMode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!title.trim()) {
      setErrorMessage('Veuillez mettre un titre.')
      return
    }

    if (!url.trim()) {
      setErrorMessage('Veuillez fournir une URL YouTube.')
      return
    }

    if (!extractYoutubeId(url)) {
      setErrorMessage('URL YouTube invalide.')
      return
    }

    const payload = {
      title,
      url,
      description,
    }

    try {
      let response
      if (isEditMode) {
        response = await updateMedia(id, payload)
        setSuccessMessage('Média modifié avec succès !')
      } else {
        response = await createMedia(payload)
        setSuccessMessage(response.message || 'Média créé avec succès !')
      }

      setErrorMessage('')

      if (!isEditMode) {
        setTitle('')
        setDescription('')
        setUrl('')
      }

      setTimeout(() => {
        setSuccessMessage('')
        if (isEditMode) {
          navigate('/media/all')
        }
      }, 2000)
    } catch (error) {
      console.log('Erreur : ', error.message)
      setErrorMessage(error.message)
      setSuccessMessage('')
    }
  }

  return (
    <div className="create-news">
      <h1 className="create-news__title">{isEditMode ? "Modifier le média" : "Créer un média"}</h1>
      <hr className="create-news__hr" />
      <form onSubmit={handleSubmit} className="create-news__form">
        <div className="create-news__form-group">
          <label htmlFor="title" className="create-news__form-label">
            Titre *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            placeholder="Titre"
            className="create-news__input"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="create-news__form-group">
          <label htmlFor="description" className="create-news__form-label">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            placeholder="Description"
            className="create-news__textarea"
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="create-news__form-group">
          <label htmlFor="url" className="create-news__form-label">
            URL YouTube *
          </label>
          <input
            id="url"
            type="url"
            value={url}
            placeholder="https://www.youtube.com/watch?v=..."
            className="create-news__input"
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        {errorMessage && <p className="create-news__error">{errorMessage}</p>}
        {successMessage && (
          <p className="create-news__success">{successMessage}</p>
        )}
        <div className="create-news--btn">
          <Button
            variant="secondary"
            onClick={() => navigate('/media/all')}
          >
            Retour
          </Button>
          <Button type="submit" variant="primary">
            {isEditMode ? 'Modifier' : 'Envoyer'}
          </Button>
        </div>
      </form>
    </div>
  )
}
