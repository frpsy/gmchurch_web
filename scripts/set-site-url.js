#!/usr/bin/env node
/**
 * 사이트 절대주소 일괄 교체 스크립트
 *
 * canonical · og:url · og:image · twitter:image · JSON-LD url · sitemap.xml ·
 * robots.txt 에 박혀 있는 절대주소를 새 도메인으로 바꿉니다.
 * (내부 링크는 전부 상대경로라 손댈 필요가 없습니다.)
 *
 * 사용:
 *   node scripts/set-site-url.js https://www.example.org
 *   node scripts/set-site-url.js https://www.example.org --dry-run
 *
 * 이전 주소를 직접 지정하려면:
 *   node scripts/set-site-url.js https://새주소 --from https://옛주소
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_OLD_BASE = "https://frpsy.github.io/gmchurch_web";

function parseArgs(argv) {
  const args = argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const fromIndex = args.indexOf("--from");
  const oldBase = fromIndex !== -1 ? args[fromIndex + 1] : DEFAULT_OLD_BASE;
  const newBase = args.find((a) => !a.startsWith("--") && a !== oldBase);
  return { newBase, oldBase, dryRun };
}

function stripTrailingSlash(url) {
  return url.replace(/\/+$/, "");
}

function main() {
  const { newBase, oldBase, dryRun } = parseArgs(process.argv);

  if (!newBase) {
    console.error("사용법: node scripts/set-site-url.js https://새도메인 [--from https://옛도메인] [--dry-run]");
    process.exit(1);
  }
  if (!/^https?:\/\//.test(newBase)) {
    console.error("새 주소는 https:// 로 시작해야 합니다.");
    process.exit(1);
  }

  const from = stripTrailingSlash(oldBase);
  const to = stripTrailingSlash(newBase);

  if (from === to) {
    console.log("이미 같은 주소입니다. 변경할 것이 없습니다.");
    return;
  }

  const root = path.resolve(__dirname, "..");
  const targets = fs
    .readdirSync(root)
    .filter((name) => /\.(html|xml|txt)$/i.test(name))
    .map((name) => path.join(root, name));

  let changedFiles = 0;
  let changedRefs = 0;

  for (const file of targets) {
    const original = fs.readFileSync(file, "utf8");
    const matches = original.split(from).length - 1;
    if (matches === 0) continue;

    const updated = original.split(from).join(to);
    changedFiles += 1;
    changedRefs += matches;
    console.log(`  ${path.basename(file)}  (${matches}곳)`);

    if (!dryRun) {
      fs.writeFileSync(file, updated, "utf8");
    }
  }

  console.log();
  console.log(`${dryRun ? "[dry-run] " : ""}${from}  →  ${to}`);
  console.log(`파일 ${changedFiles}개 · 참조 ${changedRefs}곳 변경`);

  if (changedFiles === 0) {
    console.log("바꿀 주소를 찾지 못했습니다. --from 으로 현재 주소를 직접 지정해 보세요.");
  }
}

main();
