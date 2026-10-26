#!/usr/bin/env python3
"""성가집 원본 이미지를 재압축 없이 보관하고 번호별 색인을 만든다."""

import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

SOURCE = 'https://dulkuka12.github.io/khymn/'


def digest(data):
    return hashlib.sha256(data).hexdigest()


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def archive(pdf_path, index_path, output):
    reader = PdfReader(pdf_path)
    source_index = json.loads(index_path.read_text(encoding='utf-8'))
    numbers = [row['number'] for row in source_index]
    if len(numbers) != len(set(numbers)):
        raise ValueError('원본 색인에 중복 번호가 있습니다.')
    for row in source_index:
        if not 1 <= row['page'] <= row.get('end', row['page']) <= len(reader.pages):
            raise ValueError(f'원본 페이지 범위 오류: {row}')

    images_dir = output / 'images'
    hymns_dir = output / 'hymns'
    images_dir.mkdir(parents=True, exist_ok=True)
    hymns_dir.mkdir(parents=True, exist_ok=True)
    pages = []
    for number, page in enumerate(reader.pages, 1):
        images = list(page.images)
        # 여러 조각이나 별도 글자가 있으면 일부만 저장하는 일을 막는다.
        if len(images) != 1 or page.extract_text().strip():
            raise ValueError(f'{number}쪽은 단일 스캔 이미지가 아닙니다. 별도 렌더링이 필요합니다.')
        image = images[0]
        suffix = Path(image.name).suffix.lower()
        if suffix not in ('.jpg', '.jpeg', '.png'):
            raise ValueError(f'{number}쪽 이미지 형식 확인 필요: {suffix}')
        path = images_dir / f'page-{number:04d}{suffix}'
        path.write_bytes(image.data)
        with Image.open(path) as check:
            width, height = check.size
            check.verify()
        pages.append({
            'page': number, 'file': path.relative_to(output).as_posix(),
            'width': width, 'height': height, 'bytes': len(image.data),
            'sha256': digest(image.data),
        })

    hymns = []
    for row in source_index:
        number = row['number']
        start, end = row['page'], row.get('end', row['page'])
        entry = {
            'number': number, 'title': row['title'],
            'startPage': start, 'endPage': end,
            'images': [pages[p - 1]['file'] for p in range(start, end + 1)],
            'markdown': f'hymns/{number:03d}.md',
        }
        hymns.append(entry)
        body = [f'# 성가 {number} — {row["title"]}', '',
                f'출처: [성가 2015]({SOURCE}) · 원본 PDF {start}–{end}쪽', '',
                '원본 한 페이지에 여러 곡이 함께 있을 수 있습니다.', '']
        for p in range(start, end + 1):
            body += [f'![성가 {number}, PDF {p}쪽](../{pages[p - 1]["file"]})', '']
        (hymns_dir / f'{number:03d}.md').write_text('\n'.join(body), encoding='utf-8')

    missing = sorted(set(range(1, 663)) - set(numbers))
    manifest = {
        'schemaVersion': 1, 'edition': '성가 2015',
        'retrievedAt': datetime.now(timezone.utc).isoformat(),
        'source': {'site': SOURCE, 'pdf': SOURCE + 'hymnbook.pdf',
                   'index': SOURCE + 'hymn-index-final.json',
                   'pdfSha256': digest(pdf_path.read_bytes()),
                   'indexSha256': digest(index_path.read_bytes())},
        'pageCount': len(pages), 'indexedHymnCount': len(hymns),
        'missingFromSourceIndex': missing,
        'imageBytes': sum(p['bytes'] for p in pages),
        'extraction': 'embedded-original-image-without-recompression',
        'pages': pages,
    }
    write_json(output / 'manifest.json', manifest)
    write_json(output / 'index.json', {'schemaVersion': 1, 'hymns': hymns})
    write_json(output / 'source-index.json', source_index)
    lines = ['# 성가 2015 악보 색인', '',
             '| 번호 | 제목 | 악보 | PDF 페이지 |', '| --- | --- | --- | --- |']
    for h in hymns:
        title = h['title'].replace('|', '\\|')
        lines.append(f'| {h["number"]} | {title} | [보기]({h["markdown"]}) | {h["startPage"]}–{h["endPage"]} |')
    (output / 'INDEX.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(json.dumps({k: manifest[k] for k in ('pageCount', 'indexedHymnCount', 'missingFromSourceIndex', 'imageBytes')}, ensure_ascii=False))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('pdf', type=Path)
    parser.add_argument('index', type=Path)
    parser.add_argument('--output', type=Path, default=Path('data/hymnal-2015'))
    args = parser.parse_args()
    archive(args.pdf, args.index, args.output)
