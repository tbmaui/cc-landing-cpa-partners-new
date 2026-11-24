"""Convert the captured React page to native Gutenberg block specifications.

Run npm run build in react/, capture-react.py against its running server, then
this script. serialize-blocks.cjs uses the real WordPress block serializers.
"""
import html
import json
import re
import shutil
import copy
from pathlib import Path

import tinycss2
from bs4 import BeautifulSoup, Comment, NavigableString, Tag

REPO = Path(__file__).resolve().parents[1]
ASSET_BASE = '__CC_CPA_NEW_ASSETS__'
SCOPE = '.cc-cpa-new-page'


def block(name, attributes=None, children=None):
    return {'name': 'core/' + name, 'attributes': attributes or {}, 'innerBlocks': children or []}


def classes(node):
    return ' '.join(node.get('class', []))


def rich(node):
    return node.decode_contents(formatter='html')


def convert(node):
    if isinstance(node, Comment):
        return []
    if isinstance(node, NavigableString):
        return [block('paragraph', {'content': html.escape(str(node))})] if str(node).strip() else []
    if not isinstance(node, Tag):
        return []
    cls = classes(node)
    attrs = {'className': cls} if cls else {}
    if node.get('id') in ('how', 'talk'):
        attrs['anchor'] = node['id']
    if node.name in ('script', 'style'):
        return []
    if node.name == 'form':
        (REPO / 'build/react-form.html').write_text(str(node), encoding='utf-8')
        form = copy.deepcopy(node)
        form.attrs.update({'method': 'post', 'action': '__CC_FORM_ACTION__', 'data-cc-cpa-new-form': ''})
        form.attrs.pop('novalidate', None)
        form.select_one('input[type=checkbox]').attrs.update({'name': 'wants_guide', 'value': '1'})
        form.select_one('button[type=submit]')['data-cc-disabled-placeholder'] = ''
        helper = BeautifulSoup('', 'html.parser')
        form.insert(0, helper.new_tag('input', attrs={'type':'hidden','name':'action','value':'cc_cpa_new_lead'}))
        form.insert(1, NavigableString('__CC_NONCE__'))
        form.insert(2, NavigableString('__CC_NOTICE__'))
        form.insert(-1, helper.new_tag('p', attrs={'role':'alert','class':'mt-4 text-sm text-destructive'}))
        text = str(form).replace('__CC_FORM_ACTION__', "<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>")
        text = text.replace('data-cc-disabled-placeholder=""', "<?php disabled( ! cc_modern_cpa_new_configured() ); ?>")
        text = text.replace('__CC_NONCE__', "<?php wp_nonce_field( 'cc_cpa_new_lead', '_cc_cpa_new_nonce' ); ?>")
        text = text.replace('__CC_NOTICE__', "<?php if ( ! cc_modern_cpa_new_configured() ) : ?><p class=\"mb-6 text-muted-foreground\">Please contact our team to start a conversation. <a href=\"/contact-us/\">Contact us</a></p><?php endif; ?>")
        parts = REPO / 'wordpress/parts'
        parts.mkdir(parents=True, exist_ok=True)
        (parts / 'cpa-partners-new-form.php').write_text("<?php\n/** New CPA Partners form template. @package cc-modern */\nif ( ! defined( 'ABSPATH' ) ) { exit; }\n?>\n" + text + '\n', encoding='utf-8', newline='\n')
        return [block('shortcode', {'text': '[cc_cpa_partners_new_form]'})]
    if node.name == 'div' and node.get('data-orientation') == 'vertical' and 'rounded-2xl' in cls:
        source = (REPO / 'react/src/routes/index.tsx').read_text(encoding='utf-8')
        literal = re.search(r'const faqs = (\[[\s\S]*?\n\]);', source).group(1)
        faqs = json.loads(re.sub(r',\s*]', ']', literal))
        details = [block('details', {'summary': html.escape(q), 'className': 'cc-cpa-new-faq'}, [block('paragraph', {'content': html.escape(a)})]) for q, a in faqs]
        return [block('group', {**attrs, 'layout': {'type': 'default'}}, details)]
    if node.name in ('button', 'a') and ('inline-flex' in cls or node.name == 'button'):
        href = node.get('href', '#talk')
        label = node.get_text(' ', strip=True)
        action = 'cc-cpa-new-guide' if 'Guide' in label else 'cc-cpa-new-talk'
        attrs.update({'text': rich(node), 'url': href, 'className': cls + ' ' + action})
        return [block('buttons', {}, [block('button', attrs)])]
    if re.fullmatch(r'h[1-6]', node.name):
        return [block('heading', {**attrs, 'level': int(node.name[1]), 'content': rich(node)})]
    if node.name == 'p':
        return [block('paragraph', {**attrs, 'content': rich(node)})]
    if node.name == 'img':
        name = 'hero' if 'hero' in node['src'] else 'tech'
        return [block('image', {**attrs, 'url': f'{ASSET_BASE}/images/cpa-partners-new-{name}.jpg', 'alt': node.get('alt', ''), 'sizeSlug': 'full', 'linkDestination': 'none'})]
    if node.name in ('ol', 'ul'):
        items = [block('list-item', {'content': rich(li), 'className': classes(li)}) for li in node.find_all('li', recursive=False)]
        return [block('list', {**attrs, 'ordered': node.name == 'ol'}, items)]
    if node.name == 'blockquote':
        return [block('quote', attrs, [block('paragraph', {'content': rich(node)})])]
    if node.name == 'svg':
        return [block('html', {'content': str(node)})]
    if node.name == 'a':
        return [block('paragraph', {'content': str(node)})]
    if node.name == 'span' and not node.find('svg'):
        return [block('paragraph', {**attrs, 'content': rich(node)})]
    children = [child for item in node.children for child in convert(item)]
    tag = node.name if node.name in ('section', 'header', 'footer', 'article', 'aside') else 'div'
    group_attrs = {**attrs, 'tagName': tag, 'layout': {'type': 'default'}}
    if node.get('id'):
        group_attrs['anchor'] = node['id']
    return [block('group', group_attrs, children)]


