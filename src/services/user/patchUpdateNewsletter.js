// src/services/user/postLogin.js
import axiosInstance from '../axiosConfig'

const patchUpdateNewsletter = async (id, newsletter) => {
  try {
    const response = await axiosInstance.patch(
      '/user/update-newsletter',
      { id, newsletter },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )
    return response
  } catch (error) {
    console.error('Erreur : ', error.response?.data.message)
    throw new Error(error.response?.data.message)
  }
}

export default patchUpdateNewsletter
