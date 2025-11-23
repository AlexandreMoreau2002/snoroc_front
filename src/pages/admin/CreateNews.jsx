import { Button } from '../../components/export'
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { postNews, getNewsById, updateNews } from '../../repositories/newsRepository'

export default function CreateNews() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const fileInputRef = useRef(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [thumbnail, setThumbnail] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [fileName, setFileName] = useState('Aucun fichier sélectionné')

  useEffect(() => {
    if (isEditMode) {
      const fetchNews = async () => {
        try {
          const news = await getNewsById(id)
          setTitle(news.title)
          setContent(news.content)
          setFileName('Image actuelle conservée (sauf si nouvelle sélection)')
        } catch (error) {
          console.error('Erreur lors du chargement de l\'actualité :', error)
          setErrorMessage('Impossible de charger l\'actualité.')
        }
      }
      fetchNews()
    }
  }, [isEditMode, id])

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

    if (!thumbnail && !isEditMode) {
      setErrorMessage('Veuillez sélectionner une image.')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)
    if (thumbnail) {
      formData.append('thumbnail', thumbnail)
    }

    try {
      let response
      if (isEditMode) {
        response = await updateNews(id, formData)
        setSuccessMessage('Actualité modifiée avec succès !')
      } else {
        response = await postNews(formData)
        setSuccessMessage(response.message)
      }
      
      setErrorMessage('')
      if (!isEditMode) {
        setTitle('')
        setContent('')
        setThumbnail(null)
        setFileName('Aucun fichier sélectionné')
        if (fileInputRef.current) fileInputRef.current.value = null
      }
      
      setTimeout(() => {
        setSuccessMessage('')
        if (isEditMode) navigate('/actus/all')
      }, 2000)
    } catch (error) {
      console.log('Erreur : ', error.message)
      setErrorMessage(error.message)
      setSuccessMessage('')
    }
  }

  return (
    <div className="create-news">
      <h1 className="create-news__title">{isEditMode ? 'Modifier l\'actualité' : 'Créer une actualité'}</h1>
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
        {successMessage && (
          <p className="create-news__success">{successMessage}</p>
        )}
        <div className="create-news--btn">
          <Button
            variant="secondary"
            onClick={() => navigate('/home')}
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
