/**
 * [ChurchData] Single source of truth
 * SOLID: Single Responsibility — 모든 콘텐츠 데이터만 담당
 */

/**
 * 전례력 계산 — 부활절(Meeus/Jones/Butcher) 기준으로 절기와 색을 산출.
 * 대한성공회 기도서 절기 색 기준.
 */
const LiturgicalCalendar = (() => {
    function easterDate(year) {
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        return new Date(year, month - 1, day);
    }
    function addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    }
    function startOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    function adventStart(year) {
        const dec25 = new Date(year, 11, 25);
        const dec25Day = dec25.getDay();
        const daysBack = dec25Day === 0 ? 28 : dec25Day + 21;
        return addDays(dec25, -daysBack);
    }

    const SEASONS = {
        advent:    { name: "대림절",    colorName: "자색", color: "#6b4f8f", colorLight: "#f0eaf7", symbol: "🕯️", note: "주님의 오심을 기다리는 시간" },
        christmas: { name: "성탄절",    colorName: "백색", color: "#b8860b", colorLight: "#fbf3df", symbol: "⭐",   note: "말씀이 사람이 되시다"   },
        epiphany:  { name: "공현절 후", colorName: "녹색", color: "#2e7d32", colorLight: "#e8f5e9", symbol: "✨",   note: "주님이 세상에 드러나심" },
        lent:      { name: "사순절",    colorName: "자색", color: "#6b4f8f", colorLight: "#f0eaf7", symbol: "✝️",  note: "회개와 절제의 시간"     },
        holyweek:  { name: "성주간",    colorName: "적색", color: "#c0390f", colorLight: "#fdf2ee", symbol: "🌿",   note: "주님의 수난을 묵상"     },
        easter:    { name: "부활절",    colorName: "백색", color: "#b8860b", colorLight: "#fbf3df", symbol: "🌅",   note: "다시 살아나신 주님"     },
        pentecost: { name: "성령강림절", colorName: "적색", color: "#c0390f", colorLight: "#fdf2ee", symbol: "🔥",   note: "성령이 강림하시다"      },
        ordinary:  { name: "성령강림 후", colorName: "녹색", color: "#2e7d32", colorLight: "#e8f5e9", symbol: "🌿",   note: "그리스도인의 일상"     },
    };

    function compute(today = new Date()) {
        const year = today.getFullYear();
        const t = startOfDay(today);

        const easter = startOfDay(easterDate(year));
        const ashWed = startOfDay(addDays(easter, -46));
        const palmSun = startOfDay(addDays(easter, -7));
        const pentecostDay = startOfDay(addDays(easter, 49));
        const advent = startOfDay(adventStart(year));

        let season;
        if (t >= advent) {
            season = SEASONS.advent;
        } else if (t >= pentecostDay) {
            if (t.getTime() === pentecostDay.getTime()) {
                season = SEASONS.pentecost;
            } else {
                season = SEASONS.ordinary;
            }
        } else if (t >= easter) {
            season = SEASONS.easter;
        } else if (t >= palmSun) {
            season = SEASONS.holyweek;
        } else if (t >= ashWed) {
            season = SEASONS.lent;
        } else {
            const jan6 = new Date(year, 0, 6);
            if (t >= startOfDay(jan6)) {
                season = SEASONS.epiphany;
            } else {
                const prevAdvent = startOfDay(adventStart(year - 1));
                season = t >= prevAdvent ? SEASONS.advent : SEASONS.christmas;
            }
        }

        const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
        return {
            ...season,
            year,
            dateLabel: `${year}년 ${months[today.getMonth()]}`
        };
    }

    return { compute, easterDate, adventStart };
})();

