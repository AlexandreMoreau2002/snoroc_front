// front/src/services/axiosConfig.js
import axios from 'axios'
import { mockLogin, mockUsers, mockNews } from './mock/mockData'

const axiosInstance = (() => {
  const appEnv = process.env.REACT_APP_ENV
  const appVersion =
    process.env.REACT_APP_VERSION ||
    process.env.npm_package_version ||
    'dev'

  console.log('ENV :', appEnv)
  console.log(`Version applicative : ${appVersion}`)

  if (process.env.REACT_APP_ENV === 'dev') {
    console.log('[Mock api]: Utilisation des données mockées.')

    return {
      get: async (url) => {
        console.log(`[Mock GET]: Appel simulé à ${url}`)

        if (url.includes('/user/profile')) {
          return Promise.resolve({
            data: mockUsers[0],
          })
        }
        if (url.includes('/news/getall')) {
          return Promise.resolve({
            data: mockNews,
          })
        }

        return Promise.reject(new Error(`Endpoint non géré : ${url}`))
      },
      post: async (url, data) => {
        console.log(`[Mock POST]: Appel simulé à ${url} avec les données`, data)

        if (url.includes('/user/login')) {
          return Promise.resolve({
            ...mockLogin,
          })
        }

        return Promise.resolve({
          data: {
            success: true,
          },
        })
      },
    }
  }

  console.log(`[prod api v${appVersion}]: Appels API.`)
  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  axiosInstance.interceptors.response.use(
    (response) => {
      if (response.data) {
        return response.data
      }
      return response
    },
    (error) => {
      console.log('Erreur Axios interceptée:', error)

      if (
        error.code === 'ERR_NETWORK' ||
        error.message.includes('ERR_CONNECTION_REFUSED')
      ) {
        return Promise.reject({
          message: 'Le serveur est inaccessible. Veuillez réessayer plus tard.',
        })
      }
      return Promise.reject({
        message:
          error.response?.data?.message ||
          error.response?.message ||
          error.message ||
          'Une erreur inconnue est survenue.',
      })
    }
  )

  return axiosInstance
})()

export default axiosInstance
