import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from '../RoleContext'

const TestComponent = () => {
  const { theme, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={() => toggleTheme('red')}>Set Red</button>
      <button onClick={() => toggleTheme('blue')}>Set Blue</button>
    </div>
  )
}

describe('RoleContext', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    // Mock document.documentElement.style.setProperty
    document.documentElement.style.setProperty = jest.fn()
  })

  it('provides default theme value', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    expect(screen.getByTestId('theme-value')).toHaveTextContent('blue')
  })

  it('toggles theme to red and updates CSS variable', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    await user.click(screen.getByText('Set Red'))

    expect(screen.getByTestId('theme-value')).toHaveTextContent('red')
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
      '--role-color',
      '#8b0000'
    )
  })

  it('toggles theme to blue and updates CSS variable', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // First set to red to ensure change
    await user.click(screen.getByText('Set Red'))
    expect(screen.getByTestId('theme-value')).toHaveTextContent('red')

    // Then set back to blue
    await user.click(screen.getByText('Set Blue'))

    expect(screen.getByTestId('theme-value')).toHaveTextContent('blue')
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
      '--role-color',
      '#1b74e4'
    )
  })
})
