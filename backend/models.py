"""
Veritabanı modelleri - SQLAlchemy ORM sınıfları
Her sınıf veritabanında bir tabloya karşılık gelir
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


# Çoka-çok ilişki için ara tablo: Task ↔ Label
# Bir görevin birden fazla etiketi, bir etiketin birden fazla görevi olabilir
task_labels = Table(
    'task_labels',
    Base.metadata,
    Column('task_id', Integer, ForeignKey('tasks.id', ondelete='CASCADE'), primary_key=True),
    Column('label_id', Integer, ForeignKey('labels.id', ondelete='CASCADE'), primary_key=True)
)


class User(Base):
    """
    Kullanıcı modeli
    Sisteme kayıtlı kullanıcıların bilgilerini tutar
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    avatar_url = Column(String(255), nullable=True)  # Profil fotoğrafı URL'i
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # İlişkiler (relationships)
    boards = relationship("Board", back_populates="owner", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="creator", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(username='{self.username}', email='{self.email}')>"


class Board(Base):
    """
    Pano/Board modeli
    Kullanıcılar birden fazla pano oluşturabilir (örn: "Kişisel", "İş", "Okul")
    Her pano içinde birden fazla görev olabilir
    """
    __tablename__ = "boards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # İlişkiler
    owner = relationship("User", back_populates="boards")
    tasks = relationship("Task", back_populates="board", cascade="all, delete-orphan")
    labels = relationship("Label", back_populates="board", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Board(title='{self.title}', owner_id={self.owner_id})>"


class Task(Base):
    """
    Görev modeli - Uygulamanın ana varlığı
    Her görev bir panoya aittir ve bir durum (status) içerir
    """
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # Görev durumu: "todo" (yapılacak), "in_progress" (devam ediyor), "done" (tamamlandı)
    status = Column(String(20), default="todo", nullable=False, index=True)
    
    # Öncelik seviyesi (opsiyonel): "low", "medium", "high"
    priority = Column(String(20), default="medium")
    
    # Son teslim tarihi (deadline)
    deadline = Column(DateTime(timezone=True), nullable=True)
    
    # Hangi panoya ait?
    board_id = Column(Integer, ForeignKey("boards.id", ondelete="CASCADE"), nullable=False)
    
    # Kim oluşturdu?
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Sıralama için (aynı durumdaki görevlerin sırası)
    position = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # İlişkiler
    board = relationship("Board", back_populates="tasks")
    creator = relationship("User", back_populates="tasks")
    comments = relationship("Comment", back_populates="task", cascade="all, delete-orphan")
    labels = relationship("Label", secondary=task_labels, back_populates="tasks")

    def __repr__(self):
        return f"<Task(title='{self.title}', status='{self.status}')>"


class Comment(Base):
    """
    Yorum modeli
    Kullanıcılar görevlere yorum ekleyebilir
    """
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    
    # Hangi göreve ait?
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    
    # Kim yazdı?
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # İlişkiler
    task = relationship("Task", back_populates="comments")
    author = relationship("User", back_populates="comments")

    def __repr__(self):
        return f"<Comment(task_id={self.task_id}, author_id={self.author_id})>"


class Label(Base):
    """
    Etiket/Label modeli
    Görevleri kategorize etmek için kullanılır (örn: "Bug", "Feature", "Urgent")
    Her etiketin bir rengi vardır (görsel ayrım için)
    """
    __tablename__ = "labels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    
    # Renk kodu (hex formatında, örn: "#FF5733")
    color = Column(String(7), default="#808080")
    
    # Hangi panoya ait?
    board_id = Column(Integer, ForeignKey("boards.id", ondelete="CASCADE"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # İlişkiler
    board = relationship("Board", back_populates="labels")
    tasks = relationship("Task", secondary=task_labels, back_populates="labels")

    def __repr__(self):
        return f"<Label(name='{self.name}', color='{self.color}')>"
