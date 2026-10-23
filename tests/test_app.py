from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_home():
    r = client.get('/')
    assert r.status_code == 200
    assert 'Victoria Line Soft' in r.text

def test_health():
    r = client.get('/health')
    assert r.status_code == 200
    assert r.json()['status'] == 'ok'

def test_products():
    assert client.get('/products').status_code == 200

def test_contact():
    assert client.get('/contact').status_code == 200
