import axiosInstance from '../axiosConfig'

export const postNews = async (formData) => {
  try {
    const response = await axiosInstance.post('/news/create', formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    return response
  } catch (error) {
    console.error("Erreur lors de la création de l'actualité :", error)
    throw error
  }
}
