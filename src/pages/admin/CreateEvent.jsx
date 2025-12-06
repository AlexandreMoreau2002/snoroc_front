import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/export'
import { getEventById, postEvent, updateEvent } from '../../repositories/eventRepository'

export default function CreateEvent() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const fileInputRef = useRef(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [address, setAddress] = useState('')
  const [thumbnail, setThumbnail] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [fileName, setFileName] = useState('Aucun fichier sélectionné')

  useEffect(() => {
    if (!isEditMode) return

    const fetchEvent = async () => {
      try {
        const event = await getEventById(id)
        setTitle(event.title)
        setContent(event.content)
        setAddress(event.address)
        setFileName('Image actuelle conservée (sauf si nouvelle sélection)')
      } catch (error) {
        console.error("Erreur lors du chargement de l'évènement :", error)
        setErrorMessage("Impossible de charger l'évènement.")
      }
    }

    fetchEvent()
  }, [id, isEditMode])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setThumbnail(file)
    setFileName(file ? file.name : 'Aucun fichier sélectionné')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!title.trim()) {
      setErrorMessage('Veuillez mettre un titre.')
      return
    }

    if (!content.trim()) {
      setErrorMessage('Veuillez mettre une description.')
      return
    }

    if (!address.trim()) {
      setErrorMessage("Veuillez renseigner l'adresse.")
      return
    }

    if (!thumbnail && !isEditMode) {
      setErrorMessage('Veuillez sélectionner une image.')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)
    formData.append('address', address)
    if (thumbnail) {
      formData.append('thumbnail', thumbnail)
    }

    try {
      let response
      if (isEditMode) {
        response = await updateEvent(id, formData)
        setSuccessMessage("Évènement modifié avec succès !")
      } else {
        response = await postEvent(formData)
        setSuccessMessage(response.message)
      }

      setErrorMessage('')
      if (!isEditMode) {
        setTitle('')
        setContent('')
        setAddress('')
        setThumbnail(null)
        setFileName('Aucun fichier sélectionné')
        if (fileInputRef.current?.value) {
          fileInputRef.current.value = null
        }
      }

      setTimeout(() => {
        setSuccessMessage('')
        isEditMode && navigate('/events/all')
      }, 2000)
    } catch (error) {
      console.log('Erreur : ', error.message)
      setErrorMessage(error.message)
      setSuccessMessage('')
    }
  }

  return (
    <div className="create-news">
      <h1 className="create-news__title">
        {isEditMode ? "Modifier l'évènement" : 'Créer un évènement'}
      </h1>
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
          <label htmlFor="content" className="create-news__form-label">
            Description *
          </label>
          <textarea
            id="content"
            value={content}
            placeholder="Description"
            className="create-news__textarea"
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>

        <div className="create-news__form-group">
          <label htmlFor="address" className="create-news__form-label">
            Adresse *
          </label>
          <input
            id="address"
            type="text"
            value={address}
            placeholder="Adresse"
            className="create-news__input"
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="create-news__form-group-file">
          <label htmlFor="thumbnail" className="create-news__form-label">
            Photo {isEditMode ? '(Optionnel)' : '*'}
          </label>
          <div className="create-news__form-group-file-input">
            <input
              name="thumbnail"
              id="thumbnail"
              type="file"
              accept="image/*"
              className="create-news__file-input"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <label htmlFor="thumbnail" className="create-news__file-label">
              Choisir un fichier
            </label>
            <span>{fileName}</span>
          </div>
        </div>

        {errorMessage && <p className="create-news__error">{errorMessage}</p>}
        {successMessage && <p className="create-news__success">{successMessage}</p>}

        <div className="create-news--btn">
          <Button variant="secondary" onClick={() => navigate('/home')}>
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
