import { describe, it, expect } from 'vitest';
import fs from 'fs';

// JSON-LD(검색엔진용 구조화 데이터)는 정적이어야 하므로 data.js와 같은 값인지 테스트로 보장한다
const data = fs.readFileSync('data.js', 'utf8');
const pick = (key) => data.match(new RegExp(`\\n\\s+${key}: "([^"]+)"`))[1];
const email = pick('email');
const phone = pick('phone');
// 구조화 데이터는 국제 표기(+82-2-…)라 숫자만 비교한다
const digits = (v) => v.replace(/\D/g, '').replace(/^82/, '0');

describe('연락처 단일 출처', () => {
    it('HTML의 JSON-LD 이메일·전화가 data.js info와 같다', () => {
        for (const f of fs.readdirSync('.').filter(n => n.endsWith('.html'))) {
            const html = fs.readFileSync(f, 'utf8');
            for (const m of html.matchAll(/"email":\s*"([^"]+)"/g)) expect(m[1], f).toBe(email);
            for (const m of html.matchAll(/"telephone":\s*"([^"]+)"/g)) expect(digits(m[1]), f).toBe(digits(phone));
        }
    });
    it('본문 HTML에 연락처를 직접 적지 않는다(JSON-LD 제외)', () => {
        for (const f of fs.readdirSync('.').filter(n => n.endsWith('.html'))) {
            const body = fs.readFileSync(f, 'utf8').replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
            expect(body.includes(email), f).toBe(false);
            expect(body.includes(phone), f).toBe(false);
        }
    });
});
