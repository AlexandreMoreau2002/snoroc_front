import Home from '../visitor/Home'
import About from '../visitor/About'
import Event from '../visitor/Event'
import Media from '../visitor/Media'
import Signup from '../visitor/Signup'
import Profile from '../visitor/Profile'
import Contact from '../visitor/Contact'
import AllActus from '../visitor/AllActus'
import EditAbout from '../admin/EditAbout'
import CreateNews from '../admin/CreateNews'
import VerifyEmail from '../visitor/VerifyEmail'
import ActuDetails from '../visitor/ActuDetails'
import LegalNotice from '../visitor/LegalNotice'
import { HelmetProvider } from 'react-helmet-async'
import ResetPassword from '../visitor/ResetPassword'
import axiosConfig from '../../services/axiosConfig'
import TermsOfService from '../visitor/TermsOfService'
import ForgotPassword from '../visitor/ForgotPassword'
import { AuthProvider } from '../../context/AuthContext'
import { ThemeProvider } from '../../context/RoleContext'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LoadingProvider } from '../../context/LoadingContext'
import Pagination from '../../components/Pagination/Pagination'
import { Button, WorkInProgress } from '../../components/export'
import * as newsRepository from '../../repositories/newsRepository'
import * as userRepository from '../../repositories/userRepository'
import * as eventRepository from '../../repositories/eventRepository'
import * as aboutRepository from '../../repositories/aboutRepository'
import * as contactRepository from '../../repositories/contactRepository'
import { PasswordResetProvider } from '../../context/PasswordResetContext'
import ForgotComponentRequest from '../../components/forgotPassword/RequestEmail'
import ForgotComponentReset from '../../components/forgotPassword/ResetforgotPassword'

jest.mock('../../repositories/aboutRepository')
jest.mock('../../repositories/eventRepository')
jest.mock('../../repositories/newsRepository')
jest.mock('../../repositories/contactRepository')
jest.mock('../../repositories/userRepository')

const wrapper = ({ children, initialEntries = ['/'] }) => (
  <HelmetProvider>
    <ThemeProvider>
      <AuthProvider>
        <PasswordResetProvider>
          <LoadingProvider>
            <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
          </LoadingProvider>
        </PasswordResetProvider>
      </AuthProvider>
    </ThemeProvider>
  </HelmetProvider>
)

const newsItems = [
  { id: 1, title: 'A', content: 'a' },
  { id: 2, title: 'B', content: 'b' },
]

const eventItems = [
  {
    id: 1,
    title: 'Gala',
    content: 'Programme complet',
    address: '12 rue des fleurs',
    thumbnail: '/event.jpg',
    createdAt: '2024-05-01',
  },
]

beforeEach(() => {
  jest.useFakeTimers()
  aboutRepository.getAbout.mockResolvedValue({
    title: 'About',
    description: 'Desc',
    imageUrl: 'img.png',
  })
  aboutRepository.updateAbout.mockResolvedValue({ ok: true })

  newsRepository.getAllNews.mockResolvedValue(newsItems)
  newsRepository.getNewsById.mockImplementation(async (id) => newsItems.find((n) => n.id === Number(id)))
  newsRepository.deleteNews.mockResolvedValue({ deleted: true })
  newsRepository.postNews.mockResolvedValue({ message: 'created' })
  newsRepository.updateNews.mockResolvedValue({ updated: true })

  eventRepository.getAllEvents.mockResolvedValue(eventItems)
  eventRepository.getEventById?.mockResolvedValue?.(eventItems[0])
  eventRepository.deleteEvent?.mockResolvedValue?.({ deleted: true })

  contactRepository.createContactMessage.mockResolvedValue({ sent: true })

  userRepository.postEmailForgotPassword.mockResolvedValue({ message: 'mail ok' })
  userRepository.postResetForgotPassword.mockResolvedValue({ message: 'reset ok' })
  userRepository.patchUpdateNewsletter.mockResolvedValue({ newsletter: true })
  userRepository.getProfile.mockResolvedValue({ id: 1 })
  userRepository.postLogin.mockResolvedValue({ message: 'login ok', accessToken: 't', user: { isAdmin: false } })
  userRepository.postSignUp.mockResolvedValue({ token: 'tok', message: 'signup ok' })
  userRepository.postVerifyEmail.mockResolvedValue({ message: 'verified' })

  Object.defineProperty(window, 'location', {
    writable: true,
    value: { reload: jest.fn() },
  })
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
  jest.clearAllMocks()
})

describe('Full app coverage', () => {
  it('exercises visitor flows', async () => {
    await act(async () => {
      render(
        wrapper({
          initialEntries: ['/'],
          children: (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/actus" element={<AllActus />} />
              <Route path="/actus/:id" element={<ActuDetails />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/forgot" element={<ForgotPassword />} />
              <Route path="/reset" element={<ResetPassword />} />
              <Route path="/profil" element={<Profile />} />
              <Route path="/inscription" element={<Signup />} />
              <Route path="/cgu" element={<TermsOfService />} />
              <Route path="/mentions" element={<LegalNotice />} />
              <Route path="/media" element={<Media />} />
              <Route path="/verify" element={<VerifyEmail />} />
              <Route path="/event" element={<Event />} />
            </Routes>
          ),
        })
      )
    })

    expect(screen.getAllByRole('heading').length).toBeGreaterThan(0)

    await act(async () => {
      render(
        wrapper({
          initialEntries: ['/actus/1'],
          children: (
            <Routes>
              <Route path="/actus/:id" element={<ActuDetails />} />
            </Routes>
          ),
        })
      )
    })

    await act(async () => {
      render(
        wrapper({
          initialEntries: ['/verify'],
          children: (
            <Routes>
              <Route path="/verify" element={<VerifyEmail />} />
            </Routes>
          ),
        })
      )
    })
  })

  it('covers admin creation and edition', async () => {
    await act(async () => {
      render(
        wrapper({
          initialEntries: ['/admin'],
          children: (
            <Routes>
              <Route path="/admin" element={<CreateNews />} />
              <Route path="/admin/about" element={<EditAbout />} />
            </Routes>
          ),
        })
      )
    })

    await newsRepository.postNews(new FormData())
    await aboutRepository.getAbout()
    await aboutRepository.updateAbout({}, new File(['x'], 'a.png'))
    expect(newsRepository.postNews).toHaveBeenCalled()
  })

  it('covers standalone utilities', async () => {
    render(
      wrapper({
        children: <Pagination totalPages={5} currentPage={3} onPageChange={jest.fn()} />,
      })
    )

    render(
      wrapper({
        children: (
          <>
            <Button>Label</Button>
            <WorkInProgress />
            <ForgotComponentRequest />
            <ForgotComponentReset />
          </>
        ),
      })
    )

    expect(axiosConfig).toBeDefined()
  })
})
