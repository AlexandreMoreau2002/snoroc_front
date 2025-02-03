import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import postResetForgotPassword from '../../services/user/forgotPassword/postResetForgotPassword'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const resetToken = searchParams.get('token')
  const navigate = useNavigate()

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (!resetToken) {
      setError('Le lien de réinitialisation est invalide ou expiré.')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas !')
      return
    }

    setLoading(true)

    try {
      await postResetForgotPassword(resetToken, password)
      navigate('/Profil')
    } catch (error) {
      console.error('Erreur lors de la réinitialisation :', error)
      setError(
        'Échec de la réinitialisation du mot de passe. Vérifiez le lien et réessayez.'
      )
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

        {error && (
          <p className="reset-password__error" aria-live="polite">
            {error}
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
