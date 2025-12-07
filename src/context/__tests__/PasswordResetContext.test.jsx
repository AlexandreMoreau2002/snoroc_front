import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { PasswordResetProvider, usePasswordReset } from '../PasswordResetContext'

const Consumer = () => {
  const { email, setEmail } = usePasswordReset()
  return (
    <div>
      <p data-testid="reset-email">{email}</p>
      <button type="button" onClick={() => setEmail('reset@example.com')}>
        set-reset
      </button>
    </div>
  )
}

describe('PasswordResetContext', () => {
  it('stores and exposes the reset email', async () => {
    render(
      <PasswordResetProvider>
        <Consumer />
      </PasswordResetProvider>
    )

    expect(screen.getByTestId('reset-email')).toHaveTextContent('')
    await userEvent.click(screen.getByText('set-reset'))
    expect(screen.getByTestId('reset-email')).toHaveTextContent('reset@example.com')
  })
})
