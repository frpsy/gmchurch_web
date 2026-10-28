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
        // 대림 1주일 = 성탄절(12/25) 이전의 네 번째 주일
        const dec25 = new Date(year, 11, 25);
        const dec25Day = dec25.getDay(); // 0 = 일요일
        const daysBack = dec25Day === 0 ? 28 : dec25Day + 21;
        return addDays(dec25, -daysBack);
    }

    const SEASONS = {
        advent:    { key: "advent",    name: "대림절",       colorName: "자색", color: "#6b4f8f", colorLight: "#f0eaf7", onColor: "#fff",     symbol: "candle", note: "주님의 오심을 기다리는 시간" },
        christmas: { key: "christmas", name: "성탄절",       colorName: "백색", color: "#b8860b", colorLight: "#fbf3df", ink: "#80600a", onColor: "#1a1a1a", symbol: "star",   note: "말씀이 사람이 되시다"   },
        epiphany:  { key: "epiphany",  name: "공현절 후",    colorName: "녹색", color: "#285a47", colorLight: "#e7eee8", onColor: "#fff",     symbol: "sparkle",   note: "주님이 세상에 드러나심" },
        lent:      { key: "lent",      name: "사순절",       colorName: "자색", color: "#6b4f8f", colorLight: "#f0eaf7", onColor: "#fff",     symbol: "cross",  note: "회개와 절제의 시간"     },
        holyweek:  { key: "holyweek",  name: "성주간",       colorName: "적색", color: "#c0390f", colorLight: "#fdf2ee", onColor: "#fff",     symbol: "palm",   note: "주님의 수난을 묵상"     },
        easter:    { key: "easter",    name: "부활절",       colorName: "백색", color: "#b8860b", colorLight: "#fbf3df", ink: "#80600a", onColor: "#1a1a1a", symbol: "sunrise",   note: "다시 살아나신 주님"     },
        pentecost: { key: "pentecost", name: "성령강림절",   colorName: "적색", color: "#c0390f", colorLight: "#fdf2ee", onColor: "#fff",     symbol: "flame",   note: "성령께서 임하시다"      },
        ordinary:  { key: "ordinary",  name: "성령강림 후",  colorName: "녹색", color: "#285a47", colorLight: "#e7eee8", onColor: "#fff",     symbol: "leaf",   note: "그리스도인의 일상"      }
    };

    function compute(today = new Date()) {
        const day       = startOfDay(today);
        const y         = day.getFullYear();
        const easter    = easterDate(y);
        const ashWed    = addDays(easter, -46);
        const palmSun   = addDays(easter, -7);
        const pentecost = addDays(easter, 49);
        const dec25     = new Date(y, 11, 25);
        const jan6      = new Date(y, 0, 6);
        const advent    = adventStart(y);

        let season;
        if      (day <  jan6)                          season = SEASONS.christmas; // 1/1~1/5
        else if (day <  ashWed)                        season = SEASONS.epiphany;
        else if (day <  palmSun)                       season = SEASONS.lent;
        else if (day <  easter)                        season = SEASONS.holyweek;
        else if (day <  pentecost)                     season = SEASONS.easter;
        else if (day.getTime() === pentecost.getTime()) season = SEASONS.pentecost;
        else if (day <  advent)                        season = SEASONS.ordinary;
        else if (day <  dec25)                         season = SEASONS.advent;
        else                                            season = SEASONS.christmas; // 12/25~12/31

        // 표시용 부가 정보
        const yearLabel = `${y}년 ${day.getMonth() + 1}월`;
        return { ...season, year: y, dateLabel: yearLabel };
    }

    return { compute, easterDate, adventStart };
})();