const CHURCH_DATA = {
    info: {
        name: "대한성공회 광명교회",
        subName: "성 디모테오 성당",
        slogan: "녹색 교회, 모든 생명을 환대하는 교회",
        vision: "하느님 나라를 살아가는 사랑의 공동체",
        established: "1990년 2월 11일",
        address: "(14335) 경기도 광명시 아방리 2길 10",
        addressShort: "경기도 광명시 아방리 2길 10",
        phone: "02-2686-0091",
        fax: "02-2686-0092",
        email: "contact@gmskh.org"
    },

    clergy: [
        {
            name: "민숙희(마가렛)",
            title: "관할사제 · 서울교구 서부교무구 총사제",
            ordained: "2005년 서품",
            quote: "교회는 모든 이를 위해 존재해야 하며, 누구도 소외받지 않아야 합니다.",
            desc: "대한성공회 서울교구 최초의 여성 총사제(2025년 3월 임명). 성평등한 교회, 녹색교회를 지향하며 광명교회를 섬기고 있습니다. 동물·성소수자·장애인·외국인 등 누구나 감사성찬례에 참여할 수 있는 열린 교회를 만들어 가고 있습니다.",
            contact: "010-8652-0688"
        },
        {
            name: "이남호(사도요한)",
            title: "부제",
            ordained: "",
            quote: "",
            desc: "광명교회 공동체를 함께 섬기고 있습니다.",
            contact: ""
        }
    ],

    philosophy: {
        title: "우리가 지향하는 교회",
        values: [
            {
                icon: "🌿",
                title: "녹색 교회",
                desc: "하느님의 창조 세계를 돌보고, 생태적 삶을 실천하는 공동체입니다."
            },
            {
                icon: "🤲",
                title: "열린 교회",
                desc: "동물·성소수자·장애인·외국인 등 모든 생명을 환대합니다. 누구도 교회 안에서 소외받지 않습니다."
            },
            {
                icon: "⚖️",
                title: "평등한 교회",
                desc: "성별·나이·배경에 관계없이 모두가 동등하게 참여하는 공동체를 만들어 갑니다."
            },
            {
                icon: "✝️",
                title: "전례 중심",
                desc: "성공회 고유의 전례와 성찬례를 통해 하느님 나라를 미리 맛봅니다."
            }
        ]
    },

    worship: {
        liturgicalSeason: LiturgicalCalendar.compute(),
        main: [
            {
                id: "main",
                title: "주일 감사성찬례",
                time: "매주 일요일 오전 11:00",
                desc: "성공회 전례의 핵심인 감사성찬례(Eucharist). 말씀 전례와 성찬 전례 두 부분으로 이루어집니다. 세례 여부와 관계없이 제대 앞에 나오실 수 있으며, 처음 오신 분도 언제든 환영합니다."
            },
            {
                id: "children",
                title: "어린이 예배",
                time: "매주 일요일 오전 11:00",
                desc: "교육관에서 어린이들의 눈높이에 맞는 전례로 함께 드립니다. 아이들이 신앙의 언어를 몸으로 배우는 시간입니다."
            }
        ],
        guide: "처음 오셨나요? 기도서와 성가집은 안내위원이 전해드립니다. 편안한 차림으로 오시면 됩니다. 세례 여부와 관계없이 모든 분을 환영합니다.",
        liturgyInfo: [
            {
                id: "newcomer",
                title: "성공회 전례란?",
                desc: "성공회(Anglican Church)는 말씀과 성찬을 함께 중시하는 전례 교회입니다. 예배는 공동기도서(Book of Common Prayer)에 따라 드리며, 회중이 함께 기도하고 응답하는 대화 형식으로 진행됩니다. 모든 신자가 성직자와 동등하게 예배를 '드리는' 주체입니다."
            },
            {
                title: "감사성찬례 순서",
                desc: "시작 예식 → 말씀 전례(성경 봉독·설교) → 신앙 고백·중보기도 → 성찬 전례(빵과 포도주 축성·영성체) → 파송"
            },
            {
                title: "영성체 안내",
                desc: "세례받은 모든 그리스도인은 영성체에 참여하실 수 있습니다. 세례를 받지 않으셨더라도 제대 앞에 나오셔서 강복을 받으실 수 있습니다."
            }
        ]
    },

    community: {
        groups: [
            {
                id: "hopecenter",
                title: "광명 희망터",
                desc: "지역 이웃을 섬기는 나눔 사역. 소외된 이들과 함께 하느님 나라를 만들어 갑니다.",
                icon: "🌱"
            },
            {
                id: "emmaus",
                title: "엠마우스 코스",
                desc: "성공회 신앙 기초 교육 과정. 전례의 의미와 신앙의 언어를 함께 배웁니다.",
                icon: "📖"
            },
            {
                id: "smallgroup",
                title: "소그룹 모임",
                desc: "삶과 말씀을 깊이 나누는 시간. 작은 공동체 안에서 서로를 돌보며 함께 성장합니다.",
                icon: "🤝"
            }
        ]
    },

    giving: {
        bankName: "국민은행",
        bank: "2680-100-14008",
        holder: "재단법인대한성공회",
        report: "투명한 재정 운영을 위해 분기별 사역 재정 보고를 공유합니다."
    },

    sns: {
        youtube: "https://youtube.com/@gmskh",
        instagram: "https://instagram.com/gmskh",
        diocesan: "https://seoul.anglican.kr/"
    },

    liveUrl: "https://youtube.com/@gmskh",

    navigation: [
        {
            label: "예배",
            href: "worship.html",
            items: [
                { label: "주일 감사성찬례", href: "worship.html#main" },
                { label: "어린이 예배",     href: "worship.html#children" },
                { label: "처음 오신 분",    href: "worship.html#newcomer" }
            ]
        },
        {
            label: "공동체",
            href: "community.html",
            items: [
                { label: "광명 희망터",  href: "community.html#hopecenter" },
                { label: "엠마우스 코스", href: "community.html#emmaus" },
                { label: "소그룹 모임",  href: "community.html#smallgroup" }
            ]
        },
        {
            label: "사제 소개",
            href: "clergy.html",
            items: [
                { label: "관할사제",   href: "clergy.html#priest" },
                { label: "교회 철학", href: "clergy.html#philosophy" }
            ]
        },
        {
            label: "헌금과 살림",
            href: "giving.html",
            items: [
                { label: "봉헌 안내", href: "giving.html#offering" },
                { label: "오시는 길", href: "giving.html#location" }
            ]
        }
    ]
};
