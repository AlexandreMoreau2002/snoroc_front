import { render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import PrivateRoute from '../PrivateRoute'
import { useAuth } from '../../context/AuthContext'

jest.mock('../../context/AuthContext')

describe('PrivateRoute', () => {
  it('renders nested routes when user is admin', () => {
    useAuth.mockReturnValue({ isAdmin: true })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/admin" element={<div>Admin content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Admin content')).toBeInTheDocument()
  })

  it('redirects to home when user is not admin', () => {
    useAuth.mockReturnValue({ isAdmin: false })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div>Public home</div>} />
          <Route element={<PrivateRoute />}>
            <Route path="/admin" element={<div>Admin content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Public home')).toBeInTheDocument()
    expect(screen.queryByText('Admin content')).toBeNull()
  })
})
