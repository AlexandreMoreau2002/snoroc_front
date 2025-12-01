import axios from 'axios'

jest.mock('../mock/mockData', () => ({
  mockLogin: { data: { token: 'mock' } },
  mockUsers: [{ id: 1 }],
  mockNews: [{ id: 1, title: 'News' }],
}))

jest.mock('../../store/loadingStore', () => ({
  incrementLoading: jest.fn(),
  decrementLoading: jest.fn(),
}))

const loadProdInstance = () => {
  process.env.REACT_APP_ENV = 'prod'
  const mockRequest = { use: jest.fn() }
  const mockResponse = { use: jest.fn() }

  axios.create.mockReturnValue({
    interceptors: {
      request: mockRequest,
      response: mockResponse,
    },
    defaults: { headers: { common: {} } },
  })

  const axiosInstance = require('../axiosConfig').default
  return { axiosInstance, mockRequest, mockResponse }
}

describe('axiosConfig', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env.REACT_APP_ENV = 'dev'
  })

  it('provides mock handlers and errors in dev environment', async () => {
    const axiosInstance = require('../axiosConfig').default

    const profile = await axiosInstance.get('/user/profile')
    expect(profile.data).toEqual({ id: 1 })

    await expect(axiosInstance.get('/news/id/1')).resolves.toEqual({ data: { id: 1, title: 'News' } })
    await expect(axiosInstance.get('/news/getall')).resolves.toEqual({ data: [{ id: 1, title: 'News' }] })
    await expect(axiosInstance.get('/unknown')).rejects.toThrow('Endpoint non géré : /unknown')
    await expect(axiosInstance.get('/news/id/999')).rejects.toThrow('Actualité introuvable dans les données mockées.')

    const login = await axiosInstance.post('/user/login', {})
    expect(login.data.token).toBe('mock')
    const genericPost = await axiosInstance.post('/misc', { foo: 'bar' })
    expect(genericPost.data.success).toBe(true)
  })

  it('configures interceptors and handles success paths in prod', async () => {
    const { mockRequest, mockResponse } = loadProdInstance()
    const loadingStore = require('../../store/loadingStore')

    const requestSuccess = mockRequest.use.mock.calls[0][0]
    const requestError = mockRequest.use.mock.calls[0][1]
    const responseSuccess = mockResponse.use.mock.calls[0][0]
    const responseError = mockResponse.use.mock.calls[0][1]

    const config = requestSuccess({ headers: {} })
    expect(config).toEqual({ headers: {} })
    expect(loadingStore.incrementLoading).toHaveBeenCalled()

    await expect(requestError(new Error('boom'))).rejects.toThrow('boom')
    expect(loadingStore.decrementLoading).toHaveBeenCalled()

    expect(responseSuccess({ data: { ok: true } })).toEqual({ ok: true })
    expect(responseSuccess({})).toEqual({})
    expect(loadingStore.decrementLoading).toHaveBeenCalled()

    await expect(responseError({
      code: 'ERR_NETWORK',
      message: 'Network down',
    })).rejects.toEqual({
      message: 'Le serveur est inaccessible. Veuillez réessayer plus tard.',
    })

    await expect(
      responseError({
        message: 'boom',
        response: { data: { message: 'server says' } },
      })
    ).rejects.toEqual({ message: 'server says' })

    await expect(
      responseError({
        message: 'plain boom',
      })
    ).rejects.toEqual({ message: 'plain boom' })

    await expect(
      responseError({
        message: '',
        response: {},
      })
    ).rejects.toEqual({ message: 'Une erreur inconnue est survenue.' })
  })
})
