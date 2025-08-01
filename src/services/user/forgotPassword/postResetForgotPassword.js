import axiosInstance from '../../axiosConfig'
import { ApiResponse } from '../../../utils/apiResponseHandler'

const postResetForgotPassword = async (email, resetToken, newPassword) => {
  try {
    const response = await axiosInstance.post('/user/reset-password', {
      email,
      resetToken,
      newPassword
    })
    
    const apiResponse = new ApiResponse(response.data)
    
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

export default postResetForgotPassword
