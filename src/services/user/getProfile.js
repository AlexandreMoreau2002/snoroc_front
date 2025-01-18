// src/services/user/getProfile.js
import axiosInstance from '../axiosConfig'

const getProfile = async (userId) => {
  try {
    const response = await axiosInstance.get(`/user/profile`, {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_JWT_TOKEN}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération du profil :', error)
    throw error
  }
}

export default getProfile
