"""Preserve the original user-supplied ZIP alongside the maintained React source."""
import hashlib
import json
import zipfile
import sys
from pathlib import Path

repo = Path(__file__).resolve().parents[1]
archive = Path(sys.argv[1]).resolve()
original = repo / 'source/react-export'
original.mkdir(parents=True, exist_ok=True)
files = {}
with zipfile.ZipFile(archive) as z:
    for entry in z.infolist():
        if entry.is_dir():
            continue
        rel = Path(entry.filename).relative_to('complete-controller-cpa-partners')
        target = (original / rel).resolve()
        assert target.is_relative_to(original.resolve())
        data = z.read(entry)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        files[rel.as_posix()] = hashlib.sha256(data).hexdigest()
(repo / 'source/provenance.json').write_text(json.dumps({'archive': archive.name, 'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(), 'files': files}, indent=2) + '\n', encoding='utf-8')
meta = {'page': 'CPA Partners — New', 'repository': 'tbmaui/cc-landing-cpa-partners-new', 'react_directory': 'react', 'wordpress_directory': 'wordpress', 'wordpress_pattern': 'cc-modern/page-cpa-partners-new', 'wordpress_status': 'validated', 'theme_dependency': {'repository': 'tbmaui/complete-controller-modern-theme', 'minimum_reviewed_version': '1.3.16'}, 'source_archive': archive.name, 'source_sha256': hashlib.sha256(archive.read_bytes()).hexdigest(), 'delivery_version': 'v1.0.0', 'review_date': '2026-11-24', 'previous_repository': 'tbmaui/cc-landing-cpa-partners'}
(repo / 'page.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Preserved the original export and recorded its hashes')
