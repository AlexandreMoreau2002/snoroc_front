// src/services/user/getProfile.js
import axiosInstance from '../axiosConfig'

const getProfile = async () => {
  try {
    const response = await axiosInstance.get('/user/profile', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération du profil :', error)
    throw error
  }
}

export default getProfile
