import React, { useState } from 'react'
import { postNews } from '../services/news/postNews'

export default function CreateNewsForm() {
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
    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)
    formData.append('thumbnail', thumbnail)

    try {
      const response = await postNews(formData)
      setSuccessMessage(response.message)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage("Erreur lors de la création de l'actualité.")
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
            {' '}
            Titre *{' '}
          </label>
          <input
            required
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
            {' '}
            Description *{' '}
          </label>
          <textarea
            required
            id="content"
            value={content}
            placeholder="Description"
            className="create-news__textarea"
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>
        <div className="create-news__form-group-file">
          <label htmlFor="thumbnail" className="create-news__form-label">
            {' '}
            Photo *{' '}
          </label>
          <div className="create-news__form-group-file-input">
            <input
              required
              id="thumbnail"
              type="file"
              accept="image/*"
              className="create-news__file-input"
              onChange={handleFileChange}
            />
            <label htmlFor="thumbnail" className="create-news__file-label">
              Choisir un fichier
            </label>
            <span>{fileName}</span>
          </div>
        </div>
        {errorMessage && (
          <p className="create-news__error-message">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="create-news__success-message">{successMessage}</p>
        )}
        <button type="submit" className="create-news__button">
          Envoyer
        </button>
      </form>
    </div>
  )
}
