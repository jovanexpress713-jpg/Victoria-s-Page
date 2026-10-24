from fastapi.testclient import TestClient
from app.main import INSIGHTS, app

client = TestClient(app)

# Regression checks for the shared shell and end-to-end inquiry entry points.


def test_home():
    r = client.get('/')
    assert r.status_code == 200
    assert 'Victoria Line Soft' in r.text
    assert 'vlx-recommend' in r.text
    # Every route uses the same shared navigation and footer.
    assert 'class="site-header"' in r.text
    assert 'class="site-footer"' in r.text


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
    r = client.get('/products')
    assert r.status_code == 200
    assert 'المواقع والمنصات الرقمية' in r.text
    assert 'المتاجر الإلكترونية' in r.text
    assert 'الذكاء الاصطناعي والأتمتة' in r.text
    assert '/contact?service=website' in r.text


def test_contact():
    r = client.get('/contact')
    assert r.status_code == 200
    assert 'quote-request' in r.text
    assert 'action="/quote"' in r.text
    assert 'ai-readiness' in r.text


def test_contact_prefills_selected_service_and_goal():
    r = client.get('/contact?service=store&goal=growth')
    assert r.status_code == 200
    assert 'value="store" selected' in r.text
    assert "تحسين النمو وتجربة العملاء" in r.text


def test_quote_request_is_saved_and_redirects():
    r = client.post('/quote', data={
        'name': 'اختبار تلقائي',
        'phone': '967700000000',
        'service': 'website',
        'details': 'طلب اختبار من الاختبارات الآلية'
    }, follow_redirects=False)
    assert r.status_code == 303
    assert r.headers['location'] == '/contact?saved=1'


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


def test_home_uses_original_visuals_not_stock_photos():
    r = client.get('/')
    assert r.status_code == 200
    assert 'images.unsplash.com' not in r.text
    assert r.text.count('class="project-art-svg"') >= 6
    assert 'income-art-svg' in r.text
    assert 'شفافية:' in r.text


def test_live_lab_has_four_interactive_demos():
    r = client.get('/lab')
    assert r.status_code == 200
    for panel in ('panel-shop', 'panel-dashboard', 'panel-brand', 'panel-mobile'):
        assert panel in r.text
    assert 'data-add=' in r.text
    assert 'data-range=' in r.text
    assert 'data-color=' in r.text
    assert 'data-screen=' in r.text


def test_project_architect_routes_with_machine_readable_goal_and_can_restart():
    r = client.get('/')
    assert r.status_code == 200
    assert "&goal='+encodeURIComponent(g.id)" in r.text
    assert "arch-restart" in r.text


def test_solution_pages_use_original_visuals():
    products = client.get('/products')
    assistant = client.get('/ai/sales')
    assert products.status_code == 200
    assert assistant.status_code == 200
    assert 'images.unsplash.com' not in products.text
    assert 'images.unsplash.com' not in assistant.text
    assert 'px-hero-art' in products.text
    assert 'vai-hero-art' in assistant.text
