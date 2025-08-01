// src/services/user/patchUpdatePassword.js
import axiosInstance from '../axiosConfig'
import { ApiResponse } from '../../utils/apiResponseHandler'

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

export default patchUpdatePassword
