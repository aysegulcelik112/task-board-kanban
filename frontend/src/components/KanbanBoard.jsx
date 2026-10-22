/**
 * Kanban Board - Ana görev yönetimi bileşeni
 * 3 sütunlu yapı: Todo, In Progress, Done
 * @dnd-kit ile sürükle-bırak desteği (React 18 uyumlu)
 */
import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import Column from './Column';
import BoardSelector from './BoardSelector';
import CreateBoardModal from './CreateBoardModal';
import Confetti from './Confetti';
import ConfirmModal from './ConfirmModal';
import './KanbanBoard.css';

function KanbanBoard({ user, onNavigate, darkMode, setDarkMode }) {
  const { logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  // dnd-kit sensors - klavye ve fare desteği
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px hareket ettikten sonra sürükleme başlasın
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Kullanıcının baş harfini al (avatar için)
  const getUserInitial = () => {
    if (user.full_name) {
      return user.full_name.charAt(0).toUpperCase();
    }
    return user.username.charAt(0).toUpperCase();
  };

  // Dropdown menüyü dışarı tıklayınca kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-profile-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Panoları yükle
  useEffect(() => {
    fetchBoards();
  }, []);

  // Seçili pano değiştiğinde görevleri yükle
  useEffect(() => {
    if (selectedBoard) {
      fetchTasks();
    }
  }, [selectedBoard]);

  const fetchBoards = async () => {
    try {
      const response = await axios.get('/boards/');
      setBoards(response.data);
      
      // İlk panoyu otomatik seç (varsa)
      if (response.data.length > 0 && !selectedBoard) {
        setSelectedBoard(response.data[0]);
      }
    } catch (error) {
      console.error('Panolar yüklenemedi:', error);
    }
  };

  const fetchTasks = async () => {
    if (!selectedBoard) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/tasks/?board_id=${selectedBoard.id}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Görevler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (boardData) => {
    try {
      const response = await axios.post('/boards/', boardData);
      setBoards([...boards, response.data]);
      setSelectedBoard(response.data);
      setShowCreateModal(false);
      toast.success(t('toast.boardCreated'));
    } catch (error) {
      console.error('Pano oluşturulamadı:', error);
      toast.error(t('toast.error'));
    }
  };

  const handleDeleteBoard = async (boardId) => {
    // Confirm modal'ı göster
    setConfirmModal({
      isOpen: true,
      title: t('board.deleteBoard'),
      message: t('board.deleteBoardConfirm'),
      onConfirm: async () => {
        try {
          await axios.delete(`/boards/${boardId}`);
          const newBoards = boards.filter(b => b.id !== boardId);
          setBoards(newBoards);
          
          // Silinen pano seçiliyse, başka bir panoyu seç
          if (selectedBoard?.id === boardId) {
            setSelectedBoard(newBoards[0] || null);
          }
          toast.success(t('toast.boardDeleted'));
        } catch (error) {
          console.error('Pano silinemedi:', error);
          toast.error(t('toast.error'));
        }
      },
      type: 'danger'
    });
  };

  // Görevleri durum bazında grupla
  const groupTasksByStatus = () => {
    return {
      todo: tasks.filter(task => task.status === 'todo'),
      in_progress: tasks.filter(task => task.status === 'in_progress'),
      done: tasks.filter(task => task.status === 'done'),
    };
  };

  const handleCreateTask = async (taskData) => {
    try {
      await axios.post('/tasks/', taskData);
      fetchTasks();
      toast.success(t('toast.taskCreated'));
    } catch (error) {
      console.error('Görev oluşturulamadı:', error);
      toast.error(t('toast.error'));
      throw error;
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      await axios.put(`/tasks/${taskId}`, taskData);
      fetchTasks();
      toast.success(t('toast.taskUpdated'));
    } catch (error) {
      console.error('Görev güncellenemedi:', error);
      toast.error(t('toast.error'));
      throw error;
    }
  };

  const handleDeleteTask = async (taskId) => {
    setConfirmModal({
      isOpen: true,
      title: t('task.deleteTask'),
      message: t('task.deleteTaskConfirm'),
      onConfirm: async () => {
        try {
          await axios.delete(`/tasks/${taskId}`);
          fetchTasks();
          toast.success(t('toast.taskDeleted'));
        } catch (error) {
          console.error('Görev silinemedi:', error);
          toast.error(t('toast.error'));
        }
      },
      type: 'danger'
    });
  };

  // Sürükle-bırak işlemi tamamlandığında (dnd-kit)
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    // Geçersiz bırakma
    if (!over) return;

    // Görev ID'sini ve containerları al
    const activeId = active.id;
    const overId = over.id;

    // Aktif görev datasını al
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    // Over konumu sütun mu yoksa görev mi?
    let newStatus = activeTask.status;
    let overTask = tasks.find(t => t.id === overId);
    
    // Eğer over bir sütun ID'si ise (todo, in_progress, done)
    if (['todo', 'in_progress', 'done'].includes(overId)) {
      newStatus = overId;
    } else if (overTask) {
      // Eğer başka bir görevin üzerine bırakıldıysa, o görevin statusünü al
      newStatus = overTask.status;
    }

    // Aynı sütun içinde aynı yere bırakıldı
    if (activeId === overId) return;

    // Optimistic UI update
    const updatedTasks = tasks.map(task => 
      task.id === activeId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);

    // Eğer görev "done" sütununa taşındıysa konfeti patlatconfetti!
    if (newStatus === 'done' && activeTask.status !== 'done') {
      setConfettiTrigger(prev => prev + 1);
    }

    // Backend'e gönder
    try {
      await axios.patch(`/boards/${selectedBoard.id}/tasks/${activeId}/status`, null, {
        params: {
          new_status: newStatus,
          new_position: 0
        }
      });
    } catch (error) {
      console.error('Görev durumu güncellenemedi:', error);
      // Hata olursa geri yükle
      fetchTasks();
      toast.error(t('toast.error'));
    }
  };

  const tasksByStatus = groupTasksByStatus();

  // İstatistikler hesaplama
  const stats = {
    total: tasks.length,
    todo: tasksByStatus.todo.length,
    inProgress: tasksByStatus.in_progress.length,
    done: tasksByStatus.done.length,
    completionRate: tasks.length > 0 ? Math.round((tasksByStatus.done.length / tasks.length) * 100) : 0
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Confetti trigger={confettiTrigger} />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
      <div className="kanban-container">
        {/* Modern Header with User Menu */}
        <header className="kanban-header">
          <div className="header-left">
            <h1>🎯 {t('board.title')}</h1>
          </div>
          
          <div className="header-right">
            <div className="user-profile-menu">
              <button 
                className="user-profile-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="user-avatar">{getUserInitial()}</span>
                <span>{user.full_name || user.username}</span>
                <span>{showUserMenu ? '▲' : '▼'}</span>
              </button>

              {showUserMenu && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{getUserInitial()}</div>
                    <div className="dropdown-name">{user.full_name || user.username}</div>
                    <div className="dropdown-email">{user.email}</div>
                  </div>
                  
                  <div className="dropdown-items">
                    <button className="dropdown-item" onClick={() => onNavigate('profile')}>
                      <span>👤</span>
                      <span>{t('menu.profile')}</span>
                    </button>
                    <button className="dropdown-item" onClick={() => onNavigate('settings')}>
                      <span>⚙️</span>
                      <span>{t('menu.settings')}</span>
                    </button>
                    <button className="dropdown-item" onClick={() => {
                      setDarkMode(!darkMode);
                      localStorage.setItem('darkMode', !darkMode);
                    }}>
                      <span>{darkMode ? '☀️' : '🌙'}</span>
                      <span>{darkMode ? t('menu.lightMode') : t('menu.darkMode')}</span>
                    </button>
                    <button className="dropdown-item danger" onClick={logout}>
                      <span>🚪</span>
                      <span>{t('menu.logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <BoardSelector
          boards={boards}
          selectedBoard={selectedBoard}
          onSelectBoard={setSelectedBoard}
          onCreateBoard={() => setShowCreateModal(true)}
          onDeleteBoard={handleDeleteBoard}
        />

        {selectedBoard ? (
          <div className="board-content">
            <div className="board-info">
              <h2 className="board-title">{selectedBoard.title}</h2>
              {selectedBoard.description && (
                <p className="board-description">{selectedBoard.description}</p>
              )}
            </div>

            {/* Quick Stats Dashboard */}
            <div className="stats-dashboard">
              <div className="stat-card stat-total">
                <div className="stat-icon">📊</div>
                <div className="stat-details">
                  <div className="stat-label">{t('stats.totalTasks')}</div>
                  <div className="stat-value">{stats.total}</div>
                </div>
              </div>

              <div className="stat-card stat-todo">
                <div className="stat-icon">📋</div>
                <div className="stat-details">
                  <div className="stat-label">{t('stats.todoTasks')}</div>
                  <div className="stat-value">{stats.todo}</div>
                </div>
              </div>

              <div className="stat-card stat-progress">
                <div className="stat-icon">🔄</div>
                <div className="stat-details">
                  <div className="stat-label">{t('stats.inProgressTasks')}</div>
                  <div className="stat-value">{stats.inProgress}</div>
                </div>
              </div>

              <div className="stat-card stat-done">
                <div className="stat-icon">✅</div>
                <div className="stat-details">
                  <div className="stat-label">{t('stats.doneTasks')}</div>
                  <div className="stat-value">{stats.done}</div>
                </div>
              </div>

              <div className="stat-card stat-completion">
                <div className="stat-icon">🎯</div>
                <div className="stat-details">
                  <div className="stat-label">{t('stats.completionRate')}</div>
                  <div className="stat-value">{stats.completionRate}%</div>
                </div>
                <div className="completion-bar">
                  <div className="completion-fill" style={{ width: `${stats.completionRate}%` }}></div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading">⏳ {t('common.loading')}</div>
            ) : (
              <div className="columns-container">
              <Column
                title={`📋 ${t('status.todo')}`}
                status="todo"
                tasks={tasksByStatus.todo}
                onRefresh={fetchTasks}
                boardId={selectedBoard.id}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
              <Column
                title={`🔄 ${t('status.in_progress')}`}
                status="in_progress"
                tasks={tasksByStatus.in_progress}
                onRefresh={fetchTasks}
                boardId={selectedBoard.id}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
              <Column
                title={`✅ ${t('status.done')}`}
                status="done"
                tasks={tasksByStatus.done}
                onRefresh={fetchTasks}
                boardId={selectedBoard.id}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            </div>
          )}
          </div>
        ) : (
          <div className="no-board-message">
            <p>👈 {t('board.selectBoard')}</p>
          </div>
        )}

        {showCreateModal && (
          <CreateBoardModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateBoard}
          />
        )}
      </div>
    </DndContext>
  );
}

export default KanbanBoard;
