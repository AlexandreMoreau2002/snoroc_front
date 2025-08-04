// src/services/user/postSignUp.js
import axiosInstance from '../axiosConfig'
import { ApiResponse } from '../../utils/apiResponseHandler'

const postSignUp = async (data) => {
  try {
    const response = await axiosInstance.post('/user/signup', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const apiResponse = new ApiResponse(response)
    
    if (!apiResponse.isSuccess()) {
      throw new Error(apiResponse.getError().message)
    }
    
    return apiResponse.getData()
    
  } catch (error) {
    if (error.response?.data) {
      const apiResponse = new ApiResponse(error.response.data)
      throw new Error(apiResponse.getError().message)
    }
    
    throw new Error(error.message || 'Erreur de connexion')
  }
}

export default postSignUp
