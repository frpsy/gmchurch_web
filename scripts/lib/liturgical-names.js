// 주보 목록 주일명 생성기. 대한성공회 기도서 교회력 표기를 따른다
// (기준표 docs/wiki/liturgy.md, 원본 docs/sources/bcp-liturgical-calendar.hwp, 검사 tests/calendarTerms.test.js).
// 표준 전례독서(data/lectionary-year-*.json)의 주일명과 같아야 하며, 해 표기(가해·나해·다해)만 앞에 붙는다.

// ── 전례력 절기 레이블 ────────────────────────────────────────
export function easterDate(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4;
    const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day   = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

function adventStart(year) {
    const dec25 = new Date(year, 11, 25);
    const dow = dec25.getDay();
    return addDays(dec25, -(dow === 0 ? 28 : dow + 21));
}

// 주의 세례주일 = 1월 6일(공현일) 다음 첫 번째 일요일
function baptismOfLord(year) {
    const jan6 = new Date(year, 0, 6);
    const dow = jan6.getDay();
    return addDays(jan6, dow === 0 ? 7 : 7 - dow);
}

// 가/나/다해: Advent 2022 시작 → 가해, 2023 → 나해, 2024 → 다해, 순환
function yearLabel(adventYear) {
    return ['가', '나', '다'][((adventYear - 2022) % 3 + 3) % 3];
}

export function sundayLabel(dateStr) {
    const y  = +dateStr.slice(0, 4);
    const mo = +dateStr.slice(4, 6) - 1;
    const d  = +dateStr.slice(6, 8);
    const date = new Date(y, mo, d);

    const easter    = easterDate(y);
    const ashWed    = addDays(easter, -46);
    const palmSun   = addDays(easter, -7);
    const pentecost = addDays(easter, 49);
    const advent    = adventStart(y);
    const ck        = addDays(advent, -7);   // 왕이신 그리스도 주일
    const baptism   = baptismOfLord(y);      // 주의 세례주일(연중 1주일)
    const wk = (a, b) => Math.round((+a - +b) / 604800000);

    // 전례력 연도 레이블 (해당 날짜가 속하는 대림절 시작 연도 기준)
    const advY = date >= advent ? y : y - 1;
    const yLbl = yearLabel(advY);

    // 주일명은 대한성공회 기도서 교회력 표기를 따른다(대림 1주일, 연중 33주일처럼 '제' 없이).
    // 성탄절 (12/25 ~ 주의 세례주일 전)
    if (mo === 11 && d === 25) return '성탄일';
    if (mo === 11 && d > 25) return '성탄 1주일';

    // 대림절
    if (date >= advent) return `대림 ${wk(date, advent) + 1}주일`;

    // 성령강림주일 이후 연중 시기 (삼위일체 주일 포함)
    if (date >= pentecost) {
        const w = wk(date, pentecost);
        if (w === 0) return '성령강림주일';
        if (w === 1) return '삼위일체 주일';
        const weeksToGoCK = Math.round((+ck - +date) / 604800000);
        if (weeksToGoCK === 0) return '왕이신 그리스도 주일';
        return `${yLbl}해 연중 ${34 - weeksToGoCK}주일`;
    }

    // 부활절 ~ 성령강림
    if (date >= easter) {
        const w = wk(date, easter);
        if (w === 0) return '부활주일';
        if (w === 6) return '부활 7주일(승천 후 주일)';
        return `부활 ${w + 1}주일`;
    }

    // 성주간
    if (date >= palmSun) return '고난주일(성지주일)';

    // 사순절
    if (date >= ashWed) return `사순 ${wk(date, ashWed)}주일`;

    // 공현 후 연중 시기 (사순절 전)
    if (date >= baptism) {
        const w = wk(date, baptism);
        return w === 0 ? '주의 세례주일' : `${yLbl}해 연중 ${w + 1}주일`;
    }

    // 성탄 1·2주일 (1/1 ~ 주의 세례주일 전)
    const prevDec25 = new Date(y - 1, 11, 25);
    return `성탄 ${Math.ceil((+date - +prevDec25) / 604800000)}주일`;
}
