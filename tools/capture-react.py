"""Capture the running React page for the native WordPress converter."""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url', default='http://127.0.0.1:5187/')
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
(repo / 'build').mkdir(exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=str(Path.home() / 'AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe'))
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    page.goto(args.url, wait_until='networkidle')
    page.evaluate('document.fonts.ready')
    root = page.locator('.min-h-screen.bg-background').filter(has=page.locator('h1')).first
    root.wait_for()
    assert 'Bookkeeping Built for CPAs' in root.inner_text()
    (repo / 'build/react-page.html').write_text(root.evaluate('(el) => el.outerHTML'), encoding='utf-8')
    page.screenshot(path=str(repo / 'build/react-1440.png'), full_page=True)
    print('Captured React page, including', root.locator('section').count(), 'sections')
    browser.close()
