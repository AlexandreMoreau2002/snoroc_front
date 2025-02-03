import React, { useState } from 'react'
import RequestEmail from '../../components/forgotPassword/RequestEmail'
import ResetPassword from '../../components/forgotPassword/ResetforgotPassword'
import { useSearchParams } from 'react-router-dom'

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  return (
    <div className="forgot-password">
      {token ? (
        <ResetPassword token={token} />
      ) : (
        <RequestEmail setStep={setStep} setEmail={setEmail} />
      )}
    </div>
  )
}
