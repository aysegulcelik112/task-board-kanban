/**
 * Görev kartı bileşeni
 * Tek bir görevin görsel temsili
 * @dnd-kit ile sürüklenebilir
 */
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './TaskCard.css';

function TaskCard({ task, onRefresh, onEdit, onDelete }) {
  // dnd-kit sortable setup
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      await onDelete(task.id);
      onRefresh();
    }
  };

  const handleEdit = () => {
    onEdit(task);
  };
  // Öncelik rengini belirle
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#1e90ff';
      default: return '#888';
    }
  };

  // Öncelik Türkçe karşılığı
  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return priority;
    }
  };

  // Tarihi formatla
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Deadline geçmiş mi kontrol et
  const isOverdue = () => {
    if (!task.deadline) return false;
    const now = new Date();
    const deadline = new Date(task.deadline);
    return deadline < now && task.status !== 'done';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card"
      onClick={handleEdit}
    >
      <div className="task-card-header">
        <h4 className="task-title">{task.title}</h4>
        <div className="task-card-actions">
          <span
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          >
            {getPriorityText(task.priority)}
          </span>
          <button
            className="delete-task-btn"
            onClick={handleDelete}
            title="Görevi sil"
          >
            🗑️
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      {task.deadline && (
        <div className={`task-deadline ${isOverdue() ? 'overdue' : ''}`}>
          📅 {formatDate(task.deadline)}
          {isOverdue() && ' (Gecikmiş!)'}
        </div>
      )}

      {task.labels && task.labels.length > 0 && (
        <div className="task-labels">
          {task.labels.map(label => (
            <span
              key={label.id}
              className="label-badge"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskCard;
