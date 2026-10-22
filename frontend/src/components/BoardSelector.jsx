/**
 * Pano seçici bileşeni
 * Kullanıcının panolarını listeler ve seçim yapmasını sağlar
 */
import './BoardSelector.css';

function BoardSelector({ boards, selectedBoard, onSelectBoard, onCreateBoard, onDeleteBoard }) {
  return (
    <div className="board-selector">
      <div className="boards-list">
        {boards.map(board => (
          <div
            key={board.id}
            className={`board-item ${selectedBoard?.id === board.id ? 'active' : ''}`}
            onClick={() => onSelectBoard(board)}
          >
            <span className="board-name">{board.title}</span>
            <button
              className="delete-board-btn"
              onClick={(e) => {
                e.stopPropagation(); // Parent click'i tetikleme
                onDeleteBoard(board.id);
              }}
              title="Panoyu sil"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      <button className="create-board-btn" onClick={onCreateBoard}>
        + Yeni Pano
      </button>
    </div>
  );
}

export default BoardSelector;
