export default function StatusMessage({ status = 'success', message }) {
  if (!message) {
    return null
  }

  const normalizedStatus = status === 'error' ? 'error' : 'success'

  return (
    <p
      className={`status-message status-message--${normalizedStatus}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </p>
  )
}
