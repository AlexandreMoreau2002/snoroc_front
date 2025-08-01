// src/utils/apiResponseHandler.js

/**
 * Vérifie si une réponse API est un succès
 * @param {Object} response - La réponse de l'API
 * @returns {boolean} - true si succès, false sinon
 */
export const isSuccess = (response) => {
  // Vérifier que response n'est pas null ou undefined
  if (!response || typeof response !== 'object') {
    return false
  }
  
  // Si c'est un objet Axios (contient status, headers, etc.)
  if (response.status && response.headers && response.data) {
    // C'est un objet Axios, on travaille avec response.data
    const apiData = response.data
    if (apiData.success !== undefined) {
      return apiData.success === true
    }
    if (apiData.error !== undefined) {
      return apiData.error === false
    }
    if (apiData.value !== undefined) {
      return apiData.value === true
    }
    return false
  }
  
  // Nouvelle structure unifiée (réponse API directe)
  if (response.success !== undefined) {
    return response.success === true
  }
  
  // Ancienne structure (compatibilité)
  if (response.error !== undefined) {
    return response.error === false
  }
  
  if (response.value !== undefined) {
    return response.value === true
  }
  
  return false
}

/**
 * Extrait les données de la réponse API
 * @param {Object} response - La réponse de l'API
 * @returns {any} - Les données extraites
 */
export const getData = (response) => {
  // Vérifier que response n'est pas null ou undefined
  if (!response || typeof response !== 'object') {
    return null
  }
  
  // Si c'est un objet Axios (contient status, headers, etc.)
  if (response.status && response.headers && response.data) {
    // C'est un objet Axios, on travaille avec response.data
    const apiData = response.data
    if (apiData.success !== undefined && apiData.data) {
      return apiData.data
    }
    if (apiData.error === false && apiData.data) {
      return apiData.data
    }
    return apiData
  }
  
  // Nouvelle structure unifiée (réponse API directe)
  if (response.success !== undefined && response.data) {
    return response.data
  }
  
  // Ancienne structure (compatibilité)
  if (response.error === false && response.data) {
    return response.data
  }
  
  // Si pas de structure data, retourner la réponse complète
  return response
}

/**
 * Extrait le message de la réponse API
 * @param {Object} response - La réponse de l'API
 * @returns {string} - Le message
 */
export const getMessage = (response) => {
  // Vérifier que response n'est pas null ou undefined
  if (!response || typeof response !== 'object') {
    return 'Opération effectuée avec succès'
  }
  
  // Si c'est un objet Axios (contient status, headers, etc.)
  if (response.status && response.headers && response.data) {
    return response.data.message || 'Opération effectuée avec succès'
  }
  
  return response.message || 'Opération effectuée avec succès'
}

/**
 * Extrait les informations d'erreur de la réponse API
 * @param {Object} response - La réponse de l'API
 * @returns {Object} - Les informations d'erreur
 */
export const getError = (response) => {
  // Vérifier que response n'est pas null ou undefined
  if (!response || typeof response !== 'object') {
    return {
      message: 'Une erreur inconnue est survenue',
      code: 'UNKNOWN_ERROR',
      details: null
    }
  }
  
  // Si c'est un objet Axios (contient status, headers, etc.)
  if (response.status && response.headers && response.data) {
    const apiData = response.data
    if (apiData.success === false) {
      return {
        message: apiData.message || 'Une erreur est survenue',
        code: apiData.error?.code || 'UNKNOWN_ERROR',
        details: apiData.error?.details || null
      }
    }
    if (apiData.error === true || apiData.value === false) {
      return {
        message: apiData.message || 'Une erreur est survenue',
        code: 'LEGACY_ERROR',
        details: null
      }
    }
    return {
      message: 'Une erreur inconnue est survenue (Axios)',
      code: 'UNKNOWN_ERROR',
      details: null
    }
  }
  
  // Nouvelle structure unifiée (réponse API directe)
  if (response.success === false) {
    return {
      message: response.message || 'Une erreur est survenue',
      code: response.error?.code || 'UNKNOWN_ERROR',
      details: response.error?.details || null
    }
  }
  
  // Ancienne structure (compatibilité)
  if (response.error === true || response.value === false) {
    return {
      message: response.message || 'Une erreur est survenue',
      code: 'LEGACY_ERROR',
      details: null
    }
  }
  
  return {
    message: 'Une erreur inconnue est survenue',
    code: 'UNKNOWN_ERROR',
    details: null
  }
}

/**
 * Classe pour gérer les réponses API de manière uniforme
 */
export class ApiResponse {
  constructor(response) {
    // Vérifier que response n'est pas null ou undefined
    if (!response || typeof response !== 'object') {
      this.response = {
        success: false,
        message: 'Réponse invalide',
        error: {
          message: 'Une erreur inconnue est survenue',
          code: 'INVALID_RESPONSE',
          details: null
        }
      }
    } else {
      this.response = response
    }
    this.success = isSuccess(this.response)
    this.data = getData(this.response)
    this.message = getMessage(this.response)
    this.error = this.success ? null : getError(this.response)
  }
  
  /**
   * Vérifie si la réponse est un succès
   * @returns {boolean}
   */
  isSuccess() {
    return this.success
  }
  
  /**
   * Obtient les données de la réponse
   * @returns {any}
   */
  getData() {
    return this.data
  }
  
  /**
   * Obtient le message de la réponse
   * @returns {string}
   */
  getMessage() {
    return this.message
  }
  
  /**
   * Obtient les informations d'erreur
   * @returns {Object|null}
   */
  getError() {
    return this.error
  }
}
