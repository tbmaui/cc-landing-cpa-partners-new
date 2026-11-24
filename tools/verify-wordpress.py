"""Verify the local native editor, responsive page and interactive behavior.

Requires an isolated WordPress install, build/wp-fixtures.json, and local test
credentials in CC_TEST_USER / CC_TEST_PASSWORD or the established review cache.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

repo = Path(__file__).resolve().parents[1]
fixtures = json.loads((repo / 'build/wp-fixtures.json').read_text(encoding='utf-8'))
auth_path = Path.home() / '.cache/cc-page-review/review-auth.json'
auth = json.loads(auth_path.read_text(encoding='utf-8')) if auth_path.exists() else {}
username = os.environ.get('CC_TEST_USER', auth.get('user', ''))
password = os.environ.get('CC_TEST_PASSWORD', auth.get('password', ''))
base = os.environ.get('CC_TEST_URL', 'http://127.0.0.1:8099')
assert username and password, 'Local editor test credentials are required'
results = {'editor': [], 'responsive': []}
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=str(Path.home() / 'AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe'))
    context = browser.new_context()
    context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
    page = context.new_page()
    page.set_default_timeout(60000)
    page.goto(base + '/wp-login.php', wait_until='domcontentloaded')
    page.locator('#user_login').fill(username)
    page.locator('#user_pass').fill(password)
    page.locator('#wp-submit').click()
    page.wait_for_url('**/wp-admin/**', wait_until='domcontentloaded')
    for name, fixture in fixtures.items():
        page.goto(base + '/wp-admin/post.php?post=' + str(fixture['id']) + '&action=edit', wait_until='domcontentloaded')
        page.wait_for_function("window.wp && wp.data && wp.data.select('core/block-editor').getBlocks().length")
        result = page.evaluate('''() => {
            let total = 0; const invalid = []; const types = {};
            const walk = blocks => blocks.forEach(block => {
                total++; types[block.name] = (types[block.name] || 0) + 1;
                if(block.isValid === false) invalid.push(block.name);
                walk(block.innerBlocks || []);
            });
            walk(wp.data.select('core/block-editor').getBlocks());
            return {total, invalid, types};
        }''')
        assert not result['invalid'], (name, result)
        assert result['types'].get('core/heading', 0) >= 25
        assert result['types'].get('core/details', 0) == 10
        results['editor'].append({'fixture': name, **result})
        print('PASS actual editor:', name, result['total'], 'valid native blocks', flush=True)
    for width in (390, 768, 1024, 1440, 1920):
        page.set_viewport_size({'width': width, 'height': 1000})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(fixtures['page']['url'], wait_until='networkidle')
        page.evaluate('''async () => {
            document.querySelectorAll('.cc-cpa-new-page img').forEach(image => image.loading='eager');
            await Promise.all([...document.querySelectorAll('.cc-cpa-new-page img')].map(image => image.decode()));
            await document.fonts.ready;
        }''')
        result = page.evaluate('''() => {
            const root = document.querySelector('.cc-cpa-new-page');
            const text = [...root.querySelectorAll('*')].filter(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && el.getClientRects().length);
            return {overflow: document.documentElement.scrollWidth > innerWidth + 1,
                fonts: [...new Set(text.map(el => getComputedStyle(el).fontFamily.split(',')[0].trim().replaceAll('"','')))],
                images: [...root.querySelectorAll('img')].map(image => ({loaded: image.complete && image.naturalWidth > 0, src: image.src})),
                sections: root.querySelectorAll('section').length,
                heroFont: getComputedStyle(root.querySelector('h1')).fontFamily,
                heroColor: getComputedStyle(root.querySelector('h1')).color,
                headings: [...root.querySelectorAll('h2')].map(el => el.textContent.trim())};
        }''')
        assert not result['overflow'], (width, 'horizontal overflow')
        assert set(result['fonts']) <= {'Montserrat', 'Old Standard TT'}, (width, result['fonts'])
        assert all(image['loaded'] for image in result['images']), (width, result['images'])
        assert result['heroFont'].startswith('"Old Standard TT"'), result['heroFont']
        assert result['heroColor'] in ('rgb(255, 255, 255)', 'oklch(1 0 0)', 'color(srgb 1 1 1)'), result['heroColor']
        assert result['sections'] == 11
        assert not errors, errors
        assert page.locator('form[data-cc-cpa-new-form] button[type=submit]').is_disabled()
        if width in (390, 1440):
            page.locator('.cc-cpa-new-page').screenshot(path=str(repo / f'build/wordpress-{width}.png'))
            page.evaluate('window.scrollTo(0,0)')
            page.screenshot(path=str(repo / f'build/wordpress-hero-{width}.png'))
            page.locator('#talk').screenshot(path=str(repo / f'build/wordpress-form-{width}.png'))
        results['responsive'].append({'width': width, **result})
        print('PASS WordPress responsive:', width, flush=True)
    page.locator('.cc-cpa-new-guide a').first.click()
    assert page.locator('#talk [name=wants_guide]').is_checked()
    page.locator('.cc-cpa-new-talk a').first.click()
    assert not page.locator('#talk [name=wants_guide]').is_checked()
    details = page.locator('details.cc-cpa-new-faq')
    details.nth(0).locator('summary').click()
    page.wait_for_function("document.querySelectorAll('details.cc-cpa-new-faq[open]').length === 1")
    details.nth(1).locator('summary').click()
    page.wait_for_function("document.querySelectorAll('details.cc-cpa-new-faq[open]').length === 1 && document.querySelectorAll('details.cc-cpa-new-faq')[1].open")
    print('PASS WordPress guide/talk controls and single-open native FAQs', flush=True)
    browser.close()
(repo / 'build/wordpress-results.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
