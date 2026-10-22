"""
Basit API Testleri - Pytest
"""


def test_root(client):
    """Ana sayfa testi"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data


def test_register_user(client):
    """Kullanıcı kaydı testi"""
    response = client.post("/auth/register", json={
        "username": "testuser1",
        "email": "test1@example.com",
        "password": "testpass123",
        "full_name": "Test User"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser1"
    assert data["email"] == "test1@example.com"


def test_login(client):
    """Giriş testi"""
    # Önce kayıt ol
    client.post("/auth/register", json={
        "username": "testuser2",
        "email": "test2@example.com",
        "password": "testpass123"
    })
    
    # Giriş yap
    response = client.post("/auth/login", json={
        "username": "testuser2",
        "password": "testpass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    """Yanlış şifre ile giriş testi"""
    # Kayıt
    client.post("/auth/register", json={
        "username": "testuser3",
        "email": "test3@example.com",
        "password": "correctpass"
    })
    
    # Yanlış şifre ile giriş
    response = client.post("/auth/login", json={
        "username": "testuser3",
        "password": "wrongpassword"
    })
    assert response.status_code == 401


def test_get_current_user(client):
    """Token ile kullanıcı bilgisi alma testi"""
    # Kayıt ve giriş
    client.post("/auth/register", json={
        "username": "testuser4",
        "email": "test4@example.com",
        "password": "testpass123"
    })
    
    login_response = client.post("/auth/login", json={
        "username": "testuser4",
        "password": "testpass123"
    })
    token = login_response.json()["access_token"]
    
    # Token ile kullanıcı bilgisi al
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser4"


def test_create_board_and_task(client):
    """Pano ve görev oluşturma testi"""
    # Kayıt ve giriş
    client.post("/auth/register", json={
        "username": "testuser5",
        "email": "test5@example.com",
        "password": "testpass123"
    })
    
    login_response = client.post("/auth/login", json={
        "username": "testuser5",
        "password": "testpass123"
    })
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Pano oluştur
    board_response = client.post("/boards/", json={
        "title": "Test Board",
        "description": "Test description"
    }, headers=headers)
    
    assert board_response.status_code == 201
    board_id = board_response.json()["id"]
    
    # Görev oluştur
    task_response = client.post("/tasks/", json={
        "title": "Test Task",
        "description": "Task description",
        "status": "todo",
        "priority": "high",
        "board_id": board_id
    }, headers=headers)
    
    assert task_response.status_code == 201
    task_data = task_response.json()
    assert task_data["title"] == "Test Task"
    assert task_data["status"] == "todo"


def test_get_tasks(client):
    """Görev listeleme testi"""
    # Kayıt ve giriş
    client.post("/auth/register", json={
        "username": "testuser6",
        "email": "test6@example.com",
        "password": "testpass123"
    })
    
    login_response = client.post("/auth/login", json={
        "username": "testuser6",
        "password": "testpass123"
    })
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Pano ve görev oluştur
    board_response = client.post("/boards/", json={"title": "Board"}, headers=headers)
    board_id = board_response.json()["id"]
    
    client.post("/tasks/", json={
        "title": "Task 1",
        "board_id": board_id,
        "status": "todo"
    }, headers=headers)
    
    # Görevleri listele
    response = client.get(f"/tasks/?board_id={board_id}", headers=headers)
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) >= 1
    assert tasks[0]["title"] == "Task 1"
