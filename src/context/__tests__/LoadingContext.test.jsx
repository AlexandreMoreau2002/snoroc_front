import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { LoadingProvider, useLoading } from '../LoadingContext'
import {
  subscribeToLoading,
  incrementLoading,
  decrementLoading,
} from '../../store/loadingStore'

jest.mock('../../store/loadingStore', () => {
  const subscribeToLoading = jest.fn()
  const incrementLoading = jest.fn()
  const decrementLoading = jest.fn()
  return { subscribeToLoading, incrementLoading, decrementLoading }
})

const LoadingConsumer = () => {
  const { isLoading, startLoading, stopLoading } = useLoading()
  return (
    <div>
      <p data-testid="state">{isLoading ? 'busy' : 'idle'}</p>
      <button type="button" onClick={startLoading}>
        start
      </button>
      <button type="button" onClick={stopLoading}>
        stop
      </button>
    </div>
  )
}

describe('LoadingContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('subscribes to loading updates and exposes start/stop helpers', async () => {
    let subscriptionCallback
    const unsubscribe = jest.fn()
    subscribeToLoading.mockImplementation((cb) => {
      subscriptionCallback = cb
      cb(false)
      return unsubscribe
    })

    render(
      <LoadingProvider>
        <LoadingConsumer />
      </LoadingProvider>
    )

    expect(screen.getByTestId('state')).toHaveTextContent('idle')

    act(() => subscriptionCallback(true))
    expect(screen.getByTestId('state')).toHaveTextContent('busy')

    await userEvent.click(screen.getByText('start'))
    await userEvent.click(screen.getByText('stop'))
    expect(incrementLoading).toHaveBeenCalledTimes(1)
    expect(decrementLoading).toHaveBeenCalledTimes(1)
  })

  it('cleans up the loading subscription on unmount', () => {
    const unsubscribe = jest.fn()
    subscribeToLoading.mockImplementation(() => unsubscribe)

    const { unmount } = render(
      <LoadingProvider>
        <LoadingConsumer />
      </LoadingProvider>
    )

    unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })

  it('falls back to default context functions without a provider', async () => {
    const BareConsumer = () => {
      const { startLoading, stopLoading, isLoading } = useLoading()
      return (
        <div>
          <p data-testid="default-state">{isLoading ? 'busy' : 'idle'}</p>
          <button type="button" onClick={startLoading}>
            default-start
          </button>
          <button type="button" onClick={stopLoading}>
            default-stop
          </button>
        </div>
      )
    }

    render(<BareConsumer />)

    expect(screen.getByTestId('default-state')).toHaveTextContent('idle')
    await userEvent.click(screen.getByText('default-start'))
    await userEvent.click(screen.getByText('default-stop'))
    expect(incrementLoading).not.toHaveBeenCalled()
    expect(decrementLoading).not.toHaveBeenCalled()
  })
})
