#!/usr/bin/env python3
"""Gemini 안정 호출 클라이언트 (표준 라이브러리만 사용).

안정화 방식:
  1) 모델 체인: 앞 모델이 죽거나 막히면 다음 모델로 넘어간다.
  2) 모델마다 재시도: 429·5xx·타임아웃·빈 404(간헐 오류)는 지수 백오프로 다시 시도한다.
  3) 경로 이중화: generateContent가 실패하면 Interactions API로 한 번 더 시도한다.
  4) 영구 오류(키 오류 401/403, 본문 있는 404=모델 폐기)는 재시도하지 않고 바로 다음 모델로 간다.

사용:
  from gemini_client import generate
  r = generate("질문", json_mode=False)     # r.text, r.model, r.route
  python3 gemini_client.py --check          # 모델별 건강 점검
"""
import base64, json, mimetypes, os, sys, time, urllib.error, urllib.request

BASE = "https://generativelanguage.googleapis.com/v1beta"
MODELS = ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.7-flash",
          "gemini-3-flash-preview", "gemini-3.1-pro-preview"]
KEY_FILES = ["/Users/home/Claude/ai-orchestrator/.env", os.path.expanduser("~/.config/watch/.env")]
BACKOFF = [2, 5, 12]  # 모델당 최대 4회 시도(첫 시도 + 재시도 3회)


class GeminiError(RuntimeError):
    pass


class Result:
    def __init__(self, text, model, route, attempts):
        self.text, self.model, self.route, self.attempts = text, model, route, attempts


def load_key():
    k = os.environ.get("GEMINI_API_KEY")
    if k:
        return k.strip()
    for path in KEY_FILES:
        try:
            for line in open(path, encoding="utf-8"):
                if line.startswith("GEMINI_API_KEY="):
                    v = line.split("=", 1)[1].strip().strip("'\"")
                    if v:
                        return v
        except OSError:
            continue
    raise GeminiError("GEMINI_API_KEY를 찾지 못했다 (환경변수, ai-orchestrator/.env, ~/.config/watch/.env)")


def file_part(path):
    """이미지·PDF 등 바이너리를 inline_data 파트로 만든다."""
    mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
    with open(path, "rb") as f:
        return {"inline_data": {"mime_type": mime, "data": base64.b64encode(f.read()).decode()}}


def _post(url, body, key, timeout):
    req = urllib.request.Request(url, json.dumps(body).encode(),
                                 {"x-goog-api-key": key, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def _via_generate(model, parts, json_mode, key, timeout):
    body = {"contents": [{"role": "user", "parts": parts}]}
    if json_mode:
        body["generationConfig"] = {"responseMimeType": "application/json"}
    d = _post(f"{BASE}/models/{model}:generateContent", body, key, timeout)
    return "".join(p.get("text", "") for c in d.get("candidates", [])
                   for p in c.get("content", {}).get("parts", []) if not p.get("thought"))


def _via_interactions(model, parts, json_mode, key, timeout):
    content = []
    for p in parts:
        if "text" in p:
            content.append({"type": "text", "text": p["text"]})
        elif "inline_data" in p:
            mt = p["inline_data"]["mime_type"]
            kind = "image" if mt.startswith("image/") else "document"
            content.append({"type": kind, "mime_type": mt, "data": p["inline_data"]["data"]})
        else:
            raise GeminiError("Interactions 경로가 지원하지 않는 파트 형식")
    body = {"model": model, "input": content if len(content) > 1 else content[0]["text"]}
    if json_mode:
        body["response_mime_type"] = "application/json"
    d = _post(f"{BASE}/interactions", body, key, timeout)
    return "".join(c.get("text", "") for s in d.get("steps", []) if s.get("type") == "model_output"
                   for c in s.get("content", []) if c.get("type") == "text")


def _classify(e):
    """(재시도 가능 여부, 사유) 반환."""
    if isinstance(e, urllib.error.HTTPError):
        body = ""
        try:
            body = e.read()[:200].decode(errors="replace")
        except Exception:
            pass
        if e.code in (429, 500, 502, 503, 504):
            return True, f"HTTP {e.code}"
        if e.code == 404 and not body.strip():
            return True, "HTTP 404(빈 응답, 간헐 오류)"
        return False, f"HTTP {e.code} {body.strip()[:120]}"
    return True, f"{type(e).__name__}: {str(e)[:100]}"  # 타임아웃·연결 오류


def generate(prompt=None, parts=None, json_mode=False, models=None, timeout=300, log=None, key=None):
    """프롬프트(또는 parts)를 보내 텍스트를 받는다. 모든 모델·경로가 실패하면 GeminiError."""
    log = log or (lambda m: print(m, file=sys.stderr))
    key = key or load_key()
    parts = parts or [{"text": prompt}]
    errors, attempts = [], 0
    for model in (models or MODELS):
        quota_hits = 0
        for route, fn in (("generateContent", _via_generate), ("interactions", _via_interactions)):
            for i in range(len(BACKOFF) + 1):
                attempts += 1
                try:
                    text = fn(model, parts, json_mode, key, timeout)
                    if not text.strip():
                        raise GeminiError("빈 응답")
                    if json_mode:
                        json.loads(text)  # JSON 깨짐도 재시도 대상으로 취급
                    return Result(text, model, route, attempts)
                except GeminiError as e:
                    retry, why = True, str(e)
                except json.JSONDecodeError as e:
                    retry, why = True, f"JSON 파싱 실패: {e}"
                except Exception as e:
                    retry, why = _classify(e)
                errors.append(f"{model}/{route}: {why}")
                log(f"[gemini] {model}/{route} 시도 {i + 1} 실패: {why}")
                if why.startswith("HTTP 429"):
                    quota_hits += 1  # 할당량은 같은 모델에서 곧 풀리지 않는다
                if not retry or i == len(BACKOFF) or (why.startswith("HTTP 429") and i >= 1):
                    break
                time.sleep(BACKOFF[i])
            if quota_hits >= 2:
                break  # 두 경로 모두 429면 이 모델은 건너뛴다
    raise GeminiError("모든 모델·경로 실패:\n  " + "\n  ".join(errors[-8:]))


def check():
    """모델별로 짧은 호출을 보내 상태를 표로 출력한다. 하나라도 되면 0, 전부 실패하면 1."""
    ok_any = False
    print(f"{'모델':28}{'경로':18}결과")
    for model in MODELS:
        for route, fn in (("generateContent", _via_generate), ("interactions", _via_interactions)):
            t0 = time.time()
            try:
                text = fn(model, [{"text": "OK 한 단어로만 답해"}], False, load_key(), 60)
                state = f"정상 ({time.time() - t0:.1f}초) '{text.strip()[:10]}'" if text.strip() else "빈 응답"
                ok_any = ok_any or bool(text.strip())
            except Exception as e:
                state = "실패: " + _classify(e)[1]
            print(f"{model:28}{route:18}{state}")
    return 0 if ok_any else 1


if __name__ == "__main__":
    if "--check" in sys.argv:
        sys.exit(check())
    if len(sys.argv) > 1:
        print(generate(" ".join(sys.argv[1:])).text)
    else:
        print(__doc__)
