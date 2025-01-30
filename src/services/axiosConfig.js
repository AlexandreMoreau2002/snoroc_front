// front/src/services/axiosConfig.js
import axios from 'axios'
import { mockLogin, mockUsers, mockNews } from './mock/mockData'

const axiosInstance = (() => {
  console.log('ENV :', process.env.REACT_APP_ENV)

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

  console.log('[prod api]: Appels API.')
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
      console.error('Erreur dans l’intercepteur Axios :', error)
      return Promise.reject(error)
    }
  )

  return axiosInstance
})()

export default axiosInstance
