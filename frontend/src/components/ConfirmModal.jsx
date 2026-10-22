/**
 * Confirmation Modal - Özel Onay Dialogu
 * Tarayıcının confirm() yerine kullanılır, tasarımla uyumlu
 * React Portal ile document.body'ye render edilir
 */
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import './ConfirmModal.css';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'danger' }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  // Backdrop tıklayınca kapat
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className="confirm-modal-overlay" onClick={handleBackdropClick}>
      <div className="confirm-modal-content">
        <div className="confirm-modal-icon">
          {type === 'danger' && '⚠️'}
          {type === 'warning' && '🔔'}
          {type === 'info' && 'ℹ️'}
        </div>

        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>

        <div className="confirm-modal-actions">
          <button 
            className="confirm-btn cancel"
            onClick={handleCancel}
          >
            {cancelText || t('common.cancel')}
          </button>
          <button 
            className={`confirm-btn ${type}`}
            onClick={handleConfirm}
            autoFocus
          >
            {confirmText || t('common.delete')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmModal;
