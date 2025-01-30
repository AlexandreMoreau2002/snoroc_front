// src/services/mocks/mockData.js

export const mockLogin = {
  accessToken: process.env.REACT_APP_TOKEN,
  user: {
    id: 1,
    firstname: 'Alex',
    lastname: 'Dev',
    email: 'pricedelu@gmail.com',
    isAdmin: true,
  },
}

export const mockUsers = [
  {
    id: 1,
    firstname: 'Admin',
    lastname: 'User',
    email: 'pricedelu@gmail.com',
    userPhone: '0769666370',
    civility: 'Mr',
    newsletter: false,
    isVerified: true,
    isAdmin: true,
    createdAt: '2025-01-17T23:08:57.000Z',
    updatedAt: '2025-01-17T23:08:57.000Z',
  },
  {
    id: 2,
    firstname: 'Test',
    lastname: 'User',
    email: 'moreaualexandre2002@gmail.com',
    userPhone: '0769666370',
    civility: 'Mrs',
    newsletter: true,
    isVerified: false,
    isAdmin: false,
    createdAt: '2025-01-16T20:00:00.000Z',
    updatedAt: '2025-01-16T20:00:00.000Z',
  },
]

export const mockNews = [
  {
    id: 1,
    title: 'Nouvelle actualité',
    content: 'Ceci est le contenu de la nouvelle actualité.',
    thumbnail: 'http://localhost:3030uploads/1737756586873-image.jpg',
    authorId: 1,
    createdAt: '2025-01-24T22:09:46.000Z',
    updatedAt: '2025-01-24T22:09:46.000Z',
  },
  {
    id: 2,
    title: 'Nouvelle actualité',
    content: 'Ceci est le contenu de la nouvelle actualité.',
    thumbnail: 'http://localhost:3030uploads/1737756588135-image.jpg',
    authorId: 1,
    createdAt: '2025-01-24T22:09:48.000Z',
    updatedAt: '2025-01-24T22:09:48.000Z',
  },
  {
    id: 3,
    title: 'Nouvelle actualité',
    content: 'Ceci est le contenu de la nouvelle actualité.',
    thumbnail: 'http://localhost:3030uploads/1737756588482-image.jpg',
    authorId: 1,
    createdAt: '2025-01-24T22:09:48.000Z',
    updatedAt: '2025-01-24T22:09:48.000Z',
  },
  {
    id: 4,
    title: 'Nouvelle actualité',
    content: 'Ceci est le contenu de la nouvelle actualité.',
    thumbnail: 'http://localhost:3030uploads/1737756588744-image.jpg',
    authorId: 1,
    createdAt: '2025-01-24T22:09:48.000Z',
    updatedAt: '2025-01-24T22:09:48.000Z',
  },
  {
    id: 5,
    title: 'Nouvelle actualité',
    content: 'Ceci est le contenu de la nouvelle actualité.',
    thumbnail: 'http://localhost:3030uploads/1737756588939-image.jpg',
    authorId: 1,
    createdAt: '2025-01-24T22:09:48.000Z',
    updatedAt: '2025-01-24T22:09:48.000Z',
  },
  {
    id: 7,
    title: 'Nouvelle actualité',
    content: 'Ceci est le contenu de la nouvelle actualité.',
    thumbnail: 'http://localhost:3030uploads/1737757119165-image.jpg',
    authorId: 1,
    createdAt: '2025-01-24T22:18:39.000Z',
    updatedAt: '2025-01-24T22:18:39.000Z',
  },
]
