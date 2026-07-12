// 표준 전례독서(data/lectionary-year-a.json) 위에 주보 기록
// (data/lectionary-overrides.json)을 병합해, 특정 주일에 실제로 봉독하는
// 네 본문을 산출한다.
//
// ⚠️ 이 병합 규칙은 app.js의 SundaysRenderer._applyOverrides +
//    _lectionaryCardHtml의 트랙 선택 로직과 동일하게 유지해야 한다.
//    (브라우저는 빌드가 없어 이 ESM을 직접 import하지 못하므로 로직이
//     두 곳에 존재한다. 한쪽을 고치면 반드시 다른 쪽도 함께 고칠 것.)

// 주보에서 확인한 트랙·특별 주일 독서를 표준 주일 위에 병합해 실제 봉독 본문을 반환.
// - 특별 주일(override.readings): 네 본문 전체 교체, 표준 주일명은 standardName으로 보존
// - 일반 주일: firstReading은 트랙으로 선택(주보 기록 우선, 없으면 짝 독서 B 기본)
// date가 표준 목록에 없으면 null.
export function resolveReadings(sundays, overrides, date) {
    const s = sundays.find(x => x.date === date);
    if (!s) return null;
    const o = (overrides && overrides[date]) || null;

    if (o && o.readings) {
        return {
            date,
            week: o.koreanName || s.koreanName,
            standardName: s.koreanName,
            track: null,
            fromBulletin: true,
            first:  o.readings.firstReading,
            psalm:  o.readings.psalm,
            second: o.readings.secondReading,
            gospel: o.readings.gospel
        };
    }

    // 일반 주일: 제1독서는 트랙으로 선택, 시편은 트랙 A일 때 표준(트랙 B값)과
    // 어긋나므로 주보 기록(o.psalm)이 있으면 우선한다.
    const hasB  = !!s.readings.firstReadingB;
    const track = hasB ? ((o && o.track) || 'B') : null;
    const first = (hasB && track === 'B')
        ? s.readings.firstReadingB
        : s.readings.firstReadingA;
    return {
        date,
        week: s.koreanName,
        standardName: s.koreanName,
        track,
        fromBulletin: !!(o && (o.track || o.psalm)),
        first,
        psalm:  (o && o.psalm) || s.readings.psalm,
        second: s.readings.secondReading,
        gospel: s.readings.gospel
    };
}

// 연중 시기에서 트랙 선택이 실제로 의미가 있는 주일인지(짝 독서가 존재).
export function isToggleWeek(sundays, date) {
    const s = sundays.find(x => x.date === date);
    return !!(s && s.readings && s.readings.firstReadingB);
}

// YYYY-MM-DD → 7일 뒤(다음 주일) 키. UTC 고정으로 서머타임 영향 없음.
export function nextSundayKey(date) {
    const [y, m, d] = date.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d + 7));
    const p = n => String(n).padStart(2, '0');
    return `${dt.getUTCFullYear()}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())}`;
}

// "2026-07-12" → "2026년 7월 12일"
export function koreanDate(date) {
    const [y, m, d] = date.split('-').map(Number);
    return `${y}년 ${m}월 ${d}일`;
}
