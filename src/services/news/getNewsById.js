// src/services/news/getNewsById.js
import axiosInstance from '../axiosConfig'

const getNewsById = async (id) => {
  try {
    const response = await axiosInstance.get(`/news/id/${id}`)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la récupération de l'actualité :", error)
    throw error
  }
}

export default getNewsById
