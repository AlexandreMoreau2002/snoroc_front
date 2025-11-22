import { useMemo, useState } from 'react'
import StatusMessage from '../../components/StatusMessage'
import { createContactMessage } from '../../repository/contact/contactRepository'

const initialFormState = {
  lastname: '',
  firstname: '',
  phone: '',
  email: '',
  subject: '',
  message: '',
}

const socialLinks = [
  { icon: 'fa-facebook', label: 'Facebook', url: 'https://facebook.com' },
  { icon: 'fa-instagram', label: 'Instagram', url: 'https://instagram.com' },
  { icon: 'fa-twitter', label: 'Twitter', url: 'https://twitter.com' },
]

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
const STATUS_DISPLAY_DURATION = 3000

export default function Contact() {
  const [formValues, setFormValues] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const socialCards = useMemo(
    () =>
      socialLinks.map((social) => (
        <a
          key={social.label}
          href={social.url}
          className="contact__social-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className={`fa-brands ${social.icon}`}></i>
        </a>
      )),
    []
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }))
    setFormErrors((prev) => {
      if (!prev[name]) {
        return prev
      }
      const nextErrors = { ...prev }
      delete nextErrors[name]
      return nextErrors
    })
  }

  const validateForm = () => {
    const errors = {}

    if (!formValues.lastname.trim()) {
      errors.lastname = 'Le nom est obligatoire.'
    }
    if (!formValues.firstname.trim()) {
      errors.firstname = 'Le prénom est obligatoire.'
    }
    if (!isValidEmail(formValues.email)) {
      errors.email = 'Veuillez saisir une adresse email valide.'
    }
    if (!formValues.subject.trim()) {
      errors.subject = 'Le sujet est obligatoire.'
    }
    if (!formValues.message.trim()) {
      errors.message = 'Merci de saisir votre message.'
    }

    return errors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const errors = validateForm()
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)

    const payload = {
      name: [formValues.firstname, formValues.lastname].filter(Boolean).join(' '),
      email: formValues.email.trim(),
      phone: formValues.phone.trim() || null,
      subject: formValues.subject.trim(),
      message: formValues.message.trim(),
    }

    try {
      await createContactMessage(payload)
      setSuccessMessage('Merci pour votre message, nous revenons vers vous rapidement.')
      setTimeout(() => {
        setSuccessMessage('')
      }, STATUS_DISPLAY_DURATION)
      setFormValues(initialFormState)
      setFormErrors({})
    } catch (error) {
      setErrorMessage(
        error?.message ||
          "Impossible d'envoyer votre message pour le moment. Merci de réessayer ultérieurement."
      )
      setTimeout(() => {
        setErrorMessage('')
      }, STATUS_DISPLAY_DURATION)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="contact">
      <section className="contact__section">
        <h2 className="contact__section-title">Nos réseaux sociaux</h2>
        <hr className="contact__divider" />
        <div className="contact__social-row">{socialCards}</div>
      </section>

      <section className="contact__section">
        <h2 className="contact__section-title">Nous contacter</h2>
        <hr className="contact__divider" />
        <form className="contact__form" onSubmit={handleSubmit} noValidate>
          <div className="contact__row contact__row--dual">
            <div className="contact__field">
              <input
                id="lastname"
                name="lastname"
                type="text"
                placeholder="Nom"
                value={formValues.lastname}
                onChange={handleChange}
              />
              {formErrors.lastname && (
                <p className="contact__field-error">{formErrors.lastname}</p>
              )}
            </div>
            <div className="contact__field">
              <input
                id="firstname"
                name="firstname"
                type="text"
                placeholder="Prenom"
                value={formValues.firstname}
                onChange={handleChange}
              />
              {formErrors.firstname && (
                <p className="contact__field-error">{formErrors.firstname}</p>
              )}
            </div>
          </div>

          <div className="contact__row">
            <div className="contact__field">
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Telephone"
                value={formValues.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="contact__row">
            <div className="contact__field">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Mail"
                value={formValues.email}
                onChange={handleChange}
              />
              {formErrors.email && (
                <p className="contact__field-error">{formErrors.email}</p>
              )}
            </div>
          </div>

          <div className="contact__row">
            <div className="contact__field">
              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="Sujet"
                value={formValues.subject}
                onChange={handleChange}
              />
              {formErrors.subject && (
                <p className="contact__field-error">{formErrors.subject}</p>
              )}
            </div>
          </div>

          <div className="contact__row">
            <div className="contact__field">
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Message"
                value={formValues.message}
                onChange={handleChange}
              ></textarea>
              {formErrors.message && (
                <p className="contact__field-error">{formErrors.message}</p>
              )}
            </div>
          </div>

          <button type="submit" className="contact__submit" disabled={isSubmitting}>
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
          </button>

          <StatusMessage status="error" message={errorMessage} />
          <StatusMessage status="success" message={successMessage} />
        </form>
      </section>
    </main>
  )
}
