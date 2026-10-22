"""
Kimlik doğrulama testleri
pytest ile temel authentication testleri
"""


def test_register_user(client):
    """Kullanıcı kaydı testi"""
    response = client.post("/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123",
        "full_name": "Test User"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "hashed_password" not in data  # Şifre response'da olmamalı


def test_register_duplicate_username(client):
    """Aynı kullanıcı adıyla kayıt testi (hata bekleniyar)"""
    # İlk kayıt
    client.post("/auth/register", json={
        "username": "testuser",
        "email": "test1@example.com",
        "password": "testpass123"
    })
    
    # Aynı username ile tekrar kayıt
    response = client.post("/auth/register", json={
        "username": "testuser",
        "email": "test2@example.com",
        "password": "testpass123"
    })
    assert response.status_code == 400


def test_login(client):
    """Giriş testi"""
    # Önce kayıt ol
    client.post("/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123"
    })
    
    # Giriş yap
    response = client.post("/auth/login", json={
        "username": "testuser",
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
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123"
    })
    
    # Yanlış şifre ile giriş
    response = client.post("/auth/login", json={
        "username": "testuser",
        "password": "wrongpassword"
    })
    assert response.status_code == 401


def test_get_current_user(client):
    """Mevcut kullanıcı bilgisi testi"""
    # Kayıt ve giriş
    client.post("/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123"
    })
    
    login_response = client.post("/auth/login", json={
        "username": "testuser",
        "password": "testpass123"
    })
    token = login_response.json()["access_token"]
    
    # Token ile kullanıcı bilgisi al
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
