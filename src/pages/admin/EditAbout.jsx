import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/export'
import { useState, useRef, useEffect } from 'react'
import { getAbout, updateAbout } from '../../repositories/aboutRepository'

export default function EditAbout() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [fileName, setFileName] = useState('Aucun fichier sélectionné')

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const about = await getAbout()
        setTitle(about.title || '')
        setDescription(about.description || '')
        setFileName('Image actuelle conservée (sauf si nouvelle sélection)')
      } catch (error) {
        console.error('Erreur lors du chargement du contenu About :', error)
        setErrorMessage('Impossible de charger le contenu.')
      }
    }
    fetchAbout()
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setImage(file)
    setFileName(file ? file.name : 'Aucun fichier sélectionné')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!title.trim()) {
      setErrorMessage('Veuillez mettre un titre.')
      return
    }

    if (!description.trim()) {
      setErrorMessage('Veuillez mettre une description.')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    if (image) {
      formData.append('image', image)
    }

    try {
      await updateAbout(formData)
      setSuccessMessage('Contenu modifié avec succès !')
      
      setErrorMessage('')
      
      setTimeout(() => {
        setSuccessMessage('')
        navigate('/A-propos')
      }, 2000)
    } catch (error) {
      console.log('Erreur : ', error.message)
      setErrorMessage(error.message)
      setSuccessMessage('')
    }
  }

  return (
    <div className="create-news">
      <h1 className="create-news__title">Modifier le contenu</h1>
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
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            placeholder="Description"
            className="create-news__textarea"
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="create-news__form-group-file">
          <label htmlFor="image" className="create-news__form-label">
            Photo (Optionnel)
          </label>
          <div className="create-news__form-group-file-input">
            <input
              name="image"
              id="image"
              type="file"
              accept="image/*"
              className="create-news__file-input"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <label htmlFor="image" className="create-news__file-label">
              Choisir un fichier
            </label>
            <span>{fileName}</span>
          </div>
        </div>
        {errorMessage && <p className="create-news__error">{errorMessage}</p>}
        {successMessage && (
          <p className="create-news__success">{successMessage}</p>
        )}
        <div className="create-news--btn">
          <Button
            variant="secondary"
            onClick={() => navigate('/A-propos')}
          >
            Retour
          </Button>
          <Button type="submit" variant="primary">
            Modifier
          </Button>
        </div>
      </form>
    </div>
  )
}
