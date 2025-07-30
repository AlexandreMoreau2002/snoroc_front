import axiosInstance from '../axiosConfig'

const postVerifyEmail = async (data) => {
  try {
    const response = await axiosInstance.post('/user/verify-email', data)
    return response
  } catch (error) {
    console.log(error)
    throw new Error(error.response?.data?.message || error.message)
  }
}

export default postVerifyEmail
