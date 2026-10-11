import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

function loadRenderers(fetch = vi.fn()) {
    const context = createContext({ window: { addEventListener() {} }, fetch, Date });
    runInContext(readFileSync(new URL('../data.js', import.meta.url), 'utf8'), context);
    runInContext(readFileSync(new URL('../app.js', import.meta.url), 'utf8'), context);
    return runInContext('({ BulletinRenderer, NewsRenderer, SundaysRenderer, CHURCH_DATA })', context);
}

afterEach(() => vi.useRealTimers());

describe('주보 날짜 안내', () => {
    it.each([
        ['2026-10-03T14:59:59Z', '2026-09-27', true],
        ['2026-10-03T15:00:00Z', '2026-09-27', false],
        ['2026-10-03T15:00:00Z', '2026-10-04', true],
        ['2026-10-10T14:59:59Z', '2026-10-04', true],
        ['2026-10-08T00:00:00Z', '2026-10-11', false],
        ['2027-01-01T00:00:00Z', '2026-12-27', true]
    ])('한국 시간의 주일 경계를 적용한다: %s / %s', (now, date, expected) => {
        expect(loadRenderers().BulletinRenderer._isThisWeek(date, new Date(now))).toBe(expected);
    });

    it('오래된 최신 주보를 이번 주로 소개하지 않는다', () => {
        vi.useFakeTimers();
        const { BulletinRenderer, CHURCH_DATA } = loadRenderers();
        vi.setSystemTime(new Date(Date.parse(`${CHURCH_DATA.bulletins.items[0].date}T00:00:00Z`) + 14 * 86400000));
        const html = BulletinRenderer._rowHtml(CHURCH_DATA.bulletins.items[0], true);
        expect(html).toContain('최근 등록');
        expect(html).not.toContain('이번 주');
        expect(BulletinRenderer._rowHtml(CHURCH_DATA.bulletins.items[1], false)).not.toContain('최근 등록');
    });

    it('실제 이번 주 주보에만 이번 주 표시를 붙인다', () => {
        vi.useFakeTimers();
        const { BulletinRenderer, CHURCH_DATA } = loadRenderers();
        vi.setSystemTime(new Date(`${CHURCH_DATA.bulletins.items[0].date}T03:00:00Z`));
        expect(BulletinRenderer._rowHtml(CHURCH_DATA.bulletins.items[0], true)).toContain('이번 주');
    });
});

describe('교회 소식', () => {
    it('소식이 있는 주보만 최신 순으로 나열한다', () => {
        const { NewsRenderer, CHURCH_DATA } = loadRenderers();
        const expected = CHURCH_DATA.bulletins.items.filter(item => item.news && item.news.length);
        expect(NewsRenderer._weeks().map(item => item.date)).toEqual(expected.map(item => item.date));
    });

    it('"라벨 : 값" 줄은 항목표로, 나머지는 문단으로 그린다', () => {
        const { NewsRenderer } = loadRenderers();
        const html = NewsRenderer._postHtml({ title: '모임', body: '안내 문장\n일시 : 10월 18일 오후 2시 30분\n장소 : 간석교회' });
        expect(html).toContain('<p>안내 문장</p>');
        expect(html).toContain('<dt>일시</dt><dd>10월 18일 오후 2시 30분</dd>');
        expect(html).toContain('<dt>장소</dt><dd>간석교회</dd>');
        expect(html.match(/<dl /g)).toHaveLength(1);
    });
});

describe('전례독서 로딩 실패', () => {
    it.each(['network', 'http'])('오래된 독서를 숨기고 재시도할 수 있다: %s', async failure => {
        const fetch = failure === 'network'
            ? vi.fn().mockRejectedValue(new Error('offline'))
            : vi.fn().mockResolvedValue({ ok: false });
        const { SundaysRenderer } = loadRenderers(fetch);
        let retry;
        const el = {
            innerHTML: '',
            querySelector: () => ({ addEventListener: (event, handler) => { retry = handler; } })
        };
        await SundaysRenderer._lectionaryAsync(el);
        expect(el.innerHTML).toContain('전례독서를 불러오지 못했습니다');
        expect(el.innerHTML).toContain('다시 불러오기');
        expect(el.innerHTML).not.toContain('2026년 7월 12일');
        expect(el.innerHTML).not.toContain('맥추감사주일');
        expect(fetch).toHaveBeenCalledTimes(2);
        await retry();
        expect(fetch).toHaveBeenCalledTimes(4);
    });
});

describe('글꼴 preload', () => {
    it('Pretendard 글꼴 파일을 직접 preload하지 않는다', () => {
        // dynamic-subset CSS가 조각 경로(packages/...)를 스스로 해석하므로 잘못된 주소는 404가 된다.
        const pages = readdirSync(new URL('../', import.meta.url)).filter(f => f.endsWith('.html'));
        const offenders = pages.filter(f =>
            /rel="preload"[^>]*PretendardVariable[^>]*\.woff2/.test(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')));
        expect(offenders).toEqual([]);
    });
});
