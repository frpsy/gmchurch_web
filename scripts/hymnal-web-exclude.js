#!/usr/bin/env node
/**
 * 『성가 2015』 스캔의 웹 비공개 목록 생성·검사
 *
 * 저장소에는 성가집 스캔 전체(data/hymnal-2015)를 보관하지만, 웹에는 순서지(jubo/)가
 * 실제로 보여 주는 악보 쪽(data/worship/*.book.json 이 가리키는 파일)만 올린다.
 * 나머지(원본 PDF sources/, 쓰지 않는 쪽 이미지)는 두 사이트에서 모두 내려받지 못하게 한다.
 *
 *   - 개발(GitHub Pages): _config.yml 의 exclude 구간(BEGIN/END 표시 사이)
 *   - 공식(nginx 서버)  : scripts/hymnal-web-exclude.txt 를 deploy/publish.sh 가 rsync 제외 목록으로 쓴다
 *
 * 사용:
 *   node scripts/hymnal-web-exclude.js           # 두 파일을 새로 만든다 (주보제작에서 book.json 을 만든 뒤 실행)
 *   node scripts/hymnal-web-exclude.js --check   # 최신인지만 검사한다 (npm test 가 같은 검사를 한다)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HYMNAL = "data/hymnal-2015";
const IMAGE_DIRS = [`${HYMNAL}/images`, `${HYMNAL}/unison-images`];
const SOURCES_DIR = `${HYMNAL}/sources`;
const BEGIN = "# BEGIN hymnal-web-exclude (자동 생성: node scripts/hymnal-web-exclude.js — 직접 고치지 마세요)";
const END = "# END hymnal-web-exclude";

function walk(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]))
    .sort();
}

/** 순서지가 쓰는 악보 이미지 경로(저장소 루트 기준) */
export function referencedImages(root = ROOT) {
  const dir = path.join(root, "data/worship");
  const refs = new Set();
  if (!fs.existsSync(dir)) return refs;
  for (const name of fs.readdirSync(dir).filter((n) => n.endsWith(".book.json"))) {
    const text = fs.readFileSync(path.join(dir, name), "utf8");
    for (const m of text.matchAll(/data\/hymnal-2015\/[A-Za-z0-9_./-]+\.(?:jpg|jpeg|png|webp)/g)) refs.add(m[0]);
  }
  return refs;
}

/** 웹에 올리지 않을 경로 목록(저장소 루트 기준, 폴더는 끝에 /) */
export function webExcludes() {
  const refs = referencedImages();
  const files = IMAGE_DIRS.flatMap(walk).filter((p) => !refs.has(p));
  return [`${SOURCES_DIR}/`, ...files];
}

export function renderConfigBlock(list) {
  const items = list.map((p) => `  - ${p.replace(/\/$/, "")}`);
  return [BEGIN, ...items, END].join("\n");
}

export function renderRsyncList(list) {
  return (
    [
      "# 웹에 올리지 않을 성가집 스캔 목록 — 자동 생성: node scripts/hymnal-web-exclude.js",
      "# deploy/publish.sh 가 rsync --exclude-from 으로 쓰고, 이미 올라간 파일도 지운다.",
      ...list.map((p) => `/${p}`),
    ].join("\n") + "\n"
  );
}

const configPath = path.join(ROOT, "_config.yml");
const listPath = path.join(ROOT, "scripts/hymnal-web-exclude.txt");

function expectedConfig(current, list) {
  const block = renderConfigBlock(list);
  const re = new RegExp(`${BEGIN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${END}`);
  if (re.test(current)) return current.replace(re, block);
  // 처음 만들 때: exclude: 바로 아래에 넣고, 같은 폴더를 가리키던 옛 한 줄은 지운다
  const without = current.replace(/^\s*-\s*data\/hymnal-2015\/sources\s*\n/m, "");
  return without.replace(/^exclude:\s*\n/m, `exclude:\n${block}\n`);
}

export function isUpToDate() {
  const list = webExcludes();
  const config = fs.readFileSync(configPath, "utf8");
  const txt = fs.existsSync(listPath) ? fs.readFileSync(listPath, "utf8") : "";
  return config === expectedConfig(config, list) && txt === renderRsyncList(list);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const list = webExcludes();
  if (process.argv.includes("--check")) {
    if (!isUpToDate()) {
      console.error("성가 비공개 목록이 오래되었습니다: node scripts/hymnal-web-exclude.js 를 실행하세요.");
      process.exit(1);
    }
    console.log(`성가 비공개 목록 최신 (비공개 ${list.length}개, 공개 ${referencedImages().size}쪽)`);
  } else {
    const config = fs.readFileSync(configPath, "utf8");
    fs.writeFileSync(configPath, expectedConfig(config, list));
    fs.writeFileSync(listPath, renderRsyncList(list));
    console.log(`생성 완료: 비공개 ${list.length}개, 순서지용 공개 ${referencedImages().size}쪽`);
  }
}
