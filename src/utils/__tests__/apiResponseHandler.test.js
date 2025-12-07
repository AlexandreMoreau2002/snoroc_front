import { ApiResponse } from '../apiResponseHandler'

describe('ApiResponse', () => {
  it('handles invalid responses gracefully', () => {
    const response = new ApiResponse(null)

    expect(response.isSuccess()).toBe(false)
    expect(response.getMessage()).toBe('Réponse invalide ou vide')
    expect(response.getData()).toBeNull()
    expect(response.getError()).toEqual({ code: 'INVALID_RESPONSE' })
  })

  it('normalizes axios style responses', () => {
    const axiosResponse = {
      data: { status: true, data: { id: 1 }, message: 'ok' },
      headers: {},
      status: 200,
    }
    const response = new ApiResponse(axiosResponse)

    expect(response.isSuccess()).toBe(true)
    expect(response.getData()).toEqual({ id: 1 })
    expect(response.getMessage()).toBe('ok')
    expect(response.getError()).toBeNull()
  })

  it('derives success from explicit flags', () => {
    const successResponse = new ApiResponse({ error: false, data: { done: true }, message: 'done' })
    const successFlag = new ApiResponse({ success: true, message: 'flag ok' })
    const failureResponse = new ApiResponse({ value: false, message: 'not good', code: 'OOPS' })

    expect(successResponse.isSuccess()).toBe(true)
    expect(successResponse.getData()).toEqual({ done: true })
    expect(successResponse.getError()).toBeNull()

    expect(successFlag.isSuccess()).toBe(true)
    expect(successFlag.getMessage()).toBe('flag ok')

    expect(failureResponse.isSuccess()).toBe(false)
    expect(failureResponse.getMessage()).toBe('not good')
    expect(failureResponse.getError()).toEqual({
      code: 'OOPS',
      details: null,
      message: 'not good',
    })
  })

  it('extracts authentication payload when access token is present', () => {
    const authResponse = new ApiResponse({
      accessToken: 'token',
      error: false,
      message: 'connected',
      user: { id: 7 },
    })

    expect(authResponse.isSuccess()).toBe(true)
    expect(authResponse.getData()).toEqual({ accessToken: 'token', user: { id: 7 } })
    expect(authResponse.getMessage()).toBe('connected')
  })

  it('falls back to inferred success and cleans payload', () => {
    const inferredSuccess = new ApiResponse({ id: 9, name: 'fallback' })
    const defaultPayload = new ApiResponse({ status: true })
    const defaultError = new ApiResponse({ status: false })
    const unknownShape = new ApiResponse({ foo: 'bar' })

    expect(inferredSuccess.isSuccess()).toBe(true)
    expect(inferredSuccess.getData()).toEqual({ id: 9, name: 'fallback' })
    expect(inferredSuccess.getMessage()).toBe('Opération réussie')

    expect(defaultPayload.isSuccess()).toBe(true)
    expect(defaultPayload.getData()).toEqual({ message: undefined })

    expect(defaultError.isSuccess()).toBe(false)
    expect(defaultError.getError()).toEqual({
      code: 'API_ERROR',
      details: null,
      message: 'Une erreur est survenue',
    })

    expect(unknownShape.isSuccess()).toBe(false)
    expect(unknownShape.getData()).toBeNull()
  })
})
