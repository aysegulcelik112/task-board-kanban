/**
 * Pano oluşturma modalı
 * React Portal ile document.body'ye render edilir
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import './CreateBoardModal.css';

function CreateBoardModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onCreate(formData);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📋 Yeni Pano Oluştur</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Pano Başlığı *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Örn: Kişisel Projeler"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Açıklama (opsiyonel)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Bu pano hakkında kısa bilgi..."
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="submit-btn">
              Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default CreateBoardModal;
