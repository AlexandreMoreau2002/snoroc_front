import React, { useState, useEffect } from 'react'
import { usePasswordReset } from '../../context/PasswordResetContext'
import { useSearchParams, useNavigate } from 'react-router-dom'
import postResetForgotPassword from '../../services/user/forgotPassword/postResetForgotPassword'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { email, setEmail } = usePasswordReset()
  const [searchParams] = useSearchParams()
  const resetToken = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (!email) {
      const storedEmail = localStorage.getItem('resetEmail')
      if (storedEmail) {
        setEmail(storedEmail)
      }
    }
  }, [email, setEmail])

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!resetToken) {
      setErrorMessage('Le lien de réinitialisation est invalide ou expiré.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas !')
      return
    }

    setLoading(true)

    try {
      console.log(email)

      await postResetForgotPassword(email, resetToken, password)
      setErrorMessage('')
      navigate('/Profil')
    } catch (error) {
      console.log('Erreur : ', error.message)
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reset-password">
      <h1 className="reset-password__title">Réinitialiser le mot de passe</h1>
      <hr className="reset-password__hr" />
      <form className="reset-password__form" onSubmit={handleResetPassword}>
        <input
          className="reset-password__input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nouveau mot de passe"
          required
          disabled={loading}
        />

        <input
          className="reset-password__input"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirmer le mot de passe"
          required
          disabled={loading}
        />

        {errorMessage && (
          <p className="reset-password__error" aria-live="polite">
            {errorMessage}
          </p>
        )}

        <button
          className="reset-password__button"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Modification en cours...' : 'Changer le mot de passe'}
        </button>
      </form>
    </div>
  )
}
