"""기준선/변경후 캡처: 전 페이지 x 전 해상도 스크린샷 + 계산된 스타일 + 가로넘침 + 콘솔오류.
사용: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 audit/tools/capture.py <label>
결과: audit/screenshots/<label>/<page>_<w>[_dark].png, audit/metrics/<label>.json
"""
import json, os, sys
from playwright.sync_api import sync_playwright

LABEL = sys.argv[1] if len(sys.argv) > 1 else "baseline"
BASE = os.environ.get("BASE_URL", "http://localhost:8000")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ["index","clergy","faq","worship","bulletin","news","newcomer","community","giving",
         "media","videos","gallery","links","sundays","visit","hopecenter","emmaus","smallgroup",
         "greenchurch","privacy"]
WIDTHS = [int(x) for x in os.environ.get("CAP_WIDTHS", "360,390,768,1024,1440").split(",") if x]
DARK_WIDTHS = [int(x) for x in os.environ.get("CAP_DARK", "390,1440").split(",") if x]
if os.environ.get("CAP_PAGES"):
    PAGES = os.environ["CAP_PAGES"].split(",")
SHOT_DIR = os.path.join(ROOT, "screenshots", LABEL)
os.makedirs(SHOT_DIR, exist_ok=True)
os.makedirs(os.path.join(ROOT, "metrics"), exist_ok=True)

# 역할별 텍스트 요소의 계산된 스타일과 가로 넘침 요소 수집
JS = r"""
() => {
  const pick = el => {
    const cs = getComputedStyle(el);
    return {fs: cs.fontSize, lh: cs.lineHeight, fw: cs.fontWeight, ls: cs.letterSpacing,
            ff: cs.fontFamily.split(',')[0], color: cs.color, wb: cs.wordBreak, ow: cs.overflowWrap};
  };
  const visible = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const sel = {};
  for (const s of ['h1','h2','h3','h4','h5','h6','p','li','a','button','th','td','small','.section-title','.page-hero h1','.card','.btn']) {
    const map = {};
    document.querySelectorAll('main ' + s + ', ' + (s.startsWith('.')? s : 'main '+s)).forEach(el => {
      if (!visible(el)) return;
      const k = JSON.stringify(pick(el));
      const cls = (el.className && typeof el.className === 'string') ? el.className.split(' ')[0] : '';
      map[k] = map[k] || {style: pick(el), count: 0, examples: []};
      map[k].count++;
      if (map[k].examples.length < 3) map[k].examples.push((el.tagName.toLowerCase() + (cls?'.'+cls:'')) + ' "' + (el.textContent||'').trim().slice(0,30) + '"');
    });
    sel[s] = Object.values(map);
  }
  const vw = document.documentElement.clientWidth;
  const overflow = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width && (r.right > vw + 1 || r.left < -1)) {
      const cs = getComputedStyle(el);
      // 스크롤 컨테이너 안쪽이나 의도적으로 숨긴 요소 제외 판단은 검수에서
      overflow.push({tag: el.tagName.toLowerCase(), cls: (typeof el.className==='string'?el.className:''), id: el.id,
                     left: Math.round(r.left), right: Math.round(r.right), pos: cs.position});
    }
  });
  return {
    scrollWidth: document.documentElement.scrollWidth, clientWidth: vw,
    hScroll: document.documentElement.scrollWidth > vw,
    bodyFont: getComputedStyle(document.body).fontFamily,
    pretendardLoaded: document.fonts.check('16px Pretendard Variable') || document.fonts.check('16px Pretendard'),
    styles: sel, overflow: overflow.slice(0, 40), overflowCount: overflow.length,
    brokenImgs: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('loading')!=='lazy').map(i => i.getAttribute('src')),
  };
}
"""

out = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for scheme in ["light", "dark"]:
        widths = WIDTHS if scheme == "light" else DARK_WIDTHS
        for w in widths:
            ctx = b.new_context(viewport={"width": w, "height": 900}, color_scheme=scheme, reduced_motion="reduce")
            for name in PAGES:
                pg = ctx.new_page()
                errs = []
                pg.on("console", lambda m, errs=errs: errs.append(m.text) if m.type == "error" else None)
                pg.on("pageerror", lambda e, errs=errs: errs.append("pageerror: " + str(e)))
                pg.goto(f"{BASE}/{name}.html", wait_until="networkidle", timeout=60000)
                # reveal 애니메이션·지연 로딩 대응: 끝까지 스크롤 후 맨 위로
                pg.evaluate("""async () => { for (let y=0; y<document.body.scrollHeight; y+=600){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,40)); } window.scrollTo(0,0); document.querySelectorAll('.reveal,[data-reveal]').forEach(e=>e.classList.add('visible','is-visible','revealed')); }""")
                pg.wait_for_timeout(300)
                suffix = "" if scheme == "light" else "_dark"
                pg.screenshot(path=os.path.join(SHOT_DIR, f"{name}_{w}{suffix}.png"), full_page=True)
                if scheme == "light":
                    m = pg.evaluate(JS)
                    m["consoleErrors"] = errs
                    out[f"{name}@{w}"] = m
                pg.close()
            ctx.close()
    b.close()
json.dump(out, open(os.path.join(ROOT, "metrics", f"{LABEL}.json"), "w"), ensure_ascii=False, indent=1)
print("done", len(out))
