// src/services/user/forgotPassword/postEmailForgotPassword.js

import axiosInstance from '../../axiosConfig'

const postEmailForgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post('/user/forgot-password', {
      email,
    })
    return response
  } catch (error) {
    console.error("Erreur lors de la tentative d'envois de l'email :", error)
  }
}

export default postEmailForgotPassword
