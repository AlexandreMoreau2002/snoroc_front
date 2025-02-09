// src/services/user/patchUpdatePassword.js

import axiosInstance from '../axiosConfig'

const patchUpdatePassword = async (id, currentPassword, newPassword) => {
  try {
    const response = await axiosInstance.patch(
      '/user/update-password',
      {
        id,
        currentPassword,
        newPassword,
      },
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

export default patchUpdatePassword
