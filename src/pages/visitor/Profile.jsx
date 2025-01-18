// src/pages/visitor/User/UserProfile.jsx
import React, { useEffect, useState } from 'react'
import getProfile from '../../services/user/getProfile'
import { Login } from '../../components/login'

export default function UserProfile() {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = 1
        const response = await getProfile(userId)
        setUserData(response)
      } catch (error) {
        console.error(
          'Erreur lors de la récupération de l’utilisateur :',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) {
    return <p>Chargement...</p>
  }

  return (
    <div>
      <h1>Profil utilisateur</h1>
      {userData ? (
        <div>
          <p>
            <strong>Civilité :</strong> {userData.civility}
          </p>
          <p>
            <strong>Prénom :</strong> {userData.firstname}
          </p>
          <p>
            <strong>Nom :</strong> {userData.lastname}
          </p>
          <p>
            <strong>Email :</strong> {userData.email}
          </p>
          <p>
            <strong>Téléphone :</strong> {userData.userPhone}
          </p>
          <p>
            <strong>Administrateur :</strong> {userData.isAdmin ? 'Oui' : 'Non'}
          </p>
          <p>
            <strong>Vérifié :</strong> {userData.isVerified ? 'Oui' : 'Non'}
          </p>
          <p>
            <strong>Newsletter :</strong> {userData.newsletter ? 'Oui' : 'Non'}
          </p>
          <p>
            <strong>Créé le :</strong>{' '}
            {new Date(userData.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Mis à jour le :</strong>{' '}
            {new Date(userData.updatedAt).toLocaleString()}
          </p>
        </div>
      ) : (
        <p>Aucune donnée utilisateur trouvée.</p>
      )}
      <div>
        <p>Composant login</p>
        <Login />
      </div>
    </div>
  )
}
