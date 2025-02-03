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
    console.error('Erreur lors du changement de mot de passe :', error)
    throw error
  }
}

export default postResetForgotPassword
