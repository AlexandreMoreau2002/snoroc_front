import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import patchUpdatePassword from '../../services/user/patchUpdatePassword'

const ResetPassword = () => {
  const { user } = useAuth()
  const userId = user.id
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (newPassword !== confirm) {
      console.error('Les mots de passe ne correspondent pas')
      setErrorMessage('Les mots de passe ne correspondent pas')
      return
    }

    try {
      await patchUpdatePassword(userId, password, newPassword)

      setSuccessMessage('Mot de passe mis à jour avec succès')
      setErrorMessage('')

      setTimeout(() => {
        setPassword('')
        setNewPassword('')
        setConfirm('')
        setSuccessMessage('')
        navigate('/Profil')
      }, 5000)
    } catch (error) {
      setSuccessMessage('')
      console.log('Erreur : ', error.message)
      setErrorMessage(error.message)
    }
  }

  return (
    <div className="reset-password">
      <h1 className="reset-password__title">Changer de mot de passe</h1>
      <hr className="reset-password__separator" />
      <form className="reset-password__form" onSubmit={handleSubmit}>
        <input
          type="password"
          className="reset-password__input"
          value={password}
          placeholder="Ancien mot de passe *"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="reset-password__input"
          value={newPassword}
          placeholder="Nouveau mot de passe *"
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="reset-password__input"
          value={confirm}
          placeholder="Confirmer le mot de passe *"
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <div className="reset-password-action">
          <button
            className="reset-password-action__return"
            onClick={() => navigate('/Profil')}
          >
            Retour
          </button>
          <button type="submit" className="reset-password-action__button">
            Modifier
          </button>
        </div>

        {successMessage && (
          <p className="reset-password__success">{successMessage}</p>
        )}

        {errorMessage && (
          <p className="reset-password__error">{errorMessage}</p>
        )}
      </form>
    </div>
  )
}

export default ResetPassword
