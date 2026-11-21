#!/usr/bin/env python3
"""ChatGPT(Codex CLI)와 Gemini(API)를 같은 방식으로 호출하는 얇은 래퍼.

사용법:
  ai-call.py gemini  --prompt P.md --out OUT.md [--file PATH ...] [--model NAME]
  ai-call.py chatgpt --prompt P.md --out OUT.md [--file PATH ...] [--cwd DIR]

- Gemini: 환경 변수 GEMINI_API_KEY 사용(키는 출력하지 않는다). 텍스트 파일은 본문에 붙이고,
  이미지(png/jpg/jpeg/webp)는 inline_data로 보낸다.
- ChatGPT: codex exec를 읽기 전용 샌드박스(-s read-only)로 실행한다. 파일 경로를 프롬프트에 적는다.
  이미지는 codex의 -i 옵션으로 붙인다.
"""
import argparse, base64, json, mimetypes, os, subprocess, sys, urllib.request, urllib.error

IMG_EXT = {".png", ".jpg", ".jpeg", ".webp"}


def read_text(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def call_gemini(prompt, files, model, out):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("GEMINI_API_KEY가 없습니다. 환경 변수로 넣고 다시 실행하세요.")
    parts = [{"text": prompt}]
    for p in files:
        ext = os.path.splitext(p)[1].lower()
        if ext in IMG_EXT:
            mime = mimetypes.guess_type(p)[0] or "image/jpeg"
            with open(p, "rb") as f:
                parts.append({"inline_data": {"mime_type": mime, "data": base64.b64encode(f.read()).decode()}})
            parts.append({"text": f"(위 이미지: {os.path.basename(p)})"})
        else:
            parts.append({"text": f"=== 파일: {os.path.basename(p)} ===\n" + read_text(p)})
    body = json.dumps({"contents": [{"role": "user", "parts": parts}]}).encode()
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json", "x-goog-api-key": key})
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            data = json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"Gemini HTTP {e.code}: {e.read()[:300].decode(errors='replace')}")
    text = "".join(p.get("text", "") for c in data.get("candidates", []) for p in c.get("content", {}).get("parts", []))
    if not text.strip():
        sys.exit(f"Gemini 빈 응답: {json.dumps(data)[:300]}")
    with open(out, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"gemini({model}) -> {out} ({len(text)} chars)")


def call_chatgpt(prompt, files, cwd, out):
    imgs = [p for p in files if os.path.splitext(p)[1].lower() in IMG_EXT]
    others = [p for p in files if p not in imgs]
    full = prompt + ("\n\n검토 대상 파일(경로):\n" + "\n".join(f"- {p}" for p in others) if others else "")
    cmd = ["codex", "exec", "--skip-git-repo-check", "-s", "read-only", "-C", cwd, "-o", out]
    for p in imgs:
        cmd += ["-i", p]
    cmd.append(full)
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0 or not os.path.exists(out):
        sys.exit(f"codex 실패({r.returncode}): {r.stderr[-400:]}")
    print(f"chatgpt(codex) -> {out}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("engine", choices=["gemini", "chatgpt"])
    ap.add_argument("--prompt", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--file", action="append", default=[])
    ap.add_argument("--model", default=os.environ.get("AI_GEMINI_MODEL", "gemini-3.1-pro-preview"))
    ap.add_argument("--cwd", default=os.getcwd())
    a = ap.parse_args()
    prompt = read_text(a.prompt)
    if a.engine == "gemini":
        call_gemini(prompt, a.file, a.model, a.out)
    else:
        call_chatgpt(prompt, a.file, a.cwd, a.out)


if __name__ == "__main__":
    main()
