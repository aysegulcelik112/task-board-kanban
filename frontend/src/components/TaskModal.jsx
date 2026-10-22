/**
 * Görev ekleme/düzenleme modalı
 * Yeni görev oluştur veya mevcut görevi düzenle
 * 3 Bölgeli Layout: Sticky Header + Scrollable Body + Sticky Footer
 * React Portal kullanarak document.body'ye render edilir (CSS backdrop-filter sorununu çözer)
 */
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import './TaskModal.css';

function TaskModal({ task, boardId, onClose, onSubmit }) {
  const { t } = useTranslation();
  const isEdit = !!task;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    deadline: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Düzenleme modundaysa mevcut görev verilerini yükle
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        deadline: task.deadline ? task.deadline.split('T')[0] : '',
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Deadline'ı ISO formatına çevir
      const submitData = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      };

      if (!isEdit) {
        submitData.board_id = boardId;
      }

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Görev kaydedilemedi:', error);
      alert('Görev kaydedilemedi: ' + (error.response?.data?.detail || 'Bilinmeyen hata'));
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* ÜST BÖLGE - STICKY HEADER */}
        <div className="task-modal-header">
          <h3>{isEdit ? `✏️ ${t('task.editTask')}` : `➕ ${t('task.createTask')}`}</h3>
          <button className="close-btn" onClick={onClose} type="button" aria-label={t('common.close')}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ORTA BÖLGE - SCROLLABLE BODY */}
          <div className="task-modal-body">
            <div className="form-group">
              <label>{t('task.taskTitle')} *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Örn: API entegrasyonu yap"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>{t('task.taskDescription')}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Görev hakkında detaylı bilgi..."
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('task.status')}</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="todo">📋 {t('status.todo')}</option>
                  <option value="in_progress">🔄 {t('status.in_progress')}</option>
                  <option value="done">✅ {t('status.done')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('task.priority')}</label>
                <select name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="low">🔵 {t('priority.low')}</option>
                  <option value="medium">🟡 {t('priority.medium')}</option>
                  <option value="high">🔴 {t('priority.high')}</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>{t('task.deadline')}</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* ALT BÖLGE - STICKY FOOTER */}
          <div className="task-modal-footer">
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                {t('common.cancel')}
              </button>
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? `⏳ ${t('common.loading')}` : (isEdit ? t('common.update') : t('common.create'))}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default TaskModal;
