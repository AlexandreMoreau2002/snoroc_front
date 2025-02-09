import axiosInstance from '../../axiosConfig'

const postResetForgotPassword = async (email, resetToken, newPassword) => {
  try {
    const response = await axiosInstance.post('/user/reset-password', {
      email,
      resetToken,
      newPassword
    })
    return response
  } catch (error) {
    console.error('Erreur : ', error.response?.data.message)
    throw new Error(error.response?.data.message)
  }
}

export default postResetForgotPassword
