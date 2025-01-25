// src/services/user/getProfile.js
import axiosInstance from '../axiosConfig'

const getAllNews = async () => {
  try {
    const response = await axiosInstance.get('/news/getall')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération du profil :', error)
    throw error
  }
}

export default getAllNews
