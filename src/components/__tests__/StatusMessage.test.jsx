import { act, render, screen, waitFor } from '@testing-library/react'
import React from 'react'

import StatusMessage from '../StatusMessage'

jest.useFakeTimers()

describe('StatusMessage', () => {
  it('does not render when message is empty', () => {
    render(<StatusMessage message="" />)

    expect(screen.queryByRole('status')).toBeNull()
  })

  it('renders and hides automatically with callback', async () => {
    const onHide = jest.fn()

    render(
      <StatusMessage
        message="Saved successfully"
        duration={200}
        onHide={onHide}
      />
    )

    expect(screen.getByRole('status')).toHaveTextContent('Saved successfully')

    await act(async () => {
      jest.advanceTimersByTime(200)
    })

    await waitFor(() => expect(screen.queryByRole('status')).toBeNull())
    expect(onHide).toHaveBeenCalledTimes(1)
  })

  it('applies error styling when variant is error', () => {
    render(<StatusMessage message="Oops" variant="error" />)

    expect(screen.getByRole('status')).toHaveClass(
      'status-message--error'
    )
  })
})
