import { useEffect, useState } from 'react'

const DEFAULT_DURATION = 3000

export default function StatusMessage({
  message,
  status = 'success',
  variant,
  duration = DEFAULT_DURATION,
  onHide,
}) {
  const type = variant || status
  const normalizedStatus = type === 'error' ? 'error' : 'success'
  const [visible, setVisible] = useState(Boolean(message))

  useEffect(() => {
    if (!message) {
      setVisible(false)
      return
    }

    setVisible(true)

    const timer = setTimeout(() => {
      setVisible(false)
      onHide?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [message, duration, onHide])

  if (!message || !visible) {
    return null
  }

  return (
    <p
      className={`status-message status-message--${normalizedStatus}`}
      role="status"
    >
      {message}
    </p>
  )
}
