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
    console.error('Erreur :', error.response?.data.message)
    throw new Error(error.response?.data.message)
  }
}

export default postLogin
