import axiosInstance from '../services/axiosConfig'

export const getAllMedia = async () => {
  try {
    const response = await axiosInstance.get('/media/getall')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des médias :', error)
    throw error
  }
}

export const getMediaById = async (id) => {
  try {
    const response = await axiosInstance.get(`/media/id/${id}`)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération du média :', error)
    throw error
  }
}

export const createMedia = async (payload) => {
  try {
    const response = await axiosInstance.post('/media/create', payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    return response
  } catch (error) {
    console.error('Erreur lors de la création du média :', error)
    throw error
  }
}

export const updateMedia = async (id, payload) => {
  try {
    const response = await axiosInstance.patch(`/media/update/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Erreur lors de la mise à jour du média :', error)
    throw error
  }
}

export const deleteMedia = async (id) => {
  try {
    const response = await axiosInstance.delete(`/media/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Erreur lors de la suppression du média :', error)
    throw error
  }
}
