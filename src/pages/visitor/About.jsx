import Actus from '../../asset/Actus.jpg'
import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/export'
import { useAuth } from '../../context/AuthContext'
import { getAbout } from '../../repositories/aboutRepository'

export default function About() {
  const [aboutData, setAboutData] = useState({
    title: 'Snoroc',
    description: '',
    image: null
  })
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user && user.isAdmin

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const data = await getAbout()
        if (data) {
          setAboutData(data)
        }
      } catch (error) {
        console.error('Erreur chargement About:', error)
      }
    }
    fetchAbout()
  }, [])

  const paragraphs = aboutData.description 
    ? aboutData.description.split('\n').filter(p => p.trim() !== '')
    : []

  const imageUrl = aboutData.image || Actus

  return (
    <>
      <Helmet>
        <title>À propos</title>
      </Helmet>
      <main className="about">
        <section className="about__intro">
          <h1 id="about-heading" className="about__title">
            {aboutData.title}
          </h1>
          <div className="about__media">
            <img src={imageUrl} alt={aboutData.title} loading="lazy" />
          </div>
          {paragraphs.length > 0 && (
            <p className="about__lead">{paragraphs[0]}</p>
          )}
        </section>

        <section className="about__body">
          {paragraphs.slice(1).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>

        {isAdmin && (
          <Button
            className="admin-button"
            variant="primary"
            onClick={() => navigate('/admin/about/edit')}
          >
            Modifier
          </Button>
        )}
      </main>
    </>
  )
}
