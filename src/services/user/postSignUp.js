// src/services/user/postSignUp.js
import axiosInstance from '../axiosConfig'

const postSignUp = async (data) => {
  try {
    const response = await axiosInstance.post('/user/signup', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response
  } catch (error) {
    console.error('Erreur : ', error.response?.data.message)
    throw new Error(error.response?.data.message)
  }
}

export default postSignUp
