import { Button } from './export'
import PropTypes from 'prop-types'

export default function ConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  message,
}) {
  if (!isOpen) return null

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal-content">
        <p>{message}</p>
        <div className="confirmation-modal-actions">
          <Button variant="secondary" onClick={onCancel}>
            Non
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Oui
          </Button>
        </div>
      </div>
    </div>
  )
}

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
}