def scoped_css(text):
    # Unwrap Tailwind layers so the component wins over WordPress's unlayered
    # element styles, while every selector stays inside the page wrapper.
    def render(rules):
        result = []
        for rule in rules:
            if rule.type == 'qualified-rule':
                # A comma inside :is()/attribute tokens is not a selector split.
                selectors, current = [], []
                for token in rule.prelude:
                    if token.type == 'literal' and token.value == ',':
                        selectors.append(tinycss2.serialize(current).strip()); current = []
                    else:
                        current.append(token)
                selectors.append(tinycss2.serialize(current).strip())
                scoped = []
                for selector in selectors:
                    if ':root' in selector:
                        selector = selector.replace(':root', SCOPE)
                    elif selector == ':host':
                        continue
                    elif re.match(r'^(html|body)(?=[\s.:#>\[]|$)', selector):
                        selector = re.sub(r'^(html|body)', SCOPE, selector, count=1)
                    else:
                        selector = SCOPE + ' ' + selector
                    scoped.append(selector)
                if scoped:
                    result.append(','.join(scoped) + '{' + tinycss2.serialize(rule.content) + '}')
            elif rule.type == 'at-rule':
                kind = rule.lower_at_keyword
                if kind == 'layer':
                    if rule.content:
                        result.append(render(tinycss2.parse_rule_list(rule.content, skip_whitespace=True)))
                elif rule.content and kind in ('media', 'supports', 'container', 'starting-style'):
                    result.append('@' + rule.at_keyword + tinycss2.serialize(rule.prelude) + '{' + render(tinycss2.parse_rule_list(rule.content, skip_whitespace=True)) + '}')
                else:
                    result.append(tinycss2.serialize([rule]))
        return '\n'.join(result)
    return render(tinycss2.parse_stylesheet(text, skip_whitespace=True))


