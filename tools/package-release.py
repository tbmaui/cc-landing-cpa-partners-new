"""Package the integration overlay and verify source and theme archives."""
import hashlib
import json
import zipfile
from pathlib import Path

repo = Path(__file__).resolve().parents[1]
workspace = repo.parents[1]
dist = repo / 'dist'
dist.mkdir(exist_ok=True)
archive = dist / 'cc-landing-cpa-partners-new-wordpress-v1.0.0.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as output:
    for file in sorted((repo / 'wordpress').rglob('*')):
        if file.is_file():
            output.write(file, file.relative_to(repo).as_posix())
with zipfile.ZipFile(archive) as check:
    assert check.testzip() is None
    assert not any('\\' in name for name in check.namelist())
theme = workspace / 'dist/cc-modern-1.3.16.zip'
with zipfile.ZipFile(theme) as check:
    assert check.testzip() is None
    assert 'Version: 1.3.16' in check.read('cc-modern/style.css').decode('utf-8')
    for name in ('cc-modern/patterns/page-cpa-partners.php', 'cc-modern/patterns/page-cpa-partners-new.php', 'cc-modern/inc/cpa-partners-new.php', 'cc-modern/parts/cpa-partners-new-form.php'):
        assert name in check.namelist(), name
    assert not any('\\' in name or '/build/' in name or '/node_modules/' in name for name in check.namelist())
provenance = json.loads((repo / 'source/provenance.json').read_text(encoding='utf-8'))
for name, digest in provenance['files'].items():
    assert hashlib.sha256((repo / 'source/react-export' / name).read_bytes()).hexdigest() == digest, name
print('Verified complete theme, page overlay and all original source hashes')
