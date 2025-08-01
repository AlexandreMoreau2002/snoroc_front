// src/services/user/patchUpdateNewsletter.js
import axiosInstance from '../axiosConfig'
import { ApiResponse } from '../../utils/apiResponseHandler'

const patchUpdateNewsletter = async (id, newsletter) => {
  try {
    const response = await axiosInstance.patch(
      '/user/update-newsletter',
      { id, newsletter },
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

export default patchUpdateNewsletter