def main():
    soup = BeautifulSoup((REPO / 'build/react-page.html').read_text(encoding='utf-8'), 'html.parser')
    root = soup.find('div')
    for node in root.find_all(True):
        for name in list(node.attrs):
            if name.startswith('data-tsd-'):
                del node.attrs[name]
    # The host WordPress theme supplies its existing navigation and footer.
    for node in root.find_all(['header', 'footer'], recursive=False):
        node.decompose()
    tree = convert(root)[0]
    tree['attributes']['className'] = 'cc-cpa-new-page ' + tree['attributes']['className']
    tree['attributes']['align'] = 'full'
    tree['attributes']['templateLock'] = 'contentOnly'
    (REPO / 'build/wordpress-blocks.json').write_text(json.dumps([tree], ensure_ascii=False), encoding='utf-8')
    assets = REPO / 'wordpress/assets'
    for directory in ('css', 'js', 'fonts', 'images'):
        (assets / directory).mkdir(parents=True, exist_ok=True)
    for photo in ('hero', 'tech'):
        shutil.copy2(REPO / f'react/src/assets/{photo}.jpg', assets / f'images/cpa-partners-new-{photo}.jpg')
    for font in (REPO / 'react/public/fonts').iterdir():
        shutil.copy2(font, assets / 'fonts' / font.name)
    css_file = next((REPO / 'react/.output/public/assets').glob('styles-*.css'))
    css = scoped_css(css_file.read_text(encoding='utf-8'))
    css = css.replace('/fonts/cpa-partners-new-', '../fonts/cpa-partners-new-')
    css += '''
.cc-cpa-new-page { margin:0; font:400 16px/1.5 Montserrat,sans-serif; }
.cc-cpa-new-page p { line-height:inherit; }
.cc-cpa-new-page :where(h1,h2,h3,h4,h5,h6,p) { color:inherit; }
.cc-cpa-new-page :where(.is-layout-flow)>* { margin-block-start:0; margin-block-end:0; }
.cc-cpa-new-page .wp-block-buttons { display:contents; }
.cc-cpa-new-page .wp-block-button { position:relative; white-space:normal; text-align:center; }
.cc-cpa-new-page .wp-block-button__link { padding:0; border:0; border-radius:inherit; background:transparent; color:inherit; font:inherit; line-height:inherit; letter-spacing:inherit; text-transform:inherit; text-decoration:none; display:flex; align-items:center; justify-content:center; width:100%; height:100%; }
.cc-cpa-new-page .wp-block-button__link::after { content:""; position:absolute; inset:0; }
.cc-cpa-new-page .wp-block-button:focus-within { outline:2px solid currentColor; outline-offset:4px; }
.cc-cpa-new-page figure.wp-block-image { margin:0; }
.cc-cpa-new-page figure.wp-block-image img { display:block; width:100%; height:100%; object-fit:cover; border-radius:inherit; }
.cc-cpa-new-page blockquote.wp-block-quote { padding:0; border:0; font:inherit; }
.cc-cpa-new-page blockquote.wp-block-quote p { margin:0; }
.cc-cpa-new-page .cc-cpa-new-faq { margin:0; padding:0; border-bottom:1px solid var(--border); }
.cc-cpa-new-page .cc-cpa-new-faq:last-child { border-bottom:0; }
.cc-cpa-new-page .cc-cpa-new-faq summary { cursor:pointer; padding:16px 0; font:600 16px/1.5 Montserrat,sans-serif; list-style:none; display:flex; justify-content:space-between; gap:16px; }
.cc-cpa-new-page .cc-cpa-new-faq summary::after { content:"+"; flex-shrink:0; }
.cc-cpa-new-page .cc-cpa-new-faq[open] summary::after { content:"−"; }
.cc-cpa-new-page .cc-cpa-new-faq summary::-webkit-details-marker { display:none; }
.cc-cpa-new-page .cc-cpa-new-faq p { padding-bottom:16px; color:var(--muted-foreground); }
.cc-cpa-new-page .cc-cpa-new-form-note { grid-column:1/-1; margin:16px 0 0; }
'''
    (assets / 'css/cpa-partners-new.css').write_text(css, encoding='utf-8', newline='\n')
    print('Generated native block specification and scoped WordPress assets')


if __name__ == '__main__':
    main()
