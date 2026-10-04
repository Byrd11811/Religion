"""Refresh download provenance from bundled files without network requests."""
import json
import pathlib
import re

root = pathlib.Path(__file__).resolve().parents[1]
rows = []
for source in sorted((root / 'data/public-domain').glob('*.txt'), key=lambda p: int(p.stem)):
    raw = source.read_text(encoding='utf-8-sig')
    title = re.search(r'^Title:\s*(.+)', raw, re.M)
    if not title:
        raise ValueError(f'Missing title: {source.name}')
    header_credits = {
        label.lower(): [x.strip() for x in re.findall(rf'^{label}:\s*(.+)', raw, re.M)]
        for label in ('Author', 'Translator', 'Editor')
    }
    rows.append(dict(id=int(source.stem), title=title.group(1).strip(), bytes=source.stat().st_size,
                     url=f'https://www.gutenberg.org/cache/epub/{source.stem}/pg{source.stem}.txt',
                     sourceHeaderCredits=header_credits,
                     license='See retained source license and edition-specific rights metadata. Header credits preserve Project Gutenberg labels and are not normalized contributor roles.'))
(root / 'data/seed/downloads.json').write_text(json.dumps(rows, indent=2), encoding='utf-8')
print(f'Recorded {len(rows)} bundled source files.')
