"""baseline과 변경 후 스크린샷을 픽셀 비교. 사용: python3 audit/tools/compare.py <label> [baseline]
결과: 페이지·해상도별 변경 픽셀 비율 표 (0.0%면 동일). 높이가 다르면 'H변화'로 표시.
"""
import os, sys
from PIL import Image, ImageChops
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
label = sys.argv[1]
base = sys.argv[2] if len(sys.argv) > 2 else "baseline"
bd, nd = os.path.join(ROOT, "screenshots", base), os.path.join(ROOT, "screenshots", label)
rows, changed = [], 0
for f in sorted(os.listdir(nd)):
    if not f.endswith(".png") or not os.path.exists(os.path.join(bd, f)):
        continue
    a, b = Image.open(os.path.join(bd, f)).convert("RGB"), Image.open(os.path.join(nd, f)).convert("RGB")
    if a.size != b.size:
        rows.append((f, f"H변화 {a.size[1]}->{b.size[1]}")); changed += 1; continue
    bbox = ImageChops.difference(a, b).getbbox()
    if bbox is None:
        continue
    d = ImageChops.difference(a, b).convert("L").point(lambda v: 255 if v > 8 else 0)
    ratio = sum(1 for v in d.getdata() if v) / (a.size[0] * a.size[1]) * 100
    if ratio > 0:
        rows.append((f, f"{ratio:.2f}%")); changed += 1
total = len([f for f in os.listdir(nd) if f.endswith('.png')])
print(f"비교 {total}장, 변경 {changed}장")
for f, r in rows:
    print(f"  {f}: {r}")
