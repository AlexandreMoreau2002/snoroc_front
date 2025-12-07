import axiosInstance from '../services/axiosConfig'

export const getAllEvents = async () => {
  try {
    const response = await axiosInstance.get('/event/getall')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des évènements :', error)
    throw error
  }
}

export const getEventById = async (id) => {
  try {
    const response = await axiosInstance.get(`/event/id/${id}`)
    return response.data
  } catch (error) {
    console.error("Erreur lors de la récupération de l'évènement :", error)
    throw error
  }
}

export const postEvent = async (formData) => {
  try {
    const response = await axiosInstance.post('/event/create', formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    return response
  } catch (error) {
    console.error('Erreur : ', error.message)
    throw new Error(error.message)
  }
}

export const updateEvent = async (id, formData) => {
  try {
    const response = await axiosInstance.patch(`/event/update/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'évènement :", error)
    throw error
  }
}

export const deleteEvent = async (id) => {
  try {
    const response = await axiosInstance.delete(`/event/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    return response.data
  } catch (error) {
    console.error("Erreur lors de la suppression de l'évènement :", error)
    throw error
  }
}
