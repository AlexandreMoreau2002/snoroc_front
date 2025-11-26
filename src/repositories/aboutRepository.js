import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL + '/about'

export const getAbout = async () => {
    try {
        const response = await axios.get(API_URL)
        return response.data
    } catch (error) {
        throw new Error(
            error.response?.data?.message || 'Erreur lors de la récupération du contenu About.'
        )
    }
}

export const updateAbout = async (formData) => {
    try {
        const token = localStorage.getItem('token')
        const response = await axios.put(API_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
        })
        return response.data
    } catch (error) {
        throw new Error(
            error.response?.data?.message || 'Erreur lors de la mise à jour du contenu About.'
        )
    }
}
