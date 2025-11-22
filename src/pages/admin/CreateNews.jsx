import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { postNews } from '../../repositories/newsRepository'

export default function CreateNews() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [thumbnail, setThumbnail] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [fileName, setFileName] = useState('Aucun fichier sélectionné')

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

    if (!thumbnail) {
      setErrorMessage('Veuillez sélectionner une image.')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)
    formData.append('thumbnail', thumbnail)

    try {
      const response = await postNews(formData)
      setSuccessMessage(response.message)
      setErrorMessage('')
      setTitle('')
      setContent('')
      setThumbnail(null)
      setFileName('Aucun fichier sélectionné')
      if (fileInputRef.current) fileInputRef.current.value = null
      setTimeout(() => {
        setSuccessMessage('')
      }, 5000)
    } catch (error) {
      console.log('Erreur : ', error.message)
      setErrorMessage(error.message)
      setSuccessMessage('')
    }
  }

  return (
    <div className="create-news">
      <h1 className="create-news__title">Créer une actualité</h1>
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
            Photo *
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
          <button
            type="button"
            className="return"
            onClick={() => navigate('/home')}
          >
            Retour
          </button>
          <button type="submit" className="submit">
            Envoyer
          </button>
        </div>
      </form>
    </div>
  )
}
