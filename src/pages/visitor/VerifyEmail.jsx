import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import React, { useState, useEffect, useRef } from 'react'
import postVerifyEmail from '../../services/user/postVerifyEmail'

export default function VerifyEmail() {
  const { email, login } = useAuth()
  const inputsRef = useRef([])
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [verificationCode, setVerificationCode] = useState(Array(6).fill(''))

  useEffect(() => {
    if (verificationCode.every((digit) => digit !== '')) {
      handleSubmit()
    }
  }, [verificationCode])

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return

    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasteData = e.clipboardData
      .getData('text')
      .slice(0, 6)
      .replace(/\D/g, '')
    if (pasteData.length === 6) {
      setVerificationCode(pasteData.split(''))
      inputsRef.current[5]?.focus()
    }
  }

  const handleSubmit = async () => {
    setErrorMessage('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const response = await postVerifyEmail({
        email,
        emailVerificationToken: verificationCode.join(''),
      })
      // Si la réponse contient un token et des infos utilisateur, connecter automatiquement
      if (response.data && response.data.accessToken && response.data.user) {
        login({
          accessToken: response.data.accessToken,
          user: response.data.user
        })
        setSuccessMessage('Email vérifié avec succès ! Connexion automatique...')
        setTimeout(() => {
          navigate('/news')
        }, 2000)
      } else {
        // Fallback si pas de données de connexion
        setSuccessMessage(response.data?.message || 'Email vérifié avec succès !')
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (error) {
      setErrorMessage(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="verify-email">
      <h1 className="verify-email__title">Vérification de l'email</h1>
      <hr className="verify-email__hr" />
      <form className="verify-email__form">
        <label className="verify-email__form-label">
          Code de vérification :
        </label>
        <div className="verify-email__inputs">
          {verificationCode.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              className="verify-email__input"
              type="text"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onPaste={handlePaste}
              maxLength={1}
              disabled={loading}
            />
          ))}
        </div>

        {errorMessage && (
          <p className="verify-email__error" aria-live="polite">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="verify-email__success" aria-live="polite">
            {successMessage} Redirection en cours...
          </p>
        )}
      </form>
    </div>
  )
}
