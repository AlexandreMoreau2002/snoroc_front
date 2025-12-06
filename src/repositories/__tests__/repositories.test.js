import axios from 'axios'
import * as aboutRepository from '../aboutRepository'
import * as contactRepository from '../contactRepository'
import * as newsRepository from '../newsRepository'
import * as userRepository from '../userRepository'
import * as eventRepository from '../eventRepository'

jest.mock('../../services/axiosConfig', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}))

jest.mock('axios')

const axiosConfig = require('../../services/axiosConfig')

const defaultError = new Error('Erreur de connexion')

describe('repository helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('token', 'abc')
  })

  describe('about repository', () => {
    it('returns about data and handles update', async () => {
      axios.get.mockResolvedValue({ data: { title: 'About' } })
      axios.put.mockResolvedValue({ data: { message: 'updated' } })

      await expect(aboutRepository.getAbout()).resolves.toEqual({ title: 'About' })
      await expect(aboutRepository.updateAbout({ title: 'New' })).resolves.toEqual({ message: 'updated' })
    })

    it('throws explicit and fallback errors', async () => {
      axios.get.mockRejectedValue({ response: { data: { message: 'fail' } } })
      await expect(aboutRepository.getAbout()).rejects.toThrow('fail')

      axios.put.mockRejectedValue(new Error('unknown'))
      await expect(aboutRepository.updateAbout({})).rejects.toThrow(
        'Erreur lors de la mise à jour du contenu About.'
      )
    })

    it('uses default about error message when no payload is provided', async () => {
      axios.get.mockRejectedValue(new Error('network'))
      await expect(aboutRepository.getAbout()).rejects.toThrow(
        'Erreur lors de la récupération du contenu About.'
      )
    })
  })

  describe('contact repository', () => {
    it('creates contact messages and surfaces failures', async () => {
      axiosConfig.post.mockResolvedValue({ data: { ok: true }, status: true })
      const payload = { email: 'a@example.com' }
      await expect(contactRepository.createContactMessage(payload)).resolves.toEqual({ data: { ok: true }, status: true })

      axiosConfig.post.mockRejectedValue(defaultError)
      await expect(contactRepository.createContactMessage(payload)).rejects.toThrow('Erreur de connexion')
    })
  })

  describe('event repository', () => {
    it('fetches events successfully', async () => {
      axiosConfig.get.mockResolvedValue({ data: [{ id: 1 }], status: true })
      await expect(eventRepository.getAllEvents()).resolves.toEqual([{ id: 1 }])

      axiosConfig.get.mockResolvedValue({ data: { id: 1 }, status: true })
      await expect(eventRepository.getEventById(1)).resolves.toEqual({ id: 1 })
    })

    it('creates and modifies events successfully', async () => {
      const postResponse = { data: { message: 'created' }, status: true }
      axiosConfig.post.mockResolvedValue(postResponse)
      await expect(eventRepository.postEvent(new FormData())).resolves.toEqual(postResponse)

      axiosConfig.patch.mockResolvedValue({ data: { updated: true }, status: true })
      await expect(eventRepository.updateEvent(1, new FormData())).resolves.toEqual({ updated: true })

      axiosConfig.delete.mockResolvedValue({ data: { deleted: true }, status: true })
      await expect(eventRepository.deleteEvent(1)).resolves.toEqual({ deleted: true })
    })

    it('handles event repository errors', async () => {
      axiosConfig.get.mockRejectedValueOnce(defaultError)
      await expect(eventRepository.getAllEvents()).rejects.toThrow('Erreur de connexion')

      axiosConfig.get.mockRejectedValueOnce(defaultError)
      await expect(eventRepository.getEventById(1)).rejects.toThrow('Erreur de connexion')

      axiosConfig.post.mockRejectedValueOnce({ message: 'create fail' })
      await expect(eventRepository.postEvent(new FormData())).rejects.toThrow('create fail')

      axiosConfig.patch.mockRejectedValueOnce(defaultError)
      await expect(eventRepository.updateEvent(1, new FormData())).rejects.toThrow('Erreur de connexion')

      axiosConfig.delete.mockRejectedValueOnce(defaultError)
      await expect(eventRepository.deleteEvent(1)).rejects.toThrow('Erreur de connexion')
    })
  })

  describe('news repository', () => {
    it('fetches and mutates news successfully', async () => {
      axiosConfig.get.mockResolvedValue({ data: [{ id: 1 }], status: true })
      await expect(newsRepository.getAllNews()).resolves.toEqual([{ id: 1 }])

      axiosConfig.get.mockResolvedValueOnce({ data: { id: 2 }, status: true })
      await expect(newsRepository.getNewsById(2)).resolves.toEqual({ id: 2 })

      const postResponse = { data: { message: 'created' }, status: true }
      axiosConfig.post.mockResolvedValueOnce(postResponse)
      await expect(newsRepository.postNews(new FormData())).resolves.toEqual(postResponse)

      axiosConfig.patch.mockResolvedValueOnce({ data: { updated: true }, status: true })
      await expect(newsRepository.updateNews(2, new FormData())).resolves.toEqual({ updated: true })

      axiosConfig.delete.mockResolvedValueOnce({ data: { deleted: true }, status: true })
      await expect(newsRepository.deleteNews(2)).resolves.toEqual({ deleted: true })
    })

    it('propagates news errors across endpoints', async () => {
      axiosConfig.get.mockRejectedValueOnce(defaultError)
      await expect(newsRepository.getAllNews()).rejects.toThrow('Erreur de connexion')

      axiosConfig.get.mockRejectedValueOnce(defaultError)
      await expect(newsRepository.getNewsById(1)).rejects.toThrow('Erreur de connexion')

      axiosConfig.post.mockRejectedValueOnce(defaultError)
      await expect(newsRepository.postNews(new FormData())).rejects.toThrow('Erreur de connexion')

      axiosConfig.patch.mockRejectedValueOnce(defaultError)
      await expect(newsRepository.updateNews(1, new FormData())).rejects.toThrow('Erreur de connexion')

      axiosConfig.delete.mockRejectedValueOnce(defaultError)
      await expect(newsRepository.deleteNews(1)).rejects.toThrow('Erreur de connexion')
    })
  })

  describe('user repository', () => {
    it('handles successful flows', async () => {
      axiosConfig.post
        .mockResolvedValueOnce({ status: true, data: { token: 'tok' } })
        .mockResolvedValueOnce({ status: true, data: { token: 'signup' } })
        .mockResolvedValueOnce({ status: true, data: { verified: true } })
        .mockResolvedValueOnce({ data: { status: true, data: { email: 'sent' } } })
        .mockResolvedValueOnce({ data: { status: true, data: { message: 'reset' } } })
        .mockResolvedValueOnce({ status: true, message: 'direct email' })
        .mockResolvedValueOnce({ status: true, message: 'direct reset' })

      axiosConfig.get.mockResolvedValueOnce({ status: true, data: { id: 1 } })
      axiosConfig.patch
        .mockResolvedValueOnce({ status: true, data: { newsletter: true } })
        .mockResolvedValueOnce({ status: true, data: { changed: true } })

      await expect(userRepository.postLogin('a@example.com', 'pwd')).resolves.toEqual({ token: 'tok' })
      await expect(userRepository.postSignUp({ email: 'a@example.com' })).resolves.toEqual({ token: 'signup' })
      await expect(userRepository.getProfile()).resolves.toEqual({ id: 1 })
      await expect(userRepository.patchUpdateNewsletter(1, true)).resolves.toEqual({ newsletter: true })
      await expect(userRepository.patchUpdatePassword(1, 'old', 'new')).resolves.toEqual({ changed: true })
      await expect(userRepository.postVerifyEmail({ code: '123' })).resolves.toEqual({ verified: true })
      await expect(userRepository.postEmailForgotPassword('mail@example.com')).resolves.toEqual({ email: 'sent' })
      await expect(userRepository.postResetForgotPassword('mail@example.com', 'token', 'pwd')).resolves.toEqual({ message: 'reset' })
      await expect(userRepository.postEmailForgotPassword('branch@example.com')).resolves.toEqual({ message: 'direct email' })
      await expect(userRepository.postResetForgotPassword('branch@example.com', 'token', 'pwd')).resolves.toEqual({ message: 'direct reset' })
    })

    it('throws on ApiResponse failures without axios response', async () => {
      axiosConfig.post.mockResolvedValueOnce({ status: false, message: 'login fail' })
      await expect(userRepository.postLogin('a@example.com', 'pwd')).rejects.toThrow('login fail')

      axiosConfig.patch.mockResolvedValueOnce({ status: false, message: 'newsletter off' })
      await expect(userRepository.patchUpdateNewsletter(1, false)).rejects.toThrow('newsletter off')
    })

    it('uses axios response errors when present', async () => {
      axiosConfig.get.mockRejectedValueOnce({ response: { data: { status: false, message: 'profile err' } } })
      await expect(userRepository.getProfile()).rejects.toThrow('profile err')

      axiosConfig.post.mockRejectedValueOnce({ response: { data: { status: false, message: 'signup err' } } })
      await expect(userRepository.postSignUp({})).rejects.toThrow('signup err')

      axiosConfig.post.mockRejectedValueOnce({ response: { data: { status: false, message: 'verify err' } } })
      await expect(userRepository.postVerifyEmail({})).rejects.toThrow('verify err')

      axiosConfig.post.mockRejectedValueOnce({ response: { data: { status: false, message: 'forgot err' } } })
      await expect(userRepository.postEmailForgotPassword('a')).rejects.toThrow('forgot err')

      axiosConfig.post.mockRejectedValueOnce({ response: { data: { status: false, message: 'reset err' } } })
      await expect(userRepository.postResetForgotPassword('a', 't', 'p')).rejects.toThrow('reset err')
    })

    it('falls back to generic messages on network errors', async () => {
      axiosConfig.post.mockRejectedValueOnce(defaultError)
      await expect(userRepository.postVerifyEmail({})).rejects.toThrow('Erreur de connexion')
    })

    it('exercises error branches across endpoints', async () => {
      axiosConfig.post.mockRejectedValueOnce({ response: { data: { status: false, message: 'login resp' } } })
      await expect(userRepository.postLogin('a@example.com', 'pwd')).rejects.toThrow('login resp')

      axiosConfig.post.mockResolvedValueOnce({ status: false, message: 'signup blocked' })
      await expect(userRepository.postSignUp({})).rejects.toThrow('signup blocked')

      axiosConfig.get.mockResolvedValueOnce({ status: false, message: 'profile bad' })
      await expect(userRepository.getProfile()).rejects.toThrow('profile bad')

      axiosConfig.patch.mockRejectedValueOnce({ response: { data: { status: false, message: 'newsletter resp' } } })
      await expect(userRepository.patchUpdateNewsletter(2, true)).rejects.toThrow('newsletter resp')

      axiosConfig.patch.mockResolvedValueOnce({ status: false, message: 'password weak' })
      await expect(userRepository.patchUpdatePassword(1, 'old', 'new')).rejects.toThrow('password weak')

      axiosConfig.patch.mockRejectedValueOnce({ response: { data: { status: false, message: 'password resp' } } })
      await expect(userRepository.patchUpdatePassword(1, 'old', 'new')).rejects.toThrow('password resp')

      axiosConfig.post.mockResolvedValueOnce({ status: false, message: 'verify fail' })
      await expect(userRepository.postVerifyEmail({})).rejects.toThrow('verify fail')

      axiosConfig.post.mockResolvedValueOnce({ data: { status: false, message: 'forgot blocked' } })
      await expect(userRepository.postEmailForgotPassword('a')).rejects.toThrow('forgot blocked')

      axiosConfig.post.mockResolvedValueOnce({ data: { status: false, message: 'reset blocked' } })
      await expect(userRepository.postResetForgotPassword('a', 't', 'p')).rejects.toThrow('reset blocked')

      axiosConfig.post.mockRejectedValueOnce(new Error('network down'))
      await expect(userRepository.postResetForgotPassword('a', 't', 'p')).rejects.toThrow('network down')
    })

    it('falls back to local error messages without response payloads', async () => {
      axiosConfig.post.mockRejectedValueOnce({})
      await expect(userRepository.postLogin('a@example.com', 'pwd')).rejects.toThrow('Erreur de connexion')

      axiosConfig.post.mockRejectedValueOnce({})
      await expect(userRepository.postSignUp({})).rejects.toThrow('Erreur de connexion')

      axiosConfig.get.mockRejectedValueOnce({})
      await expect(userRepository.getProfile()).rejects.toThrow('Erreur de connexion')

      axiosConfig.patch.mockRejectedValueOnce({})
      await expect(userRepository.patchUpdateNewsletter(1, true)).rejects.toThrow('Erreur de connexion')

      axiosConfig.patch.mockRejectedValueOnce({})
      await expect(userRepository.patchUpdatePassword(1, 'old', 'new')).rejects.toThrow('Erreur de connexion')

      axiosConfig.post.mockRejectedValueOnce({})
      await expect(userRepository.postVerifyEmail({})).rejects.toThrow('Erreur de connexion')

      axiosConfig.post.mockRejectedValueOnce({})
      await expect(userRepository.postEmailForgotPassword('a')).rejects.toThrow('Erreur de connexion')

      axiosConfig.post.mockRejectedValueOnce({})
      await expect(userRepository.postResetForgotPassword('a', 't', 'p')).rejects.toThrow('Erreur de connexion')
    })
  })
})
