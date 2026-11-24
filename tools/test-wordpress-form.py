"""Exercise the WordPress form against an intercepted local backend, with no leads sent."""
import argparse
import json
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--wp-root', type=Path, required=True)
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
wp_root = args.wp_root.resolve()
php = Path.home() / '.cache/cc-page-review/php/php.exe'
cli = Path.home() / '.cache/cc-page-review/wp-cli.phar'
base = subprocess.check_output([str(php), str(cli), '--path=' + str(wp_root), 'option', 'get', 'home', '--skip-plugins'], text=True).strip()
assert base == 'http://127.0.0.1:8099', 'This fixture must run against the isolated local test site'
plugin = wp_root / 'wp-content/mu-plugins/cc-new-cpa-http-fixture.php'
assert not plugin.exists(), 'Do not overwrite another test fixture'
capture = repo / 'build/form-request.json'
plugin.parent.mkdir(exist_ok=True)
plugin.write_text('''<?php
if ( isset( $_SERVER['HTTP_X_CC_CPA_FIXTURE'] ) && 'local-only' === $_SERVER['HTTP_X_CC_CPA_FIXTURE'] && '127.0.0.1' === $_SERVER['REMOTE_ADDR'] ) {
    define( 'CC_MODERN_CPA_NEW_SUPABASE_URL', 'https://cpa-new-fixture.invalid' );
    define( 'CC_MODERN_CPA_NEW_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_local_fixture' );
    add_filter( 'pre_http_request', function( $pre, $request, $url ) {
        if ( 'https://cpa-new-fixture.invalid/rest/v1/cpa_partner_leads' !== $url ) { return $pre; }
        file_put_contents( __CAPTURE__, wp_json_encode( array( 'url' => $url, 'request' => $request ) ) );
        $failure = isset( $_SERVER['HTTP_X_CC_CPA_BACKEND_FAILURE'] );
        return array( 'headers' => array(), 'body' => '', 'response' => array( 'code' => $failure ? 500 : 201, 'message' => $failure ? 'Fixture error' : 'Created' ), 'cookies' => array() );
    }, 10, 3 );
}
'''.replace('__CAPTURE__', json.dumps(capture.resolve().as_posix())), encoding='utf-8')
try:
    fixtures = json.loads((repo / 'build/wp-fixtures.json').read_text(encoding='utf-8'))
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path=str(Path.home() / 'AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe'))
        context = browser.new_context(extra_http_headers={'X-CC-CPA-Fixture': 'local-only'})
        page = context.new_page()
        page.on('pageerror', lambda error: print('Browser error:', str(error), flush=True))
        page.goto(fixtures['page']['url'], wait_until='networkidle')
        nonce = page.locator('[name=_cc_cpa_new_nonce]').input_value()
        form = {'action': 'cc_cpa_new_lead', 'cc_ajax': '1', '_cc_cpa_new_nonce': nonce, 'full_name': 'Local Fixture', 'email': 'fixture@example.test', 'firm_name': 'Fixture Firm'}
        endpoint = base + '/wp-admin/admin-post.php'
        for change, expected in [({'_cc_cpa_new_nonce': 'invalid'}, 403), ({'email': 'invalid'}, 422), ({'firm_name': ''}, 422), ({'full_name': 'x' * 121}, 422)]:
            response = context.request.post(endpoint, form={**form, **change})
            assert response.status == expected, (change, response.status, response.text())
            assert response.json()['success'] is False
        page.locator('[name=full_name]').fill('Local Fixture')
        page.locator('[name=email]').fill('fixture@example.test')
        page.locator('[name=firm_name]').fill('Fixture Firm')
        page.locator('.cc-cpa-new-guide a').first.click()
        context.set_extra_http_headers({'X-CC-CPA-Fixture': 'local-only', 'X-CC-CPA-Backend-Failure': '1'})
        assert page.locator('form').evaluate('(form) => form.checkValidity()'), 'Fixture form is invalid'
        with page.expect_response('**/admin-post.php') as failed_request:
            page.locator('form[data-cc-cpa-new-form] button[type=submit]').click()
        failure = failed_request.value
        print('Backend failure check:', failure.status, failure.text()[:250], flush=True)
        assert failure.status == 502
        page.wait_for_function("document.querySelector('form [role=alert]').textContent.length > 0")
        assert "couldn't send" in page.locator('form [role=alert]').text_content()
        assert page.locator('form [type=submit]').is_enabled()
        context.set_extra_http_headers({'X-CC-CPA-Fixture': 'local-only'})
        page.locator('form[data-cc-cpa-new-form] button[type=submit]').click()
        page.get_by_role('status').filter(has_text="Thank you. We'll be in touch.").wait_for()
        request = json.loads(capture.read_text(encoding='utf-8'))['request']
        data = json.loads(request['body'])
        assert data['wants_guide'] is True
        assert data['firm_name'] == 'Fixture Firm' and data['email'] == 'fixture@example.test'
        assert request['headers']['apikey'] == 'sb_publishable_local_fixture'
        assert 'Authorization' not in request['headers']
        assert set(data) == {'full_name', 'email', 'phone', 'firm_name', 'clients_to_refer', 'message', 'wants_guide'}
        context.close()
        no_js = browser.new_context(java_script_enabled=False, extra_http_headers={'X-CC-CPA-Fixture': 'local-only'})
        page = no_js.new_page()
        page.goto(fixtures['page']['url'])
        page.locator('[name=full_name]').fill('No JavaScript Fixture')
        page.locator('[name=email]').fill('nojs@example.test')
        page.locator('[name=firm_name]').fill('Fixture Firm')
        page.locator('form [type=submit]').click()
        page.get_by_role('status').filter(has_text="Thank you. We'll be in touch.").wait_for()
        browser.close()
    print('PASS form: validation, nonce, backend failure/retry, payload, guide preference and no-JavaScript submission; all HTTP calls intercepted')
finally:
    plugin.unlink()
