import axiosInstance from '../services/axiosConfig'

export const getAllNews = async () => {
    try {
        const response = await axiosInstance.get('/news/getall')
        return response.data
    } catch (error) {
        console.error('Erreur lors de la récupération des actualités :', error)
        throw error
    }
}

export const getNewsById = async (id) => {
    try {
        const response = await axiosInstance.get(`/news/id/${id}`)
        return response.data
    } catch (error) {
        console.error("Erreur lors de la récupération de l'actualité :", error)
        throw error
    }
}

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
        console.error('Erreur : ', error.message)
        throw new Error(error.message)
    }
}

export const updateNews = async (id, formData) => {
    try {
        const response = await axiosInstance.patch(`/news/update/${id}`, formData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'actualité :", error)
        throw error
    }
}

export const deleteNews = async (id) => {
    try {
        const response = await axiosInstance.delete(`/news/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        return response.data
    } catch (error) {
        console.error("Erreur lors de la suppression de l'actualité :", error)
        throw error
    }
}