const CHURCH_DATA = {
    info: {
        name: "대한성공회 광명교회",
        subName: "성 디모테오 성당",
        tagline: "녹색교회",          // 로고 워드마크 부제 (서체 서브셋 fonts/brand-serif.woff2에 포함된 글자만 사용)
        slogan: "모든 생명을 환대하는 교회",
        vision: "하느님 나라를 살아가는 사랑의 공동체",
        diocese: "대한성공회 서울교구 서부교무구",
        aboutLead: "성공회 기도서를 따라 예배하며, 생태 보전을 신앙의 과제로 삼는 광명의 녹색교회입니다.",
        aboutDesc: "주일 애찬(예배 후 함께 나누는 식사)에는 비건 음식도 함께 마련합니다.",
        award: { year: "2023", title: "녹색교회 선정", org: "기독교환경운동연대", href: "greenchurch.html#press", newsUrl: "https://www.newsis.com/view/NISX20230515_0002303502" },
        established: "1990년 2월 11일",
        address: "경기도 광명시 아방리 2길 10",
        addressShort: "경기도 광명시 아방리 2길 10",
        postalCode: "14335",
        addressJibun: "경기도 광명시 노온사동 373-1",
        addressDetail: {
            sido: "경기도",
            sigungu: "광명시",
            eupmyeondong: "노온사동",
            jibun: "373-1",
            road: "아방리 2길 10"
        },
        geo: { latitude: 37.4757, longitude: 126.8641 },
        phone: "02-2686-0091",
        fax: "02-2686-0092",
        email: "bsyg2000@hanmail.net"
    },

    childrenWorship: {
        "eyebrow": "광명교회 어린이 예배",
        "heroEyebrow": "Children's Worship",
        "intro": "광명교회 어린이 예배는 선생님들과 함께 드리는 예배입니다. 말씀을 듣고, 찬양하고, 기도합니다.",
        "heroAlt": "팔을 벌린 예수님 곁에 모인 어린이들을 그린 그림",
        "heroCredit": "출처: 바오로딸 콘텐츠 오혜정",
        "welcomeLabel": "시간·장소 보기",
        "visitLabel": "오시는 길",
        "rhythmTitle": "예배에서 하는 일",
        "rhythm": [
            {
                "title": "말씀 듣기",
                "desc": "선생님들과 함께 성서 말씀을 읽고, 찬양과 활동으로 이야기를 나눕니다."
            },
            {
                "title": "묻고 이야기하기",
                "desc": "궁금한 것은 자유롭게 말하고, 서로 귀 기울여 듣습니다. 함께 노는 시간도 있습니다."
            },
            {
                "title": "영성체",
                "desc": "영성체 시간에는 어른들과 함께 성체를 모십니다. 세례받은 어린이는 모두 성체를 받을 수 있습니다."
            }
        ],
        "storyEyebrow": "활동 모습",
        "storyTitle": "아이들이 벽에 그린 그림",
        "storyIntro": "아이들이 직접 색을 골라 붓으로 벽에 그림을 그렸습니다.",
        "photos": [
            {
                "src": "painting-joy",
                "alt": "붓을 들고 벽화 앞에서 두 팔을 펼친 어린이",
                "caption": "붓을 들고 웃는 아이"
            },
            {
                "src": "painting-together",
                "alt": "여러 색으로 칠한 벽에 붓질하는 어린이",
                "caption": "벽에 색을 칠하는 아이"
            },
            {
                "src": "mural-church",
                "alt": "푸른 하늘과 초록 들판 위에 그린 작은 교회 벽화",
                "caption": "하늘과 들판 위의 교회 그림"
            },
            {
                "src": "mural-angel",
                "alt": "여러 색의 바탕 위에 천사와 교회를 그린 벽화",
                "caption": "천사와 교회를 그린 벽화"
            }
        ],
        "cardTitle": "사제님께 드린 카드",
        "cardIntro": "어린이 예배 아이들이 직접 쓰고 그린 카드를 민숙희 사제님께 전했습니다.",
        "cardPhotos": [
            {
                "src": "card-presenting",
                "alt": "분홍색 카드를 사제님께 건네는 두 어린이의 뒷모습",
                "caption": "사제님께 카드를 전하는 아이들"
            },
            {
                "src": "card-note",
                "alt": "손글씨와 교회 그림으로 채운 분홍색 카드",
                "caption": "아이들이 쓰고 그린 카드"
            }
        ],
        "joinTitle": "참여 안내",
        "placeLabel": "장소",
        "place": "교육관",
        "timeLabel": "시간",
        "joinIntro": "처음 오시는 가족도 환영합니다. 궁금한 점은 교회로 문의해 주세요.",
        "contactLabel": "어린이 예배 문의",
        "backLabel": "전체 예배 안내",
        "parentsIntro": "아이를 신앙 안에서 키우는 일은 부모 혼자 감당하기 어렵습니다. 어린이 예배 자녀를 둔 양육자들이 매월 모여 가정 안의 신앙 교육을 이야기하고 서로를 위해 기도합니다.",
        "parentsScheduleLabel": "일정",
        "parentsPlaceLabel": "장소",
        "parentsPlace": "교회 내 소모임 공간",
        "parentsAudienceLabel": "대상",
        "parentsAudience": "어린이 예배에 아이가 다니고 있다면 누구나",
        "parentsLinkLabel": "양육자모임 안내 보기"
    },

    // 광명 희망터(hopecenter.html) — 소개문은 교회 제공 원문(2026-10-21)
    hopeCenter: {
        // 사진을 같은 이름으로 교체하면 값을 바꿔 브라우저 캐시를 무효화한다
        imageVersion: "20261021c",
        heroEyebrow: "Community Ministry",
        title: "광명 희망터",
        summary: "지역의 소외된 이웃과 함께하는 나눔 사역",
        intro: "광명교회는 2004년 3월, 하느님의 사랑을 실천하고 이웃의 필요에 귀 기울이기 위해 부설기관인 광명희망터를 설립하였습니다.",
        heroImage: { src: "kitchen", alt: "희망터 주방에서 고개 숙여 기도하는 봉사자 세 사람", width: 1440, height: 665 },
        facts: [
            { label: "설립", value: "2004년 3월" },
            { label: "지원", value: "10가정" },
            { label: "활동", value: "매주 토요일" }
        ],
        weeklyEyebrow: "Every Saturday",
        weeklyTitle: "토요일의 나눔",
        weeklyIntro: "현재는 독거노인과 장애인 가정 등 총 10가정에 반찬을 지원하고 있습니다. 매주 토요일이면 봉사자들이 한자리에 모여 정성껏 반찬을 조리하고, 이를 각 가정에 직접 배달하며 따뜻한 마음을 전하고 있습니다.",
        steps: [
            { title: "한자리에 모입니다", desc: "매주 토요일, 봉사자들이 희망터 주방에 모입니다.", image: { src: "prayer", alt: "주방 조리대 앞에서 두 손을 모으고 기도하는 봉사자들" } },
            { title: "반찬을 조리합니다", desc: "이웃 가정에 드릴 반찬을 정성껏 만듭니다.", image: { src: "dishes", alt: "용기에 나누어 담은 오이부추무침과 양념장에 담근 달걀" } },
            { title: "가정에 전합니다", desc: "만든 반찬을 각 가정에 직접 배달합니다.", image: { src: "handoff", alt: "봉사자가 이웃에게 반찬 봉투를 건네는 모습" } }
        ],
        historyEyebrow: "Our Journey",
        historyTitle: "걸어온 길",
        historyIntro: "광명희망터는 그동안 노인 일자리 사업, 노숙인 급식 사업, 독거노인 반찬 지원 사업 등 다양한 나눔과 봉사 활동을 펼쳐 왔습니다.",
        historyImage: { src: "delivery", alt: "나눔 물품 상자를 가득 실은 차량 앞에 선 봉사자 세 사람", caption: "나눔 물품을 싣고" },
        programs: [
            { title: "노인 일자리 사업", icon: "people" },
            { title: "노숙인 급식 사업", icon: "bowl" },
            { title: "독거노인 반찬 지원 사업", icon: "dish" }
        ],
        vision: "광명희망터는 앞으로도 도움이 필요한 이웃들의 목소리에 귀 기울이며, 나눔과 사랑을 통해 지역사회에 희망을 전하는 역할을 이어가고자 합니다.",
        joinEyebrow: "Join Us",
        joinTitle: "함께하기",
        joinIntro: "희망터 봉사를 이어가기 위해서는 교우 여러분의 봉헌과 봉사가 필요합니다. 많은 관심과 기도를 바랍니다.",
        officerRole: "희망터 총무",
        contactLabel: "희망터 문의",
        givingLabel: "헌금 안내",
        communityLabel: "공동체 전체 보기"
    },

    ui: {
        copyAddress: { success: "복사됨", failure: "주소를 선택했습니다. 길게 눌러 복사해 주세요." }
    },

    // 홈(index.html) 전용 문구 — 예배 시간·위치 등 사실 정보는 info/worship에서 파생
    home: {
        heroActions: [
            { label: "처음 오셨나요?", href: "newcomer.html", primary: true },
            { label: "예배 안내",    href: "worship.html" }
        ],
        stats: { established: "설립", worship: "주일 예배", location: "위치" },
        about: {
            eyebrow: "About",
            title: "광명교회",
            facts: [
                { label: "성당", key: "subName" },
                { label: "소속", key: "diocese" }
            ],
            more: "교회 소개 자세히 보기"
        },
        worship: {
            eyebrow: "Worship",
            title: "예배 안내",
            sub: "성공회 전례를 중심으로 드리는 주일 예배입니다.",
            more: "예배 자세히 보기"
        },
        thisSunday: {
            title: "다가오는 주일",
            labels: { season: "절기", first: "제1독서", second: "제2독서", gospel: "복음" }
        },
        guide: {
            eyebrow: "Welcome",
            title: "처음 오셨나요?",
            sub: "방문 전에 많이 궁금해하시는 내용을 모았습니다.",
            cards: [
                { icon: "parking", title: "주차 안내",      desc: "교회 인근에 무료 주차가 가능합니다.",                     href: "visit.html#parking",       action: "주차 안내 보기" },
                { icon: "chalice", title: "영성체 안내",    desc: "세례받은 모든 그리스도인이 성체를 모실 수 있습니다.",     href: "newcomer.html#communion",  action: "영성체 안내 보기" },
                { icon: "question", title: "자주 묻는 질문", desc: "성공회와 예배에 관해 자주 받는 질문을 모았습니다.",       href: "faq.html",                 action: "질문 보기" },
                { icon: "book", title: "주일 주보",      desc: "이번 주 주보를 이미지와 PDF로 보실 수 있습니다.", href: "bulletin.html",           action: "주보 보기" }
            ]
        },
        visit: {
            eyebrow: "Visit",
            title: "오시는 길",
            sub: "광명교회로 초대합니다.",
            phoneLabel: "전화",
            more: "자세히 보기"
        }
    },

    anglican: {
        welcome: "광명교회를 찾아 주셔서 감사합니다.",
        welcomeSub: "성공회의 역사와 신앙, 광명교회가 걸어온 길을 소개합니다.",
        what: {
            eyebrow: "Anglican Church",
            title: "성공회란?",
            paras: [
                "성공회(聖公會)는 '거룩하고 공번된 교회'라는 뜻입니다. 16세기 잉글랜드 종교개혁에 뿌리를 두며, 가톨릭의 전례 전통과 개신교의 성서 중심 신앙을 함께 품는 <strong>'중도의 길(Via Media)'</strong>을 걸어왔습니다.",
                "오늘날 성공회는 전 세계 165개국, 약 8,500만 명의 신자가 함께하는 세계 공동체입니다. 특정 교리를 강요하지 않으며, 한 지도자에게 권위를 집중시키지도 않습니다. <strong>말씀과 성찬을 중심으로 하는 공동 신앙</strong>을 원칙으로 삼습니다."
            ],
            pillars: [
                { icon: "book", title: "성서", desc: "하느님의 말씀인 성서는 신앙과 삶의 최고 권위입니다. 예배마다 구약·서신서·복음서를 함께 봉독합니다." },
                { icon: "bulb", title: "이성", desc: "하느님이 주신 이성으로 말씀을 해석하고, 그 신앙을 일상에서 실천합니다." },
                { icon: "pillar", title: "전통", desc: "초대교회로부터 이어진 사도적 전통과 2,000년 공동체의 지혜를 신앙의 안내자로 삼습니다." }
            ],
            pillarNote: "흔히 16세기 신학자 리처드 후커(Richard Hooker, 1554–1600)에게서 비롯되었다고 설명하는 '세 기둥'입니다. 후커는 성서에 첫째 자리를 두고, 그다음 이성, 그리고 교회의 목소리(전통)를 따라야 한다고 가르쳤습니다.",
            mission: {
                eyebrow: "Five Marks of Mission",
                title: "성공회 선교정신",
                intro: "성공회는 그리스도를 따르는 선교 공동체로서, ‘교회의 선교는 그리스도의 선교(The Mission of the Church is the Mission of Christ)’라는 고백 위에 서 있습니다.",
                marks: [
                    { num: "01", ko: "하느님 나라의 기쁜 소식을 전합니다.", en: "To proclaim the Good News of the Kingdom" },
                    { num: "02", ko: "새 신자를 가르치고, 세례 주고, 양육합니다.", en: "To teach, baptize and nurture new believers" },
                    { num: "03", ko: "사랑의 섬김으로 이웃의 필요에 응답합니다.", en: "To respond to human need by loving service" },
                    { num: "04", ko: "불의한 사회를 변화시키기 위해 노력합니다.", en: "To seek to transform unjust structures of society" },
                    { num: "05", ko: "창조질서를 보존하며, 지구생명의 회복과 유지에 헌신합니다.", en: "To strive to safeguard the integrity of creation and sustain and renew the life of the earth" }
                ],
                note: "성공회 선교정신(The Five Marks of Mission)은 세계성공회협의회(Anglican Consultative Council)와 람베스 회의(Lambeth Conference)를 통해 확인된 세계성공회의 공통된 선교원칙입니다."
            }
        },
        korea: {
            eyebrow: "Anglican Church of Korea",
            title: "대한성공회",
            founded: "1890",
            paras: [
                "1890년, 영국 성공회 선교사 고요한(찰스 존 코프) 주교가 한국에 도착하면서 대한성공회의 역사가 시작되었습니다. 선교 초기부터 병원과 학교를 세워 의료와 교육 사역을 함께 펼쳐 왔습니다.",
                "일제강점기와 민주화 시기에도 사회적 책임을 이어왔으며, 오늘날에도 선교·교육·사회복지 분야에서 활동을 계속하고 있습니다."
            ],
            highlights: [
                { icon: "church", text: "서울·대전·부산 3개 교구, 전국 130여 교회" },
                { icon: "cap", text: "성공회대학교 등 교육·사회 사업 운영" },
                { icon: "globe", text: "세계성공회공동체(Anglican Communion) 정식 회원 교회" },
                { icon: "scales", text: "2001년 여성 사제 서품 시작, 사회 정의와 인권 옹호" }
            ],
            ionaLink: {
                label: "강화 아이오나 순례길",
                desc: "대한성공회의 모태가 된 강화 아이오나 순례길 소개",
                url: "https://iona-ganghwa.com/25"
            },
            incheonLink: {
                label: "인천 내동교회와 랜디스 박사의 삶",
                desc: "인천 개항장 거리의 성공회 내동교회와 인천의 슈바이처, 랜디스 박사 이야기",
                url: "https://www.incheontoday.com/news/articleView.html?idxno=210910"
            },
            cathedralLink: {
                label: "서울 정동 서울주교좌성당과 6.10민주항쟁 진원지",
                desc: "정동 서울주교좌성당과 6월 민주항쟁의 진원지가 된 성공회 이야기",
                url: "https://www.mindlenews.com/news/articleView.html?idxno=10937"
            }
        }
    },

    logo: {
        eyebrow: "Our Symbol",
        title: "교회 로고",
        // 광명교회 로고 '열린 빛' — 마크는 app.js ARCH_MARK_PATH
        church: {
            name: "열린 빛",
            subtitle: "Open Light",
            desc: [
                "광명교회의 로고 ‘열린 빛’은 예배당의 아치창 사이로 들어온 빛이 십자가를 이루는 모습을 담았습니다. 닫힌 벽이 아니라 열린 창으로, 세상의 빛이신 그리스도(요한 8:12)를 향해 누구에게나 열려 있는 교회를 나타냅니다.",
                "교회 이름과 함께 ‘녹색교회’를 새겨, 모든 생명을 환대하고 하느님의 창조세계를 돌보는 광명교회의 부르심을 담았습니다."
            ],
            elements: [
                { label: "아치창", desc: "예배당의 창이자 문입니다. 하느님께 나아가는 자리이며, 세상을 향해 열린 교회를 뜻합니다." },
                { label: "십자가 모양의 빛", desc: "그려 넣은 십자가가 아니라 열린 틈으로 드러나는 십자가입니다. 어둠 속에 비치는 그리스도의 빛을 나타냅니다." },
                { label: "아래로 넓어지는 빛줄기", desc: "위에서 내려온 빛이 아래로 갈수록 넓게 퍼집니다. 받은 은총이 세상으로 흘러감을 뜻합니다." },
                { label: "녹색교회", desc: "2023년 녹색교회로 선정된 광명교회가 이어 가는 창조세계 돌봄의 사명입니다." }
            ],
            colors: [
                { name: "숲 녹색", hex: "#1c4336", desc: "생명과 창조세계" },
                { name: "세이지", hex: "#b1b883", desc: "새싹과 자람" },
                { name: "크림", hex: "#f0ece4", desc: "빛과 환대" }
            ]
        },
        // 세계성공회 상징
        anglican: {
            title: "캔터베리 십자가",
            subtitle: "Canterbury Cross",
            lead: "성공회를 대표하는 상징",
            desc: "1867년 영국 캔터베리에서 발굴된 850년경 앵글로색슨 시대의 십자가 모양 브로치에서 유래한 상징으로, 세계 곳곳의 성공회를 나타내는 십자가로 널리 쓰입니다.",
            history: "원형인 브로치는 1867년 캔터베리 세인트조지 거리(St George's Street)에서 발굴되었습니다.¹ 은 장식을 박은 청동(구리 합금) 브로치이며,³ 원본은 현재 캔터베리의 박물관인 비니 하우스(The Beaney House of Art & Knowledge)에 소장되어 있습니다.²³ 1935년 캔터베리 대성당은 이 십자가를 청동으로 본떠 대성당의 돌에 붙인 기념 십자가를 세계 여러 성공회 대성당에 선물로 보내, 성공회 공동체의 일치를 나타냈습니다.¹ 다만 세계성공회(Anglican Communion)의 공식 문장은 별도의 ‘컴퍼스 로즈(Compass Rose)’입니다.⁴",
            elements: [
                { label: "십자가", desc: "그리스도의 십자가를 나타냅니다." },
                { label: "네 팔", desc: "바깥으로 갈수록 넓어지는 네 팔의 끝이 하나의 원을 이루어, 전체가 둥근 바퀴처럼 보입니다." },
                { label: "세 갈래 매듭", desc: "각 팔에 새겨진 세 갈래 매듭 무늬(트리케트라)는 성부·성자·성령, 삼위일체를 나타냅니다." },
                { label: "가운데", desc: "원래 브로치에서는 가운데의 작은 사각형이 네 팔을 하나로 잇습니다." }
            ],
            refs: [
                "Canterbury Archaeological Trust, “Canterbury cross” (1867년 St George's Street 발굴, 850년경 제작, 1935년 복제 십자가 배포) — <a href=\"https://www.canterbury-archaeology.org.uk/canterbury-cross-cathedral\" target=\"_blank\" rel=\"noopener\">canterbury-archaeology.org.uk</a>",
                "Wikipedia, “Canterbury cross” (원본 소장처: Beaney House of Art and Knowledge) — <a href=\"https://en.wikipedia.org/wiki/Canterbury_cross\" target=\"_blank\" rel=\"noopener\">en.wikipedia.org</a>",
                "100 Objects Kent, “Canterbury cross brooch” (재질·소장처) — <a href=\"https://100objectskent.co.uk/object/canterbury-cross-brooch\" target=\"_blank\" rel=\"noopener\">100objectskent.co.uk</a>",
                "The Episcopal Church, “Compass Rose” (세계성공회 공식 문장) — <a href=\"https://www.episcopalchurch.org/glossary/compass-rose/\" target=\"_blank\" rel=\"noopener\">episcopalchurch.org</a>"
            ]
        }
    },

    ministerSection: {
        categories: [
            { id: "성직자", title: "성직자" },
            { id: "사역자", title: "사역자", note: "모든 세례받은 신자는 일상을 살아가는 사제직으로 교회와 세상을 섬깁니다." },
            { id: "교회위원", title: "교회위원" }
        ]
    },

    clergy: [
        {
            category: "성직자",
            name: "민숙희(마가렛)",
            title: "관할사제 · 서울교구 서부교무구 총사제",
            photo: "images/clergy/priest-portrait.jpg",
            photoThumb: "images/clergy/priest-portrait-450.jpg",
            ordained: "2005년 서품",
            quote: "교회는 모든 이를 위해 존재해야 하며, 그 누구도 소외되어서는 안 됩니다.",
            desc: "성공회대학교 신학과(1988학번)를 졸업하고 2005년 사제로 서품되었습니다. 2025년 2월 서울교구 최초의 여성 총사제로 임명되었으며, 성평등과 생태 존중을 지향하며 광명교회를 섬기고 있습니다.",
            contact: "bsyg2000@hanmail.net",
            bio: {
                milestones: [
                    { year: "1988", text: "성공회대학교 신학과 입학" },
                    { year: "1998", text: "서울교구 신학대학원 성직과정 입학 — 교구 여성 성직 과정생", first: true },
                    { year: "2005", text: "사제 서품" },
                    { year: "2006", text: "동두천교회 보좌사제 — 서울교구 여성 사목자 일반교회 단독 사목", first: true },
                    { year: "—", text: "동두천·성북 나눔의집 원장 역임 — 서울교구 첫 여성 원장", first: true },
                    { year: "2014", text: "강화 송산교회 관할사제 부임 — 서울교구 첫 여성 관할사제", first: true },
                    { year: "2025", text: "서울교구 서부교무구 총사제 임명 — 교구 여성 총사제", first: true }
                ],
                roles: [
                    "서울교구 청년연합회장(전, 1996)",
                    "대한성공회 제2대 여성국장(전)",
                    "관구 윤리위원회 위원(전)",
                    "대한성공회 여성 성직자회 회장(전)",
                    "대한성공회 정의평화사제단 회장(현)",
                    "성공회대학교 동물권리 과정 수강(현)"
                ],
                externalRoles: [
                    "한국기독청년연합회(EYCK) 서울지회장(전)",
                    "한국기독교교회협의회(NCCK) 여성위원장(전)",
                    "NCCK 종교간대화위원회 위원장(전)",
                    "한국교회 인권센터 부이사장(현)"
                ],
                ministryNote: "대한성공회 최초로 반려동물 축복식을 시작해 오랫동안 이어오고 있으며, 유기견 보호소 봉사와 수의사 초청 강연 등 생명 사역을 함께 이어가고 있습니다. '경계 없는 교회, 모든 생명에게 열린 교회, 차별과 혐오에 맞서는 교회'가 민숙희 사제가 지향하는 사목 방향입니다.",
                source: {
                    title: "《여성들이 함께 길을 내고 걷는 우리들의 사제》",
                    author: "대한성공회 전국여성성직자회",
                    publisher: "성공회출판사",
                    year: "2021"
                }
            }
        },
        {
            category: "성직자",
            name: "이남호(사도요한)",
            title: "협동사제",
            photo: "images/clergy/priest-portrait-2.jpg",
            photoThumb: "images/clergy/priest-portrait-2-450.jpg",
            ordained: "2013년 서품",
            quote: "목회와 상담의 공통 원칙은 공감이며, 타인의 아픔을 공감하는 것은 주님이 주시는 능력입니다.",
            desc: "문학, 신학, 상담심리, 동양철학을 두루 공부한 성공회 사제입니다. 35세에 늦깎이로 신학의 길에 들어서 사제 서품을 받았으며, 마포들음교회에서 상담센터를 운영하는 등 사목과 상담을 접목한 사역을 이어왔습니다. 현재 광명교회 협동사제로 섬기고 있습니다.",
            contact: "",
            kyoboUrl: "https://www.aladin.co.kr/m/mproduct.aspx?itemid=287238568",
            blogUrl: "https://m.blog.naver.com/brave9955",
            bio: {
                milestones: [
                    { year: "—", text: "서울 출생, 서대문·은평 지역에서 성장 — 충암초·중학교, 명지고등학교 졸업" },
                    { year: "—", text: "연세대학교 불어불문학과 졸업, 직장인으로 생활" },
                    { year: "1999", text: "성공회대학교 신학과 편입(만 35세) — 늦깎이로 사제의 길을 선택" },
                    { year: "2001", text: "성공회대학교 졸업, 성공회대학교 신학대학원 입학(만 37세)" },
                    { year: "2003", text: "성공회대학교 신학대학원 졸업" },
                    { year: "2005", text: "부제 서품" },
                    { year: "2007", text: "가톨릭대학교 상담심리대학원 입학" },
                    { year: "2009", text: "가톨릭대학교 상담심리대학원 졸업(상담심리학 석사)" },
                    { year: "2010", text: "상담심리사 자격 취득" },
                    { year: "2011", text: "동방문화대학원대학교 입학" },
                    { year: "2013", text: "사제 서품" },
                    { year: "2020", text: "동방문화대학원대학교 졸업(주역·명리학 철학박사)" },
                    { year: "—", text: "성공회 살림터(노숙위기가정 보호시설) 소장" },
                    { year: "—", text: "마포들음교회 관할사제 — 교회 내 들음상담센터 개설·운영" },
                    { year: "—", text: "성공회대학교·한겨레문화센터 강의" },
                    { year: "현재", text: "옹진 재가노인지원서비스센터장, 광명교회 협동사제" }
                ],
                roles: [
                    "성공회 살림터 소장(전)",
                    "성공회대학교 강사(전)",
                    "한겨레문화센터 강사(전)",
                    "마포들음교회 들음상담센터 운영(전)",
                    "옹진 재가노인지원서비스센터장(현)",
                    "광명교회 협동사제(현)"
                ],
                ministryNote: "부제 시절 '사람에 대한 이해가 부족하다'는 자각이 상담심리 공부의 계기가 되었습니다. 평일엔 상담센터, 주일엔 예배당으로 운영했던 마포들음교회의 경험처럼, 그의 사목은 아픈 마음을 공감으로 돌보는 일과 분리되지 않습니다. 저서 『기독교, 명리학과 만나다』는 신앙과 동양적 성찰이 만나는 지점을 탐구한 작업입니다."
            }
        }
    ],

    // 평신도 임원진 — 이름(세례명) 형식, 교회위원은 가나다순. term은 선출직 임기(별정직·사역자는 생략). category는 ministerSection.categories와 매칭
    officers: [
        { category: "교회위원", role: "신자회장",   term: "2026.9~2028.9", members: ["이문희(니콜라)"] },
        { category: "교회위원", role: "사제회장",   term: "2026.9~2028.9", members: ["박종미(수산나)"] },
        { category: "교회위원", role: "교회위원",   term: "2026.9~2028.9", members: ["나영숙(엘리사벳)", "박경준(프란시스)", "박광식(암브로스)", "윤상돈(베드로)"] },
        { category: "교회위원", role: "건축위원장", members: ["정순진(디모데오)"] },
        { category: "교회위원", role: "희망터 총무", members: ["신효심(베로니카)"] },
        { category: "사역자",   role: "신자 사역자", members: ["정동숙(엘리사벳)", "박종미(수산나)"] }
    ],

    bishop: {
        name: "김장환(엘리야)",
        title: "제7대 서울교구장 주교",
        diocese: "대한성공회 서울교구",
        ordained: "2024년 9월 26일 성품 및 승좌",
        photo: "images/clergy/bishop-portrait.jpg",
        photoThumb: "images/clergy/bishop-portrait-450.jpg",
        desc: "대한성공회 제7대 서울교구장 주교로, 2024년 9월 26일 서울주교좌성당에서 성품식과 승좌식을 거쳐 취임했습니다. 1964년생으로, 서강대 불어불문학과를 졸업한 뒤 1995년 성공회 사목신학연구원을 마쳤으며, 1998년 사제 서품을 받았습니다. 오산세마대교회 관할사제, 서울교구 선교교육훈련국장, 대학로교회 관할사제 등을 지냈습니다. 취임사에서는 '사도성을 회복하는 성공회'를 강조하며 세계성공회 선교정신에 따라 교회와 세상을 위해 기도하고 복음을 선포하는 데 전념하겠다고 밝혔습니다.",
        note: "광명교회는 대한성공회 서울교구 소속 교회입니다."
    },

    philosophy: {
        title: "우리가 지향하는 교회",
        intro: [
            "광명교회는 모든 존재가 존중받는 공동체, 모든 이가 참여하고 누리는 평등한 교회, 모든 생명이 보호받는 생태적 성소를 지향합니다.",
            "우리는 생명을 가리지 않고 환영합니다. 장애인, 성소수자, 이주노동자, 어린이와 노인, 그리고 동물들까지 — 하느님의 모든 피조물은 이곳에서 환대받습니다."
        ],
        values: [
            {
                icon: "leaf",
                title: "녹색교회",
                desc: "생태와 환경 보전을 신앙의 과제로 삼고 실천합니다. 녹색교회·동물복지·환경보호를 실천하며 생명을 돌봅니다. 주일 애찬에는 비건 음식도 함께 준비합니다.",
                href: "greenchurch.html",
                cta: "녹색교회 자세히 보기"
            },
            {
                icon: "hands-heart",
                title: "열린 교회",
                desc: "성소수자·장애인·이주노동자·어린이·노인·동물 등 사회적 소수자와 모든 생명에 열려 있습니다."
            },
            {
                icon: "scales",
                title: "평등한 교회",
                desc: "성별·나이·지위에 관계없이 누구나 동등하게 예배에 참여하고 봉사합니다."
            },
            {
                icon: "cross",
                title: "전례 중심",
                desc: "성공회 기도서에 따른 전례와 성찬을 예배의 중심에 둡니다."
            }
        ],
        closing: "광명교회는 신앙과 일상, 사람과 이웃이 연결되는 열린 공동체입니다."
    },

    // 교회 연혁 — 출처: 교회 제공 「대한성공회 광명교회 연혁」 PDF(2026-10-21). 인쇄된 문구 그대로(띄어쓰기만 교정)
    history: {
        eyebrow: "Our History",
        title: "교회 연혁",
        sub: "1989년 개척을 다짐한 때부터 오늘까지 광명교회가 걸어온 길입니다.",
        // key: true 항목만 먼저 보이고, 버튼으로 전체 연혁을 펼친다
        moreLabel: "전체 연혁 보기",
        lessLabel: "핵심만 보기",
        items: [
            { year: "1989", date: "4월 2일", text: "영등포교회 위원회에서 교회개척기금 1천만 원을 마련하여 광명지역에 개척 의지 다짐", key: true },
            { year: "1989", date: "8월 11일", text: "매주 금요일 광명지역에 거주하는 영등포, 베다교회 교우를 중심으로 각 가정과 연합 구역예배를 철산13단지 이은혜 교우 댁에서 드림" },
            { year: "1989", date: "8월 14일", text: "황주익 베드로, 김정순 요안나 가정에서 매일 저녁 10시에 교회 설립을 위한 작정기도 드림" },
            { year: "1989", date: "9월 27일", text: "광명시 철산3동 463-92 동원빌딩 지하(보증금 1천만 원, 월세 2십만 원) 교회로 계약" },
            { year: "1989", date: "9월 29일", text: "첫 구역예배 9명 참석(인도: 윤병학 마가)", key: true },
            { year: "1990", date: "1월 15일", text: "장창경 베레기아 전도사 부임" },
            { year: "1990", date: "1월 18일", text: "영등포교회 김준배 사무엘 사제와 광명지역 교우 30여 명이 목요 만도(저녁기도)를 드리고 축복식 관련 토의" },
            { year: "1990", date: "2월 10일", text: "관할사제 김근상 바우로 사제 임명" },
            { year: "1990", date: "2월 11일", text: "광명 성 디모테오 성당 축복식 — 집전 김성수 시몬 주교", key: true },
            { year: "1990", date: "10월 15일", text: "관할사제 박찬욱 아브라함 사제, 관리사제 전삼광 세바스찬 사제 임명" },
            { year: "1991", date: "12월 26일", text: "최상석 아타나시오 사제 부임" },
            { year: "1992", date: "5월 3일", text: "광명시 하안동 중심상업지구 3-5, 성보프라자 이전 축복식", key: true },
            { year: "1993", date: "2월 1일", text: "본교회 승격. 관할사제: 김재열 요한 사제", key: true },
            { year: "1994", date: "4월 17일", text: "최상석 아타나시오 사제 관할사제 임명" },
            { year: "1995", date: "11월 12일", text: "광명4동 158-288 성전 이전 축성식(집전: 정철범 마태오 주교)", key: true },
            { year: "1999", date: "11월 28일", text: "이완홍 바나바 사제 부임" },
            { year: "2003", date: "10월 12일", text: "광명시 노온사동 373-1 이전 축성식", key: true },
            { year: "2003", date: "11월 16일", text: "고영돈 베네딕트 사제 부임" },
            { year: "2009", date: "2월 22일", text: "박성순(야고보) 사제 부임" },
            { year: "2012", date: "1월 15일", text: "김태욱 사제 부임" },
            { year: "2013", date: "1월 27일", text: "김영회 사제 부임" },
            { year: "2016", date: "1월 31일", text: "한자천 사제 부임" },
            // 원본 PDF는 「2019년 2월 29일」 — 2019년에는 2월 29일이 없어 일(日)은 확인 전까지 비워 둔다
            { year: "2019", date: "2월", text: "민숙희 사제 부임", key: true }
        ]
    },

    // 교회 소개 페이지 — 섹션 둘러보기 내비 + 순차 연결 흐름
    aboutJourney: {
        navLabel: "교회 소개 둘러보기",
        nextLabel: "다음"
    },

    worship: {
        lectionaryError: {
            description: "전례독서를 불러오지 못했습니다. 연결 상태를 확인한 뒤 다시 시도해 주세요.",
            retry: "다시 불러오기"
        },
        liturgicalSeason: LiturgicalCalendar.compute(),
        currentReadings: {
            week: "연중 제30주일",
            year: "A년",
            date: "2026년 10월 25일",
            note: "주보 기준 · 대한성공회 공동 전례독서에 따릅니다.",
            items: [
                { role: "제1독서", ref: "신명기 34:1-12" },
                { role: "시편", ref: "시편 90편" },
                { role: "서신서", ref: "데살로니카전서 2:1-8" },
                { role: "복음", ref: "마태 22:34-46" }
            ]
        },
        nextReadings: {
            week: "모든 성인 주일",
            year: "A년",
            date: "2026년 11월 1일",
            items: [
                { role: "제1독서", ref: "묵시록 7:9-17" },
                { role: "시편", ref: "시편 34:1-10, 22" },
                { role: "서신서", ref: "요한1서 3:1-3" },
                { role: "복음", ref: "마태 5:1-12" }
            ]
        },
        main: [
            {
                id: "main",
                title: "주일 감사성찬례",
                time: "매주 일요일 오전 11:00",
                desc: "성공회 전례의 중심인 감사성찬례(Eucharist)입니다. 말씀과 성찬 안에서 예수 그리스도를 만나는 시간이며, 세례받은 모든 그리스도인이 성체를 모실 수 있습니다. 반려동물과 함께 오신 분은 예배 후 신부님께 강복(축복 기도)을 청할 수 있습니다.",
                summary: "말씀과 성찬 안에서 예수 그리스도를 만나는 성공회 전례의 중심 예배입니다. 세례받은 모든 그리스도인이 성체를 모실 수 있으며, 반려동물과 함께 오신 분은 예배 후 강복(축복 기도)을 청할 수 있습니다."
            },
            {
                id: "children",
                href: "children.html",
                summary: "함께 놀고 기도하며 하느님의 사랑을 배웁니다.",
                linkLabel: "어린이 예배 만나보기",
                title: "어린이 예배",
                time: "매주 일요일 오전 11:00",
                desc: "교육관에서 드리는 어린이 예배입니다. 성공회 전례를 어린이 눈높이에 맞추어 구성합니다."
            }
        ],
        guide: "",
        eucharistIntro: "성공회 주일 예배의 중심은 <strong>감사성찬례</strong>입니다. 천주교의 '미사', 개신교의 '성만찬'과 같은 예배로, 그리스도교 예배의 출발이자 핵심입니다.",
        eucharistIntroQuote: "감사성찬례는 예수님의 마지막 만찬에서 비롯되었으며, <strong>공동체가 함께 모여 말씀을 듣고 성찬을 나누는</strong> 시간입니다.",
        eucharistOrder: [
            {
                title: "개회예식",
                items: [
                    "입당 성가와 함께 집전자가 입장합니다.",
                    "회중은 모두 일어나 하느님께 예배드릴 준비를 합니다.",
                    "죄를 고백하고 용서를 구합니다."
                ]
            },
            {
                title: "말씀의 전례",
                items: [
                    "제1독서(구약) · 성시(시편) · 제2독서(서신서)",
                    "복음환호송(<em>\"알렐루야, 알렐루야\"</em>) 후 <strong>복음서 봉독</strong>과 설교",
                    "니케아 신경 또는 사도신경으로 신앙을 함께 고백합니다.",
                    "교회와 세상, 이웃과 자신을 위한 중보기도 — 회중은 <em>\"주여, 우리의 기도를 들으소서\"</em>로 응답합니다."
                ]
            },
            {
                title: "성찬의 전례",
                items: [
                    "평화의 인사를 나눕니다.",
                    "빵과 포도주, 헌금을 봉헌하고 집전자가 <strong>빵과 포도주를 축성</strong>합니다.",
                    "주님의 기도 후 <strong>영성체</strong> — 그리스도의 몸과 피를 모십니다."
                ]
            },
            {
                title: "파송예식",
                items: [
                    "감사 기도와 강복을 받습니다.",
                    "<em>\"나가서 주님의 복음을 전합시다 / 평화를 이룹시다 / 사랑을 나눕시다\"</em>",
                    "회중: <em>\"그리스도의 이름으로. 아멘\"</em> — 우리는 세상으로 파송되는 선교사가 됩니다."
                ]
            }
        ],
        spaceGuide: {
            intro: "성공회 성당에 처음 들어서면 낯선 공간과 물건들을 만나게 됩니다.",
            items: [
                {
                    icon: "drop",
                    name: "성수대",
                    en: "Holy Water",
                    desc: "예배당 입구에 놓인 성수입니다. 세례를 통해 하느님의 백성이 되었음을 기억하며, 손끝에 적셔 십자 성호를 긋고 예배의 자리로 들어섭니다."
                },
                {
                    icon: "book",
                    name: "독서대",
                    en: "Ambo · Lectern",
                    desc: "하느님의 말씀을 봉독하고 설교를 선포하는 자리입니다. 구약·서신서·복음서가 이곳에서 회중에게 선포됩니다."
                },
                {
                    icon: "chalice",
                    name: "제대",
                    en: "Altar",
                    desc: "감사성찬례의 중심이 되는 거룩한 식탁입니다. 빵과 포도주를 축성하여 그리스도의 몸과 피를 나누는, 예배의 가장 거룩한 자리입니다."
                },
                {
                    icon: "tabernacle",
                    name: "성막",
                    en: "Tabernacle",
                    desc: "축성된 성체를 모셔 두는 곳입니다. 거동이 어려운 병자나 교우를 방문하여 성체를 나눌 때 이곳에 보관된 성체를 사용합니다."
                },
                {
                    icon: "candle",
                    name: "부활초",
                    en: "Paschal Candle",
                    desc: "부활하신 그리스도의 빛과 새 생명·영생의 소망을 상징합니다. 부활절에 새로 축복하여 밝히며, 세례와 장례 예식에서도 함께합니다."
                }
            ]
        },
        resources: [
            {
                icon: "book",
                title: "성공회 기도서",
                desc: "공동기도서(BCP)입니다.",
                url: "https://dulkuka12.github.io/kbcp/"
            },
            {
                icon: "music",
                title: "성가집",
                desc: "예배 성가를 온라인으로 볼 수 있습니다.",
                url: "https://dulkuka12.github.io/khymn/"
            },
            {
                icon: "cross",
                title: "공동번역 성서",
                desc: "성공회 예배에서 봉독하는 공동번역 성서입니다.",
                url: "https://bible.anglican.kr/"
            }
        ],
        prayer: {
            dailyOfficeIntro: [
                "성무일과(매일기도)는 정해진 시간에 드리는 교회의 공적 기도입니다. \"늘 기도하십시오\"(1데살 5:17)라는 말씀을 따라, 초대교회와 수도원 전통에서 이어져 온 기도의 리듬입니다.",
                "성공회 기도서는 하루의 흐름에 따른 네 가지 기도를 제공합니다. 시편과 성서 봉독, 송가와 기도로 구성되며, 공동체나 개인이 매일 같은 기도문으로 하느님 앞에 하루를 열고 닫습니다.",
                "정해진 기도문을 날마다 되풀이하는 일은 단조로워 보일 수 있지만, 같은 말씀을 거듭 새기며 하루의 때를 거룩하게 구별하는 데 그 뜻이 있습니다. 아래 기도서를 따라 누구나 지금 함께 기도할 수 있습니다."
            ],
            dailyOffice: [
                {
                    icon: "sunrise",
                    title: "아침기도",
                    en: "Morning Prayer",
                    desc: "하루를 시작하며 드리는 기도입니다. 송가·시편·성서 봉독·기도로 구성됩니다.",
                    url: "https://dulkuka12.github.io/kbcp/morning-prayer.html"
                },
                {
                    icon: "sun",
                    title: "낮기도",
                    en: "Noonday Prayer",
                    desc: "하루의 한가운데서 잠시 멈추어 드리는 짧은 기도입니다.",
                    url: "https://dulkuka12.github.io/kbcp/noonday-prayer.html"
                },
                {
                    icon: "sunset",
                    title: "저녁기도",
                    en: "Evening Prayer",
                    desc: "하루를 마감하며 감사와 참회로 드리는 기도입니다. 성모마리아 송가(마그니피캇)를 포함하며, 빛이신 그리스도를 찬양합니다.",
                    url: "https://dulkuka12.github.io/kbcp/evening-prayer.html"
                },
                {
                    icon: "moon",
                    title: "밤기도",
                    en: "Compline",
                    desc: "수도원 전통에서 비롯된 짧고 고요한 기도입니다. 잠자리에 들기 전 하루를 마감합니다.",
                    url: "https://dulkuka12.github.io/kbcp/compline-prayer.html"
                }
            ],
            bcp: {
                eyebrow: "Book of Common Prayer & Hymnal",
                title: "공동기도서와 성가",
                sections: [
                    {
                        title: "공동기도서(Book of Common Prayer)란?",
                        body: [
                            "동방정교회, 로마가톨릭교회와 같이 성공회는 하나의 전례서(예배예식서)를 사용하는 '기도서의 교회'입니다. 성서, 기도서, 성가는 성공회 신앙생활의 세 기둥입니다.",
                            "잉글랜드 종교개혁기에 토마스 크랜머 캔터베리 대주교가 성서와 개신교 교리에 입각해서 동서고금의 훌륭한 기도문과 예식문들을 참고하면서도, 영국의 평민들(commoners) 모두가 가정에 두고 즐겨 사용하도록 편찬했습니다. 그래서 영문학상으로도 중요한 자료로 평가됩니다.",
                            "전례력(교회력), 성찬예배, 세례성사와 병자·혼인·상장례 등 성사적 예식들, 성무일과(매일기도), 각종 기도문, 성무일과용 시편집으로 이뤄져 있습니다.",
                            "세계성공회는 이를 바탕으로 각 나라별 특성과 시대변화를 반영한 공동기도서를 계속해서 만들어가고 있습니다. 뉴질랜드 기도서는 마오리 원주민들의 신앙을 잘 반영한 예로 꼽힙니다."
                        ]
                    },
                    {
                        title: "대한성공회 성가란?",
                        body: [
                            "한국 개신교는 여러 교단이 같은 성경 번역본과 같은 찬송가를 함께 쓰는 경우가 많지만, 외국은 각 교단 신학을 반영해 감리교·침례교·장로교 등이 각자 따로 만들어 씁니다.",
                            "대한성공회는 1990년판 성가집에 이어 2015년에 새 성가집 『성가 2015』를 펴냈습니다. 초대교회 동서방 교부들의 신앙이 담긴 노래들부터, 현대 가톨릭 성가와 한국 개신교 찬송가, 제3세계 성가, 복음성가를 두루 담았습니다.",
                            "특히 한국예술종합학교 총장이었던 이건용의 창작곡들과 여러 국악, 한국 작곡가들의 곡이 애창되고 있습니다."
                        ]
                    }
                ]
            },
            intercession: {
                icon: "globe",
                title: "세계성공회 중보기도 목록",
                en: "Anglican Cycle of Prayer",
                desc: "전 세계 성공회 교구와 교회를 날마다 기억하며 기도합니다. 세계성공회가 공식 발행한 2023–2026년 기도 목록입니다.",
                url: "https://www.anglicancommunion.org/wp-content/uploads/2026/02/acp_from-aba-to-divine-hope-via-zululand-2023-to-2026_webpdf.pdf"
            }
        }
    },

    community: {
        groups: [
            {
                id: "hopecenter",
                title: "광명 희망터",
                desc: "지역의 소외된 이웃과 함께하는 돌봄 사역",
                icon: "sprout",
                detailUrl: "hopecenter.html"
            },
            {
                id: "emmaus",
                title: "엠마우스 코스",
                desc: "그리스도교 신앙의 기초를 배우는 과정",
                icon: "book",
                detailUrl: "emmaus.html"
            },
            {
                id: "smallgroup",
                title: "소그룹 모임",
                desc: "기도하고 이야기 나누는 작은 모임",
                icon: "people",
                detailUrl: "smallgroup.html"
            },
            {
                id: "agape",
                title: "주일 애찬",
                desc: "예배 후 함께 음식을 나누는 자리",
                note: "비건 음식도 함께 준비됩니다",
                footnote: "* 비건: 계란·우유도 포함하지 않는 완전 채식",
                icon: "bowl"
            }
        ],
        smallgroups: {
            intro: "교재나 정해진 형식 없이, 솔직한 만남을 중심에 두는 작은 모임입니다.",
            groups: [
                {
                    id: "parents",
                    icon: "house",
                    title: "어린이 예배 양육자모임",
                    en: "Sunday School Parents",
                    schedule: "매월 셋째 주일 애찬 후",
                    desc: "아이를 신앙 안에서 키우는 일은 부모 혼자 감당하기 어렵습니다. 이 모임은 어린이 예배 자녀를 둔 양육자들이 함께 모여, 가정 안의 신앙 교육을 솔직하게 이야기하고 서로를 위해 기도하는 자리입니다.",
                    details: [
                        "매월 셋째 주일 애찬을 마친 후, 교회 내 소모임 공간에서 진행합니다.",
                        "정해진 교재나 커리큘럼 없이, 그 달의 관심사나 고민을 자유롭게 나눕니다.",
                        "기도와 나눔으로 마무리하며, 한 시간 안팎으로 진행합니다.",
                        "어린이 예배에 아이가 다니고 있다면 누구나 참여할 수 있습니다."
                    ]
                }
            ]
        }
    },

    giving: {
        bankName: "국민은행",
        bank: "2680-100-14008",
        holder: "대한성공회 광명교회",
        report: "분기별로 재정 운영 결과를 투명하게 공개합니다.",
        receiptInfo: "기부금 영수증을 발급해 드립니다. 필요하신 분은 교회 사무실로 문의해 주세요."
    },

    // 오시는 길(visit.html) — {phone}은 info.phone으로 치환
    visit: {
        locationTitle: "주소와 연락처",
        transportTitle: "교통·주차 안내",
        labels: { postal: "우편번호", phone: "전화", fax: "팩스", car: "승용차", bus: "버스", parking: "주차" },
        car: "내비게이션에 <em>대한성공회 광명교회</em> 또는 위 주소를 검색해 주세요.",
        bus: {
            stopLabel: "가까운 정류장",
            stop: "온신초등학교앞",
            routes: [
                { no: "505",  type: "blue" },
                { no: "5627", type: "green" },
                { no: "5633", type: "green" },
                { no: "6637", type: "green" }
            ],
            note: "서울역·구로디지털단지·목동 방면에서 접근 가능합니다."
        },
        parking: "교회 인근에 무료 주차가 가능합니다. 방문 전 교회 사무실({phone})로 확인해 주세요.",
        note: "※ 네이버 지도·카카오맵에서 <strong>대한성공회 광명교회</strong>로 검색하시면 최단 경로 안내를 받으실 수 있습니다."
    },

    // 방문자 수: 외부 카운터(Abacus, 가입 불필요)에 저장. baseline은 누적 표시에 더하는 시작 숫자
    visitorCounter: {
        endpoint: 'https://abacus.jasoncameron.dev',
        namespace: 'gmchurch-frpsy-web',
        baseline: 0
    },

    sns: {
        youtube: "https://youtube.com/channel/UCDaJNUSrCsljsECQpKDBv7A",
        instagram: "https://www.instagram.com/anglican_gm?igsh=MTdnbWRsdHF3OGVucw==",
        "naver blog": "https://m.blog.naver.com/bambi_0mini",
        diocesan: "https://seoul.anglican.kr/"
    },

    press: [
        {
            year: "2026",
            category: "정의·평화",
            media: "에큐메니안",
            title: "6월 민주항쟁 39주년 시민기념식, 성공회 서울주교좌성당서 열려 — 민숙희 마가렛 사제 추모 설교",
            date: "2026.06",
            url: "https://www.ecumenian.com/news/articleView.html?idxno=31441"
        },
        {
            year: "2018",
            category: "목회·상담",
            media: "국민일보",
            title: "목회와 상담의 공통 원칙은 공감… 주님의 공감능력으로 아픈 마음 치유",
            date: "2018.01",
            url: "https://www.kmib.co.kr/article/view.asp?arcid=0923882885&code=23111211&sid1=min"
        },
        {
            year: "2023",
            category: "녹색교회",
            media: "CBS 크리스천노컷뉴스",
            title: "대한성공회, \"모든 교회를 녹색교회로!\" 교회력 '창조절' 전격 시행",
            date: "2023.08",
            url: "https://mch.nocutnews.co.kr/news/6000856"
        },
        {
            year: "2023",
            category: "녹색교회",
            media: "뉴시스",
            title: "NCCK, 올해 '녹색교회' 11곳 선정 — 광명교회(대한성공회) 등",
            date: "2023.05",
            url: "https://mobile.newsis.com/view_amp.html?ar_id=NISX20230515_0002303502"
        },
        {
            year: "2025",
            category: "여성 성직",
            media: "성공회신문",
            title: "서울교구 최초 여성 총사제 민숙희 마가렛 사제, 부산교구 최초 여성 성직자 상임위원 심미경 아가타 사제 인터뷰",
            date: "2025.02",
            url: "https://www.skhnews.or.kr/news/articleView.html?idxno=768"
        },
        {
            year: "2021",
            category: "여성 성직",
            media: "뉴스앤조이",
            title: "대한성공회 여성 사제 서품 20주년…여성 성직 역사는 교단 여성들의 투쟁기",
            date: "2021.09",
            url: "https://www.newsnjoy.or.kr/news/articleView.html?idxno=303297"
        },
        {
            year: "2016",
            category: "반려동물 목회",
            media: "뉴스앤조이",
            title: "개업 축복식도 하면서, 동물은 왜 안 되나? — 반려동물 축복식 집전한 민숙희 사제 인터뷰",
            date: "2016.10",
            url: "https://www.newsnjoy.or.kr/news/articleView.html?idxno=206450"
        },
        {
            year: "2005",
            category: "여성 성직",
            media: "여성신문",
            title: "대한성공회 서울교구 첫 여성성직자 민숙희, 김기리 부제",
            date: "2005.05",
            url: "https://www.womennews.co.kr/news/articleView.html?idxno=15941"
        }
    ],

    liveUrl: "https://youtu.be/5tTJvrTX4aA",

    media: {
        // 미디어·자료 허브(media.html) 카드 — MediaHubRenderer가 렌더
        hub: {
            cards: [
                { icon: "film", title: "영상 갤러리", desc: "성공회의 신앙과 예배, 광명교회 공동체 이야기를 담은 유튜브 영상.", href: "videos.html",  action: "영상 보기" },
                { icon: "camera", title: "사진 갤러리", desc: "예배와 나눔, 절기의 순간들을 담은 공동체 사진 모음.",            href: "gallery.html", action: "사진 보기" },
                { icon: "link", title: "관련 기관",   desc: "대한성공회와 세계성공회의 기관·공동체 안내.",                   href: "links.html",   action: "자세히 보기" }
            ]
        },
        intro: "성공회의 신앙과 예배, 광명교회 공동체 이야기를 담은 영상입니다.",
        channelUrl: "https://youtube.com/channel/UCDaJNUSrCsljsECQpKDBv7A",
        videos: [
            {
                id: "ZwZie64rrZ0",
                title: "성공회 교회에 들어오면 깜짝 놀라는 이유",
                desc: "처음 성공회 교회나 성당에 방문했을 때 겪을 수 있는 낯선 예배 형식과 성찬례 등 성공회만의 독특한 특징을 소개합니다.",
                category: "성공회 소개"
            },
            {
                id: "9gah5PrWiWk",
                title: "광명교회 주일 애찬 풍경",
                desc: "주일 감사성찬례가 끝난 후, 교우들이 함께 모여 밥을 나누는 애찬 시간을 담은 영상입니다.",
                category: "공동체"
            },
            {
                id: "HhG_WUnRbPA",
                title: "젊은 여성들이 교회를 떠나는 이유?",
                desc: "여성 선교 주일을 맞아 교회 내 여성의 역할과 교회를 떠나는 현실적인 고민을 다룬 설교 영상입니다.",
                category: "설교"
            },
            {
                id: "YnOIUmn-BtM",
                title: "'성공회를 조심하라'고 하는 사람을 조심하세요!",
                desc: "구원은 사람이 선언하는 것이 아니라 하느님께서 주시는 선물임을 강조하며, 타 교파에 대한 오해를 바로잡는 내용입니다.",
                category: "신앙 이야기"
            },
            {
                id: "hYwgh1NV8QE",
                title: "예수님의 승천이 우리에게 미치는 영향",
                desc: "성공회 교회력을 바탕으로 예수님의 부활뿐만 아니라 '승천'이 우리의 신앙과 삶에 어떤 의미를 갖는지 짧게 설명합니다.",
                category: "신앙 이야기"
            }
        ]
    },

    links: {
        groups: [
            {
                title: "대한성공회",
                items: [
                    { name: "대한성공회",   url: "https://anglicankr.church/",                                        desc: "대한성공회 공식 홈페이지" },
                    { name: "대한성공회 서울교구",           url: "https://seoul.anglican.kr/",                                        desc: "대한성공회 서울교구 공식 홈페이지" },
                    { name: "대한성공회 서울주교좌성당",     url: "https://www.cathedral.or.kr/",                                      desc: "대한성공회 서울주교좌성당" },
                    { name: "대한성공회 신문",         url: "https://www.skhnews.or.kr/",                                        desc: "대한성공회 공식 신문" },
                    { name: "대한성공회 출판사",       url: "https://smartstore.naver.com/skhnews21",                            desc: "성공회 서적·자료 온라인 서점" }
                ]
            },
            {
                title: "교육·선교 기관",
                items: [
                    { name: "성공회대학교",   url: "https://www.skhu.ac.kr/introMain/index.html", desc: "대한성공회가 한국에 설립하여 경영하고 있는 사립 종합대학교" },
                    { name: "대한성공회 여성선교센터",   url: "http://www.awmck.org/",                            desc: "여성의 시각으로 선교 사명을 재정립하고 성평등한 교회 공동체를 만들기 위해 2016년에 설립된 대한성공회 관구 산하 기관" },
                    { name: "대한성공회 G.F.S.", url: "https://www.gfskorea.org",                  desc: "Girls' Friendly Society — 1875년 영국에서 시작된, 신앙 안에서 여성의 성장과 연대를 도모하는 성공회 여성 공동체" },
                    { name: "성공회 나눔의 집 협의회",   url: "https://ko.wikipedia.org/wiki/%EC%84%B1%EA%B3%B5%ED%9A%8C_%EB%82%98%EB%88%94%EC%9D%98%EC%A7%91%ED%98%91%EC%9D%98%ED%9A%8C", desc: "소외된 이웃의 인권을 보호하고 지역사회와 대안을 만드는 대표적인 사회선교 기관" }
                ]
            },
            {
                title: "수도 공동체",
                items: [
                    { name: "대한성공회 성 프란시스 수도회(네이버 지도)", url: "https://naver.me/xB77Wcf2",                                          desc: "아시시의 성 프란시스 영성을 따르는 대한성공회의 남자 수도 공동체", external: true },
                    { name: "대한성공회 성가수도회",         url: "https://www.sister.or.kr",                                           desc: "1925년에 설립된 대한성공회의 여성 수도회" }
                ]
            },
            {
                title: "세계성공회",
                items: [
                    { name: "세계성공회",         url: "https://www.anglicancommunion.org/",                                 desc: "Anglican Communion — 전 세계 성공회 공동체" },
                    { name: "캔터베리 대주교",    url: "https://www.archbishopofcanterbury.org/",                            desc: "세계성공회 정신적 수장의 공식 홈페이지" }
                ]
            }
        ]
    },

    // 성공회에 대한 오해·궁금증 FAQ (faq.html, FaqRenderer)
    // 답변은 대한성공회 공식 자료·세계성공회 문헌을 근거로 광명교회가 정리. refs는 출처 링크.
    faq: {
        eyebrow: "Frequently Asked Questions",
        title: "자주 묻는 질문",
        lead: "성공회를 처음 접하는 분들이 흔히 갖는 오해와 궁금증을 모았습니다. 각 답변에는 확인할 수 있는 출처를 함께 달았습니다.",
        note: "아래 답변은 대한성공회의 공식 자료와 세계성공회 문헌을 바탕으로 광명교회가 정리한 안내입니다. 신학적 세부와 공식 입장은 교단 문헌을 우선합니다.",
        categories: [
            {
                id: "identity",
                title: "정체성과 뿌리",
                icon: "cross",
                items: [
                    {
                        q: "성공회는 이단인가요?",
                        a: "아닙니다. 현재 세계 165개 이상의 나라에서 약 8,500만 명의 신자들이 캔터베리 대주교와 상징적 관계를 맺고 자치하고 있는 그리스도교 전통에 뿌리를 둔 교단입니다.\n\n16세기 종교개혁으로 로마가톨릭을 믿던 서유럽은 분열됩니다. 독일과 북유럽은 종교개혁가 마르틴 루터를 따르는 루터교가 국가교회로 설립되었고, 스위스와 프랑스 일부, 스코틀랜드에는 장 칼뱅의 영향을 받은 개혁교회(스코틀랜드에서는 장로교)가 생겼습니다. 잉글랜드는 국왕 헨리 8세가 로마 교황을 거부하면서 국교회의 수장이 되면서 성공회가 생겨났습니다. 지금도 국왕이 잉글랜드 국교회의 수장이지만, 상징에 불과합니다.",
                        refs: [
                            { label: "성공회 (Wikipedia)", url: "https://ko.wikipedia.org/wiki/%EC%84%B1%EA%B3%B5%ED%9A%8C" },
                            { label: "성공회 (나무위키)", url: "https://namu.wiki/w/%EC%84%B1%EA%B3%B5%ED%9A%8C" },
                            { label: "세계성공회공동체 (나무위키)", url: "https://namu.wiki/w/%EC%84%B8%EA%B3%84%EC%84%B1%EA%B3%B5%ED%9A%8C%EA%B3%B5%EB%8F%99%EC%B2%B4" }
                        ]
                    },
                    {
                        q: "헨리 8세가 결혼(이혼)을 위해 만든 교단인가요?",
                        a: "결혼 문제는 계기일 뿐, 핵심은 <strong>왕위 계승 위기</strong>와 유럽 종교개혁의 흐름이었습니다.\n\n헨리 8세는 왕위를 이을 아들을 얻지 못하자 교황 클레멘스 7세에게 혼인 무효를 청했지만, 교황은 왕비 캐서린의 조카인 황제 카를 5세의 압력 아래 있어 이를 받아들이지 않았습니다. 이에 헨리 8세는 로마와 관계를 끊고 1534년 수장령으로 잉글랜드 교회의 수장이 되었습니다. 이후 크랜머 대주교 등의 영향으로 <strong>'개신교 교리에 가톨릭 전통의 예배 형식'</strong>을 갖춘 오늘날 성공회로 자리 잡았습니다.",
                        refs: [
                            { label: "잉글랜드의 종교 개혁 (Wikipedia)", url: "https://ko.wikipedia.org/wiki/%EC%9E%89%EA%B8%80%EB%9E%9C%EB%93%9C%EC%9D%98_%EC%A2%85%EA%B5%90_%EA%B0%9C%ED%98%81" },
                            { label: "토마스 크랜머 (Wikipedia)", url: "https://ko.wikipedia.org/wiki/%ED%86%A0%EB%A8%B8%EC%8A%A4_%ED%81%AC%EB%9E%9C%EB%A8%B8" }
                        ]
                    },
                    {
                        q: "천주교(가톨릭)인가요, 개신교인가요?",
                        a: "한국에서는 흔히 <strong>개신교</strong>의 한 교파로 분류되며, 대한성공회는 한국기독교교회협의회(NCCK) 회원 교단입니다. 다만 성공회는 가톨릭과 개신교 중 하나로 딱 잘라 말하기 어려운 교단입니다.\n\n16세기 잉글랜드 종교개혁에서 비롯되어 가톨릭의 전례 전통(주교직·성사·예배 형식)과 개신교의 성서 중심 신앙을 함께 품고 있습니다. 교황의 수위권은 인정하지 않으며, 이 균형을 <strong>‘중도의 길(Via Media)’</strong>이라 부릅니다.",
                        refs: [
                            { label: "성서·이성·전통과 리처드 후커 (Via Media)", url: "https://liturgy.co.nz/scripture-tradition-reason-and-richard-hooker" },
                            { label: "대한성공회 (한국민족문화대백과사전)", url: "https://encykorea.aks.ac.kr/Article/E0015092" },
                            { label: "대한성공회 (Wikipedia)", url: "https://ko.wikipedia.org/wiki/%EB%8C%80%ED%95%9C_%EC%84%B1%EA%B3%B5%ED%9A%8C" }
                        ]
                    },
                    {
                        q: "톰 라이트·존 스토트 책으로 성공회를 처음 알게 됐는데, 왜 한국성공회는 느낌이 다른가요?",
                        a: "성공회 안에는 신학 성향과 예배 스타일에 따라 크게 세 흐름이 공존합니다. <strong>저교회파(Low Church, 복음주의)</strong>는 성서의 권위와 설교를 중시하고, <strong>고교회파(High Church, 앵글로-가톨릭주의)</strong>는 초대교회 전승과 성사·전례를 강조하며, <strong>광교회파(Broad Church)</strong>는 이성·학문과 사회 참여를 중심에 둡니다.\n\n존 스토트(1921–2011)와 톰 라이트(N.T. Wright) 같은 영국 신학자들은 <strong>복음주의 전통</strong>에서 널리 읽히는 저자들입니다. 성서 중심의 설교와 개인 신앙을 강조하는 이 전통은 가톨릭적 의례 중심 예배와 분위기가 크게 다릅니다.\n\n대한성공회가 가톨릭처럼 느껴지는 이유는 <strong>1890년 첫 선교사들이 고교회파 계열</strong>이었기 때문입니다. 초대 주교 고요한(찰스 존 코프)을 비롯한 선교사들은 19세기 영국에서 가톨릭의 역사적 전통과 전례를 회복하고자 일어난 <strong>'옥스퍼드 운동(Oxford Movement)'</strong>의 영향을 받았습니다. 이 뿌리로 인해 성당 건축·사제 제복·감사성찬례 형식이 가톨릭과 유사한 모습을 갖추게 되었습니다.\n\n그럼에도 저·고·광교회파 모두 '성서·전통·이성'의 세 기둥과 <strong>'중도의 길(Via Media)'</strong> 안에서 하나의 성공회를 이룹니다. 어떤 흐름으로 성공회를 처음 만나셨든, 같은 믿음의 공동체 안에 함께합니다.",
                        refs: [
                            { label: "고교회파 (위키백과)", url: "https://ko.wikipedia.org/wiki/%EA%B3%A0%EA%B5%90%ED%9A%8C%ED%8C%8C" },
                            { label: "고교회와 저교회 (나무위키)", url: "https://namu.wiki/w/%EA%B3%A0%EA%B5%90%ED%9A%8C%EC%99%80%20%EC%A0%80%EA%B5%90%ED%9A%8C" },
                            { label: "광교회파 (위키백과)", url: "https://ko.wikipedia.org/wiki/%EA%B4%91%EA%B5%90%ED%9A%8C%ED%8C%8C" },
                            { label: "대한성공회 (위키백과)", url: "https://ko.wikipedia.org/wiki/%EB%8C%80%ED%95%9C%EC%84%B1%EA%B3%B5%ED%9A%8C" },
                            { label: "옥스퍼드 운동 (위키백과)", url: "https://ko.wikipedia.org/wiki/%EC%98%A5%EC%8A%A4%ED%8D%BC%EB%93%9C_%EC%9A%B4%EB%8F%99" },
                            { label: "존 스토트 (Wikipedia)", url: "https://en.wikipedia.org/wiki/John_Stott" },
                            { label: "N.T. 라이트 (Wikipedia)", url: "https://en.wikipedia.org/wiki/N._T._Wright" }
                        ]
                    },
                    {
                        q: "결국 영국 교회 아닌가요? 외국 교회인가요?",
                        a: "아닙니다. 대한성공회는 <strong>1993년 세계성공회로부터 독립 자치권을 인정받은 한국 교단</strong>입니다.\n\n1890년 영국 선교사 고요한(찰스 존 코프) 주교가 설립했지만, 이후 한국화 과정을 거쳐 운영과 의사결정을 한국 교단이 자치적으로 합니다. 캔터베리 대주교와는 상하 관계가 아닌 동등한 ‘교제와 일치’의 관계입니다.",
                        refs: [
                            { label: "사진으로 보는 대한성공회 약사 (대한성공회 관구)", url: "https://anglicankr.church/%ec%82%ac%ec%a7%84%ec%9c%bc%eb%a1%9c-%eb%b3%b4%eb%8a%94-%eb%8c%80%ed%95%9c%ec%84%b1%ea%b3%b5%ed%9a%8c-%ec%95%bd%ec%82%ac/" },
                            { label: "대한성공회 (Wikipedia)", url: "https://ko.wikipedia.org/wiki/%EB%8C%80%ED%95%9C_%EC%84%B1%EA%B3%B5%ED%9A%8C" }
                        ]
                    }
                ]
            },
            {
                id: "faith",
                title: "신앙과 성사",
                icon: "dove",
                items: [
                    {
                        q: "구원을 어떻게 이해하나요?",
                        a: "구원은 조건을 채워 얻어내는 것이 아니라, <strong>예수 그리스도를 통해 하느님께서 거저 주시는 선물(은총)</strong>이라고 믿습니다.\n\n특정 교단 소속이나 정해진 ‘공식’을 구원의 조건으로 삼지 않으며, 성서를 구원에 필요한 모든 것을 담은 말씀으로 고백합니다.",
                        refs: [
                            { label: "시카고-람베스 사대강령 — 성서의 권위", url: "https://www.anglicancommunion.org/the-chicago-lambeth-quadrilateral/" }
                        ]
                    },
                    {
                        q: "성찬의 빵과 포도주를 어떻게 보나요?",
                        a: "그리스도께서 성찬에 <strong>참으로 임재</strong>하신다고 믿되, ‘어떻게’ 임재하시는지를 특정 교리로 규정하지 않습니다.\n\n빵과 포도주의 실체가 변한다는 가톨릭의 <strong>화체설은 따르지 않으며</strong>(39개조 제28조), 그 신비를 믿음으로 받아 모시는 것을 중요하게 여깁니다.",
                        refs: [
                            { label: "성공회 신앙의 39개조 — 성찬론", url: "https://namu.wiki/w/39%EA%B0%9C%20%EC%8B%A0%EC%A1%B0" }
                        ]
                    },
                    {
                        q: "다른 교회에서 받은 세례를 다시 받아야 하나요?",
                        a: "아닙니다. <strong>삼위일체 하느님의 이름(성부·성자·성령)으로 물로 받은 세례</strong>는 교단과 관계없이 유효한 세례로 인정합니다.\n\n천주교·개신교에서 세례를 받으셨다면 다시 받을 필요가 없습니다.",
                        refs: [
                            { label: "시카고-람베스 사대강령 — 세례 성사", url: "https://www.anglicancommunion.org/the-chicago-lambeth-quadrilateral/" },
                            { label: "세례 (Wikipedia)", url: "https://ko.wikipedia.org/wiki/%EC%84%B8%EB%A1%80" }
                        ]
                    },
                    {
                        q: "마리아와 성인을 숭배하나요?",
                        a: "아닙니다. 성모 마리아와 성인들을 <strong>신앙의 모범으로 공경</strong>하지만, 예배와 기도의 대상은 오직 삼위일체 하느님입니다.\n\n성공회 39개조 제22조는 성인에게 기도로 전구를 청하는 당시 로마 교회의 가르침(invocation of saints)을 받아들이지 않았습니다. 다만 오늘날 성공회 안에서도 전통에 따라 성인 공경의 모습은 조금씩 다릅니다.",
                        refs: [
                            { label: "성공회 신앙의 39개조 — 제22조", url: "https://namu.wiki/w/39%EA%B0%9C%20%EC%8B%A0%EC%A1%B0" }
                        ]
                    }
                ]
            },
            {
                id: "society",
                title: "평등과 사회참여",
                icon: "scales",
                items: [
                    {
                        q: "성공회는 ‘좌파 교회’인가요?",
                        a: "성공회의 사회 참여는 정당이나 이념이 아니라 <strong>신앙에서 나옵니다</strong>.\n\n세계성공회가 공유하는 ‘선교의 다섯 표지’ 네 번째가 <em>‘불의한 사회 구조를 변화시키는 것’</em>입니다. 대한성공회는 1950년대 이후 산업 선교, 1986년 첫 나눔의 집을 연 빈민 선교, 1987년 6월 민주항쟁 때 서울주교좌성당의 역할 등으로 사회 현실에 함께해 왔으며, 이는 특정 정파를 지지하는 것과 다른 신앙적 실천입니다.",
                        refs: [
                            { label: "성공회 선교정신 — 다섯 표지 (세계성공회)", url: "https://www.anglicancommunion.org/five-marks-of-mission/" },
                            { label: "대한성공회 (한국민족문화대백과사전)", url: "https://encykorea.aks.ac.kr/Article/E0015092" },
                            { label: "성공회 나눔의집협의회 (Wikipedia)", url: "https://ko.wikipedia.org/wiki/%EC%84%B1%EA%B3%B5%ED%9A%8C_%EB%82%98%EB%88%94%EC%9D%98%EC%A7%91%ED%98%91%EC%9D%98%ED%9A%8C" },
                            { label: "서울시청 앞 시민항쟁의 증인, 성공회 서울대성당 (시민언론 민들레)", url: "https://www.mindlenews.com/news/articleView.html?idxno=10937" }
                        ]
                    },
                    {
                        q: "여성도 사제가 될 수 있나요? 성경적인가요?",
                        a: "네. 대한성공회는 <strong>2001년 첫 여성 사제(민병옥 카타리나)</strong>를 서품했으며, 성별은 성직의 자격을 가르지 않는다고 봅니다.\n\n갈라디아서 3장 28절(‘남자도 여자도 그리스도 안에서 하나’)과 초대교회의 여성 지도자들(브리스길라 등)이 성서적 근거입니다.",
                        refs: [
                            { label: "민병옥 사제 (Wikipedia)", url: "https://ko.wikipedia.org/wiki/%EB%AF%BC%EB%B3%91%EC%98%A5" }
                        ]
                    },
                    {
                        q: "성공회는 동성애·동성결혼을 지지하나요?",
                        a: "세계성공회 안에서는 <strong>관구마다 입장이 다릅니다</strong>. 대한성공회는 동성결혼을 공식 예식으로 시행하지 않습니다.\n\n관구에 따라 동성결혼을 허용하는 곳도 있고, 전통적 혼인관(1998년 람베스 회의 결의 I.10)을 유지하는 곳도 있어 논의 중입니다. 대한성공회 정의평화사제단과 나눔의집협의회는 2021년 성명에서 <strong>성소수자에 대한 혐오와 차별에 반대한다</strong>고 밝혔습니다. 광명교회는 찾아오시는 누구도 문 앞에서 돌려보내지 않습니다.",
                        refs: [
                            { label: "람베스 회의 1998 결의문 (I.10 포함, 세계성공회)", url: "https://www.anglicancommunion.org/lambeth-conference-1998-resolutions/" },
                            { label: "대한성공회 정의평화사제단·나눔의집협의회 성명 (뉴시스, 2021)", url: "https://mobile.newsis.com/view/NISX20210305_0001361022" }
                        ]
                    }
                ]
            },
            {
                id: "join",
                title: "함께하기",
                icon: "people",
                items: [
                    {
                        q: "교파를 옮기거나 신앙을 새로 시작해야 하나요?",
                        a: "꼭 그렇지 않습니다. 성공회는 다른 교단의 세례를 인정하므로, <strong>교적 이전 없이도 함께 예배하실 수 있습니다</strong>.\n\n천주교나 개신교에서 신앙생활을 해 오셨다면 그 여정을 그대로 존중합니다. 자세한 안내는 <a href='newcomer.html'>처음 오신 분</a> 페이지를 참고해 주세요.",
                        refs: []
                    },
                    {
                        q: "성공회 예배(전례)는 천주교 미사처럼 어렵지 않나요?",
                        a: "낯설 수 있지만, 순서가 정해져 있어 <strong>오히려 따라가기 쉽습니다</strong>.\n\n주보와 기도서가 모든 순서를 안내하고, 옆자리 교우들이 도와드립니다. 미리 <a href='newcomer.html#worship-space'>전례 공간 안내</a>와 <a href='worship.html#eucharist-order'>감사성찬례 순서</a>를 보시면 한결 편안합니다.",
                        refs: []
                    }
                ]
            }
        ]
    },

    sundays: {
        seasons: [
            {
                key: "advent",
                name: "대림절",
                en: "Advent",
                colorName: "자색",
                color: "#6b4f8f",
                symbol: "candle",
                period: "성탄 4주 전 주일 ~ 성탄 전날",
                desc: "주님의 오심을 기다리며 준비하는 시간. 교회력의 새해가 시작됩니다."
            },
            {
                key: "christmas",
                name: "성탄절",
                en: "Christmas",
                colorName: "백색·금색",
                color: "#b8860b",
                symbol: "star",
                period: "12월 25일 ~ 1월 5일",
                desc: "말씀이 사람이 되신 기쁨을 기념합니다. 성탄 후 12일간 이어집니다."
            },
            {
                key: "epiphany",
                name: "공현절 후",
                en: "Epiphany",
                colorName: "녹색",
                color: "#2f6a52",
                symbol: "sparkle",
                period: "1월 6일 ~ 재의 수요일 전날",
                desc: "주님께서 세상에 자신을 드러내신 것을 기념합니다. 공현절과 주님의 세례 주일을 포함합니다."
            },
            {
                key: "lent",
                name: "사순절",
                en: "Lent",
                colorName: "자색",
                color: "#6b4f8f",
                symbol: "cross",
                period: "재의 수요일 ~ 성주간 전날",
                desc: "회개와 절제로 부활을 준비하는 시간. 재의 수요일에 시작됩니다."
            },
            {
                key: "holyweek",
                name: "성주간",
                en: "Holy Week",
                colorName: "적색",
                color: "#c0390f",
                symbol: "palm",
                period: "종려주일 ~ 성토요일",
                desc: "주님의 수난을 묵상하는 한 주간. 종려주일·성목요일·성금요일·성토요일을 포함합니다."
            },
            {
                key: "easter",
                name: "부활절",
                en: "Easter",
                colorName: "백색·금색",
                color: "#b8860b",
                symbol: "sunrise",
                period: "부활 주일 ~ 성령강림 주일 (50일)",
                desc: "다시 살아나신 주님을 기리는 기쁨의 계절. 50일간 이어집니다."
            },
            {
                key: "pentecost",
                name: "성령강림절",
                en: "Pentecost",
                colorName: "적색",
                color: "#c0390f",
                symbol: "flame",
                period: "부활 후 50일째 주일",
                desc: "성령께서 제자들에게 임하신 날을 기념합니다. 교회가 시작된 날입니다."
            },
            {
                key: "ordinary",
                name: "성령강림 후",
                en: "Ordinary Time",
                colorName: "녹색",
                color: "#2f6a52",
                symbol: "leaf",
                period: "성령강림 다음 주 ~ 대림절 전날",
                desc: "그리스도인의 일상을 살아가는 긴 계절. 왕이신 그리스도 주일로 마무리됩니다."
            }
        ],
        specialSundays: [
            {
                name: "공현절",
                en: "Epiphany",
                date: "1월 6일 또는 직후 주일",
                origin: "세계성공회",
                desc: "동방박사들의 방문을 통해 예수님이 온 세상에 드러나신 날입니다. 공현절 후 첫 주일은 주님의 세례 주일로 지킵니다."
            },
            {
                name: "세계기도일",
                en: "World Day of Prayer",
                date: "3월 첫째 금요일",
                origin: "세계교회 (에큐메니컬)",
                desc: "1887년 미국에서 시작된 에큐메니컬 평신도 여성 기도운동. 매년 특정 나라 여성들이 예식을 준비하며, 170여 개국에서 함께 드립니다."
            },
            {
                name: "종려주일",
                en: "Palm Sunday",
                date: "성주간 첫날 (부활 7일 전)",
                origin: "세계성공회",
                desc: "예수님의 예루살렘 입성을 기념하며 종려가지를 들고 행진합니다. 성주간의 시작입니다."
            },
            {
                name: "승천주일",
                en: "Ascension Sunday",
                date: "부활 후 40일째 또는 직후 주일",
                origin: "세계성공회",
                desc: "부활하신 주님께서 하늘에 오르신 날을 기념합니다. 부활절에서 성령강림절로 이어지는 길목입니다."
            },
            {
                name: "성삼위일체 주일",
                en: "Trinity Sunday",
                date: "성령강림 다음 주일",
                origin: "세계성공회",
                desc: "성부·성자·성령 삼위일체 하느님을 고백하는 날. 성공회 교회력에서 특별히 강조하는 교리 주일입니다."
            },
            {
                name: "환경주일",
                en: "Environment Sunday",
                date: "6월 첫째 주일",
                origin: "NCCK",
                desc: "하느님의 창조세계를 돌보는 청지기 사명을 새기는 날. 한국교회가 함께 지켜 왔습니다."
            },
            {
                name: "창조절",
                en: "Season of Creation",
                date: "9월 1일 ~ 10월 4일",
                origin: "세계교회 · 대한성공회",
                desc: "1989년 에큐메니컬 총대주교 디미트리오스 1세의 선포로 시작. WCC가 절기로 확대했으며, 10월 4일 성 프란시스 축일에 마무리됩니다."
            },
            {
                name: "모든 성인의 날",
                en: "All Saints' Day",
                date: "11월 1일 또는 직후 주일",
                origin: "세계성공회",
                desc: "신앙의 선진들과 모든 성인을 기억하고 감사하는 날. 세상을 먼저 떠난 이들과의 연대를 고백합니다."
            },
            {
                name: "왕이신 그리스도 주일",
                en: "Christ the King",
                date: "대림절 직전 주일",
                origin: "세계성공회",
                desc: "교회력의 마지막 주일. 그리스도의 왕권과 통치를 선포하며 한 해를 마무리합니다."
            },
            {
                name: "세계에이즈 추모 주일",
                en: "World AIDS Sunday",
                date: "12월 1일 전후 주일",
                origin: "세계성공회",
                desc: "HIV/AIDS로 세상을 떠난 이들을 추모하고, 감염인·취약계층과 연대하는 날입니다."
            }
        ]
    },

    bulletins: {
        labels: { thisWeek: "이번 주", latest: "최근 등록" },
        intro: "예배 순서와 공동체 소식을 담은 주간 주보입니다.",
        note: "예배 전에 미리 열어 두시면 도움이 됩니다.",
        newsIntro: "최근 8주분의 교회소식을 보관합니다.",
        newsEmpty: "등록된 교회소식이 없습니다.",
        items: [
            {
                date: "2026-10-25",
                label: "2026년 10월 25일",
                season: "가해 연중 제30주일",
                images: ["bulletins/20261025_1.jpg", "bulletins/20261025_2.jpg", "bulletins/20261025_3.jpg", "bulletins/20261025_4.jpg"],
                pdf: "bulletins/20261025.pdf",
                news: [
                    { title: "11월 교회위원회 안내", body: "다음 주일 애찬 후에 11월 교회위원회가 열립니다. 모든 위원의 참석을 바랍니다." },
                    { title: "서부교무구 성직자 피정", body: "날짜 : 11월 2일(월)~5일(목)\n장소 : 고성 까리타스 피정의 집" },
                    { title: "마르코복음 강좌 안내", body: "11월과 12월 둘째 주일과 넷째 주일 (총 4회) 애찬 후에 마르코복음 강좌가 열립니다. 교재 구입을 위해 박경준 프란시스 위원에게 오늘까지 신청해 주시기 바랍니다. 많은 신청 바랍니다.\n(교재 가격은 15,000원입니다.)" },
                    { title: "G.F.S. 주관 바자회", body: "오늘 애찬부터 바자회가 시작됩니다. 즐겁고 적극적인 참여 바랍니다." },
                    { title: "신임 교회위원 교육 안내", body: "오늘 교구가 주관하는 신임 교회위원 교육이 있으니 모든 위원의 참여를 바랍니다.\n일시 : 10월 25일(주일) 오후 3시~5시\n장소 : 주교좌성당 프란시스 홀" },
                    { title: "관할사제 일정", body: "27일(화) 성공회대 종교와 신학 전공 워크숍 강의\n29일(목) 굿네이버스 컨퍼런스 강의" }
                ],
                verse: { ref: "마태 22:37-40", text: "‘네 마음을 다하고 목숨을 다하고 뜻을 다하여 주님이신 너희 하느님을 사랑하여라.’ 이것이 가장 크고 첫째 가는 계명이고, ‘네 이웃을 네 몸같이 사랑하여라.’ 한 둘째 계명도 이에 못지않게 중요하다. 이 두 계명이 모든 율법과 예언서의 골자이다." }
            },
            {
                date: "2026-10-18",
                label: "2026년 10월 18일",
                season: "가해 연중 제29주일",
                images: ["bulletins/20261018_1.jpg", "bulletins/20261018_2.jpg", "bulletins/20261018_3.jpg", "bulletins/20261018_4.jpg"],
                pdf: "bulletins/20261018.pdf",
                news: [
                    { title: "희망터 간담회 결과 안내", body: "지난 주일 열린 희망터 간담회에서는 현재 우리가 섬기는 이웃에게 반찬을 드리는 일은 12월까지 하고, 이전한 성당에서는 옥길동 행정복지센터에서 그 지역의 이웃을 소개받아 봉사를 이어가기로 했습니다.\n희망터 봉사를 이어가기 위해서는 교우 여러분의 봉헌과 봉사가 필요합니다. 많은 관심과 기도를 바랍니다." },
                    { title: "마르코복음 강좌 안내", body: "11월과 12월 둘째 주일과 넷째 주일 애찬 후에 마르코복음 강좌가 열립니다. 교재 구입을 위해 박경준 프란시스 위원에게 25일까지 신청해 주시기 바랍니다. 많은 신청 바랍니다.\n(교재 가격은 15,000원입니다.)" },
                    { title: "서부교무구 어머니연합회 기도모임 안내", body: "일시 : 10월 18일 오후 2시 30분\n장소 : 간석교회\n말씀 : 이명근 사제" },
                    { title: "G.F.S. 주관 바자회", body: "다음 주일에 우리 교회 바자회가 있으니 미리 물품을 준비해 주시기 바랍니다." },
                    { title: "신임 교회위원 교육 안내", body: "교구가 주관하는 신임 교회위원 교육이 있으니 모든 위원의 참여를 바랍니다.\n일시 : 10월 25일(주일) 오후 3시~5시\n장소 : 주교좌성당 프란시스 홀" },
                    { title: "관할사제 일정", body: "18일 4시 동아시아 주교회의 폐회 성찬례와 만찬 참석\n22일 성공회대 총장 취임식\n22일 성직자원 임시총회" }
                ]
            },
            {
                date: "2026-10-11",
                label: "2026년 10월 11일",
                season: "광명교회 축성 감사성찬례",
                images: ["bulletins/20261011_1.jpg", "bulletins/20261011_2.jpg", "bulletins/20261011_3.jpg", "bulletins/20261011_4.jpg"],
                pdf: "bulletins/20261011.pdf",
                news: [
                    { title: "감사드립니다.", body: "오늘 우리 성당 축성 23주년을 기념하여 하느님께 감사드립니다. 또한 이 교회를 세우고 지금까지 섬겨오신 교우님들께 감사드립니다.\n앞으로도 우리 모든 교우들의 헌신과 기도로 견고한 하느님의 성전이 되기를 바랍니다." },
                    { title: "희망터 간담회 안내", body: "오늘 애찬 후에 희망터 봉사자 간담회가 있습니다. 많은 참석 바랍니다." },
                    { title: "마르코복음 강좌 안내", body: "11월과 12월 둘째 주일과 넷째 주일 애찬 후에 마르코복음 강좌가 열립니다. 교재 구입을 위해 박경준 프란시스 위원에게 25일까지 신청해 주시기 바랍니다. 많은 신청 바랍니다.\n(교재 가격은 15,000원입니다.)" },
                    { title: "서울교구 어머니연합회 연차총회 안내", body: "일시 : 10월 13일(화) 오전 11시\n장소 : 서울주교좌성당(프란시스 홀)\n일정 : 감사성찬례 / 회무처리 / 점심식사" },
                    { title: "G.F.S. 총회 안내", body: "일시 : 10월 17일(토) 오전 11시\n장소 : 서울주교좌성당(프란시스 홀)" },
                    { title: "서부교무구 어머니연합회 기도모임 안내", body: "일시 : 10월 18일 오후 2시 30분\n장소 : 간석교회\n말씀 : 이명근 사제" },
                    { title: "G.F.S. 주관 바자회", body: "10월 25일에 바자회가 있으니 미리 물품을 준비해 주시기 바랍니다." },
                    { title: "신임 교회위원 교육 안내", body: "교구가 주관하는 신임 교회위원 교육이 있으니 모든 위원의 참여를 바랍니다.\n일시 : 10월 25일(주일) 오후 3시~5시\n장소 : 주교좌성당 프란시스 홀" },
                    { title: "관할사제 일정", body: "15일(목) 서부교무구 성직자 월례회의" }
                ]
            },
            {
                date: "2026-10-04",
                label: "2026년 10월 4일",
                season: "창조5주일",
                images: ["bulletins/20261004_1.jpg", "bulletins/20261004_2.jpg", "bulletins/20261004_3.jpg", "bulletins/20261004_4.jpg"],
                pdf: "bulletins/20261004.pdf",
                news: [
                    { title: "교회위원회 안내", body: "오늘 애찬 후에 새로운 회기가 시작되는 첫 교회위원회가 있습니다. 모든 위원들의 참석을 바랍니다." },
                    { title: "새 성전 인테리어 공사 현장설명회", body: "8일(목)에는 새 성전 인테리어 공사를 위한 설명회가 있습니다. 이후에 견적서를 받아 시공업체를 정하면 공사가 시작됩니다. 순조로운 진행을 위해 기도 바랍니다." },
                    { title: "우리 성당 축성기념 성찬례 안내", body: "다음 주일에 성당 축성 23주년을 기념하여 감사성찬례를 봉헌합니다. (축성일은 12일입니다) 이 성당에서의 마지막 축성기념일이 됩니다. 함께 감사하며 성찬례에 참석하시기 바랍니다." },
                    { title: "희망터 봉사자 간담회", body: "다음 주일 애찬 후에 희망터 봉사자 간담회가 있습니다. 모든 봉사자들과 관심 있는 교우님들의 참석을 바랍니다." },
                    { title: "뜨개질 소모임 안내", body: "오늘 애찬 후에 뜨개질 소모임이 있으니 많은 참석 바랍니다." },
                    { title: "G.F.S. 주관 바자회", body: "10월 25일에 바자회가 있으니 미리 물품을 준비해 주시기 바랍니다." },
                    { title: "서부교무구 어머니연합회 기도모임 안내", body: "일시 : 10월 18일 오후 2시 30분\n장소 : 간석교회\n말씀 : 이명근 사제" },
                    { title: "관할사제 일정", body: "7일 총사제회의 (양이재 주교관)" }
                ]
            }
        ]
    },

    // 사진 갤러리 (gallery.html)
    photoGallery: {
        intro: "예배, 공동체 모임, 교회 풍경 등 광명교회의 순간들을 모았습니다.",
        categories: ["전체", "예배", "공동체", "교회 풍경"],
        photos: [
            {
                id: "p01",
                title: "예배와 기도",
                desc: "매주 주일, 공동체가 모여 말씀과 성찬을 나눕니다.",
                category: "예배",
                date: "2026.06",
                src: "images/gallery/worship/outdoor-eucharist.webp",
                thumb: "images/gallery/worship/outdoor-eucharist-thumb.webp",
                alt: "광명교회 예배와 기도"
            },
            {
                id: "p04",
                title: "공동체 모임",
                desc: "함께 모여 말씀과 삶을 나누는 광명교회 공동체.",
                category: "공동체",
                date: "2026.06",
                src: "images/gallery/community/community-01.webp",
                thumb: "images/gallery/community/community-01-thumb.webp",
                alt: "광명교회 공동체 모임"
            },
            {
                id: "p11",
                title: "교회 내부 — 제대",
                desc: "캔터베리 십자가와 제대가 있는 광명교회 성전.",
                category: "교회 풍경",
                date: "2026.06",
                src: "images/gallery/scenery/sanctuary-altar.webp",
                thumb: "images/gallery/scenery/sanctuary-altar-thumb.webp",
                alt: "광명교회 교회 내부 제대"
            },
            {
                id: "p13",
                title: "2023년 녹색교회 선정",
                desc: "NCCK·기독교환경운동연대로부터 2023년 녹색교회로 선정되었습니다.",
                category: "교회 풍경",
                date: "2023.05",
                src: "images/gallery/scenery/greenchurch-award-2023.webp",
                thumb: "images/gallery/scenery/greenchurch-award-2023-thumb.webp",
                alt: "2023년 녹색교회 선정 상패"
            },
            {
                id: "p14",
                title: "희망터 봉사자들의 기도",
                desc: "희망터 주방에서 봉사자들이 두 손을 모으고 기도합니다.",
                category: "공동체",
                date: "",
                src: "images/gallery/community/hopecenter-prayer.webp",
                thumb: "images/gallery/community/hopecenter-prayer-thumb.webp",
                alt: "주방 조리대 앞에서 두 손을 모으고 기도하는 봉사자들"
            },
            {
                id: "p15",
                title: "이웃에게 드릴 반찬",
                desc: "이웃 가정에 드릴 반찬을 정성껏 만듭니다.",
                category: "공동체",
                date: "",
                src: "images/gallery/community/hopecenter-dishes.webp",
                thumb: "images/gallery/community/hopecenter-dishes-thumb.webp",
                alt: "용기에 나누어 담은 오이부추무침과 양념장에 담근 달걀"
            },
            {
                id: "p16",
                title: "나눔 물품을 싣고",
                desc: "나눔 물품을 가득 실은 차량 앞에 선 광명 희망터 봉사자들.",
                category: "공동체",
                date: "",
                src: "images/gallery/community/hopecenter-delivery.webp",
                thumb: "images/gallery/community/hopecenter-delivery-thumb.webp",
                alt: "나눔 물품 상자를 가득 실은 차량 앞에 선 봉사자 세 사람"
            },
            {
                id: "p17",
                title: "하늘과 들판 위의 교회",
                desc: "어린이 예배 아이들이 벽에 그린 교회 그림.",
                category: "공동체",
                date: "",
                src: "images/gallery/community/children-mural-church.webp",
                thumb: "images/gallery/community/children-mural-church-thumb.webp",
                alt: "푸른 하늘과 초록 들판 위에 그린 작은 교회 벽화"
            },
            {
                id: "p18",
                title: "천사와 교회를 그린 벽화",
                desc: "아이들이 직접 색을 골라 붓으로 벽에 그렸습니다.",
                category: "공동체",
                date: "",
                src: "images/gallery/community/children-mural-angel.webp",
                thumb: "images/gallery/community/children-mural-angel-thumb.webp",
                alt: "여러 색의 바탕 위에 천사와 교회를 그린 벽화"
            },
            {
                id: "p19",
                title: "벽에 색을 칠하는 아이",
                desc: "어린이 예배 아이들이 함께 벽화를 그립니다.",
                category: "공동체",
                date: "",
                src: "images/gallery/community/children-painting-together.webp",
                thumb: "images/gallery/community/children-painting-together-thumb.webp",
                alt: "여러 색으로 칠한 벽에 붓질하는 어린이"
            },
            {
                id: "p20",
                title: "비건 짜장도 함께 준비한 애찬",
                desc: "예배 후 애찬에 비건 짜장과 일반 짜장을 따로 마련했습니다.",
                category: "공동체",
                date: "",
                src: "images/gallery/community/agape-vegan-jjajang.webp",
                thumb: "images/gallery/community/agape-vegan-jjajang-thumb.webp",
                alt: "비건(채식) 짜장과 논-비건(채식X) 짜장 안내문이 놓인 애찬 배식대"
            }
        ]
    },

    navigation: [
        {
            label: "교회 소개",
            href: "clergy.html",
            items: [
                { label: "성공회란?",   short: "성공회", href: "clergy.html#what-is-anglican" },
                { label: "대한성공회",  href: "clergy.html#ack" },
                { label: "섬기는 이들", href: "clergy.html#priest-section" },
                { label: "교회 이야기", href: "clergy.html#philosophy" },
                { label: "교회 연혁",   short: "연혁", href: "clergy.html#history" },
                { label: "녹색교회",   href: "greenchurch.html" }
            ]
        },
        {
            label: "예배와 기도",
            href: "worship.html",
            items: [
                { label: "주일 감사성찬례",  href: "worship.html#main" },
                { label: "어린이 예배",     href: "children.html" },
                { label: "감사성찬례 순서",  href: "worship.html#eucharist-order" },
                { label: "성무일과(매일기도)", href: "worship.html#daily-office" },
                { label: "예배 자료",       href: "worship.html#resources" },
                { label: "공동기도서와 성가", href: "worship.html#bcp-hymnal" }
            ]
        },
        {
            label: "주보·소식",
            href: "bulletin.html",
            items: [
                { label: "주일 주보", href: "bulletin.html" },
                { label: "교회 소식", href: "news.html" }
            ]
        },
        {
            label: "교회력",
            href: "sundays.html",
            items: [
                { label: "이달의 교회력",  href: "sundays.html#monthly" },
                { label: "전례독서",       href: "sundays.html#lectionary" },
                { label: "절기 안내",      href: "sundays.html#seasons" },
                { label: "특별 주일",      href: "sundays.html#special" }
            ]
        },
        {
            label: "처음 오신 분",
            href: "newcomer.html",
            items: [
                { label: "인사말",         href: "newcomer.html#newcomer" },
                { label: "참여 안내",      href: "newcomer.html#firsttime" },
                { label: "성공회 전례란?", href: "newcomer.html#liturgy" },
                { label: "전례 공간 안내", href: "newcomer.html#worship-space" },
                { label: "영성체 안내",    href: "newcomer.html#communion" },
                { label: "자주 묻는 질문", href: "faq.html" },
                { label: "문의하기",       href: "newcomer.html#contact" }
            ]
        },
        {
            label: "공동체",
            href: "community.html",
            items: [
                { label: "광명 희망터",   href: "hopecenter.html" },
                { label: "엠마우스 코스", href: "emmaus.html" },
                { label: "소그룹 모임",  href: "smallgroup.html" }
            ]
        },
        {
            label: "미디어·자료",
            href: "media.html",
            items: [
                { label: "영상 갤러리",   href: "videos.html" },
                { label: "사진 갤러리",   href: "gallery.html" },
                { label: "관련 기관",     href: "links.html" }
            ]
        },
        {
            label: "오시는 길",
            href: "visit.html",
            items: [
                { label: "주소·교통", href: "visit.html#location" },
                { label: "주차 안내", href: "visit.html#parking" }
            ]
        }
    ]
};
