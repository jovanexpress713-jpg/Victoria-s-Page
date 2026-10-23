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


def test_whatsapp_redirect():
    r = client.get('/whatsapp', follow_redirects=False)
    assert r.status_code == 307
    assert 'wa.me/967771119726' in r.headers['location']


def test_ai_requires_message():
    r = client.post('/api/ai/chat', json={})
    assert r.status_code == 400


def test_admin_is_protected():
    r = client.get('/admin', follow_redirects=False)
    assert r.status_code == 303
    assert r.headers['location'] == '/admin/login'
