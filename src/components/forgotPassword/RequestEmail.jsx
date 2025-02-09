import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePasswordReset } from '../../context/PasswordResetContext'
import postEmailForgotPassword from '../../services/user/forgotPassword/postEmailForgotPassword'

export default function RequestEmail() {
  const navigate = useNavigate()
  const { setEmail } = usePasswordReset()
  const [inputEmail, setInputEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEmail(inputEmail)
    localStorage.setItem('resetEmail', inputEmail)

    try {
      const response = await postEmailForgotPassword(inputEmail)
      setErrorMessage('')
      setSuccessMessage(response.message)

      setEmail(inputEmail)
    } catch (error) {
      console.log('Erreur : ', error.message)
      setErrorMessage(error.message)
    }
  }

  return (
    <div className="request-email">
      <h1 className="request-email__title">Réinitialiser le mot de passe</h1>
      <hr className="request-email__separator" />
      <form className="request-email__form" onSubmit={handleSubmit}>
        <input
          type="email"
          className="request-email__input"
          value={inputEmail}
          placeholder="Adresse mail *"
          onChange={(e) => setInputEmail(e.target.value)}
          required
        />
        {errorMessage && (
          <div className="request-email__form__error">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="request-email__form__success">{successMessage}</div>
        )}
        <div className="request-email__actions">
          <button
            type="button"
            className="request-email__button request-email__button-return"
            onClick={() => navigate('/Profil')}
          >
            Retour
          </button>
          <button type="submit" className="request-email__button-submit">
            Envoyer le code
          </button>
        </div>
      </form>
    </div>
  )
}
