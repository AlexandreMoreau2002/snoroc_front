import axiosInstance from '../services/axiosConfig'
import { ApiResponse } from '../utils/apiResponseHandler'

export const postLogin = async (email, password) => {
    try {
        const response = await axiosInstance.post('/user/login', {
            email,
            password,
        })

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

export const postSignUp = async (data) => {
    try {
        const response = await axiosInstance.post('/user/signup', data, {
            headers: {
                'Content-Type': 'application/json',
            },
        })

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

export const getProfile = async () => {
    try {
        const response = await axiosInstance.get('/user/profile', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })

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

export const patchUpdateNewsletter = async (id, newsletter) => {
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

export const patchUpdatePassword = async (id, currentPassword, newPassword) => {
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

export const postVerifyEmail = async (data) => {
    try {
        const response = await axiosInstance.post('/user/verify-email', data)

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

export const postEmailForgotPassword = async (email) => {
    try {
        const response = await axiosInstance.post('/user/forgot-password', {
            email,
        })

        // Note: The original code used response.data here, but axiosInstance interceptor 
        // already returns response.data. If the API returns { data: ... }, then response.data is correct.
        // If it returns the body directly, then response is correct.
        // Keeping original logic for safety, assuming response structure requires it.
        // If axiosInstance returns body, and body has .data property, then this is valid.
        const apiResponse = new ApiResponse(response.data || response)

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

export const postResetForgotPassword = async (email, resetToken, newPassword) => {
    try {
        const response = await axiosInstance.post('/user/reset-password', {
            email,
            resetToken,
            newPassword
        })

        const apiResponse = new ApiResponse(response.data || response)

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
