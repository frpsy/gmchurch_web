#!/usr/bin/env python3
"""HTML 한 파일(jubo/index.html 같은 단일 페이지)에서 결정적 증거를 뽑는다.

출력(마크다운): 1) 라이트·다크 대비 조합표(변수 값 기준, 4.5 미만 FAIL)
2) 글자색 사용처 목록(줄 번호)  3) 정의만 있고 한 번만 나오는 식별자(죽은 코드 후보)

사용: python3 scripts/ai-evidence.py jubo/index.html > evidence.md
"""
import re, sys
src = open(sys.argv[1], encoding='utf-8').read()
css = src.split('<style>')[1].split('</style>')[0]
lines = css.split('\n')

def block_vars(text):
    return dict(re.findall(r'--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})', text))

root_m = re.search(r':root\s*\{(.*?)\}', css, re.S)
light = block_vars(root_m.group(1))
dark_m = re.search(r'prefers-color-scheme:dark\)\{\s*:root:not\(\[data-theme="light"\]\)\{(.*?)\}', css, re.S)
dark = {**light, **block_vars(dark_m.group(1))} if dark_m else dict(light)

def lum(h):
    c = [int(h[i:i+2], 16) / 255 for i in (1, 3, 5)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]

def ratio(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)

TEXT = [k for k in light if k.startswith(('ink', 'brand', 'accent', 'resp', 'chip-ink', 'verse-ink')) and k != 'brand-ink']
BG = ['bg', 'surface', 'surface-2', 'chip', 'verse-bg']
print("## 대비 조합표 (변수 값으로 계산됨, 4.5 미만은 FAIL)")
for mode, vars_ in (("라이트", light), ("다크", dark)):
    print(f"\n### {mode}")
    print("| 글자색 \\ 배경 | " + " | ".join(BG) + " |")
    print("|---|" + "---|" * len(BG))
    for t in TEXT:
        if t not in vars_: continue
        cells = []
        for b in BG:
            if b not in vars_: cells.append("-"); continue
            r = ratio(vars_[t], vars_[b])
            cells.append(f"{r:.2f}" + (" **FAIL**" if r < 4.5 else ""))
        print(f"| --{t} | " + " | ".join(cells) + " |")

print("\n## 글자색 사용처 (코드 줄 번호)")
for i, l in enumerate(lines, 1):
    m = re.search(r'color:var\(--(ink[a-z0-9-]*|brand|accent|resp|chip-ink|verse-ink)\)', l)
    if m:
        sel = l.split('{')[0].strip()[-60:]
        print(f"- L{i}: `{sel}` → --{m.group(1)}")

print("\n## 정의만 있고 호출이 1번뿐인 식별자 (죽은 코드 후보)")
js = src.split('<script>')[-1]
for name in sorted(set(re.findall(r'(?:const|let|function)\s+([A-Za-z_][A-Za-z0-9_]*)', js))):
    n = len(re.findall(r'\b' + re.escape(name) + r'\b', js))
    if n <= 1:
        print(f"- {name}: 출현 {n}회")
