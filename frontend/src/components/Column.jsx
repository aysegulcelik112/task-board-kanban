/**
 * Kanban sütunu bileşeni
 * Bir duruma ait tüm görevleri gösterir
 * @dnd-kit ile sürükle-bırak desteği
 */
import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import './Column.css';

function Column({ title, status, tasks, onRefresh, boardId, onCreateTask, onUpdateTask, onDeleteTask }) {
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // dnd-kit droppable setup
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleSubmit = async (taskData) => {
    if (editingTask) {
      await onUpdateTask(editingTask.id, taskData);
    } else {
      // Yeni görev oluştururken durumu otomatik ayarla
      await onCreateTask({ ...taskData, status });
    }
    setShowModal(false);
    setEditingTask(null);
  };

  // Görev ID'lerini dnd-kit için hazırla
  const taskIds = tasks.map(task => task.id);

  return (
    <div className={`column column-${status}`}>
      <div className="column-header">
        <h3>{title}</h3>
        <span className="task-count">{tasks.length}</span>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`tasks-list ${isOver ? 'dragging-over' : ''}`}
        >
          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>Henüz görev yok</p>
              <p className="empty-hint">Aşağıdaki + butonuna tıklayarak ekleyin</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onRefresh={onRefresh}
                onEdit={handleEditTask}
                onDelete={onDeleteTask}
              />
            ))
          )}
        </div>
      </SortableContext>

      <button className="add-task-btn" onClick={handleCreateTask}>
        + Görev Ekle
      </button>

      {showModal && (
        <TaskModal
          task={editingTask}
          boardId={boardId}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

export default Column;
