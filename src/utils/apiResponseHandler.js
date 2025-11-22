/**
 * Normalise la réponse API pour gérer les différents formats du backend.
 * Formats connus :
 * 1. { error: boolean, message: string, data?: any } (Success: error === false)
 * 2. { value: boolean, message: string } (Success: value === true, Error: value === false)
 * 3. { status: boolean, message: string } (Success: status === true)
 * 4. { accessToken: string, user: object, ... } (Auth success, often mixed with error: false)
 */
class ApiResponse {
  constructor(response) {
    this.originalResponse = response
    this.normalized = this.normalize(response)
  }

  /**
   * Normalise la réponse en un format standard interne
   * @param {Object} response - La réponse brute (axios response.data ou response directe)
   */
  normalize(response) {
    // Gestion des réponses Axios complètes (si on passe response au lieu de response.data)
    let data = response
    if (response && response.data && response.status && response.headers) {
      data = response.data
    }

    if (!data || typeof data !== 'object') {
      return {
        success: false,
        message: 'Réponse invalide ou vide',
        data: null,
        error: { code: 'INVALID_RESPONSE' }
      }
    }

    // 1. Déterminer le succès
    let success = false

    // Priorité aux indicateurs explicites
    if (typeof data.status === 'boolean') {
      success = data.status === true
    } else if (typeof data.error === 'boolean') {
      success = data.error === false
    } else if (typeof data.value === 'boolean') {
      success = data.value === true
    } else if (typeof data.success === 'boolean') {
      success = data.success === true
    } else {
      // Fallback : Si aucun indicateur, on suppose succès si pas d'erreur explicite
      // et présence de données significatives (ex: accessToken)
      if (data.accessToken || data.id) {
        success = true
      }
    }

    // 2. Extraire le message
    const message = data.message || (success ? 'Opération réussie' : 'Une erreur est survenue')

    // 3. Extraire les données utiles
    let payload = null

    if (success) {
      if (data.data !== undefined) {
        payload = data.data
      } else if (data.accessToken) {
        // Cas spécifique Auth : on renvoie tout l'objet (accessToken + user)
        // On exclut les champs de status pour nettoyer
        const { error, value, status, message, ...rest } = data
        payload = rest
      } else {
        // Si pas de champ data explicite, on essaie de renvoyer l'objet nettoyé
        const { error, value, status, message, ...rest } = data
        // Si l'objet restant n'est pas vide, c'est la donnée
        if (Object.keys(rest).length > 0) {
          payload = rest
        } else {
          // Si pas de données, on renvoie le message dans un objet pour éviter null
          payload = { message }
        }
      }
    }

    let errorObj = null
    if (!success) {
      errorObj = {
        message: message,
        code: data.code || 'API_ERROR',
        details: data.details || null
      }
    }

    return {
      success,
      message,
      data: payload,
      error: errorObj
    }
  }

  isSuccess() {
    return this.normalized.success
  }

  getData() {
    return this.normalized.data
  }

  getMessage() {
    return this.normalized.message
  }

  getError() {
    return this.normalized.error
  }
}

export { ApiResponse }
