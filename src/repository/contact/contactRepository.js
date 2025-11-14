// front/src/repository/contact/contactRepository.js
import axiosInstance from '../../services/axiosConfig'

/**
 * Soumet le formulaire de contact via l'API.
 * @param {{name: string, email: string, phone?: string|null, subject: string, message: string}} payload
 * @returns {Promise<Object>} Réponse de l'API.
 */
export const createContactMessage = (payload) => {
  return axiosInstance.post('/contact', payload)
}
