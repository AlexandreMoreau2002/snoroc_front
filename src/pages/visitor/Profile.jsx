// src/pages/visitor/User/Profile.jsx
import React, { useEffect, useState } from 'react'
import Login from '../../components/login'
import { useAuth } from '../../context/AuthContext'
import getProfile from '../../services/user/getProfile'

export default function UserProfile() {
  const { token, logout } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setUserData(null)
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      setLoading(true)
      try {
        const response = await getProfile()
        setUserData(response)
      } catch (error) {
        console.error(
          'Erreur lors de la récupération de l’utilisateur :',
          error
        )
        setUserData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [token])

  // Affiche uniquement le composant Login si l'utilisateur n'est pas connecté
  if (!token) {
    return <Login />
  }

  if (loading) {
    return <p className="profile__loading">Chargement...</p>
  }

  return (
    <div className="profile">
      <h1 className="profile__title">Profil utilisateur</h1>
      {userData ? (
        <div className="profile__details">
          <p className="profile__detail">
            <strong>Civilité :</strong> {userData.civility}
          </p>
          <p className="profile__detail">
            <strong>Prénom :</strong> {userData.firstname}
          </p>
          <p className="profile__detail">
            <strong>Nom :</strong> {userData.lastname}
          </p>
          <p className="profile__detail">
            <strong>Email :</strong> {userData.email}
          </p>
          <p className="profile__detail">
            <strong>Téléphone :</strong> {userData.userPhone}
          </p>
          <p className="profile__detail">
            <strong>Administrateur :</strong> {userData.isAdmin ? 'Oui' : 'Non'}
          </p>
          <p className="profile__detail">
            <strong>Vérifié :</strong> {userData.isVerified ? 'Oui' : 'Non'}
          </p>
          <p className="profile__detail">
            <strong>Newsletter :</strong> {userData.newsletter ? 'Oui' : 'Non'}
          </p>
          <p className="profile__detail">
            <strong>Créé le :</strong>{' '}
            {new Date(userData.createdAt).toLocaleString()}
          </p>
          <p className="profile__detail">
            <strong>Mis à jour le :</strong>{' '}
            {new Date(userData.updatedAt).toLocaleString()}
          </p>
        </div>
      ) : (
        <p className="profile__no-data">Aucune donnée utilisateur trouvée.</p>
      )}
      <div className="profile__actions">
        <button onClick={() => logout()} className="profile__logout-button">
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
