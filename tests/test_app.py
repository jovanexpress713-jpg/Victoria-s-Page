from fastapi.testclient import TestClient
from app.main import INSIGHTS, app

client = TestClient(app)


def test_home():
    r = client.get('/')
    assert r.status_code == 200
    assert 'Victoria Line Soft' in r.text
    assert 'vls-recommend' in r.text


def test_health():
    r = client.get('/health')
    assert r.status_code == 200
    data = r.json()
    assert data['status'] == 'ok'
    assert data['version'] == '2.5.0'
    assert data['ai_configured'] == bool(__import__('os').getenv('OPENAI_API_KEY', '').strip())
    assert data['database_backend'] in {'postgresql', 'sqlite'}
    assert data['database_persistent_configured'] == bool(
        __import__('os').getenv('DATABASE_URL')
        or __import__('os').getenv('POSTGRES_URL')
        or __import__('os').getenv('POSTGRES_PRISMA_URL')
    )


def test_security_headers():
    r = client.get('/')
    assert r.headers['x-content-type-options'] == 'nosniff'
    assert r.headers['x-frame-options'] == 'DENY'
    assert r.headers['referrer-policy'] == 'strict-origin-when-cross-origin'


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


def test_insights_list_and_search():
    r = client.get('/insights')
    assert r.status_code == 200
    assert 'افهم ما يتغيّر' in r.text
    first = INSIGHTS[0]
    filtered = client.get('/insights', params={'q': first['title'][:12]})
    assert filtered.status_code == 200
    assert first['title'] in filtered.text


def test_insight_detail_and_missing_slug():
    slug = INSIGHTS[0]['slug']
    assert client.get(f'/insights/{slug}').status_code == 200
    assert client.get('/insights/this-article-does-not-exist').status_code == 404
