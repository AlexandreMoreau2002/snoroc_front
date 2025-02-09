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
    console.error('Erreur : ', error.response?.data.message)
    throw new Error(error.response?.data.message)
  }
}

export default getProfile
