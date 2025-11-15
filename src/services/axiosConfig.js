// front/src/services/axiosConfig.js
import axios from 'axios'
import { mockLogin, mockUsers, mockNews } from './mock/mockData'
import { incrementLoading, decrementLoading } from '../store/loadingStore'

const { version } = require('./../../package.json')

const axiosInstance = (() => {
  const appEnv = process.env.REACT_APP_ENV
  console.log('ENV :', appEnv)
  console.log(`Version applicative : v${version}`)

  if (process.env.REACT_APP_ENV === 'dev') {
    console.log('[Mock api]: Utilisation des données mockées.')

    const withLoading = async (callback) => {
      incrementLoading()
      try {
        return await callback()
      } finally {
        decrementLoading()
      }
    }

    return {
      get: async (url) =>
        withLoading(async () => {
          console.log(`[Mock GET]: Appel simulé à ${url}`)

          if (url.includes('/user/profile')) {
            return {
              data: mockUsers[0],
            }
          }
          if (url.includes('/news/getall')) {
            return {
              data: mockNews,
            }
          }

          throw new Error(`Endpoint non géré : ${url}`)
        }),
      post: async (url, data) =>
        withLoading(async () => {
          console.log(`[Mock POST]: Appel simulé à ${url} avec les données`, data)

          if (url.includes('/user/login')) {
            return {
              ...mockLogin,
            }
          }

          return {
            data: {
              success: true,
            },
          }
        }),
    }
  }

  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  axiosInstance.interceptors.request.use(
    (config) => {
      incrementLoading()
      return config
    },
    (error) => {
      decrementLoading()
      return Promise.reject(error)
    }
  )

  axiosInstance.interceptors.response.use(
    (response) => {
      decrementLoading()
      if (response.data) {
        return response.data
      }
      return response
    },
    (error) => {
      console.log('Erreur Axios interceptée:', error)
      decrementLoading()

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
