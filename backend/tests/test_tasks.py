"""
Görev (Task) CRUD testleri
"""


def get_auth_token(client):
    """Test kullanıcısı oluştur ve token al"""
    client.post("/auth/register", json={
        "username": "taskuser",
        "email": "task@test.com",
        "password": "pass123"
    })
    response = client.post("/auth/login", json={
        "username": "taskuser",
        "password": "pass123"
    })
    return response.json()["access_token"]


def test_create_task(client):
    """Görev oluşturma testi"""
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Önce bir pano oluştur
    board_response = client.post("/boards/", json={
        "title": "Test Board",
        "description": "Test description"
    }, headers=headers)
    board_id = board_response.json()["id"]
    
    # Görev oluştur
    response = client.post("/tasks/", json={
        "title": "Test Task",
        "description": "Task description",
        "status": "todo",
        "priority": "high",
        "board_id": board_id
    }, headers=headers)
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["status"] == "todo"


def test_get_tasks(client):
    """Görev listeleme testi"""
    token = get_auth_token(client)
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
    assert len(tasks) == 1
    assert tasks[0]["title"] == "Task 1"
