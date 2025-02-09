// src/services/user/forgotPassword/postEmailForgotPassword.js

import axiosInstance from '../../axiosConfig'

const postEmailForgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post('/user/forgot-password', {
      email,
    })
    return response
  } catch (error) {
    console.error('Erreur : ', error.response?.data.message)
    throw new Error(error.response?.data.message)
  }
}

export default postEmailForgotPassword
