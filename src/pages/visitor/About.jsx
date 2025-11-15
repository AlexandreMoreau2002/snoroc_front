import Actus from '../../asset/Actus.jpg'
import { Helmet } from 'react-helmet-async'

const paragraphs = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras lobortis sapien velit, quis finibus mi dignissim ut. Integer vitae libero ante. Duis ut massa blandit nunc auctor congue.',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras lobortis sapien velit, quis finibus mi dignissim ut. Integer vitae libero ante. Duis ut massa blandit nunc auctor congue eu sed elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus placerat, nulla sed mattis posuere, ligula metus rhoncus metus, eu.',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras lobortis sapien velit, quis finibus mi dignissim ut. Integer vitae libero ante. Duis ut massa blandit nunc auctor congue eu sed elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus placerat, nulla sed mattis posuere, ligula metus rhoncus metus, eu.',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras lobortis sapien velit, quis finibus mi dignissim ut. Integer vitae libero ante. Duis ut massa blandit nunc auctor congue eu sed elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus placerat, nulla sed mattis posuere, ligula metus rhoncus metus, eu.',
]

export default function About() {
  return (
    <>
      <Helmet>
        <title>À propos</title>
      </Helmet>
      <main className="about">
        <section className="about__intro">
          <h1 id="about-heading" className="about__title">
            Snoroc
          </h1>
          <div className="about__media">
            <img src={Actus} alt="Snoroc sur scène" loading="lazy" />
          </div>
          <p className="about__lead">{paragraphs[0]}</p>
        </section>

        <section className="about__body">
          {paragraphs.slice(1).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>
      </main>
    </>
  )
}
