import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'

import Header from '../Header'

describe('Header navigation', () => {
  it('highlights matching aliases and renders logo links', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <Header />
      </MemoryRouter>
    )

    expect(screen.getAllByRole('link', { name: 'Actus' })[0]).toHaveClass(
      'header__nav__link--active'
    )
    const logos = screen.getAllByAltText('Logo')
    const profileLinks = screen.getAllByRole('link', { name: 'Profil' })

    expect(logos).toHaveLength(2)
    profileLinks.forEach((link) =>
      expect(link).not.toHaveClass('header__nav__link--active')
    )
  })

  it('toggles the mobile drawer visibility', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    )

    const header = screen.getByRole('banner')
    const toggle = screen.getByRole('button')

    expect(header).not.toHaveClass('header--open')

    await userEvent.click(toggle)

    expect(header).toHaveClass('header--open')
  })
})
