import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Contact from '../visitor/Contact'

jest.mock('../../repositories/contactRepository', () => ({
  createContactMessage: jest.fn(),
}))

const contactRepo = require('../../repositories/contactRepository')

describe('Contact page', () => {
  let user
  const fillForm = async () => {
    await user.type(screen.getByPlaceholderText('Nom'), 'Doe')
    await user.type(screen.getByPlaceholderText('Prenom'), 'Jane')
    await user.type(screen.getByPlaceholderText('Mail'), 'jane@example.com')
    await user.type(screen.getByPlaceholderText('Sujet'), 'Hello')
    await user.type(screen.getByPlaceholderText('Message'), 'Content')
  }

  beforeEach(() => {
    jest.useFakeTimers()
    user =
      typeof userEvent.setup === 'function'
        ? userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
        : userEvent
    contactRepo.createContactMessage.mockReset()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('displays validation errors then clears status messages via timers', async () => {
    contactRepo.createContactMessage
      .mockRejectedValueOnce(new Error('server'))
      .mockResolvedValueOnce({ ok: true })

    render(
      <MemoryRouter>
        <Contact />
      </MemoryRouter>
    )

    await user.click(screen.getByText('Envoyer'))
    expect(await screen.findAllByText(/obligatoire/i)).toHaveLength(3)

    await fillForm()
    await user.click(screen.getByText('Envoyer'))

    await waitFor(() => expect(contactRepo.createContactMessage).toHaveBeenCalledTimes(1))
    expect(await screen.findByText('server')).toBeInTheDocument()
    act(() => jest.runOnlyPendingTimers())

    await user.click(screen.getByText('Envoyer'))
    await waitFor(() => expect(contactRepo.createContactMessage).toHaveBeenCalledTimes(2))
    expect(await screen.findByText(/Merci pour votre message/i)).toBeInTheDocument()
    act(() => jest.runOnlyPendingTimers())
  })

  it('falls back to default error message when backend omits one', async () => {
    contactRepo.createContactMessage.mockRejectedValueOnce({})

    render(
      <MemoryRouter>
        <Contact />
      </MemoryRouter>
    )

    await fillForm()
    await user.click(screen.getByText('Envoyer'))

    expect(
      await screen.findByText(
        /Impossible d'envoyer votre message pour le moment. Merci de réessayer ultérieurement./i
      )
    ).toBeInTheDocument()
    act(() => jest.runOnlyPendingTimers())
  })
})
