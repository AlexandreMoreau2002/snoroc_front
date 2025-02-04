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
    console.error(
      'Erreur lors du changement de préférence de notification :',
      error
    )
    throw error
  }
}

export default patchUpdateNewsletter
