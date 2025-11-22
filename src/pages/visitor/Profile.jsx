// src/pages/visitor/User/Profile.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Login } from '../../components/export'
import { useAuth } from '../../context/AuthContext'
import getProfile from '../../services/user/getProfile'
import StatusMessage from '../../components/StatusMessage'
import patchUpdateNewsletter from '../../services/user/patchUpdateNewsletter'

const STATUS_DISPLAY_DURATION = 3000

export default function UserProfile() {
  const { user } = useAuth()
  const userId = user?.id
  const navigate = useNavigate()
  const { token, logout } = useAuth()
  const [userData, setUserData] = useState(null)
  const [newsletter, setNewsletter] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setUserData(null)
      return
    }

    const fetchUser = async () => {
      setErrorMessage('')
      
      try {
        const data = await getProfile()
        setUserData(data)
        setNewsletter(data.newsletter || false)
      } catch (error) {
        console.error('Erreur récupération profil:', error.message)
        setErrorMessage(error.message)
        setUserData(null)
      }
    }

    fetchUser()
  }, [token])

  const updateNewsletter = async () => {
    setErrorMessage('')
    setSuccessMessage('')
    
    try {
      await patchUpdateNewsletter(userId, newsletter)
      setSuccessMessage('Préférences mises à jour avec succès !')
      
      setTimeout(() => {
        setSuccessMessage('')
      }, STATUS_DISPLAY_DURATION)
    } catch (error) {
      console.error('Erreur mise à jour newsletter:', error.message)
      setErrorMessage(error.message)
      
      setTimeout(() => {
        setErrorMessage('')
      }, STATUS_DISPLAY_DURATION)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const handleNewsletterChange = () => {
    setNewsletter((prev) => !prev)
  }

  if (!token) {
    return <Login />
  }

  return (
    <div className="profile">
      <h1 className="profile__title profile__title--notification">
        Notifications
      </h1>
      <hr className="profile__divider" />
      <div className="profile__notifications">
        <input
          type="checkbox"
          id="notif"
          name="notif"
          checked={newsletter}
          onChange={handleNewsletterChange}
          className="profile__notifications__checkbox"
        />
        <label htmlFor="notif" className="profile__label">
          Je souhaite recevoir les actualités et les évènements par mail.
        </label>
      </div>
      <button
        onClick={updateNewsletter}
        className="profile__button profile__button--update"
      >
        Mettre à jour
      </button>
      <StatusMessage status="error" message={errorMessage} />
      <StatusMessage status="success" message={successMessage} />
      <h1 className="profile__title profile__title--info">
        Informations personnelles
      </h1>
      <hr className="profile__divider" />
      <div className="profile__info">
        <p className="profile__info-item">
          {userData?.lastname || 'Non renseigné'}
        </p>
        <p className="profile__info-item">
          {userData?.firstname || 'Non renseigné'}
        </p>
        <p className="profile__info-item">
          {userData?.email || 'Non renseigné'}
        </p>
        <p className="profile__info-item">
          {userData?.userPhone || 'Non renseigné'}
        </p>
      </div>

      <button
        onClick={() => navigate('/ResetPassword')}
        className="profile__button profile__button--password"
      >
        Modifier mon mot de passe
      </button>

      <button
        onClick={handleLogout}
        className="profile__button profile__button--logout"
      >
        Se déconnecter
      </button>
    </div>
  )
}
