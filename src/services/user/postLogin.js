// src/services/user/postLogin.js
import axiosInstance from '../axiosConfig'

const postLogin = async (email, password) => {
  try {
    const response = await axiosInstance.post('/user/login', {
      email,
      password,
    })
    return response
  } catch (error) {
    console.error('Erreur lors de la tentative de connexion :', error)
    throw error
  }
}

export default postLogin
