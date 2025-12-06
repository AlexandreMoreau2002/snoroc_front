import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'

import HeaderMobileNav from '../HeaderMobileNav'

const LINKS = [
  { label: 'Home', to: '/', aliases: ['/home'] },
  { label: 'Évènements', to: '/events/all', aliases: ['/Event', '/event'] },
]

describe('HeaderMobileNav', () => {
  it('calls toggle handler and applies active class for aliases', async () => {
    const handleToggle = jest.fn()
    const handleClose = jest.fn()

    render(
      <MemoryRouter initialEntries={['/home']}>
        <HeaderMobileNav
          links={LINKS}
          isOpen={false}
          onToggle={handleToggle}
          onClose={handleClose}
        />
      </MemoryRouter>
    )

    await userEvent.click(screen.getByRole('button'))

    expect(handleToggle).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveClass(
      'header__nav__link--active'
    )
  })

  it('closes on navigation change and when clicking a link', async () => {
    const handleClose = jest.fn()

    const { rerender } = render(
      <MemoryRouter initialEntries={['/']}>
        <HeaderMobileNav
          links={LINKS}
          isOpen
          onToggle={() => {}}
          onClose={handleClose}
        />
      </MemoryRouter>
    )
    const callsAfterRender = handleClose.mock.calls.length

    rerender(
      <MemoryRouter initialEntries={['/events/all']}>
        <HeaderMobileNav
          links={LINKS}
          isOpen
          onToggle={() => {}}
          onClose={handleClose}
        />
      </MemoryRouter>
    )
    const callsAfterRerender = handleClose.mock.calls.length

    expect(callsAfterRerender).toBeGreaterThanOrEqual(callsAfterRender)

    await userEvent.click(screen.getByRole('link', { name: 'Home' }))

    expect(handleClose.mock.calls.length).toBeGreaterThan(callsAfterRerender)
  })
})
