import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import WorkInProgress from '../WorkInProgress'

describe('WorkInProgress', () => {
  it('renders placeholder content inside router context', () => {
    render(
      <MemoryRouter>
        <WorkInProgress />
      </MemoryRouter>
    )

    expect(screen.getAllByText(/En cours de développement/i)).toHaveLength(2)
  })
})
