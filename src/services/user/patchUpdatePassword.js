// src/services/user/patchUpdatePassword.js

import axiosInstance from '../axiosConfig'

const patchUpdatePassword = async (id, currentPassword, newPassword) => {
  try {
    const response = await axiosInstance.patch(
      '/user/update-password',
      {
        id,
        currentPassword,
        newPassword
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      }
    )
    return response
  } catch (error) {
    console.error(
      'Erreur lors de la tentative de changement de mot de passe : ',
      error
    )
  }
}

export default patchUpdatePassword
