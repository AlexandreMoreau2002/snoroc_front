import { decrementLoading, incrementLoading, resetLoading, subscribeToLoading } from '../loadingStore'

describe('loadingStore', () => {
  afterEach(() => {
    resetLoading()
  })

  it('notifies subscribers on increment and decrement', () => {
    const callback = jest.fn()
    const unsubscribe = subscribeToLoading(callback)

    expect(callback).toHaveBeenCalledWith(false)

    incrementLoading()
    expect(callback).toHaveBeenLastCalledWith(true)

    decrementLoading()
    expect(callback).toHaveBeenLastCalledWith(false)

    unsubscribe()
  })

  it('protects against invalid callbacks', () => {
    const unsubscribe = subscribeToLoading('not a function')

    expect(() => incrementLoading()).not.toThrow()
    expect(() => decrementLoading()).not.toThrow()
    expect(() => unsubscribe()).not.toThrow()
  })

  it('does not go below zero and can reset', () => {
    const callback = jest.fn()
    subscribeToLoading(callback)

    decrementLoading()
    expect(callback).toHaveBeenLastCalledWith(false)

    incrementLoading()
    incrementLoading()
    expect(callback).toHaveBeenLastCalledWith(true)

    resetLoading()
    expect(callback).toHaveBeenLastCalledWith(false)
  })
})
