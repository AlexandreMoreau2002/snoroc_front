import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import postEmailForgotPassword from '../../services/user/forgotPassword/postEmailForgotPassword'

export default function RequestEmail({ setStep, setEmail }) {
  const navigate = useNavigate()
  const [inputEmail, setInputEmail] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await postEmailForgotPassword(inputEmail)
      setEmail(inputEmail)
      setStep(2)
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email :", error)
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
        <div className="test">
          <button className="return" onClick={() => navigate('/Profil')}>
            Retour
          </button>
          <button type="submit" className="request-email__button">
            Envoyer le code
          </button>
        </div>
      </form>
    </div>
  )
}
