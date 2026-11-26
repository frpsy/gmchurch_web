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
    function baptismOfLord(year) {
        // 주의 세례주일 = 공현일(1/6) 후 첫 주일. 성탄절기는 이 주일 전까지다(기도서 교회력).
        const jan6 = new Date(year, 0, 6);
        return addDays(jan6, 7 - jan6.getDay());
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
        epiphany:  { key: "epiphany",  name: "공현 후 연중 시기", colorName: "녹색", color: "#285a47", colorLight: "#e7eee8", onColor: "#fff",     symbol: "sparkle",   note: "주님이 세상에 드러나심" },
        lent:      { key: "lent",      name: "사순절",       colorName: "자색", color: "#6b4f8f", colorLight: "#f0eaf7", onColor: "#fff",     symbol: "cross",  note: "회개와 절제의 시간"     },
        holyweek:  { key: "holyweek",  name: "성주간",       colorName: "홍색", color: "#c0390f", colorLight: "#fdf2ee", onColor: "#fff",     symbol: "palm",   note: "주님의 수난을 묵상"     },
        easter:    { key: "easter",    name: "부활절",       colorName: "백색", color: "#b8860b", colorLight: "#fbf3df", ink: "#80600a", onColor: "#1a1a1a", symbol: "sunrise",   note: "다시 살아나신 주님"     },
        pentecost: { key: "pentecost", name: "성령강림주일", colorName: "홍색", color: "#c0390f", colorLight: "#fdf2ee", onColor: "#fff",     symbol: "flame",   note: "성령께서 임하시다"      },
        ordinary:  { key: "ordinary",  name: "성령강림 후 연중 시기", colorName: "녹색", color: "#285a47", colorLight: "#e7eee8", onColor: "#fff",     symbol: "leaf",   note: "그리스도인의 일상"      }
    };

    function compute(today = new Date()) {
        const day       = startOfDay(today);
        const y         = day.getFullYear();
        const easter    = easterDate(y);
        const ashWed    = addDays(easter, -46);
        const palmSun   = addDays(easter, -7);
        const pentecost = addDays(easter, 49);
        const dec25     = new Date(y, 11, 25);
        const baptism   = baptismOfLord(y);
        const advent    = adventStart(y);

        let season;
        if      (day <  baptism)                       season = SEASONS.christmas; // 1/1 ~ 주의 세례주일 전날
        else if (day <  ashWed)                        season = SEASONS.epiphany;
        else if (day <  palmSun)                       season = SEASONS.lent;
        else if (day <  easter)                        season = SEASONS.holyweek;
        else if (day <  pentecost)                     season = SEASONS.easter;
        else if (day.getTime() === pentecost.getTime()) season = SEASONS.pentecost;
        else if (day <  advent)                        season = SEASONS.ordinary;
        else if (day <  dec25)                         season = SEASONS.advent;
        else                                            season = SEASONS.christmas; // 12/25~12/31

        // 그날의 전례색: 연중 시기라도 주의 세례주일·삼위일체 주일·왕이신 그리스도 주일은 백색(기도서 교회력)
        const t = day.getTime();
        const white = [baptism, addDays(pentecost, 7), addDays(advent, -7)].some(d => d.getTime() === t);
        const dayColor = white
            ? { dayColor: SEASONS.christmas.color, dayInk: SEASONS.christmas.ink, dayColorName: SEASONS.christmas.colorName }
            : { dayColor: season.color, dayInk: season.ink, dayColorName: season.colorName };

        // 표시용 부가 정보
        const yearLabel = `${y}년 ${day.getMonth() + 1}월`;
        return { ...season, ...dayColor, year: y, dateLabel: yearLabel };
    }

    return { compute, easterDate, adventStart, baptismOfLord };
})();

const CHURCH_DATA = {
    info: {
        name: "대한성공회 광명교회",
        subName: "성 디모테오 성당",
        tagline: "녹색교회",          // 로고 워드마크 부제 (서체 서브셋 fonts/brand-serif.woff2에 포함된 글자만 사용)
        slogan: "모든 생명을 환대하는 교회",
        vision: "하느님 나라를 살아가는 사랑의 공동체",
        diocese: "대한성공회 서울교구 서부교무구",
        aboutLead: "광명교회는 성공회 기도서에 따라 예배합니다. 생태 보전을 신앙의 과제로 삼아 실천하는 녹색교회입니다.",
        aboutDesc: "주일 예배 뒤에는 함께 식사하는 애찬이 있습니다. 비건 음식도 마련합니다.",
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
        "parentsIntro": "아이를 신앙 안에서 키우는 일은 부모 혼자 감당하기 어렵습니다. 어린이 예배에 자녀를 보내는 양육자들이 매월 모여 가정 안의 신앙 교육을 이야기하고 서로를 위해 기도합니다.",
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
        intro: "광명교회는 2004년 3월 부설기관 광명 희망터를 세웠습니다. 하느님의 사랑을 실천하고 이웃의 필요에 귀 기울이려는 뜻이었습니다.",
        heroImage: { src: "kitchen", alt: "희망터 주방에서 고개 숙여 기도하는 봉사자 세 사람", width: 1440, height: 665 },
        facts: [
            { label: "설립", value: "2004년 3월" },
            { label: "지원", value: "10가정" },
            { label: "활동", value: "매주 토요일" }
        ],
        weeklyEyebrow: "Every Saturday",
        weeklyTitle: "토요일의 나눔",
        weeklyIntro: "광명 희망터는 홀로 사는 어르신과 장애인 가정 등 모두 10가정에 반찬을 전합니다. 매주 토요일 봉사자들이 모여 반찬을 만들고 각 가정에 직접 배달합니다.",
        steps: [
            { title: "한자리에 모입니다", desc: "매주 토요일, 봉사자들이 희망터 주방에 모입니다.", image: { src: "prayer", alt: "주방 조리대 앞에서 두 손을 모으고 기도하는 봉사자들" } },
            { title: "반찬을 조리합니다", desc: "이웃 가정에 드릴 반찬을 정성껏 만듭니다.", image: { src: "dishes", alt: "용기에 나누어 담은 오이부추무침과 양념장에 담근 달걀" } },
            { title: "가정에 전합니다", desc: "만든 반찬을 각 가정에 직접 배달합니다.", image: { src: "handoff", alt: "봉사자가 이웃에게 반찬 봉투를 건네는 모습" } }
        ],
        historyEyebrow: "Our Journey",
        historyTitle: "걸어온 길",
        historyIntro: "광명 희망터는 어르신 일자리 사업과 노숙인 급식 사업을 해 왔습니다. 홀로 사는 어르신에게 반찬도 전해 왔습니다.",
        historyImage: { src: "delivery", alt: "나눔 물품 상자를 가득 실은 차량 앞에 선 봉사자 세 사람", caption: "나눔 물품을 싣고" },
        programs: [
            { title: "노인 일자리 사업", icon: "people" },
            { title: "노숙인 급식 사업", icon: "bowl" },
            { title: "독거노인 반찬 지원 사업", icon: "dish" }
        ],
        vision: "광명 희망터는 앞으로도 이웃의 이야기에 귀 기울이고 필요한 도움을 나누겠습니다.",
        joinEyebrow: "Join Us",
        joinTitle: "함께하기",
        joinIntro: "희망터 활동은 교우 여러분의 봉사와 봉헌으로 이어집니다. 함께해 주시고 기도해 주세요.",
        officerRole: "희망터 총무",
        contactLabel: "희망터 문의",
        givingLabel: "헌금 안내",
        communityLabel: "공동체 전체 보기"
    },

    ui: {
        copyAddress: { success: "복사됨", failure: "주소를 선택했습니다. 길게 눌러 복사해 주세요." },
        copyAccount: { success: "복사됨", failure: "계좌번호를 선택했습니다. 길게 눌러 복사해 주세요." }
    },

    // 홈(index.html) 전용 문구 — 예배 시간·위치 등 사실 정보는 info/worship에서 파생
    home: {
        heroActions: [
            { label: "처음 오셨나요?", href: "newcomer.html", primary: true }
        ],
        about: {
            title: "광명교회",
            facts: [
                { label: "성당", key: "subName" },
                { label: "소속", key: "diocese" }
            ],
            more: "교회 소개 보기"
        },
        worship: {
            title: "예배 안내",
            sub: "주일에는 감사성찬례와 어린이 예배를 드립니다.",
            more: "예배 안내 보기"
        },
        thisSunday: {
            title: "다가오는 주일",
            labels: { season: "절기", first: "제1독서", second: "제2독서", gospel: "복음" }
        },
        guide: {
            eyebrow: "Welcome",
            title: "처음 오셨나요?",
            sub: "주차와 영성체 등 방문 전에 궁금한 점을 확인하세요.",
            cards: [
                { icon: "parking", title: "주차 안내", en: "Parking",      desc: "교회 근처에 무료로 주차할 수 있습니다.",                     href: "visit.html#parking",       action: "주차 안내 보기" },
                { icon: "chalice", title: "영성체 안내", en: "Communion",    desc: "세례받은 모든 그리스도인이 성체를 모실 수 있습니다.",     href: "newcomer.html#communion",  action: "영성체 안내 보기" },
                { icon: "question", title: "자주 묻는 질문", en: "FAQ",desc: "성공회와 예배에 관해 자주 받는 질문을 모았습니다.",       href: "faq.html",                 action: "질문 보기" },
                { icon: "book", title: "주일 주보", en: "Bulletin",      desc: "이번 주 주보를 이미지와 PDF로 보실 수 있습니다.", href: "bulletin.html",           action: "주보 보기" }
            ]
        },
        visit: {
            title: "방문 안내",
            phoneLabel: "전화"
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
            get contact() { return CHURCH_DATA.info.email; },
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
            photo: "images/clergy/lee-namho-portrait.jpg",
            photoThumb: "images/clergy/lee-namho-portrait-450.jpg",
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
                desc: "생태 보전을 신앙의 과제로 삼고 환경 보호와 동물복지를 실천합니다. 주일 애찬에는 비건 음식도 마련합니다.",
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

    // 교회 소개 페이지 — 섹션 둘러보기 내비
    aboutJourney: {
        navLabel: "교회 소개 둘러보기"
    },

    worship: {
        lectionaryError: {
            description: "전례독서를 불러오지 못했습니다. 연결 상태를 확인한 뒤 다시 시도해 주세요.",
            retry: "다시 불러오기"
        },
        liturgicalSeason: LiturgicalCalendar.compute(),
        currentReadings: {
            week: "왕이신 그리스도 주일",
            year: "A년",
            date: "2026년 11월 22일",
            note: "주보 기준 · 대한성공회 공동 전례독서에 따릅니다.",
            items: [
                { role: "제1독서", ref: "에제키엘 34:11-16, 20-24" },
                { role: "시편", ref: "시편 100" },
                { role: "서신서", ref: "에페소 1:15-23" },
                { role: "복음", ref: "마태 25:31-46" }
            ]
        },
        nextReadings: {
            week: "대림 1주일",
            year: "B년",
            date: "2026년 11월 29일",
            items: [
                { role: "제1독서", ref: "이사야 64:1-9" },
                { role: "시편", ref: "시편 80:1-7, 17-19" },
                { role: "서신서", ref: "고린토전서 1:3-9" },
                { role: "복음", ref: "마르코 13:24-37" }
            ]
        },
        main: [
            {
                id: "main",
                title: "주일 감사성찬례",
                en: "Holy Eucharist",
                time: "매주 일요일 오전 11:00",
                duration: "약 1시간 소요",
                desc: "성공회 전례의 중심인 감사성찬례(Eucharist)입니다. 말씀과 성찬 안에서 예수 그리스도를 만납니다. 세례받은 그리스도인은 누구나 성체를 모실 수 있습니다. 반려동물과 함께 오셨다면 예배 후 신부님께 강복(축복 기도)을 청하셔도 됩니다.",
                summary: "말씀과 성찬 안에서 예수 그리스도를 만나는 성공회 전례의 중심 예배입니다. 세례받은 그리스도인은 누구나 성체를 모실 수 있습니다. 반려동물과 함께 오셨다면 예배 후 강복(축복 기도)을 청하셔도 됩니다."
            },
            {
                id: "children",
                href: "children.html",
                summary: "함께 놀고 기도하며 하느님의 사랑을 배웁니다.",
                linkLabel: "어린이 예배 만나보기",
                title: "어린이 예배",
                time: "매주 일요일 오전 11:00",
                desc: "교육관에서 드리는 어린이 예배입니다. 성공회 전례를 어린이 눈높이에 맞게 풀어서 드립니다."
            }
        ],
        guide: "",
        eucharistIntro: "성공회 주일 예배의 중심은 <strong>감사성찬례</strong>입니다. 천주교의 '미사', 개신교의 '성만찬'에 해당하는 예배로, 그리스도교 예배의 뿌리이자 중심입니다.",
        eucharistIntroQuote: "감사성찬례는 예수님의 마지막 만찬에서 비롯되었습니다. <strong>공동체가 함께 모여 말씀을 듣고 성찬을 나눕니다.</strong>",
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
                    "감사 기도를 드리고 강복을 받습니다.",
                    "<em>\"나가서 주님의 복음을 전합시다 / 평화를 이룹시다 / 사랑을 나눕시다\"</em>",
                    "회중: <em>\"그리스도의 이름으로. 아멘\"</em> — 우리는 세상으로 파송되는 선교사가 됩니다."
                ]
            }
        ],
        spaceGuide: {
            intro: "성공회 성당에 처음 들어서면 낯선 공간과 물건이 눈에 띕니다.",
            items: [
                {
                    icon: "drop",
                    name: "성수대",
                    en: "Holy Water",
                    desc: "예배당 입구에 놓인 성수입니다. 손끝에 적셔 십자 성호를 긋고 예배의 자리로 들어섭니다. 세례로 하느님의 백성이 되었음을 기억하는 몸짓입니다."
                },
                {
                    icon: "book",
                    name: "독서대",
                    en: "Ambo · Lectern",
                    desc: "하느님의 말씀을 선포하는 자리입니다. 구약·서신서·복음서를 이곳에서 봉독하고 설교합니다."
                },
                {
                    icon: "chalice",
                    name: "제대",
                    en: "Altar",
                    desc: "감사성찬례의 중심이 되는 식탁입니다. 이곳에서 빵과 포도주를 축성해 그리스도의 몸과 피를 나눕니다. 예배에서 가장 거룩한 자리입니다."
                },
                {
                    icon: "tabernacle",
                    name: "성막",
                    en: "Tabernacle",
                    desc: "축성된 성체를 모셔 두는 곳입니다. 거동이 어려운 병자나 교우를 찾아가 성체를 나눌 때 이 성체를 모셔 갑니다."
                },
                {
                    icon: "candle",
                    name: "부활초",
                    en: "Paschal Candle",
                    desc: "부활하신 그리스도의 빛과 새 생명·영생의 소망을 상징합니다. 부활절에 새로 축복해 밝히고, 세례식과 장례식에서도 밝힙니다."
                }
            ]
        },
        resources: [
            {
                icon: "book",
                title: "성공회 기도서",
                desc: "성공회 공동기도서(BCP)를 온라인으로 볼 수 있습니다.",
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
                desc: "성공회 예배에서 봉독하는 공동번역 성서를 볼 수 있습니다.",
                url: "https://bible.anglican.kr/"
            }
        ],
        prayer: {
            dailyOfficeIntro: [
                "성무일과(매일기도)는 정해진 시간에 드리는 교회의 공적 기도입니다. \"늘 기도하십시오\"(1데살 5:17)라는 말씀을 따라 초대교회와 수도원에서 이어져 온 기도의 리듬입니다.",
                "성공회 기도서에는 하루의 흐름을 따르는 네 가지 기도가 있습니다. 시편과 성서 봉독, 송가와 기도로 이루어집니다. 공동체나 개인이 날마다 같은 기도문으로 하느님 앞에서 하루를 열고 닫습니다.",
                "날마다 같은 기도문을 되풀이하면 단조롭게 느껴질 수 있습니다. 그러나 같은 말씀을 거듭 새기며 하루의 때를 거룩하게 구별하는 데 그 뜻이 있습니다. 아래 기도서를 따라 누구나 지금 바로 함께 기도할 수 있습니다."
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
                    desc: "하루를 마감하며 감사와 참회로 드리는 기도입니다. 성모마리아 송가(마그니피캇)를 부르며 빛이신 그리스도를 찬양합니다.",
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
                            "성공회는 동방정교회나 로마가톨릭교회처럼 하나의 전례서(예배예식서)로 예배하는 '기도서의 교회'입니다. 성서, 기도서, 성가는 성공회 신앙생활의 세 기둥입니다.",
                            "잉글랜드 종교개혁기에 토마스 크랜머 캔터베리 대주교가 성서와 개신교 교리를 바탕으로 동서고금의 훌륭한 기도문과 예식문을 참고해, 영국 평민(commoners) 누구나 가정에 두고 즐겨 쓸 수 있도록 엮었습니다. 그래서 영문학에서도 중요한 자료로 꼽힙니다.",
                            "전례력(교회력), 성찬예배, 세례성사와 병자·혼인·상장례 등 성사적 예식, 성무일과(매일기도), 각종 기도문, 성무일과용 시편집으로 이뤄져 있습니다.",
                            "세계성공회는 이를 바탕으로 나라별 특성과 시대 변화를 반영한 공동기도서를 계속 만들어 가고 있습니다. 뉴질랜드 기도서는 마오리 원주민들의 신앙을 잘 반영한 예로 꼽힙니다."
                        ]
                    },
                    {
                        title: "대한성공회 성가란?",
                        body: [
                            "한국 개신교는 여러 교단이 같은 성경 번역본과 같은 찬송가를 함께 쓰는 경우가 많지만, 외국에서는 감리교·침례교·장로교 등 교단마다 자기 신학을 반영한 찬송가를 따로 만들어 씁니다.",
                            "대한성공회는 1990년판 성가집에 이어 2015년에 새 성가집 『성가 2015』를 펴냈습니다. 초대교회 동서방 교부들의 신앙이 담긴 노래부터, 현대 가톨릭 성가와 한국 개신교 찬송가, 제3세계 성가, 복음성가를 두루 담았습니다.",
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
                note: "비건 음식도 함께 준비합니다",
                footnote: "* 비건: 계란·우유도 포함하지 않는 완전 채식",
                icon: "bowl"
            }
        ],
        smallgroups: {
            intro: "정해진 교재나 형식 없이 솔직한 만남을 중심에 둔 작은 모임입니다.",
            groups: [
                {
                    id: "parents",
                    icon: "house",
                    title: "어린이 예배 양육자모임",
                    en: "Sunday School Parents",
                    schedule: "매월 셋째 주일 애찬 후",
                    desc: "아이를 신앙 안에서 키우는 일은 부모 혼자 감당하기 어렵습니다. 이 모임에서는 어린이 예배에 자녀를 보내는 양육자들이 모여 가정의 신앙 교육을 솔직하게 이야기하고 서로를 위해 기도합니다.",
                    details: [
                        "매월 셋째 주일 애찬을 마친 뒤 교회 소모임 공간에서 모입니다.",
                        "그달의 관심사와 고민을 자유롭게 나눕니다.",
                        "모임은 한 시간 안팎이며 기도와 나눔으로 마칩니다.",
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
            note: "서울역·구로디지털단지·목동 방면에서 오실 수 있습니다."
        },
        parking: "교회 근처에 무료로 주차할 수 있습니다. 방문 전 교회 사무실에 문의해 주세요.",
        note: "※ 네이버 지도·카카오맵에서 <strong>대한성공회 광명교회</strong>로 검색하시면 최단 경로 안내를 받으실 수 있습니다."
    },

    // 방문자 수: 외부 카운터(Abacus, 가입 불필요)에 저장. baseline은 누적 표시에 더하는 시작 숫자
    // Cloudflare Web Analytics: 주소(호스트)별로 사이트를 따로 만들어 공식·개발 통계를 분리해서 본다.
    // 토큰은 공개 페이지에 그대로 들어가는 값이다(비밀 아님). 목록에 없는 주소(로컬 등)는 집계하지 않는다.
    analytics: {
        beaconSrc: 'https://static.cloudflareinsights.com/beacon.min.js',
        tokens: {
            'gmskh.or.kr': '3660518ce5e240329474e2f4beda75fc',
            'www.gmskh.or.kr': '3660518ce5e240329474e2f4beda75fc',
            'frpsy.github.io': 'f39e147222cc4d21bc89313dead37d0f'
        }
    },

    visitorCounter: {
        endpoint: 'https://abacus.jasoncameron.dev',
        namespace: 'gmchurch-frpsy-web',   // 공식 사이트(gmskh.or.kr) 전용 — 기존 누적값 유지
        devNamespace: 'gmchurch-frpsy-web-dev', // 그 외 주소(GitHub Pages 미리보기 등)는 별도 집계
        officialHosts: ['gmskh.or.kr', 'www.gmskh.or.kr'],
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
        shorts: {
            channelUrl: "https://www.youtube.com/channel/UCDaJNUSrCsljsECQpKDBv7A/shorts",
            featured: [
                { id: "YlD1anqfWa8", title: "예배 시간의 벨소리, 그 정체를 알고 모두가 경악하는데", desc: "예배 시간의 벨소리를 소재로 한 짧은 영상입니다.", category: "설교" },
                { id: "_3KxYCQwrjY", title: "아름다운 마음들이 모여서", desc: "찬양과 율동으로 함께한 모습을 담은 짧은 영상입니다.", category: "공동체" },
                { id: "j_YXq9TUjf0", title: "어린이에게 봉헌 순서를 부탁해 보았다", desc: "어린이에게 봉헌 순서와 봉헌기도를 맡겨 본 모습을 담았습니다.", category: "공동체" },
                { id: "fIDhbA4XEbE", title: "안수집사 출신 교우가 제게 물었습니다.", desc: "주일에 교회에 모이는 일을 사도행전의 '날마다 성전에 모여'와 함께 다룬 말씀입니다.", category: "설교" },
                { id: "PfUbLh_6jkc", title: "의외로 잘 모르는 사순절 재의 진실", desc: "사순절 재의 수요일에 쓰는 재에 관한 이야기입니다. 재는 종려나무 가지를 태워 만듭니다.", category: "성공회 소개" },
                { id: "waywS1fJmQo", title: "내 믿음이 약하다고 느껴질 때", desc: "믿음이 약하게 느껴질 때, 베드로의 이야기와 함께 전하는 말씀입니다.", category: "신앙 이야기" },
                { id: "uN5vg0aWjvo", title: "AI 에게 여성 사제를 그려 달라고 했을 때 생긴 일", desc: "인공지능에게 여성 사제를 그려 달라고 요청했을 때의 이야기입니다.", category: "성공회 소개" },
                { id: "CzUZnaDBtGU", title: "무지개 언약은 인간만을 위한 것이 아닙니다", desc: "무지개 언약을 생태영성의 관점에서 다룬 짧은 영상입니다.", category: "신앙 이야기" },
                { id: "F629LHgkqsI", title: "반려동물과 같이 예배드리는 교회가 있다?", desc: "반려동물과 함께 드리는 반려동물 축복식을 소개합니다.", category: "공동체" },
                { id: "yV_w1_v-Or0", title: "교회 이전을 앞두고 다시 말씀드립니다", desc: "교회 이전을 앞두고 모든 피조물을 소중히 여기고 새 이웃과 상처 입은 이웃에게 다가가자는 말씀입니다.", category: "설교" }
            ],
            all: [
                { id: "wc8ZUO_7EI0", title: "누가 거룩한 사람인가?", desc: "광명교회 설교 말씀 가운데 '누가 거룩한 사람인가?'라는 물음을 다룬 짧은 영상입니다." },
                { id: "yV_w1_v-Or0", title: "교회 이전을 앞두고 다시 말씀드립니다" },
                { id: "F629LHgkqsI", title: "반려동물과 같이 예배드리는 교회가 있다?" },
                { id: "joP5luhgsyI", title: "오병이어, 믿으십니까?" },
                { id: "5eNVXtcpILk", title: "내 구주 예수를 더욱 사랑 @워십투게더 2026" },
                { id: "LmiIl9_Rxc0", title: "양심과 성령" },
                { id: "Y66HGZFyhCo", title: "어린이날, 교회에 무슨 일이?" },
                { id: "YlD1anqfWa8", title: "예배 시간의 벨소리, 그 정체를 알고 모두가 경악하는데" },
                { id: "02uMo_77CYE", title: "영성체 성가 \"나의 아버지\" (Bapa Kurindu)" },
                { id: "uL7Lcbdq-tQ", title: "마귀의 유혹에 지는 이유" },
                { id: "458HZsVGTng", title: "성령께서 우리를 광야로 이끄실 때" },
                { id: "PfUbLh_6jkc", title: "의외로 잘 모르는 사순절 재의 진실" },
                { id: "JNHz8Nl0wdY", title: "우리는 하나 되어 함께 걷네" },
                { id: "R3Yhz6JiRpw", title: "너의 영혼 우리 볼 때" },
                { id: "y5C2xD1b3-M", title: "우리 교회에는 문제가 많습니다 그러나" },
                { id: "ZJo_GlTR7p4", title: "성탄 밤 유아세례" },
                { id: "HJc1D5uNUXg", title: "주의 자비가 내려와(겨울 ver.)" },
                { id: "vHXBLJOTBO0", title: "스스로 믿음이 없다고 느끼시나요?" },
                { id: "3ZJ1c0LhDxA", title: "예수님이 왕이라고요?" },
                { id: "0wf8shtOm1A", title: "교회 다니는 사람은 다 아는 그거 \"영광(짝짝)\"" },
                { id: "HAf0VRbYuVw", title: "The God We Love(니케아 신경)" },
                { id: "Jv7MU93OjUI", title: "사랑해요 축복해요" },
                { id: "tQEPnosy_6k", title: "성령의 민주화" },
                { id: "WFU8j4nqwQ8", title: "선하신 주 예수 사랑 끝없네" },
                { id: "KPj5vuuY5RU", title: "우리가 또 어려움을 겪게 될 수도 있습니다. 그러나" },
                { id: "v1-zPXzs0yM", title: "이런 교회 되게 하소서" },
                { id: "CzUZnaDBtGU", title: "무지개 언약은 인간만을 위한 것이 아닙니다" },
                { id: "3flCW5LHUqo", title: "믿음을 구하는 이유가 무엇입니까?" },
                { id: "Mf2zyZC_fiI", title: "이곳을 덮으소서 이곳을 비추소서" },
                { id: "dCT4u_RYB6g", title: "2분으로 보는 연합예배 풍경" },
                { id: "G-_4IdU0vcI", title: "많은 사람들이 돈을 주인으로 섬깁니다" },
                { id: "eYtw6z4qL6U", title: "제가 살 날은 많지 않을 것입니다. 어린이들에 비하면." },
                { id: "HhG_WUnRbPA", title: "젊은 여성들이 교회를 떠나는 이유?" },
                { id: "QT0CQ1HRhmY", title: "교회 ASMR" },
                { id: "9gah5PrWiWk", title: "광명교회 주일 애찬 풍경" },
                { id: "l1BcED1oR6s", title: "차별을 없애는 이들을 위해 주시는 약속" },
                { id: "q8vjrGRbjn4", title: "삶의 변화 없는 신앙생활이 계속될 때" },
                { id: "6TthO5wwBXE", title: "상상도 못했던 요즘 젊은이들의 문화" },
                { id: "ZmENyJ5uzCU", title: "영원한 본향에 보물을 쌓으세요" },
                { id: "WJUTqzcAYGY", title: "역대급 가뭄에서 살아남은 코끼리 무리의 비밀" },
                { id: "pAgpCS_CBNg", title: "[찬양] 보물을 쌓아라" },
                { id: "A9O2usYKngI", title: "일용할 양식이 없어 죽어가는 아이들" },
                { id: "Tlccd0hXu3o", title: "극우 기독교의 문제점" },
                { id: "I1r9i08RItQ", title: "주일학교의 여름" },
                { id: "nSRsKRx2Bzc", title: "기후 위기의 시대, 이웃 사랑하기" },
                { id: "_3KxYCQwrjY", title: "아름다운 마음들이 모여서" },
                { id: "cgwvQ5pGhyU", title: "밭마늘에게서 배우는 신앙의 지혜" },
                { id: "sXhv2o7N0v8", title: "작은 교회에서 하는 신앙생활이 복된 이유" },
                { id: "N_pyqAqgo5U", title: "감사를 드리지 못하는 이유" },
                { id: "NHpnbvFXWUc", title: "예수님은 왜 사마리아를 지나가셨나?" },
                { id: "S5693vFTbMA", title: "모태신앙인이 겪을 수 있는 문제" },
                { id: "pw4VAL-b3r8", title: "혼자 걷지 않을 거예요" },
                { id: "O3cksH7p8X0", title: "\"그대 혼자 걷지 않을 거예요\" 그 이유는?" },
                { id: "MMl2Uji65SY", title: "얼마전 유튜브에서 충격적인 영상을 보았습니다" },
                { id: "Wi0PrNYfnG0", title: "잠언의 지혜가 교회에 주는 교훈" },
                { id: "chR3EczWlhw", title: "공동체를 이루게 하시는 성령의 능력" },
                { id: "33SFKKLNFTw", title: "하느님은 남성인가요? 성경을 다시 보세요" },
                { id: "V4fTU52UMHQ", title: "의외로 인기 있는 교회 관련 검색어" },
                { id: "6HHXc45cj7Q", title: "예수님께서 승천하며 우리에게 주신 말씀" },
                { id: "qbQQK6NnjKM", title: "예수님의 승천을 믿을 때 우리에게 일어나는 일" },
                { id: "fIDhbA4XEbE", title: "안수집사 출신 교우가 제게 물었습니다." },
                { id: "hYwgh1NV8QE", title: "예수님의 승천이 우리에게 미치는 영향" },
                { id: "rCTX4XoEhME", title: "성공회에서 부르는 호산나" },
                { id: "j_YXq9TUjf0", title: "어린이에게 봉헌 순서를 부탁해 보았다" },
                { id: "UpriDWpvIIU", title: "한 청년이 제게 물었습니다" },
                { id: "uN5vg0aWjvo", title: "AI 에게 여성 사제를 그려 달라고 했을 때 생긴 일" },
                { id: "BsokK5pbONU", title: "\"교회는 예배당이 아닙니다\" 그럼 무엇인가요?" },
                { id: "eDNis03fWV0", title: "저는 사실 슬럼프에 빠졌습니다" },
                { id: "QuEmsgb5yQQ", title: "예수님을  떠날 때 우리 영혼에 일어나는 일" },
                { id: "7e6TkBsxbCE", title: "예수님을 보고도 못 믿은 사람들의 충격적인 이유" },
                { id: "waywS1fJmQo", title: "내 믿음이 약하다고 느껴질 때" },
                { id: "3EfcTbtmuUQ", title: "153마리 물고기의 상상도 못한 정체" },
                { id: "16KfZvucRW8", title: "경북 산불로 죽은 나무로 십자가를 만들었더니" },
                { id: "ZGj8jszdOOY", title: "닫힌 문 사이로 예수님은 들어오십니다" },
                { id: "Hu0wkh3yxf0", title: "심방할 가정을 위해 기도할 때 주님께서 음성을 주십니다" },
                { id: "uV6_u2eHU_w", title: "우리는 다락방에 모여 있던 제자들과 같습니다" },
                { id: "ZwZie64rrZ0", title: "성공회 교회에 들어오면 깜짝 놀라는 이유" },
                { id: "bfpwGPL5AZc", title: "약자를 위해 사신 예수님" },
                { id: "VbJnDrK6vC8", title: "부활절의 진정한 의미" },
                { id: "YnOIUmn-BtM", title: "'성공회를 조심하라'고 하는 사람을 조심하세요!" },
                { id: "joms8vbPNl4", title: "삶의 변화 없는 신앙생활을 벗어나기" },
                { id: "DI0VrGxmDwI", title: "탕자 비유를 통해 교회에 주시는 말씀" },
                { id: "0X_eD2dn2GE", title: "요즘 기독교 정통교회 근황" },
                { id: "MrP0zT885cc", title: "사회적 참사를 대하는 기독교적 자세" },
                { id: "WTseXEbOy0I", title: "예수님께서 우리나라에 주시는 말씀" },
                { id: "oGiQ5yZiP_s", title: "주일 성수를 한다고 여러분의 상황이 달라지지는 않을 것입니다. 그러나 ..." },
                { id: "Okr_MAbZ0Xg", title: "사순절 대연도의 은총" },
                { id: "7VRcsr6BOFY", title: "몽골에 나무를 심는 이유" },
                { id: "5KGsdp_kciE", title: "에덴동산과 광야의 평행이론" }
            ]
        },
        videos: [
            {
                id: "wc8ZUO_7EI0",
                title: "누가 거룩한 사람인가?",
                desc: "광명교회 설교 말씀 가운데 '누가 거룩한 사람인가?'라는 물음을 다룬 짧은 영상(쇼츠)입니다.",
                category: "설교"
            },
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
        note: "아래 답변은 대한성공회의 공식 자료와 세계성공회 문헌을 바탕으로 광명교회가 정리한 안내입니다. 신학적 세부와 공식 입장은 교단 문헌을 따릅니다.",
        categories: [
            {
                id: "identity",
                title: "정체성과 뿌리",
                icon: "cross",
                items: [
                    {
                        q: "성공회는 이단인가요?",
                        a: "아닙니다. 성공회는 그리스도교의 오랜 전통에 뿌리를 둔 교단입니다. 현재 세계 165개 이상의 나라에서 약 8,500만 명의 신자가 캔터베리 대주교와 상징적 관계를 맺으며 나라별로 자치 교회를 이루고 있습니다.\n\n16세기 종교개혁으로 로마가톨릭을 믿던 서유럽은 여러 갈래로 나뉘었습니다. 독일과 북유럽에서는 종교개혁가 마르틴 루터를 따르는 루터교가 국가교회로 세워졌습니다. 스위스와 프랑스 일부, 스코틀랜드에는 장 칼뱅의 영향을 받은 개혁교회가 생겼습니다. 스코틀랜드에서는 이를 장로교라 부릅니다. 잉글랜드에서는 국왕 헨리 8세가 로마 교황의 권위를 거부하고 국교회의 수장이 되면서 성공회가 생겨났습니다. 지금도 국왕이 잉글랜드 국교회의 수장이지만, 상징적인 자리입니다.",
                        refs: [
                            { label: "성공회 (Wikipedia)", url: "https://ko.wikipedia.org/wiki/%EC%84%B1%EA%B3%B5%ED%9A%8C" },
                            { label: "성공회 (나무위키)", url: "https://namu.wiki/w/%EC%84%B1%EA%B3%B5%ED%9A%8C" },
                            { label: "세계성공회공동체 (나무위키)", url: "https://namu.wiki/w/%EC%84%B8%EA%B3%84%EC%84%B1%EA%B3%B5%ED%9A%8C%EA%B3%B5%EB%8F%99%EC%B2%B4" }
                        ]
                    },
                    {
                        q: "헨리 8세가 결혼(이혼)을 위해 만든 교단인가요?",
                        a: "결혼 문제는 계기일 뿐, 핵심은 <strong>왕위 계승 위기</strong>와 유럽 종교개혁의 흐름이었습니다.\n\n헨리 8세는 왕위를 이을 아들을 얻지 못하자 교황 클레멘스 7세에게 혼인 무효를 청했습니다. 그러나 교황은 왕비 캐서린의 조카인 황제 카를 5세의 압력 아래 있어 이를 받아들이지 않았습니다. 이에 헨리 8세는 로마와 관계를 끊고 1534년 수장령으로 잉글랜드 교회의 수장이 되었습니다. 이후 크랜머 대주교 등의 영향으로 <strong>'개신교 교리에 가톨릭 전통의 예배 형식'</strong>을 갖춘 오늘날 성공회로 자리 잡았습니다.",
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
                        a: "아닙니다. 성모 마리아와 성인들을 <strong>신앙의 모범으로 공경</strong>하지만, 예배와 기도의 대상은 오직 삼위일체 하느님입니다.\n\n성공회 39개조 제22조는 당시 로마 교회의 가르침(invocation of saints)을 받아들이지 않았습니다. 그 가르침은 성인에게 기도로 전구를 청하는 것입니다. 다만 오늘날 성공회 안에서도 전통에 따라 성인 공경의 모습은 조금씩 다릅니다.",
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
                        a: "성공회의 사회 참여는 정당이나 이념이 아니라 <strong>신앙에서 나옵니다</strong>.\n\n세계성공회가 공유하는 ‘선교의 다섯 표지’ 네 번째가 <em>‘불의한 사회 구조를 변화시키는 것’</em>입니다. 대한성공회는 1950년대 이후 산업 선교로 사회 현실에 함께해 왔습니다. 1986년 첫 나눔의 집을 연 빈민 선교와 1987년 6월 민주항쟁 때 서울주교좌성당의 역할도 그 사례입니다. 이는 특정 정파를 지지하는 것과 다른 신앙적 실천입니다.",
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
                period: "12월 25일 ~ 주의 세례주일 전날",
                desc: "말씀이 사람이 되신 기쁨을 기념합니다. 성탄 후 12일간 이어집니다."
            },
            {
                key: "epiphany",
                name: "공현 후 연중 시기",
                en: "Epiphany",
                colorName: "녹색",
                color: "#2f6a52",
                symbol: "sparkle",
                period: "주의 세례주일 ~ 재의 수요일 전날",
                desc: "주님께서 세상에 자신을 드러내신 것을 기념합니다. 공현일과 주의 세례주일을 포함합니다."
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
                colorName: "홍색",
                color: "#c0390f",
                symbol: "palm",
                period: "고난주일(성지주일) ~ 성 토요일",
                desc: "주님의 수난을 묵상하는 한 주간. 고난주일·성 목요일·성 금요일·성 토요일을 포함합니다."
            },
            {
                key: "easter",
                name: "부활절",
                en: "Easter",
                colorName: "백색·금색",
                color: "#b8860b",
                symbol: "sunrise",
                period: "부활주일 ~ 성령강림주일 (50일)",
                desc: "다시 살아나신 주님을 기리는 기쁨의 계절. 50일간 이어집니다."
            },
            {
                key: "pentecost",
                name: "성령강림주일",
                en: "Pentecost",
                colorName: "홍색",
                color: "#c0390f",
                symbol: "flame",
                period: "부활 후 50일째 주일",
                desc: "성령께서 제자들에게 임하신 날을 기념합니다. 교회가 시작된 날입니다."
            },
            {
                key: "ordinary",
                name: "성령강림 후 연중 시기",
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
                name: "공현일",
                en: "Epiphany",
                date: "1월 6일 또는 직후 주일",
                origin: "세계성공회",
                desc: "동방박사들의 방문을 통해 예수님이 온 세상에 드러나신 날입니다. 공현일 후 첫 주일은 주의 세례주일로 지킵니다."
            },
            {
                name: "세계기도일",
                en: "World Day of Prayer",
                date: "3월 첫째 금요일",
                origin: "세계교회 (에큐메니컬)",
                desc: "1887년 미국에서 시작된 에큐메니컬 평신도 여성 기도운동. 매년 특정 나라 여성들이 예식을 준비하며, 170여 개국에서 함께 드립니다."
            },
            {
                name: "고난주일(성지주일)",
                en: "Palm Sunday",
                date: "성주간 첫날 (부활 7일 전)",
                origin: "세계성공회",
                desc: "예수님의 예루살렘 입성을 기념하며 종려가지를 들고 행진합니다. 성주간의 시작입니다."
            },
            {
                name: "승천일",
                en: "Ascension Day",
                date: "부활 후 40일째 목요일 (부활 7주일로 옮길 수 있음)",
                origin: "세계성공회",
                desc: "부활하신 주님께서 하늘에 오르신 날을 기념합니다. 부활절에서 성령강림주일로 이어지는 길목입니다."
            },
            {
                name: "삼위일체 주일",
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
        newsIntro: "최근 5주분의 교회소식을 보관합니다.",
        newsEmpty: "등록된 교회소식이 없습니다.",
        // 모바일 주보(jubo/)는 홈페이지에서 연결하지 않는다(교우에게만 주소 안내, 2026-11-01). 다시 연결하려면 mobile: { href, label, desc }
        items: [
            {
                date: "2026-11-22",
                label: "2026년 11월 22일",
                season: "왕이신 그리스도 주일",
                images: ["bulletins/20261122_1.jpg", "bulletins/20261122_2.jpg", "bulletins/20261122_3.jpg", "bulletins/20261122_4.jpg"],
                pdf: "bulletins/20261122.pdf",
                news: [
                    { title: "마르코복음 강좌 안내", body: "오늘 애찬 후에 마르코복음 강좌와 소그룹 두 번째 모임이 있습니다.\n- 소그룹1 인도자 : 정동숙 (1층) / 김주영 최명숙 홍우미 한금숙 박은숙 이지영 문운영 서태석 김영원\n- 소그룹2 인도자 : 여정훈 (2층) / 이남호 윤준섭 이문희 손옥길 나영숙 신효심 박연순 이인숙 장순희 강옥금\n- 소그룹3 인도자 : 박종미 (3층) / 박경준 송경민 이가람 이성준 박상열 신인순 윤상돈" },
                    { title: "이전 감사헌금 안내", body: "- 지금 옥길동 성당의 인테리어 기초공사가 마무리 단계에 있습니다. 교우님들의 관심과 기도를 바랍니다.\n- 그리고 성전 이전을 마칠 때까지 교우 여러분께 '이전 감사헌금'을 봉헌해 주시기를 부탁드립니다. 이번 성전 이전은 수평이동을 원칙으로 준비하고 있습니다. 그러나 준비 과정에서 예상하지 못했던 변수들이 생겨나고 있으며, 새로운 성전을 좀 더 편리하고 아름다운 공간으로 마련하기 위해 추가적인 비용도 발생하고 있습니다. 이에 교우 여러분께서 새로운 성전을 함께 마련하는 마음으로 '이전 감사헌금' 봉헌에 동참해 주시기를 부탁드립니다. 각자의 형편에 따라 정성을 모아 주시면 감사하겠습니다." },
                    { title: "서울교구 교구의회 안내", body: "- 일시 : 11월 28일(토) 오전 10시\n- 장소 : 성공회대학교 피츠버그홀\n- 파송 대의원 : 이문희 니콜라, 박종미 수산나, 나영숙 엘리사벳" },
                    { title: "관할사제 일정", body: "- 26일(목) 성공회 무지개 숲 창립포럼 강의" },
                    { title: "이번 주 애찬 준비", body: "민숙희 김광영 박정연" }
                ],
                verse: { ref: "마태 25:40", text: "그러면 임금은 ‘분명히 말한다. 너희가 여기 있는 형제 중에 가장 보잘것없는 사람 하나에게 해준 것이 바로 나에게 해준 것이다.’ 하고 말할 것이다." }
            },
            {
                date: "2026-11-15",
                label: "2026년 11월 15일",
                season: "가해 연중 33주일",
                images: ["bulletins/20261115_1.jpg", "bulletins/20261115_2.jpg", "bulletins/20261115_3.jpg", "bulletins/20261115_4.jpg"],
                pdf: "bulletins/20261115.pdf",
                news: [
                    { title: "마르코복음 강좌 안내", body: "다음주일 애찬 후에 마르코복음 강좌와 소그룹 두 번째 모임이 있습니다.\n- 소그룹1 인도자 : 정동숙 (1층) / 김주영 최명숙 홍우미 한금숙 박은숙 이지영 문윤영 서태석 김영원\n- 소그룹2 인도자 : 여정훈 (2층) / 이남호 윤준섭 이문희 손옥길 나영숙 신효심 박연순 이인숙 장순희 강옥금\n- 소그룹3 인도자 : 박종미 (3층) / 박경준 송경민 이가람 이성준 박상열 신인순 윤상돈" },
                    { title: "이전 감사헌금 안내", body: "-지금 옥길동 성당의 공사가 한창입니다. 교우님들의 관심과 기도를 바랍니다.\n-그리고 성전 이전을 마칠 때까지 교우 여러분께 '이전 감사헌금'을 봉헌해 주시기를 부탁드립니다. 이번 성전 이전은 수평이동을 원칙으로 준비하고 있습니다. 그러나 준비 과정에서 예상하지 못했던 변수들이 생겨나고 있으며, 새로운 성전을 좀 더 편리하고 아름다운 공간으로 마련하기 위해 추가적인 비용도 발생하고 있습니다.\n이에 교우 여러분께서 새로운 성전을 함께 마련하는 마음으로 '이전 감사헌금' 봉헌에 동참해 주시기를 부탁드립니다. 각자의 형편에 따라 정성을 모아 주시면 감사하겠습니다." },
                    { title: "활동단체별 모임 안내", body: "오늘 애찬 후에 단체별로 모임을 갖습니다.\n많은 참석을 바랍니다." },
                    { title: "관할사제 일정", body: "- 11월 16일(월) NCCK 총회 참석\n- 11월 17일(화) 교무국 회의 참석\n- 11월 18일(수) 뉴스앤조이 인터뷰 / 성물제작 계약\n- 11월 19일(목) 성공회 무지개 숲 창립포럼(2) 참석\n- 11월 20일(금) 사택 매매잔금 지급 예정" },
                    { title: "이번 주 애찬 준비", body: "박은숙 신효심 정동숙" }
                ],
                verse: { ref: "마태 25:21", text: "그러자 주인이 그에게 ‘잘하였다. 너는 과연 착하고 충성스러운 종이다. 네가 작은 일에 충성을 다하였으니 이제 내가 큰 일을 너에게 맡기겠다. 자, 와서 네 주인과 함께 기쁨을 나누어라.’ 하고 말하였다." }
            },
            {
                date: "2026-11-08",
                label: "2026년 11월 8일",
                season: "추수감사주일",
                images: ["bulletins/20261108_1.jpg", "bulletins/20261108_2.jpg", "bulletins/20261108_3.jpg", "bulletins/20261108_4.jpg"],
                pdf: "bulletins/20261108.pdf",
                news: [
                    { title: "하느님께 감사합니다.", body: "오늘 추수감사주일을 맞이하며 하느님께서 우리에게 내려주신 은총에 감사를 드립니다.\n아울러 우리 교우 여러분 각 사람과, 여러분이 속한 공동체가 신앙의 열매를 맺어 하느님께 봉헌되기를 기도합니다." },
                    { title: "마르코복음 강좌 안내", body: "오늘 애찬 후에 마르코복음 강좌와 소그룹 모임이 시작됩니다.\n소그룹1 인도자 : 정동숙 (1층)\n김주영 최명숙 홍우미 한금숙 박은숙 이지영 문윤영 서태석 김영원\n소그룹2 인도자 : 여정훈 (2층)\n이남호 윤준섭 이문희 손옥길 나영숙 신효심 박연순 이인숙 장순희 강옥금\n소그룹3 인도자 : 박종미 (3층)\n박경준 송경민 이가람 이성준 박상열 신인순 윤상돈" },
                    { title: "관할사제 일정", body: "12일(목) 성공회 무지개 숲 창립포럼(1)\n13일(금) 총사제 회의\n13일(금)~14일(토) 여성성직 성소 클링캠프" },
                    { title: "기도와 관심 바랍니다.", body: "지금 옥길동 성당의 공사가 한창입니다. 안전하게 공사가 진행되고, 계획대로 이루어지기를 위하여 교우님들의 관심과 기도를 바랍니다." }
                ],
                verse: { ref: "마태 6:33", text: "너희는 먼저 하느님의 나라와 하느님께서 의롭게 여기시는 것을 구하여라. 그러면 이 모든 것도 곁들여 받게 될 것이다." }
            },
            {
                date: "2026-11-01",
                label: "2026년 11월 1일",
                season: "가해 연중 31주일",
                images: ["bulletins/20261101_1.jpg", "bulletins/20261101_2.jpg", "bulletins/20261101_3.jpg", "bulletins/20261101_4.jpg"],
                pdf: "bulletins/20261101.pdf",
                news: [
                    { title: "11월 교회위원회 안내", body: "오늘 애찬 후에 11월 교회위원회가 열립니다. 모든 위원의 참석을 바랍니다." },
                    { title: "추수감사주일 안내", body: "다음 주일은 추수감사주일로 봉헌합니다. 우리의 삶 안에 움직이시며 우리를 성장하게 하신 하느님께 감사드리는 날이 되기를 바랍니다." },
                    { title: "서부교무구 성직자 피정", body: "날짜 : 11월 2일(월)~5일(목)\n장소 : 고성 까리타스 피정의 집" },
                    { title: "마르코복음 강좌 안내", body: "다음 주일 애찬 후에 마르코복음 첫 번째 강좌가 열립니다. 아직 교재를 신청하지 않으신 분은 박경준 프란시스 위원에게 오늘까지 신청해 주시기 바랍니다. 많은 신청 바랍니다.\n(교재 가격은 15,000원입니다.)" },
                    { title: "성당 이전 준비가 본격적으로 시작되었습니다.", body: "-오늘 인테리어 공사 계약을 했습니다. 인테리어 업체는 '상일 이엔지'이고 내일부터 공사가 시작됩니다. 안전하고 멋진 새 성당이 되기를 기도해 주시고 많은 관심 가져 주시기 바랍니다.\n-새 성당에서의 우리 교회 선교적 이미지를 알리기 위한 '로고만들기' 작업도 진행 중입니다.\n-새로 이사할 사택도 계약했습니다. 부천시 소사본동에 있는 풍림아이원 아파트입니다." }
                ],
                verse: { ref: "마태 5:3-4", text: "마음이 가난한 사람은 행복하다. 하늘 나라가 그들의 것이다. 슬퍼하는 사람은 행복하다. 그들은 위로를 받을 것이다." }
            },
            {
                date: "2026-10-25",
                label: "2026년 10월 25일",
                season: "가해 연중 30주일",
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
            }
        ]
    },

    // 사진 갤러리 (gallery.html)
    photoGallery: {
        intro: "예배, 공동체 모임, 교회 풍경 등 광명교회의 순간들을 모았습니다.",
        categories: ["전체", "예배", "공동체", "교회 풍경", "섬기는 이들"],
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
            },
            {
                "id": "children-painting-joy",
                "title": "붓을 들고 웃는 아이",
                "desc": "",
                "category": "공동체",
                "date": "",
                "src": "images/children/painting-joy.webp",
                "thumb": "images/children/painting-joy-sm.webp",
                "alt": "붓을 들고 벽화 앞에서 두 팔을 펼친 어린이"
            },
            {
                "id": "children-card-presenting",
                "title": "사제님께 카드를 전하는 아이들",
                "desc": "",
                "category": "공동체",
                "date": "",
                "src": "images/children/card-presenting.webp",
                "thumb": "images/children/card-presenting-sm.webp",
                "alt": "분홍색 카드를 사제님께 건네는 두 어린이의 뒷모습"
            },
            {
                "id": "children-card-note",
                "title": "아이들이 쓰고 그린 카드",
                "desc": "",
                "category": "공동체",
                "date": "",
                "src": "images/children/card-note.webp",
                "thumb": "images/children/card-note-sm.webp",
                "alt": "손글씨와 교회 그림으로 채운 분홍색 카드"
            },
            {
                "id": "hope-kitchen",
                "title": "희망터 주방",
                "desc": "",
                "category": "공동체",
                "date": "",
                "src": "images/hopecenter/kitchen.webp",
                "thumb": "images/hopecenter/kitchen-sm.webp",
                "alt": "희망터 주방에서 고개 숙여 기도하는 봉사자 세 사람"
            },
            {
                "id": "hope-handoff",
                "title": "가정에 전합니다",
                "desc": "",
                "category": "공동체",
                "date": "",
                "src": "images/hopecenter/handoff.webp",
                "thumb": "images/hopecenter/handoff-sm.webp",
                "alt": "봉사자가 이웃에게 반찬 봉투를 건네는 모습"
            },
            {
                "id": "clergy-1",
                "title": "민숙희(마가렛) 사제",
                "desc": "",
                "category": "섬기는 이들",
                "date": "",
                "src": "images/clergy/priest-portrait.jpg",
                "thumb": "images/clergy/priest-portrait-450.jpg",
                "alt": "민숙희(마가렛) 사제 초상"
            },
            {
                "id": "clergy-2",
                "title": "이남호(사도요한) 사제",
                "desc": "",
                "category": "섬기는 이들",
                "date": "",
                "src": "images/clergy/lee-namho-portrait.jpg",
                "thumb": "images/clergy/lee-namho-portrait-450.jpg",
                "alt": "이남호(사도요한) 사제 초상"
            },
            {
                "id": "diocesan-bishop",
                "title": "김장환(엘리야) 주교",
                "desc": "",
                "category": "섬기는 이들",
                "date": "",
                "src": "images/clergy/bishop-portrait.jpg",
                "thumb": "images/clergy/bishop-portrait-450.jpg",
                "alt": "김장환(엘리야) 주교 초상"
            }
        ]
    },

    // 주일 설교 원문. 새 설교는 items 맨 앞이 아니어도 날짜순으로 정렬해 보여 준다.
    // paragraphs: 문단 하나가 배열 한 칸. 저자 허락을 받은 원문을 기본 교정만 거쳐 싣는다.
    sermons: {
        intro: "주일 설교와 강연을 날짜별로 모았습니다.",
        empty: "등록된 설교가 없습니다.",
        items: [
            {
                date: "2026-11-26",
                kind: "강연",
                title: "너는 이 무지개떡을 받아먹어라 - 경계를 가로지르며 만난 낯선 하느님",
                occasion: "퀴어와 함께하는 성공회 무지개숲 네트워크 창립 포럼",
                preacher: "민숙희(마가렛) 사제",
                paragraphs: [
                    "## 들어가며 ― 내가 알고 있던 하느님 너머",
                    "오늘 이 포럼에 저를 초대해 주시면서 주최 측에서 여러 가지 질문을 보내 주셨습니다. 왜 다수가 안 된다고 말하는 여성 사제의 길을 걸어갈 수 있었는지, 그 과정에서 어떤 상처를 경험했는지, 소수자로 살아온 경험이 또 다른 소수자를 만나는 데 어떤 영향을 주었는지, 그리고 그러한 경험을 통해 앞으로 어떤 교회를 꿈꾸고 있는지에 관한 질문이었습니다. 그 질문들을 읽으면서 제가 걸어온 길을 다시 돌아보게 되었습니다.",
                    "저는 1988년에 신학과에 입학했고, 2005년에 사제 서품을 받았습니다. 그리고 2025년에는 대한성공회 서울교구 최초의 여성 총사제가 되었습니다. 이렇게 몇 개의 연도로 정리하면 제가 걸어온 길이 비교적 순탄해 보일지도 모르겠습니다. 그러나 그 시간 안에는 수많은 질문과 갈등, 상처와 좌절, 그리고 함께 걸어 준 사람들이 있었습니다. 무엇보다 그 시간은 제가 알고 있다고 생각했던 하느님을 새롭게 만나는 시간이었습니다.",
                    "저는 여성으로서 사제가 되는 과정에서 교회가 이야기하는 하느님과 제가 경험하는 하느님 사이의 간극을 마주했습니다. 그리고 사제가 된 이후에는 제가 믿고 있는 하느님과 제가 실제로 만들어 가고 있는 교회 사이의 간극을 마주하게 되었습니다. 오늘 저는 그 이야기를 하려고 합니다. 성소수자 사목의 성공적인 경험이나 모범적인 교회의 사례를 말씀드리기보다는, 한 여성 사제가 경계를 넘어가는 과정에서 무엇을 발견했고, 또 다른 경계 앞에서 어떻게 머뭇거렸는지 이야기하고 싶습니다.",
                    "주최 측에서 제안해 주신 제목이 참 재미있습니다. “너는 이 무지개떡을 받아먹어라.”",
                    "저는 이 제목을 보면서 사도행전 10장의 베드로를 떠올렸습니다. 베드로는 자신이 먹어서는 안 된다고 생각했던 것들이 담긴 보자기를 마주합니다. 그리고 먹으라는 하느님의 음성을 듣습니다. 베드로에게는 당황스러운 일이었을 것입니다. 저 역시 살아오면서 그러한 순간들을 경험했습니다. 때로는 제가 교회를 향해 그 보자기를 펼쳐 보이며 이것을 받아들이라고 요구하는 사람이었습니다. 그러나 때로는 제가 베드로처럼 그 보자기 앞에서 망설이는 사람이기도 했습니다. 오늘은 그 두 가지 이야기를 함께 나누고 싶습니다.",
                    "## Ⅰ. 모두가 ‘아니오’라고 말하는 길에서",
                    "### 1. 왜 여자는 사제가 될 수 없는가",
                    "제가 신학과에 입학했던 1988년은 대한성공회에서 여성이 사제가 되는 것을 당연하게 상상할 수 있는 시대가 아니었습니다. 저는 그때 이미 외국에는 여성사제가 있다는 사실조차 몰랐습니다. 여성이 신학을 공부하는 것과 성직자가 되는 것은 별개의 문제였습니다. 사제가 되기 위해서는 신학대학원에 진학해야 했지만, 여성은 그 과정에서부터 여러 가지 제약을 받았습니다. 여성에게 사제직을 허용하지 않는 교회의 질서는 너무나 오랫동안 유지되어 왔고, 많은 사람에게 그것은 특별히 설명하거나 질문할 필요조차 없는 당연한 일이었습니다. 그런데 저는 그 당연함을 받아들이기 어려웠습니다.",
                    "저에게 여성 사제의 문제는 단순히 제가 원하는 직업을 가질 수 있느냐의 문제가 아니라 제가 믿는 하느님은 어떤 분인가에 관한 문제였습니다. 저는 교회가 저에게 안 된다고 이야기할 때, 오히려 교회에 질문하게 되었습니다.",
                    "-정말 안 되는 것입니까?",
                    "-아니면 우리가 오랫동안 안 된다고 생각해 왔던 것입니까?",
                    "이 두 가지는 전혀 다른 문제입니다. 지금까지 없었다는 사실이 앞으로도 없어야 한다는 뜻은 아닙니다. 다수가 옳다고 믿는 것이 반드시 하느님의 뜻인 것도 아닙니다. 저는 여성 사제의 길을 걸어가면서 이 사실을 배웠습니다. 그리고 그것은 이후 제가 다른 사회적 소수자들을 만나는 데 중요한 신앙적 토대가 되었습니다.",
                    "### 2. 나는 용감한 사람이었을까",
                    "사람들은 때때로 제가 용기가 있었기 때문에 여성 사제가 될 수 있었다고 이야기합니다. 물론 그 과정에서 용기가 필요한 순간들이 있었습니다. 그러나 저는 여성 사제가 되기 위해 걸어온 길을 한 사람의 용기나 의지로만 설명하고 싶지 않습니다.",
                    "저와 함께 신학을 공부하던 여성들이 있었습니다. 그리고 불평등한 교회의 제도에 함께 문제를 제기했던 남성 동료들이 있었습니다. 1998년에는 주교의 추천 없이 신학대학원에 진학할 수 있게 되었습니다. 그런데 또 다른 장벽이 생겼습니다. 남성에게만 허용되는 성직후보자고시였습니다. 그때 불평등한 시험에 응시하지 않겠다고 한 남성 신학생들이 있었습니다. 저에게는 그러한 연대가 매우 중요했습니다.",
                    "한 사람의 소수자가 아무리 옳은 이야기를 하더라도 그 사람이 혼자 모든 장벽을 넘어가기는 어렵습니다. 다수자의 위치에 있는 사람들이 자신들이 누리는 당연한 것들을 질문하기 시작할 때 변화가 일어날 수 있습니다. 여성 사제가 되는 과정에서 제가 경험한 연대는 단순히 저를 지지해 주고 응원해 주는 것이 아니었습니다. 함께 불편해지고, 함께 손해를 감수하며, 함께 다른 교회를 상상하는 것이었습니다. 저는 그것이 연대라고 생각합니다.",
                    "그리고 오늘 성소수자와 교회의 관계를 생각하면서도 그 경험을 떠올립니다. 성소수자에게 교회의 변화를 위해 계속해서 싸우고 설명하고 인내하라고 요구하는 것이 아니라, 비성소수자인 우리도 자신들이 누리는 익숙함과 권리를 함께 돌아볼 수 있는가 하는 질문입니다.",
                    "### 3. 기다리라는 말이 가지고 있는 권력",
                    "주최 측에서 보내 주신 질문 가운데 오래 생각하게 된 질문이 하나 있습니다. 노골적인 반대만큼이나 잠잠히 기다리면 언젠가 허용해 줄 것이라는 태도와 구조가 더 큰 상처가 되지는 않았느냐는 질문이었습니다. 저는 이 질문에서 ‘기다림’이라는 말을 생각해 보게 되었습니다. 교회 안에서는 변화를 이야기할 때 기다림을 강조하는 경우가 많습니다. ‘지금은 아직 때가 아니다’ 이런 말.",
                    "물론 공동체에는 변화에 필요한 시간이 있습니다. 저 역시 지역교회에서 사목하면서 사람들의 생각과 공동체의 문화가 하루아침에 바뀌지 않는다는 것을 잘 알고 있습니다. 그러나 중요한 것은 누가 누구에게 기다리라고 말하고 있는가 하는 것입니다. 기다리라고 말하는 사람과 기다려야 하는 사람이 감당하는 시간의 무게는 같지 않습니다. 이미 사제가 될 수 있는 사람에게 여성 사제의 문제는 교회가 언젠가 해결할 수 있는 제도적 과제일 수 있습니다. 그러나 사제가 되기를 희망하는 여성에게 그것은 자신의 삶에 관한 문제입니다. 그 기다림 속에서 자신의 미래를 계획하기 어렵고, 부르심에 대한 확신마저 흔들릴 수 있습니다.",
                    "더구나 기다리라는 말에는 종종 기다림의 끝을 결정할 권한이 자신들에게 있다는 생각이 전제되어 있습니다. 허용하는 사람이 있고, 허용받아야 하는 사람이 있습니다. 권리를 가진 사람이 있고, 그 권리를 얻기 위해 자신의 존재와 능력을 입증해야 하는 사람이 있습니다.",
                    "저는 성소수자에 대한 교회의 태도도 마찬가지입니다. 성소수자의 존엄을 인정하는 문제를 우리는 언제까지 교회가 준비되기를 기다려야 하는 문제로 남겨 둘 것인가? 변화에 시간이 필요하다는 사실과 누군가의 존엄을 유예하는 것은 구분되어야 한다고 생각합니다.",
                    "### 4. 사제가 된 이후에도 계속되었던 질문",
                    "저는 2005년에 사제 서품을 받았습니다. 그러나 여성 사제가 되었다고 해서 여성 사제에 대한 차별과 편견이 끝난 것은 아니었습니다. 제대 앞에 선 여성 사제의 모습 자체를 낯설게 받아들이는 교인들이 있었고, 여성 사제가 등장한 것을 교회가 잘못되어 가는 징후처럼 이야기하는 사람도 있었습니다.",
                    "그런 말을 들으면서 상처를 받기도 했습니다. 여성 사제라는 제 존재가 누군가에게는 신앙적으로 받아들이기 어려운 것이었습니다. 저라는 사람과 만나 보기도 전에, 제가 어떤 사목을 하는지 알기도 전에, 여성이라는 이유만으로 판단이 이루어지는 경험이었습니다. 제도적으로는 사제가 되었지만 공동체 안에서 사제로 인정받는 문제는 여전히 남아 있었습니다.",
                    "이런 경험은 저에게 사제가 된 이후 어떤 교회를 만들어 갈 것인가에 관한 질문을 남겼습니다. 기존에 남성 사제들이 해 왔던 일을 여성인 나도 똑같이 할 수 있다는 것을 증명하는 데 그칠 것인가? 아니면 여성 사제의 존재를 통해 그동안 당연하게 여겨 왔던 교회의 질서 자체를 새롭게 질문할 것인가? 저는 후자의 길을 가고 싶었습니다.",
                    "## Ⅱ. 소수자의 자리에서 넓어지는 감각",
                    "### 1. 이전에는 보이지 않았던 것들",
                    "여성 사제로 살아온 경험은 제가 교회를 바라보는 시선을 변화시켰습니다. 이전에는 잘 보이지 않았던 것들이 보이기 시작했습니다.",
                    "-교회에서 말할 수 있는 사람은 누구인가",
                    "-교회에서 중요한 결정을 내리는 사람은 누구인가",
                    "-교회에서 보이지 않는 노동을 감당하고 있는 사람은 누구인가",
                    "교회의 차별은 노골적인 혐오의 형태로 나타나는 것은 아닙니다. 아무도 문제라고 생각하지 않는 일상적인 관습 속에서도 차별은 존재할 수 있습니다. 오히려 너무나 자연스럽기 때문에 그것이 차별이라는 사실조차 인식하지 못할 때가 있습니다.",
                    "여성 사제에 대한 문제를 생각하면서 제가 발견한 것도 그러한 구조였습니다. 그리고 여성 문제를 넘어 다른 사회적 소수자들의 삶에 관심을 갖게 되면서, 제가 당연하게 여기고 있는 것들 역시 누군가에게는 배제의 구조가 될 수 있다는 사실을 배우게 되었습니다.",
                    "### 2. 소수자의 자리가 또 다른 소수자를 만나게 하다.",
                    "저는 여성의 삶을 둘러싼 차별에 관심을 갖는 과정에서 다른 사회적 약자와 소수자의 삶에도 관심을 갖게 되었습니다. 그리고 그 관심은 교회의 울타리 밖으로 저를 이끌었습니다. 교회와 다른 종교가 만나고, 신앙인과 비신앙인이 만나고, 서로 다른 사회적 경험을 가진 사람들이 함께 질문하는 자리에서 저는 많은 것을 배웠습니다. 그 과정에서 제가 만나게 된 하느님은 이전에 제가 알고 있던 하느님보다 훨씬 크신 분이었습니다. 저는 하느님께서 교회 안에만 머물러 계시는 분이 아니라 교회가 미처 보지 못했던 사람들의 삶 속에서도 일하고 계신다는 사실을 생각하게 되었습니다.",
                    "저는 동물과 함께하는 전례에도 관심을 가지고 있습니다. 반려동물을 축복하고, 반려동물을 잃은 사람들의 슬픔을 함께 나누는 사목을 하면서 교회가 충분히 관심을 기울이지 못했던 돌봄의 영역을 만나게 되었습니다. 누군가에게는 가족과 같은 존재의 죽음인데, 그 슬픔이 사회나 교회에서 충분히 인정받지 못할 수 있습니다. 그러한 사람들을 만나면서 저는 인간의 슬픔과 관계, 생명과 창조세계에 대한 이해가 더욱 넓어지는 것을 경험하게 되었습니다. 물론 여성의 경험과 성소수자의 경험, 장애인의 경험, 동물과 인간의 관계를 다 같은 동일한 범주로 설명할 수는 없습니다. 각각의 존재가 겪는 배제의 역사와 조건은 서로 다릅니다.",
                    "### 3. 평등은 교회의 주방에서도 시작된다",
                    "제가 사목하는 광명교회는 특정한 사회적 의제나 신학적 지향에 뜻을 같이하는 사람들이 처음부터 모여 만든 교회가 아닙니다. 다양한 연령과 삶의 경험을 가진 사람들이 오랫동안 신앙생활을 해 온 일반적인 지역교회입니다. 교인들의 사회적·정치적 입장도 서로 다르고, 교회를 이해하는 방식도 다릅니다. 저와 생각이 비슷한 교인들만 있는 것은 아닙니다. 그러한 교회에서 제가 지향하는 가치를 공동체의 일상으로 만들어 가는 것은 쉬운 일이 아닙니다. 하지만 바로 그러한 자리에서 일어나는 작은 변화가 저는 소중하다고 생각합니다.",
                    "우리 교회에서도 주일예배 후 식사를 준비하는 일은 주로 여성 교인들의 몫이었습니다. 오랫동안 그렇게 해 왔고, 많은 사람이 그것을 자연스럽게 받아들였습니다. 그런데 여성과 남성이 똑같이 성찬례에 참여하고 똑같이 식사를 하는데, 왜 식사를 준비하는 일은 주로 여성들의 몫이어야 할까요? 저는 남성과 여성, 사제와 평신도가 함께 참여하는 애찬봉사조를 만들었습니다. 처음부터 모든 사람이 반가워한 것은 아니었습니다. 익숙했던 역할과 방식이 변화하는 것을 불편하게 느끼는 사람들도 있었습니다. 그러나 조금씩 함께 음식을 준비하고 식사하고 정리하는 일이 공동체의 일상이 되어 갔습니다.",
                    "우리 교회의 표어는 ‘함께 배우고, 함께 돌보는 교회’입니다. 저에게 함께 배운다는 것은 단순히 성서를 공부하거나 새로운 지식을 얻는 일만을 의미하지 않습니다. 우리가 지금까지 살아온 방식이 모든 사람에게 공평했는지 질문하고, 서로의 삶을 통해 배워 가는 일이기도 합니다. 함께 돌본다는 것도 특정한 사람이 다른 사람을 일방적으로 돌보는 일이 아니라, 서로의 삶이 연결되어 있음을 알아가는 과정이라고 생각합니다. 저는 그러한 지역교회의 작은 변화들 속에서도 하느님의 선교가 이루어질 수 있다고 믿습니다.",
                    "## Ⅲ. 또 다른 소수자를 만나 나의 한계를 발견하다",
                    "### 1. 나는 열린 교회의 사제라고 생각했다",
                    "저는 여성 사제로 살아오면서 차별과 배제의 경험을 했고, 사회적 약자와 소수자들의 인권 문제에 연대해 왔습니다. 그래서 성소수자와 함께하는 교회에 대해서도 비교적 자신이 있었던 것 같습니다. 저는 성소수자라는 이유로 누군가가 교회에서 배제되는 것에 반대했습니다. 성소수자 역시 하느님의 사랑을 받는 존재이며, 누구와도 동등하게 신앙생활을 할 수 있어야 한다고 생각했습니다. 그러던 중 몇 명의 성소수자가 광명교회를 찾아왔습니다. 그들은 저의 활동과 성소수자에 대한 입장을 알고 찾아온 사람들이었습니다.",
                    "저는 그들을 반갑게 맞이했습니다. 그리고 성소수자라는 이유로 특별하게 대할 필요는 없다고 생각했습니다. 다른 교인들과 똑같이 예배하고, 함께 식사하고, 자연스럽게 공동체의 일원이 되면 된다고 생각했습니다. 저에게는 그것이 평등이고 환대라고 생각되었습니다.",
                    "그런데 실제 관계 속에서는 제가 예상하지 못했던 어려움들이 생겼습니다. 저는 때때로 그들의 반응이 예민하다고 느꼈습니다. 어떤 순간에는 공격적이라고 느끼기도 했습니다. 제가 그렇게 느꼈다는 사실이 그들이 실제로 그런 사람들이었다는 뜻은 아닙니다. 그러나 당시 저는 당혹스러웠고 마음의 어려움을 겪었습니다.",
                    "저는 그들과의 관계가 왜 이렇게 어려운지 잘 알지 못했습니다. 성소수자에 대한 차별에 반대하고, 그들을 환영하는 나인데 왜 관계는 이렇게 어려울까 생각했습니다. 그리고 제가 충분히 알지 못하는 사이에 기존 청년 교인들과의 관계에서도 갈등이 생겼습니다. 결국 그들은 교회를 떠났습니다. 저는 그 경험을 통해 성소수자 사목에 대한 제 자신의 준비가 부족했다는 사실을 인정하게 되었습니다. 성소수자 인권을 지지하는 것과 성소수자와 구체적인 관계를 맺으며 함께 신앙생활을 하는 것은 다른 일이었다는 것을요.",
                    "### 2. 소수자인 나는 언제나 소수자의 편에 서 있는가",
                    "저는 이 경험을 여성 사제로 살아온 제 자신의 삶과 연결하여 돌아보게 되었습니다. 여성 사제로 살아오는 동안 저는 다른 사람에게 종종 불편한 사람이었을 것입니다. 당연하게 여겨 왔던 것에 대해 질문하고, 오랫동안 유지되어 온 관습에 문제를 제기하며, 다른 사람들이 아직 준비되지 않았다고 말할 때에도 변화를 요구했기 때문입니다. 저의 그러한 태도를 누군가는 지나치다고 생각했을 수도 있습니다. 예민하다고 생각했을 수도 있고, 공격적이라고 생각했을 수도 있습니다. 그런데 이제 제가 사목하는 교회에서 만난 사람들에게 제가 비슷한 감정을 느꼈다는 사실을 생각하게 되었습니다.",
                    "물론 서로 다른 상황을 단순하게 비교할 수는 없습니다. 제가 경험했던 차별과 그들이 경험했을지 모르는 차별을 동일시할 수도 없습니다. 그러나 적어도 저 자신의 판단을 다시 질문해 볼 수는 있었습니다. 나는 누구의 기준으로 그들의 반응을 이해하고 있었는가? 나는 그동안 나를 평가해 왔던 사람들과 얼마나 다른 방식으로 그들을 만나고 있었는가? 하는 것을요.",
                    "저는 여성 사제로서 교회의 권력구조에 문제를 제기해 왔습니다. 그러나 지금 제가 사목하는 지역교회에서는 공동체의 중요한 결정을 내리는 관할사제입니다. 저의 말과 판단은 다른 교인들의 삶에 영향을 미칩니다. 저는 그 공간에서 권력을 가지고 있는 사람입니다. 그러므로 소수자로 살아온 제 경험만큼이나 제가 지금 어떤 위치에 있는지를 함께 살펴야 했습니다. 제가 차별을 경험한 사람이라는 사실이 저를 차별의 가능성으로부터 자유롭게 해 주지는 않았습니다. 이것은 제게 불편하지만 중요한 발견이었습니다.",
                    "### 3. 허용받고 싶지 않았던 내가 누군가를 허용하는 사람이 되다",
                    "저는 여성 사제가 되는 과정에서 교회가 여성에게 사제직을 허용할 것인가라는 질문 자체에 문제를 느꼈는데요, 성소수자 사목을 돌아보면서 제가 사용하는 언어에도 비슷한 구조가 있는 것은 아닌지 생각하게 되었습니다. 저는 성소수자를 환대하겠다고 이야기했습니다. 물론 그것은 차별과 혐오에 반대하는 의미에서 한 이야기였습니다. 그런데 받아들이는 사람은 누구이고 받아들여지는 사람은 누구라는거지? 환대하는 사람은 누구이고 환대받는 사람은 누구라는거지? 혹시 우리 교회의 주인은 기존 교인들과 사제이고, 성소수자는 우리가 선의를 가지고 맞이하는 손님이라고 생각했던 것은 아닐까? 하는 생각이 든겁니다.",
                    "여성 사제로서 저는 교회가 저를 특별히 허용해 주는 것은 아니라고 생각합니다. 애초에 하느님의 부르심을 받은 사제로서 다른 사제들과 동등한 것입니다. 그렇다면 성소수자 그리스도인 역시 교회의 특별한 허락이나 선의를 기다리는 존재가 아니라, 처음부터 우리와 함께 교회를 이루어 가는 존재로 이해할 수 있어야 하지 않을까요?",
                    "저는 여기에서 제가 걸어온 여성 사제의 길과 성소수자 사목의 경험이 만난다고 생각합니다. 과거에는 제가 경계 바깥에 서서 교회에 문을 열라고 요구하는 사람이었다면, 어느 순간 저는 교회의 문 안쪽에 서 있었던 겁니다.",
                    "### 4. 기다리라는 말을 하는 사람이 된 것은 아닐까",
                    "제가 지역교회의 관할사제로 살아가면서 이제는 공동체의 어려움과 갈등을 함께 감당해야 하는 위치에 서게 되었습니다. 저는 교인들의 생각이 변화하는 데 시간이 걸린다는 사실을 알고 있습니다. 오랫동안 형성된 신앙의 언어와 문화가 쉽게 바뀌지 않는다는 것도 알고 있습니다. 그래서 때로는 사람들이 변화할 수 있도록 기다려 주는 것이 사목이라고 생각합니다.",
                    "그런데 누구를 기다려 주고 있는 것일까요?",
                    "과거에 제가 불편하게 느꼈던 기다리라는 말을, 이제는 제가 다른 사람에게 하고 있는 것은 아닌지 생각하게 되었는데 이 질문 앞에서 쉽게 답을 내리지 못합니다. 지역교회 사목은 서로 다른 사람들을 함께 돌봐야 하는 일이기 때문입니다. 누구 한 사람의 생각으로 공동체 전체가 변화하는 것도 아닙니다. 하지만 우리의 변화가 느리다는 것을 누군가가 계속해서 차별받아야 하는 이유로 만들 수는 없다고 생각합니다. 저에게는 이 사이의 긴장을 어떻게 감당할 것인가 하는 과제가 남아 있습니다.",
                    "### 5. 상처를 주고받는 관계에 대하여",
                    "저는 성소수자와 함께하는 교회를 이야기하면서 실제 관계에서 발생하는 어려움도 이야기할 수 있었으면 좋겠습니다. 성소수자와 비성소수자가 함께하는 공동체라고 해서 모든 관계가 아름답고 평화로운 것은 아닐 것입니다. 서로의 성격이 다르고, 지나온 삶이 다르고, 관계를 맺는 방식도 다릅니다. 누군가에게는 상처를 주려는 의도가 없었지만 다른 누군가에게는 상처가 될 수 있습니다. 그리고 좋은 의도를 가지고 있는 사람도 잘못할 수 있습니다. 저 역시 그랬습니다.",
                    "저는 사목자로서 복잡한 관계를 충분히 이해하고 감당할 준비가 되어 있지 않았습니다. 저와 생각이 비슷한 사람들과 연대하는 일에는 비교적 익숙했지만, 서로 다른 사람들이 함께 살아가는 공동체에서 갈등을 다루는 일은 또 다른 역량을 필요로 했습니다. 그것은 제가 앞으로 더 배우고 싶은 부분입니다. 그리고 혼자서 그 어려움을 감당하기보다는 함께 질문하고 고민할 수 있는 사람들을 만나고 싶습니다. 제가 무지개 숲의 시작을 반갑게 생각하는 이유도 여기에 있습니다.",
                    "## Ⅳ. 낯선 하느님을 만나다",
                    "### 1. 베드로는 이미 하느님을 알고 있던 사람이다",
                    "다시 사도행전 10장의 이야기로 돌아가 보겠습니다. 베드로는 예수님을 따랐던 사람이었고, 예수님의 죽음과 부활을 경험했던 사람이었습니다. 초대교회의 중요한 지도자이기도 했습니다. 그런 베드로에게 하느님께서는 낯선 경험을 하게 하십니다. 하늘에서 내려온 보자기 안에는 베드로가 먹을 수 없다고 여겼던 것들이 들어 있었습니다. 하느님께서는 그것을 먹으라고 하십니다. 그러나 베드로는 거절합니다.",
                    "**자신은 지금까지 부정한 것을 먹어 본 적이 없다는 것입니다. 베드로는 하느님을 잘 섬기기 위해 그 질서를 지켜 왔습니다. 그런데 이제 하느님께서는 그 질서를 넘어가라고 말씀하십니다.**",
                    "하느님을 섬기기 위해 지켜 왔던 질서가 오히려 하느님께서 지금 행하고 계시는 일을 이해하는 데 장벽이 된 것입니다. 그리고 베드로는 이방인 고르넬리오를 만납니다. 그 만남을 통해 자신이 부정하다고 여겨 왔던 경계를 다시 생각하게 됩니다. 이 이야기를 읽으면서 저는 베드로가 어떤 새로운 교리를 배웠다는 사실보다, 베드로가 어떤 새로운 사람을 만났다는 사실에 주목하고 싶습니다. 베드로는 구체적인 사람과의 만남을 통해 하느님을 새롭게 이해하게 되었습니다. 그리고 자신이 복음을 전해야 한다고 생각했던 사람에게서 오히려 하느님의 일하심을 발견했습니다. 하느님은 베드로가 그곳에 도착하기 전부터 이미 고르넬리오와 그의 공동체 안에서 일하고 계셨습니다. 저는 이것이 선교의 중요한 모습이라고 생각합니다.",
                    "### 2. 퀴어는 우리의 감각과 인식을 확장하는 은총인가",
                    "주최 측에서 보내 주신 슬로건이 있습니다. ‘퀴어는 신과 이웃, 나를 향한 우리의 감각과 인식을 확장하는 은총.’ 저는 이 문장을 제 삶의 경험과 연결해 보고 싶습니다. 여성 사제로 살아오는 과정에서 여성의 존재가 교회에 새로운 질문을 던지는 것을 경험했습니다.",
                    "-사제직은 무엇인가?",
                    "-하느님의 부르심은 누구에게 주어지는가?",
                    "-교회의 권위는 어디에서 오는가?",
                    "-우리가 하느님을 이해하고 표현하는 방식은 얼마나 남성 중심적인가?",
                    "이러한 질문들은 여성만을 위한 질문이 아니었습니다. 교회 전체가 자신을 다시 이해하도록 요청하는 질문이었습니다. 성소수자 그리스도인의 존재 역시 교회에 그러한 질문을 던질 수 있다고 생각합니다. 우리는 사랑을 어떻게 이해하고 있는가? 인간의 관계와 가족을 어떻게 이해하고 있는가? 하느님께서 창조하신 다양성을 얼마나 받아들이고 있는가?",
                    "저는 이러한 질문들이 교회의 신앙을 축소하는 질문이 아니라 확장할 수 있는 질문이라고 생각합니다. 다만 한 가지 덧붙이고 싶은 것이 있습니다. 성소수자가 우리에게 은총이라는 말이 성소수자는 교회를 변화시키거나 비성소수자를 교육해야 한다는 또 다른 부담이 되어서는 안 된다고 생각합니다. 성소수자 그리스도인 역시 그저 신앙생활을 하고 싶을 수 있습니다. 누군가에게 무언가를 가르쳐 주지 않아도 되고, 교회의 변화를 위해 특별한 역할을 감당하지 않아도 됩니다. 그 존재가 우리에게 유익하기 때문에 환영받아야 하는 것은 아닙니다. 그 존재 자체가 이미 소중합니다. 그럼에도 우리가 서로 다른 존재와 만나고 함께 살아갈 때 이전에는 알지 못했던 하느님과 이웃과 나 자신을 발견하게 되는 것, 저는 그것을 은총이라고 이야기하고 싶습니다.",
                    "## Ⅴ. 평범한 지역교회에서 꿈꾸는 선교",
                    "### 1. 아직 준비되지 않았지만",
                    "제가 사목하는 광명교회는 소위 말하는 일반교회입니다. 다양한 생각과 역사를 가진 사람들의 모임이죠. 저와 모든 생각을 공유하는 교인들만 있는 것도 아닙니다. 그런 지역교회에서 변화를 만들어 가는 것은 더디고 때로는 힘든 일입니다. 그러나 저는 일반적인 지역교회가 변화하는 일이 중요하다고 생각합니다.",
                    "모든 성소수자 그리스도인이 성소수자에게 우호적인 특별한 교회를 찾아 먼 곳까지 이동해야만 신앙생활을 할 수 있다면, 일반적인 교회는 여전히 변화의 책임으로부터 벗어나 있는 것은 아닐까요? 자신이 살아가는 동네에서, 가족이나 이웃과 함께 살아가는 일상의 공간에서, 자연스럽게 신앙생활을 할 수 있는 교회가 많아지면 좋겠습니다. 저는 그것이 지역교회가 감당할 수 있는 중요한 선교적 역할이라고 생각합니다.",
                    "### 2. 하느님의 사랑을 왜곡하지 않는 공동체",
                    "길찾는교회에서는 ‘지금보다 좀 더 평등하고 안전한 신앙공동체’를 강조한다고 들었습니다. 그 이유는 하느님께서 우리에게 평등하고 안전한 관계로 다가오시는 분이기에, 교회가 그 사랑과 환대를 왜곡하는 통로가 되어서는 안 된다는 것입니다. 저는 그 표현에 공감합니다. 교회는 하느님의 사랑을 사람들에게 전하는 공동체이지만, 때로는 교회가 하느님의 사랑을 가리는 공동체가 될 수도 있기 때문입니다.",
                    "우리는 여전히 부족할 수 있고, 서로에게 상처를 줄 수도 있으며, 미처 발견하지 못한 차별적 구조를 가지고 있을 수 있습니다. 그러나 지금의 모습에 안주하지 않고 조금 더 평등하고 안전한 공동체로 변화해 가겠다는 고백은 매우 중요합니다. 다만 그 ‘조금 더’라는 말이 또 다른 유예의 언어가 되지 않았으면 좋겠습니다. 완벽한 공동체가 되는 데에는 시간이 걸리겠지만, 지금 발생하고 있는 차별이나 상처에 대해서는 지금 응답할 수 있어야 할 것입니다.",
                    "### 3. 퀴어 그리스도인과 동행하는 것이 왜 선교적인가",
                    "저는 선교가 단순히 교인 수를 늘리는 일이라고 생각하지 않습니다. 선교는 하느님께서 이미 세상에서 이루어 가시는 생명과 정의와 평화의 일에 교회가 참여하는 것이라고 생각합니다. 그런 의미에서 성소수자 그리스도인과 함께하는 것은 교회의 여러 특별한 사업 가운데 하나가 아닙니다. 그것은 교회가 복음을 어떻게 이해하고 있는가를 보여 주는 일이기도 합니다.",
                    "예수님께서 만나셨던 사람들 가운데에는 당시의 사회적·종교적 질서 속에서 배제되었던 사람들이 있었습니다. 예수님은 그들의 삶의 자리에서 만나셨고, 그 만남을 통해 당시 사회와 종교가 당연하게 여겼던 경계를 드러내셨습니다. 저는 교회 역시 그러한 만남을 통해 복음의 의미를 새롭게 발견할 수 있다고 생각합니다.",
                    "교회가 성소수자와 함께함으로써 교회가 기존에 보지 못했던 것을 볼 수 있고, 익숙한 신앙의 언어를 다시 생각할 수 있으며, 하느님의 사랑을 더 넓게 이해할 수 있다면 그것은 교회에 주어진 선교적 은총이라고 생각합니다.",
                    "## Ⅵ. 나가며 ― 무지개떡 앞에 선 베드로처럼",
                    "‘너는 이 무지개떡을 받아먹어라.’",
                    "저는 그 말씀을 성소수자라는 존재를 받아들이라는 일방적인 명령으로만 이해하고 싶지 않습니다. 그 만남을 통해 네가 알고 있던 하느님을 더 넓게 이해하라는 말씀으로, 네가 알고 있던 이웃을 새롭게 발견하라는 말씀, 그리고 네가 알고 있던 너 자신도 다시 만나 보라는 말씀으로 듣고 싶습니다.",
                    "저는 그 무지개떡 앞에서 여전히 망설이고 있을지도 모르겠습니다. 그러나 다시 그 떡을 받아먹고 싶습니다. 그리스도의 식탁은 제가 주인이 되어 다른 사람을 초대하는 식탁이 아니라, 저 역시 초대받은 식탁이기 때문입니다. 우리는 함께 초대받은 사람들입니다.",
                    "저는 무지개숲이라는 이름이 참 좋습니다. 숲은 서로 다른 생명들이 각자의 모습으로 살아가면서 함께 이루는 공간이죠. 어느 한 종류의 생명이 숲 전체의 모습을 결정하지 않습니다.",
                    "우리 성공회가 그러한 숲이 되었으면 좋겠습니다. 서로 다른 존재들이 각자의 모습을 잃지 않으면서도 함께 살아가는 교회, 갈등과 어려움 속에서도 서로의 존엄을 포기하지 않는 교회, 그리고 서로의 존재를 통해 우리가 미처 알지 못했던 하느님을 함께 발견하는 교회.",
                    "저는 그런 교회를 여러분과 함께 꿈꾸고 싶습니다. 주님의 식탁에서.",
                    "감사합니다.",
                ]
            },
            {
                date: "2026-11-22",
                title: "왕이신 그리스도는 어디에 계시는가?",
                scripture: "에제 34:11-16,20-24 / 에페 1:15-23 / 마태 25:31-46",
                preacher: "민숙희(마가렛) 사제",
                footnotes: [
                    "1925년 12월 11일 교황 비오 11세의 회칙 『Quas primas』(‘처음에’라는 뜻의 라틴어)로 이 축일이 제정되었습니다.",
                    "에제 34:22의 말씀입니다.",
                    "마태 25:40의 말씀입니다.",
                    "누가 16:19-31의 비유입니다.",
                ],
                paragraphs: [
                    "오늘은 교회력의 마지막 주일인 왕이신 그리스도 주일입니다. 다음 주부터는 대림절이 시작됩니다. 한 해의 교회력을 마무리하면서 우리는 예수 그리스도가 어떤 왕이신지, 그분이 다스리시는 세상은 어떤 세상인지를 생각합니다. 오늘은 왕이신 그리스도를 기념하는 날인데, 예수님은 왕의 권위나 영광을 말씀하시기보다 굶주린 사람, 목마른 사람, 나그네, 병든 사람, 감옥에 갇힌 사람을 이야기하십니다. 우리가 세상에서 보는 왕의 모습과는 많이 다릅니다. 예수님은 왜 왕의 영광을 말씀하시면서 가장 보잘것없는 사람들을 이야기하셨을까요?",
                    "왕이신 그리스도 주일, 이 축일은 초대교회부터 지켜온 오래된 축일이 아닙니다. 1925년 로마 가톨릭교회의 교황 비오 11세가 제정한 축일입니다. 당시는 제1차 세계대전이 끝난 지 불과 7년이 지난 때였고 유럽은 사회적, 정치적으로 혼란을 겪고 있었습니다. 그리고 여러 나라에서 파시즘과 극단적인 민족주의가 성장하고 있었습니다. 사람들은 이런 혼란을 끝내고 자신들을 안전하게 지켜줄 강력한 지도자를 갈망했습니다. 마치 예수 시대처럼 말이죠. 이런 시대에 교황 비오 11세가 그리스도의 왕권을 선포한 것입니다.[^1]",
                    "세상의 왕과 그리스도의 왕권은 무엇이 다른가? 세상의 왕은 더 많은 권력을 소유하고 다른 사람을 지배함으로써 자신의 힘을 드러냅니다. 그러나 **예수님은 전혀 다른 방식으로 자신의 왕권을 보여주셨습니다.** 예수님은 자신의 세력을 과시하거나 다른 사람들을 쳐내려고 군대를 조직하지 않으셨습니다. 왕이지만 왕궁도 없습니다. 그분은 가난한 사람들과 식사하시고, 병든 사람들을 고치시고, 사회에서 배제된 사람들을 찾아가셨습니다. 그리고 마침내 로마 제국의 정치범을 처형하는 십자가에서 죽으셨습니다.",
                    "오늘 제1독서인 에제키엘서는 이러한 그리스도의 왕권을 이해하는 데 도움을 줍니다. 에제키엘 예언자는 기원전 6세기 바빌론 유배 시대에 활동했습니다. 당시 유다 왕국은 바빌론에 패배했고, 예루살렘 성전은 파괴되었으며, 많은 백성이 포로로 끌려갔습니다. 에제키엘서 34장에서 하느님께서는 이스라엘의 목자들, 즉 왕과 지도자들을 책망합니다. 그들은 백성을 돌보아야 했지만 자신들의 부를 늘리는 데만 급급했습니다.",
                    "그런데 제가 오늘따라 주목하는 부분이 있습니다. 하느님께서 살진 양과 여윈 양 사이의 시비를 가리겠다고 하시는 부분입니다. 살진 양들이 약한 양들을 옆구리와 어깨로 밀쳐내고 뿔로 받아 우리 밖으로 쫓아냈기 때문입니다. 에제키엘 34장에서 왕과 지도자를 목자에 비유하셨다면 양은 백성들입니다. 하느님이 보시기에 지도자들에게만 문제가 있었던 것이 아닙니다. 양들 사이에도 힘의 불균형과 억압이 존재했습니다. 힘센 양이 약한 양을 밀어내고, 자신이 차지한 자리를 지키기 위해 다른 양을 쫓아냈습니다. 그러나 하느님께서는 분명히 말씀하십니다. “나는 내 양떼를 구해 주어 다시는 노략질당하지 않게 하리라.”[^2] 우리의 왕은 약한 자가 밀려나지 않게 돌보시는 분이시며, 그 균형을 중요하게 생각하시는 분입니다.",
                    "마태오 복음은 우리의 왕을 어떻게 볼까요? 마태오 복음은 로마 제국의 지배 아래 있던 상황이었습니다. 당시 로마 황제는 제국의 질서와 평화를 보장하는 최고 권력자였습니다. 이 질서와 평화는 작은 자들의 것이 아니라 자신들의 권력과 부를 유지하기 위한 것이죠. **그런데 우리의 왕이 사람들을 심판하는 기준은 로마 황제와는 완전히 다릅니다.** “너희는 내가 굶주렸을 때에 먹을 것을 주었고 목말랐을 때에 마실 것을 주었으며 나그네 되었을 때에 따뜻하게 맞이하였다.” 예수님은 우리에게 굶주린 사람을 먹였는지, 나그네를 환대했는지, 병든 사람을 돌보았는지, 감옥에 갇힌 사람을 찾아갔는지를 물으십니다.",
                    "당시 로마 사회는 신분과 계층의 차이가 분명한 사회였습니다. 가난한 사람, 노예, 병든 사람들은 쉽게 사회의 주변부로 밀려났습니다. 특히 감옥에 갇힌 사람들은 외부의 도움 없이는 기본적인 생활조차 어려운 경우가 많았습니다. 지금처럼 감옥에 있는 사람을 먹여주고 재워주는 것이 아니었습니다. 그런 사람들을 찾아간다는 것은 단순한 동정이 아니었습니다. 사회가 외면하는 사람과 관계를 맺는 일이고 때로는 위험하기도 한 일이었습니다. 예수님은 바로 그 관계 안에 자신이 계셨다고 말씀하시는 것입니다. “너희가 여기 있는 형제 중에 가장 보잘것없는 사람 하나에게 해준 것이 바로 나에게 해준 것이다.”[^3]",
                    "여러분, 신앙생활 열심히 하시죠? 우리는 하느님을 만나기 위해 성전에 나오고, 기도하고, 성찬례에 참여합니다. 물론 이것은 우리 신앙의 중심입니다. 그러나 예수님은 성전 밖에서도 당신을 만날 수 있다고 말씀하십니다. 굶주린 사람에게 음식을 건네는 자리에서, 낯선 사람을 환대하는 자리에서, 병든 사람을 돌보는 자리에서 그리스도를 만날 수 있다는 것입니다. 우리 광명교회는 우리의 왕이 좋아하실 만한 공동체입니다. 우리는 희망터를 통해 이웃을 섬기고 기꺼이 봉사를 하고 있으니 말입니다. 오늘 또 주목해야 할 것은 심판받는 사람들의 반응입니다. 그들은 이렇게 묻습니다. “주님, 주님께서 언제 굶주리고 목마르셨으며, 언제 나그네 되시고 헐벗으셨으며, 또 언제 병드시고 감옥에 갇히셨기에 저희가 모른 체하고 돌보아 드리지 않았다는 말씀입니까?” 그들은 자신들이 무슨 잘못을 했는지 이해하지 못합니다.",
                    "그런데 가만히 보세요. 이 사람들이 심판받는 이유는 특별히 누군가를 공격하거나 해쳤기 때문이 아닙니다. 그들은 굶주린 사람을 보고도 먹을 것을 주지 않았고, 나그네를 맞이하지 않았으며, 병든 사람을 보고도 돌보지 않았던 것입니다. **그들의 문제는 적극적인 폭력만이 아니라 외면과 무관심이었습니다.** 우리는 흔히 남에게 피해를 주지 않고, 나쁜 일을 하지 않으면 괜찮다고 생각하지만 예수님의 가르침은 그것이 아닙니다. 부자와 나자로 이야기에서도 부자는 나자로를 때리거나 쫓아내지 않았습니다.[^4] 오히려 그 당시 문화로 봤을 때 거지를 집 마당에 들이고, 부스러기라도 먹을 것을 내어 주는 것은 좋은 사람으로 생각할 때였습니다. 그런데 부자가 죽어서 벌을 받게 된 죄는 바로 무관심이었죠. 온몸에 종기가 돋아 있는 헐벗은 나자로를 이웃으로 바라보지 않고 그저 무시해도 되는 무가치한 존재로 생각한 그것이 죄가 되었습니다.",
                    "그럼 우리는 어떤 백성이 되어야겠습니까? 오늘 에페소서는 그리스도께서 모든 권세와 세력 위에 계시며, 교회의 머리가 되셨다고 선언합니다. 교회의 머리가 그리스도이시라면, 교회는, 우리는 그리스도의 통치 방식을 삶으로 드러내야 합니다. 그리스도께서 만나주신 사람들을 만나야 하고, 그리스도께서 환대했던 사람들을 우리도 환대해야 합니다. 오늘 본기도에서 우리는 이렇게 기도했습니다. “온 세상에 자유를 주시어 주님의 평화를 누리게 하시고, 주님의 사랑과 통치 안에서 모든 민족이 하나 되게 하소서.” 우리가 기도하는 그리스도의 평화는 힘센 사람이 약한 사람을 억눌러서 얻어내는 것이 아닙니다. 약한 사람을 찾아가 옆에 서고, 그 누구도 밀어내지 않고, 상처 입은 사람을 돌보고, 누구도 버려지지 않도록 깨어 있을 때 이루어지는 평화입니다.",
                    "우리 광명교회가 새로운 성전에서 시작할 삶도 그러하기를 바랍니다. 남들 보기에 멋진 교회가 아니라 누구든 들어와 쉴 수 있는 교회, 가진 자 다수자의 목소리보다 약한 자 소수자의 아픔에 먼저 귀 기울이는 교회가 되기를 바랍니다. 오늘 우리에게 주어진 질문을 다시 한번 마음에 새깁시다. “왕이신 그리스도는 어디에 계시는가?” 예수님께서는 대답하십니다. “너희가 여기 있는 형제 중에 가장 보잘것없는 사람 하나에게 해준 것이 바로 나에게 해준 것이다.” 우리의 왕은 바로 그곳에 계십니다. 그리고 우리를 그곳으로 부르고 계십니다. 그 부르심에 응답하는 우리들이 되기를 주님의 이름으로 축원합니다.",
                ]
            },
            {
                date: "2026-06-14",
                title: "어떻게 믿음의 사람이 되는가?",
                scripture: "창세 18:1-15 / 시편 116 / 로마 5:1-8 / 마태 9:35-10:8",
                preacher: "이남호(사도요한) 사제",
                source: { label: "원문 보기(네이버 블로그)", url: "https://m.blog.naver.com/brave9955/224469215214" },
                footnotes: [
                    "창세 18:14의 말씀입니다. 설교에서는 아브라함과 사라의 불신을 두고 하느님이 하신 말씀으로 인용됩니다.",
                    "‘존나 버티기’를 줄인 은어입니다.",
                    "맹자 『고자 하』 15장의 말을 옮긴 것입니다.",
                ],
                paragraphs: [
                    "성부와 성자와 성령의 이름으로 말씀드립니다. 한 주간 동안 안녕하셨는지요? 제가 사는 항동은 산책하기에 좋은 장소가 두 군데 있는데, 한곳은 푸른 수목원이고 다른 한 곳은 역곡 천변입니다. 저는 푸른 수목원보다는 역곡 천변을 따라 걷기를 좋아했습니다. 광명교회가 이전하는 곳 근처에 바로 역곡 천변이 있습니다. 키 작은 벚꽃나무들이 줄지어 서있는 역곡 천변의 봄 풍경을 강력하게 추천합니다. 최근에는 경작을 하고 있지 않지만 한때 포도밭도 있었고, 또 광명경륜 경기장 쪽으로 내려가면 한 뼘쯤 되는 논에서 벼가 자라는 풍경도 볼 수 있습니다. 5, 6월쯤 되면 세상모르는 새끼 고양이들이 갑자기 길가로 툭 튀어나와 어리둥절 하는 모습이 산책하는 사람들을 웃음 짓게 합니다. 또 6월 중·하순 장마가 시작되면 그 빗줄기 속에서 간간히 밤꽃 냄새가 전해지기도 합니다.",
                    "아직 시간은 남았지만 평소에 산책하던 길을 따라 교회에 온다고 생각하니, 이 또한 무슨 조화인가라는 생각이 들어, 그곳 주민으로서 광명교회가 이전할 지역의 풍경에 대해 소개해 보았습니다. 아무쪼록 교우 여러분께서도 새로운 환경에 주어진 모든 풍경을 마음껏 즐기셨으면 하는 바람뿐입니다.",
                    "2.",
                    "오늘 제 1독서인 창세기는 “야훼께서는 마므레의 상수리나무 곁에서 아브라함에게 나타나셨다.”로 시작됩니다. 세 사람이 아브라함에게 나타났는데, 세 사람 중 한 사람은 하느님이었고 나머지 두 사람은 천사였습니다. 우리가 흔히 아브라함을 믿음의 아버지라고 부릅니다. 그는 하느님과 일대 일의 대화가 가능할 만큼 하느님과 가까운 사람이었습니다. 그러나 그가 처음부터 믿음의 사람은 아니었습니다. 그의 믿음은 우리처럼 삶을 통해 겪게 되는 다사다난한 사건들을 통해 성숙된 것입니다. 하느님이 먼저 아브라함을 선택합니다. 하느님이 아브라함을 선택하신 이유는 그를 통해 큰 민족을 이루고 이름을 떨치며 남에게 복을 베푸는 사람으로 만들기 위해서였습니다. 그때 그의 나이는 75세였으며 사라는 65세였습니다.",
                    "하느님의 말만 믿고 자기의 고향과 친척과 아비의 집을 떠난 여행의 대가는 혹독했습니다. 흉년이 들어 이집트로 갔을 때, 아브라함은 어떠한 상황에서도 자신을 지켜 주시리라는 하느님에 대한 믿음을 잃고, 자신이 살기 위해 사라를 누이 동생이라고 속이는 얕은꾀를 쓰게 됩니다. 아브라함의 말만 믿고 사라를 불러 들었던 이집트 왕은 하느님으로 무서운 재앙을 당하게 됩니다. 이처럼 그는 온전히 하느님을 신뢰하지 않았습니다. 고향을 떠난 지 24년이 지나서 아브라함이 99세가 되던 해, 하느님은 아브라함이 많은 민족과 왕족을 자손으로 배출하는 조상이 될 것이라는 계약을 맺게 됩니다. 그러자 아브라함은 하느님의 이 말씀을 듣고 속으로 웃으면서 “나이 백 살에 아들을 보다니! 사라도 아흔 살이나 되었는데 어떻게 아기를 낳겠는가?”하고 중얼거립니다. 그러면서 아브라함은 “하느님, 좀 무리하지 마시고 그냥 이스마엘이나 하느님께 귀여움을 받고 살게 해주세요.” 라고 청합니다.",
                    "이스마엘은 아브라함과 몸종 하갈 사이에서 태어난 자식이었습니다. 하느님은 당신의 약속을 믿지 않고 ‘그냥 있는 사람한테나 잘하게 해 주세요’ 라고 말하는 아브라함의 현실적이지만 자포자기적인 모습을 염두에 두셨다가 두 명의 천사와 함께 직접 아브라함을 찾으신 것입니다. 아브라함은 이들을 환대하고, 세 사람은 아브라함이 대접한 근사한 요리를 먹습니다. 그리고 그 중한 분인 하느님이 사라가 내년 봄에, 즉 아브라함이 100세가 되던 해에 아들을 낳을 것이라고 전합니다. 그러자 사라가 속으로 웃으며 “내가 이렇게 늙었고 내 남편도 다 늙었는데, 이제 무슨 낙을 다시 보랴.”고 하면서 하느님의 말을 믿지 않았습니다. 그러자 하느님은 두 내외의 불신을 확인하시고 꾸짖게 됩니다. 이처럼 하느님의 말씀을 믿고 고향을 떠난 지 24년이 지난 후에도 아브라함과 사라의 믿음은 온전하지 않았습니다. 그러자 마음이 답답해지신 하느님은 이렇게 말씀하셨습니다. “야훼가 무슨 일인들 못하겠느냐?”[^1]",
                    "**아브라함과 사라뿐만 아니라 우리도 하느님의 바로 이 말씀을 온전하게 받아들이게 되는 순간, 비로소 우리의 믿음이 어느 정도 완숙의 경지에 이르렀다고 말할 수 있는 것입니다.** “야훼 하느님이 무슨 일인들 못하겠느냐?” 이 말씀을 꼭 기억하시기 바랍니다. 사실 이들의 불신앙은 지금 우리들의 모습과 유사합니다. 아브라함과 사라, 그리고 우리들도 온전한 믿음을 위해서는 아직도 가야할 길이 많이 남아 있기 때문입니다.",
                    "3.",
                    "오늘 제 2독서인 로마서는 우리가 믿음의 길을 가는 동안 필연적으로 겪어야 하는 일들에 대해 말하고 있습니다. 우리 역시 아브라함처럼 하느님의 선택에 의해 믿음을 갖게 됩니다. 그러나 우리가 고통과 환난을 당하면서도 기뻐하기까지는 많은 우여곡절이 필요합니다. 먼저 고통이 인내를 낳습니다. 여러분들이 겪었던, 아니면 지금 겪고 있는 여러 고통을 생각해 보십시오. 쉽게 끝나지 않을 것 같은 고통 속에 빠져 허우적거릴 때, 여러분의 마음에 가장 먼저 드는 생각은 무엇입니까? 바로 이 상황을 버텨보자는 마음입니다. 버티기가 바로 인내입니다. 거꾸로 매달아도 국방부 시계는 돌아간다고, 이 또한 지나가리라고, 이처럼 고통은 필연적으로 우리 안에서 인내를 낳습니다. 요즘 젊은 분들이 쓰는 말로는 “존버”라고 합니다.[^2] 그러나 우리가 인내로 견디더라도 그것이 하루 이틀이 아닌 이상 힘이 들 것입니다. 그래서 이제 인내는 우리로 하여금 끈기를 낳게 합니다.",
                    "끈기는 인내를 지속시키는 힘입니다. 이 ‘끈기’를 개신교에서 쓰는 개역성경에서는 ‘연단’, 그리고 표준새번역 성경에는 ‘단련된 인격’, 영어성경에서는 ‘proven character’라고 표현하고 있습니다. **결국 고통과 인내가 우리에게 가져다주는 미덕은 바로 단련된 인격, 검증된 인격인 것입니다.** 이제 고통과 환난 속에서도 망가지지 않고 인격이 단련되어 종국에는 하느님 나라에 대한 희망을 낳게 됩니다. 세상에 대한 번뇌와 욕망으로 가득 찼던 자신의 마음이 비워짐을 깨닫고, 어느덧 자신의 눈이 오롯하게 하느님 나라를 향하고 있음을 알게 됩니다. 그리고 종국에는 이 모든 길을 하느님께서 함께 하셨음을 알게 됩니다.",
                    "우리는 고통이 결국 희망을 낳는 믿음의 역설을 몸소 체득하면서 비로소 ‘하느님은 정말 못하시는 일이 없구나.’라는 온전한 믿음에 이르게 되는 것입니다. 고대 중국의 성현인 맹자도 이와 비슷한 말을 합니다.[^3] “하늘이 장차 어떤 사람에게 큰일을 맡기려 할 때는 반드시 먼저 그 마음과 뜻을 흔들어 고통스럽게 하고 뼈마디가 꺾어지는 고난을 당하게 하며, 그의 몸을 굶주리게도 하고 그 생활을 빈궁에 빠뜨려 하는 일마다 어렵게 한다. 이는 그의 마음을 두들겨서 참을성을 길러주어 지금까지 할 수 없었던 일도 할 수 있게 함이다.” 동서양을 막론하고 인간을 성숙시키는 최고의 방법은 고통, 고난이었던 것입니다. 이처럼 하느님으로부터, 하늘로부터 선택받은 인간은, **인생이라는 대학에서 고난이라는 전공필수 과목을 이수해야 하는 것입니다.**",
                    "4.",
                    "이제 다시 아브라함의 이야기로 돌아가겠습니다. 아브라함과 사라는 하느님이 약속하신대로 100세에 아들을 얻게 되었습니다. “야훼가 무슨 일인들 못하겠느냐?”는 하느님의 말씀이 실감나는 상황이었을 것입니다. 아마 이 일을 계기로 이들의 믿음은 한 차례 성숙했으리라 봅니다. 믿음은 고통을 통해서도, 또 소망을 이루어주시는 하느님 체험을 통해서도 성장하기 때문입니다. 그런데 하느님께서는 난데없이 아브라함에게 이삭을 번제물로 바치라는 무리한 명령을 내립니다. 아브라함은 그 명령을 받들어 이삭과 함께 사흘을 걸어 하느님이 말씀하신 모리아 산에 도착합니다. 아브라함은 모리아 산에 도착하자 이삭에게 장작을 지우고 산에 오릅니다. 그런데 이삭은 자신이 번제물인지도 모르고 천진난만하게 말합니다. “아버지, 불씨도 있고 장작도 있는데, 번제물로 드릴 어린 양은 어디 있습니까?” 아브라함은 번제물은 하느님이 손수 마련하실 거라고 이삭에게 대답합니다. 그리고는 이삭을 묶어 제단 장작더미 위에 올려 놓습니다.",
                    "이삭을 받치라고 한 하느님의 명령을 들은 후부터 이제 이삭을 불사를 그 순간까지 아브라함은 만감이 교차했을 것입니다. ‘무슨 일인들 못하겠느냐고 말하시는 하느님이지만 그래도 이런 일까지 하실 줄은 몰랐다.’라는 원망과 분노부터, ‘당신이 주신 아들, 당신이 가져가신다는데 어찌하랴.’는 체념과 포기까지, 아브라함이 겪었던 갈등은 제3자인 우리가 가늠하기는 어려울 것입니다. 그러나 결국 아브라함이 택한 것은 하느님에 대한 철저한 순종과 믿음이었습니다. 따라서 아브라함이 손에 칼을 잡고 아들을 막 찌르려고 할 때, 천사가 그 아이에게 손을 대지 마라고 외쳤으며, 하느님께서 외아들마저 바친 아브라함의 충심을 치하하는 드라마틱한 해피엔딩이 일어났던 것입니다. 당시 아브라함이 몇 살이었는지 모르지만 75살에 불림을 받고 100살에 이삭을 낳고 또 이삭의 나이가 서른이 훨씬 넘었다고 하니, 아브라함이 온전한 믿음을 갖기 위해서는 물리적으로 최소한 60년이 넘는 시간이 필요했던 것입니다. 참고로 아브라함은 175세에 죽음을 맞이합니다.",
                    "5.",
                    "우리는 오늘 복음에서 이제 막 당신 사역의 초반부를 시작하신 예수님을 만나게 됩니다. 그리고 열두 제자들에게 당신의 권능을 부여하시는 예수님의 모습도 봅니다. 그들은 이제 이스라엘 백성 중의 길 잃은 양들을 찾아 나서게 됩니다. 예수님이 걸어가셔야 할 길은 너무도 명백했습니다. 이제 당신도 역시 고통이 인내를 낳고 인내가 끈기를 낳고 끈기가 희망을 낳는 믿음의 길, 더 쉽게 말하면 맨땅에 헤딩하면서 무에서 유를 창조하는 길을 걸어 당신이 바로 사람이 되신 하느님이심을 증명해야만 했습니다. 제자들 역시 이들을 기다리고 있는 것은 꽃길이 아니었을 것입니다. 그들이 참으로 하느님을 온전하게 신뢰하고 있음을 증명하게 위해 그들 역시 고난의 길을 떠나야 합니다. 그들도 역시 고통이 인내를 낳고 인내가 단련된 인격, 증명된 인격을 낳고 그것이 또 희망을 낳을 수 있음을 보여줘야 하는 길에 들어선 것입니다. 이제 우리도 아브라함처럼, 예수님처럼, 제자들처럼 우리의 영혼을 증명하기 위해 믿음의 길을 떠납니다.",
                    "우리도 우리의 삶을 통해 우리가 하느님의 자녀 됨을 증명해야 합니다. 그리고 그 길은 예외 없이 ‘환난이 인내를 낳고 인내가 연단을 낳고 연단이 희망을 낳는 길’인 것입니다. 제대로 된 신앙인으로 살아가려면 누구도 이 길을 피할 수 없습니다. 만약 이 길을 피하는 신앙인이 있다면 성직자는 가야파나 바리사이파 같은 종교 권력자가 될 것이고, 신자들은 위선자, 흔히 말하는 개독이 될 것입니다. 이제 다시 시작된 연중주일을 맞아, 우리에게 주어진 믿음의 길을 갈 수 있도록 주님의 은총을 청해 봅니다. 성부와 성자와 성령의 이름으로 말씀드렸습니다.",
                ]
            },
            {
                date: "2026-08-09",
                title: "주님이십니까 그러시다면",
                scripture: "열왕상 19:9-18 / 시편 85편 / 로마 10:5-15 / 마태 14:22-33",
                preacher: "이남호(사도요한) 사제",
                source: { label: "원문 보기(네이버 블로그)", url: "https://m.blog.naver.com/brave9955/224408352749" },
                footnotes: [
                    "마태 14:27의 말씀입니다.",
                    "출애 3:14의 말씀입니다.",
                    "아돌프 아이히만은 나치 간부로, 1961년 예루살렘 재판에서 ‘명령에 따랐을 뿐’이라고 주장해 알려졌습니다.",
                    "마태 14:30의 말씀입니다.",
                    "선종(禪宗)의 말로, 『무문관』 제46칙에 나옵니다.",
                ],
                paragraphs: [
                    "성부와 성자와 성령의 이름으로 말씀드립니다. 한 주간 동안 안녕하셨는지요? 끝 모를 폭염이 우리의 일상을 뒤덮었던 최근입니다. 그러나 이러한 폭염 속에서도 이른 아침에는 선선한 바람이 불어와 조금씩 가을이 다가오고 있음을 느낄 수 있습니다. 입추가 지난 8월 7일이었으니 9월 23일 추분이 되면 본격적인 가을이 시작되리라 봅니다. 이처럼 자연은 어김없는 순환을 통해 우리의 믿음에 대해 답을 하지만, 반면 세상은 그렇지 못한 것 같습니다. 민초의 바람과는 달리 점점 더 꼬이기만 하는 정치, 경제적 현실이 모두의 마음을 무겁게 합니다. 어쩌면 이러한 현실을 돌파하기 위해 주님에 대한 믿음이 더 필요한 때는 아닌가라는 생각이 들기도 합니다. 오늘 복음은 우리가 어떠한 존재이며 어떻게 굳건한 믿음을 얻을 수 있는가에 대해 말하고 있습니다. 아무쪼록 흔들림 없는 믿음의 길을 가는 저와 여러분이 되기를 기도합니다.",
                    "2.",
                    "오늘 복음은 예수께서 급히 제자들을 재촉하여 배를 태워 건너편으로 먼저 가게 하시고 당신께서는 홀로 기도하려고 산으로 오르셨다는 말씀으로부터 시작됩니다. 예수께서 제자들과 군중들을 빨리 흩어 버리신 이유는 지난 주 복음에서 보듯이 수천 명의 장정들을 대상으로 오병이어의 기적을 베푸신 것에 대한 후유증을 최소화하기 위해서였을 것입니다. 예수님은 군중들의 당신에 대한 기대와 열광을 빨리 가라앉히고자 하셨습니다. 즉 지금 당신에게 필요한 것은 아버지 하느님 앞에서 홀로 있음이었고, 군중들에게 필요한 것은 흥분에서 벗어나 일상으로 돌아가는 일이라는 판단아래 기도를 드리려고 홀로 산에 오르신 것입니다. 예수께서 이처럼 평화로운 자기 정화의 시간을 보내는 반면 산 아래에서는 매우 혼란스러운 상황이 펼쳐지고 있었습니다. 그 이유는 제자들이 타고 있던 배가 역풍을 만나 새벽 네 시까지 시달리고 있었기 때문입니다.",
                    "아마도 이러한 상황을 예측하신 예수님은 물위를 걸어서 제자들의 배로 다가섭니다. 그렇지 않아도 풍랑에 시달려 혼비백산한 제자들은 설상가상으로 물 위로 사람이 걸어오는 모습마저 보자 새파랗게 질리고 맙니다. 일종의 오컬트 영화의 한 장면이 제자들 앞에 펼쳐진 것입니다. 그때 예수께서 제자들에게 이렇게 말씀하십니다. “나다. 안심하여라. 겁낼 것 없다.”[^1] 출애굽기에서 모세가 하느님께 누구시냐고 물을 때 하느님은 “나는 나다”라고 대답하셨습니다.[^2] 예수님이 “나다”라고 말씀하신 이유는 당신이 하느님과 같은 존재라는 의미였습니다. 내가 자연을 다스리는 하느님이어서 곧 풍랑을 잠재울 것이니, 더 이상 두려움에 떨고 있을 필요가 없다고 제자들을 안심시키는 말씀인 것입니다. 오늘 1독서인 열왕기상에도 이와 비슷한 장면이 등장합니다. 오늘 1독서에는 매우 어려운 처지에 놓인 엘리야가 등장합니다.",
                    "이세벨 왕후의 비호를 받던 바알의 모든 예언자들을 몰살시켰기 때문에, 엘리야는 이세벨 왕후로부터 죽음의 위협에 놓이게 됩니다. 엘리야는 고향을 떠나 은신처를 찾아 시나이 산을 향해 가면서, 자신의 모든 행위가 야훼 하느님과의 교감을 통해 일어난 일임을 입증받기를 원했습니다. 하느님에 의해 원기를 회복한 엘리야는 오늘 1독서에서 보듯이 밤을 지내기 위해 한 동굴 앞에 이르게 되고, 하느님의 목소리를 듣게 됩니다. “앞으로 나가서 야훼 앞에 있는 산 위에 서 있거라.” 그러자 야훼께서 지나가시면서 바위를 산산조각 내는 바람, 지진, 불길 등의 기적을 통하여 막강한 당신의 힘을 보이십니다. 이제 제자들과 엘리야, 그리고 우리들은 풍랑을 잠재울 수 있는 예수님의 전능함과 바위를 산산조각 내는 바람, 지진, 불길 등의 기적을 행하시는 하느님을 믿고 받아들이기만 하면 됩니다. 그러나 오늘 복음은 여기서 한 발짝 더 나아가 베드로라는 인물을 등장시켜 그 기적을 자신의 것으로 만들고자하는 인간의 욕망에 대해 말하고 있습니다. “나도 예수님처럼 기적을 일으키고 싶다.” 이것이 인간의 속마음일 것입니다.",
                    "3.",
                    "베드로는 예수님의 등장으로 인해 모든 사태의 종료를 앞둔 시점에서 뜬금없이 예수님께 이렇게 말합니다. “주님이십니까? 그러시다면 저더러 물 위로 걸어오라고 하십시오.” 제가 만약 예수님이었다면 베드로의 이 말이 저의 신경을 거슬리게 했을 거라는 확신이 듭니다. 베드로는 예수님이 풍랑을 잠재우는 것을 보았습니다. 그런데 또 “주님이십니까? 그러시다면” 이라고 질문합니다. 이것은 마치 방금 해트트릭을 이뤄낸 축구선수 메시에게 “당신이 메시입니까? 자 이제 당신의 현란한 기술을 보여주시오.”라고 말하는 것과 다르지 않기 때문입니다. 베드로는 자명한 것에 대한 의심을 지니고 있었던 것입니다. 베드로는 중력의 법칙을 거스를 수 있는 유일한 존재는 그 법칙을 만든 하느님이심을 물위를 걸어오는 예수님을 통해 확인했지만, 그럼에도 불구하고 베드로가 이렇게 질문한다는 것은, 그가 실상은 아주 의심이 많고 신중한 사람임을 보여주는 증거이기 때문입니다. 베드로는 예수께서 잡혀가실 때 칼을 휘둘러 당신을 잡으러 온 병사의 귀를 자를 정도로 공격적인 사람이었습니다.",
                    "그러나 예수님이 잡혀가신 후 당신과 같이 있었던 사람을 색출할 때 베드로는 예수님을 모른다고 세 번이나 부인했습니다. 그렇게 용감하게 칼을 휘두르던 사람이 겁에 질려 세 번씩이나 예수님을 모른다고 하다니, 어쩐지 베드로의 성격에는 일관성이 없는 것 같이 보입니다. 만약에 저라면 “그렇다. 나도 거기에 있었으니 잡아가라.”고 했을 것 같기 때문입니다. 믿고 의지할 존재가 있다면 누구보다도 강해지지만 그 존재가 사라진다면 그 누구보다도 비열하고 약해질 수 있는 인간이 바로 베드로입니다. 더불어 스스로가 누구보다도 예수님을 믿고 있다고 생각하는 순간에도 불현 듯 상대방에 대해 의심을 드러내는 존재가 베드로인 것입니다. 우리는 주위에서 베드로와 유사한 사람들을 많이 접하게 됩니다. 혼자서는 절대 하지 못하나 힘 있는 무리에 의존해서 약자를 괴롭히는 일에 참여합니다. 그리고 항상 빠져나갈 구멍을 만들어 놓고 혹시 책임 소재가 따르게 되면 재빨리 발을 뺍니다.",
                    "이런 부류의 인간들이 신앙의 힘으로 인해 베드로처럼 거룩한 존재가 되지 못한다면, 가스실에서 유대인들을 죽인 것은 오직 히틀러의 명령 때문이었고 군인은 명령을 따를 명예가 있었다고 강변했던 나치의 전범 아이히만의 수준까지[^3] 떨어질 수 있는 사람들인 것입니다.",
                    "4.",
                    "배에서 내린 베드로는 물위를 밟고 예수님께 나아갑니다. 그러다가 거센 바람을 보자 그만 무서운 생각이 들어 물에 빠지게 됩니다. 베드로의 실패는 베드로가 예수님께 던진 질문, “주님이십니까? 그러시다면 저더러 물 위로 걸어오라고 하십시오.”의 ‘그러시다면’에 이미 내포되어 있었습니다. 다행히 베드로는 물에 빠져 죽게 된 순간에는 너무 급했던지 ‘그러시다면’이라는 말을 하지 않습니다. 그는 “주님이시라면 살려주십시오.”가 아니라 “주님, 살려 주십시오.”[^4]라고 비명을 질렀습니다. 베드로가 예수님의 수제자이며 교회의 반석이 된 까닭은 그가 너무 나약하고 의심이 많아서 하느님을 필요로 할 수밖에 없는 인간이었기 때문입니다. 이처럼 하느님을 믿는다고 하면서도 그 대상에 대해 끊임없이 의심을 품는 존재가 바로 인간입니다. 그렇다고 해서 자신이 의존하는 존재를 과감하게 끊어버릴 수도 없는 것도 또한 인간인 것입니다.",
                    "**자신이 주님을 믿고 있다고 믿는 순간에는 물위도 걸을 수 있지만, 자신이 주님을 의심하는 순간에는 여지없이 물에 빠지는 것이 우리 인간들입니다.** **베드로는 우리들의 자화상인 것입니다.** 한편 물위를 걷다가 또 물에 빠지다가를 거듭해야 하는 것이 우리의 신앙이기도 합니다. 그 누구도 물에 빠지지 않은 채 믿음을 지속시킬 수 없습니다. 그렇게 확신하는 사람일수록 또 물에 빠지고 맙니다. 그래서 예수님이 우리에게 “왜 의심을 품었느냐? 그렇게도 믿음이 약하냐?”고 물어 보신다면 우리의 대답은 그저 “입이 열 개 있어도 할 말이 없습니다.” 정도일 것입니다. 그럼에도 불구하고 베드로가 우리에게 보여준 귀감이 될 만한 행동은 폭풍우 속에서 배에 안주했던 것이 아니라 기꺼이 자신의 믿음을 시험에 보려고 했던 도전정신이었습니다.",
                    "이처럼 신앙은 독립과 의존, 안주와 도전, 신뢰와 불신 그 사이 어느 곳에 자리 잡고 있습니다. 불교에 이런 말이 있습니다. “백척간두 진일보, 시방세계 현전신”[^5] 백척간두, 즉 백 자나 되는 높은 장대 위에 올라섰다는 것은 더할 수 없이 어렵고 위태로운 지경을 의미합니다. 거기서 한발만 내디디면 천길 아래로 떨어지는 것이 당연한 이치입니다. 그러나 이것은 인간의 생각일 뿐입니다. 불교에서는 우리가 백척간두에서 진일보하면 새로운 세계가 눈앞에 펼쳐진다고 말합니다. 우리의 믿음도 마찬가지입니다. 백척간두에서 한 발짝을 내디디면 떨어져 죽을 것 같지만, **그 순간에 하느님의 보이지 않는 손이 우리를 새로운 세계로 인도할 수 있다는 것**, 이것이 오늘 베드로의 에피소드가 말하고자 하는 바인 것입니다. 베드로는 이러한 시도를 통해 자신의 의심을 줄이고 믿음을 더하는 인간으로 거듭났을 것입니다.",
                    "어쨌거나 베드로는 물위를 걸을 수 있었던 최초이자 최후의 인간이라는 타이틀을 갖게 되었습니다. 우리도 가끔은 베드로처럼 주님에게 물위를 걷게 해달라고 부탁할 필요가 있습니다. 주님이 우리가 물위를 걷게 해 주실 수 있는 분이라는 믿음이 있다면 우리는 물위를 걷게 될 것입니다. 의심에 의심을 거듭했지만 그래서 예수님의 손길을 끌어낸 베드로의 시도가 때로는 신앙의 성장에 있어서 좋은 계기가 될 수 있습니다. 이를 깊이 묵상해보는 저와 여러분이 되기를 주님의 이름으로 기원합니다. 성부와 성자와 성령의 이름으로 말씀드렸습니다.",
                ]
            },
            {
                date: "2026-07-12",
                title: "하느님의 섭리를 돌아보는 맥추절",
                scripture: "신명 8:1-4 / 시편 119편 / 히브 11:32-40 / 마태 6:25-34",
                preacher: "이남호(사도요한) 사제",
                source: { label: "원문 보기(네이버 블로그)", url: "https://m.blog.naver.com/brave9955/224408350387" },
                footnotes: [
                    "출애 23:16은 일 년 중 처음 거두는 곡식을 하느님께 바치는 절기, 곧 맥추절을 말합니다.",
                    "보릿고개는 식량이 떨어진 봄철의 어려운 시기를 가리키는 말로, 1960~70년대까지 쓰였습니다.",
                    "신명 8:3의 말씀으로, 예수님도 마태 4:4에서 이 말씀을 인용하셨습니다.",
                ],
                paragraphs: [
                    "성부와 성자와 성령의 이름으로 말씀드립니다. 한 주간 동안 안녕하셨는지요? 결국 장마 시즌에 들어서긴 했지만 올해 여름의 시작은 비교적 선선했던 편이었습니다. 오늘은 성공회에서 공식적으로 지키는 맥추감사주일입니다. 보리를 추수하게 됨을 감사하는 날인 것입니다. 세계적으로 맥추감사주일을 지키는 교회는 대한민국이 유일하다고 합니다. 아마도 맥추감사주일이 한국의 문화에 맞춰 탄생했기 때문이 아닐까 합니다. 대자연의 흐름 속에서 지금이 보리 수확의 시기임을 기억해내는 것도 의미가 있으리라 봅니다. 개인적으로는 고양이들을 키우다보니 보리는 제게 친숙한 식물이 되었습니다. 우리는 말도 안 되는 소리를 들으면 “무슨 개가 풀 뜯어먹는 소리하냐?”라고 합니다. 개를 키워본 저로서는 산책 중에 개가 풀을 뜯어먹는 모습을 본 적이 없는 것 같습니다. 그래서 고양이도 그러려니 했는데 웬 걸, 이 친구들은 풀 종류를 매우 좋아하는 것이었습니다.",
                    "지금은 목포 인근의 넓은 마당이 있는 집에 살아서, 동네 길고양이들에게 안식처를 제공하는 부천교회 교우 분이 계시는데, 그 분이 고양이들을 주라고 보리 씨앗을 보내준 적이 있습니다. 사실 저희 고양이들도 그분으로부터 입양했습니다. 그래서 저는 씨앗을 작은 화분에 심었는데, 보리가 자라면 고양이들이 틈틈이 뜯어 먹는 것이었습니다. 저는 그 모습이 너무 귀여워 한동안 보리를 키웠던 적이 있었습니다. 지금은 쿠팡에서 아직 싹이 트지 않은 캔에 담긴 캣닢 씨앗을 사서 키우는 것으로 대신하고 있습니다. 저는 보리들의 곧게 자라는 모습과 눈부시게 푸른 빛깔이 무척이나 아름답다고 생각했습니다. 눈의 피로를 푸는데 안성맞춤인 식물이었습니다. 그래서 지난번에 있었던 작은 상가 교회에서도 보리를 키워 볼까하여 화분에 씨앗을 심었던 적이 있습니다. 그러나 안타깝게도 아침에만 볕이 드는 동향이어서 그런지, 보리는 잘 자라지 못했습니다.",
                    "저는 햇빛을 받기 위해 일제히 창 쪽으로 몸을 구부리고 자라나는 보리들에 대해 측은함을 느꼈습니다. 아마도 이것은 제가 태어나서 처음으로 식물에 대해 안타까움을 느꼈던 사건일 것입니다. “보리도 살기 위해 안간힘을 쓰면서 햇빛을 향하는구나.” 보리도 태어났으니 알곡을 맺고자하는 목적을 이루려고 하겠지만, 결국 그 소명을 이루지 못하고 하나 둘씩 시들어 죽고 말았습니다. 곧고 푸르게 자라는 보리를 보고자하는 제 욕심 때문에 보리에게 몹쓸 짓을 하고 있는 것은 아닌가하는 생각이 들어 더 이상 심지 않게 되었습니다.",
                    "2.",
                    "아시다시피 보리는 양력 11월에 씨를 뿌려서 이맘때쯤 수확합니다. 쉽게 말하면 본격적으로 추위가 시작되는 겨울에 씨를 뿌려서 한여름이 되기 전에 수확하는 식물인 것입니다. 모든 식물들이 활동을 정지하고 동면을 청하는 시기에 보리 씨앗은 뿌려지고, 이제 막 모내기로 벼가 논에 자리를 잡는 시기에 보리는 수확됩니다. 그래서 출애굽기 23장 16절에 보면[^1], 일 년 중에 가장 먼저 나는 곡식인 보리를 하느님께 바치라는 말씀이 있습니다. 그리고 이러한 성서의 말씀을 절기로 만든 것이 맥추절, 맥추감사주일입니다. 확실히 보리는 벼와는 다른 성장 사이클을 가지고 있습니다. 어쩌면 하느님이 벼와 보리를 서로 다른 시기에 수확하게 해서 사람들의 배를 곯게 하지 않으려는 뜻이 있었는지 모릅니다. 우리가 아는 용어 중에 보릿고개라는 말이 있습니다.[^2] 또 “같은 거지라도 봄 거지 보다는 가을 거지가 낫다”는 말도 있습니다.",
                    "곳간에서 인심난다고, 가을은 수확을 한 후여서 그래도 사람들의 인심이 후한데, 겨울을 지내는 동안 먹을 것이 떨어져, 없는 사람은 더 힘들여져 봄 거지는 굶어죽기 딱 좋았다고 합니다. 이에 사람들은 풀뿌리와 나무껍질을 삶아 먹으면서 보리 수확을 기다립니다. 따라서 보릿고개는 지난해 수확했던 곡식이 다 떨어지고 곡식인 보리가 나오기 전인, 양력으로 대략 4, 5월을 말합니다. 꽃은 사방에 흐드러지게 피는 그 때가 아이러니하게도 가장 배를 곯아야 하는 보릿고개의 시기인 것입니다. 현재 보릿고개라는 말은 좀 더 의미가 확장되어서 경제적으로 어려운 시기를 말하는 용어가 되었습니다. 지금의 대한민국이 그런 시기는 아닐까요? 또한 옛 사람들이 인간의 삶의 패턴을 두 가지 방식, 즉 쌀과 보리의 생장주기에 비유해서 말한 경우도 있었습니다. 벼는 기후에 따라 봄에 씨앗을 뿌리고 초여름에 모내기를 해서 가을에 추수하게 됩니다. 이후 사람들은 거두어들인 곡식으로 겨울을 지내게 됩니다.",
                    "이것이 자연의 순리에 따라 사는 보편적인 삶의 방식일 것입니다. 쌀의 생장주기를 따라 사는 방식은 순탄한 삶이며 대부분의 사람들이 추구하는 삶의 방식이기도 합니다. 학교에서 배운 것을 바탕으로 직장에 들어가고 결혼을 하고 아이를 낳고 키우다가 퇴직해서 여생을 살아가는 것, 즉 때에 맞는 방식으로 사는 것, 이것을 농사에 비유한다면 쌀농사이고 아마도 모든 부모들이 자녀에게 바라는 삶일 것입니다. 저의 많은 친구들이 작년과 재작년에 정년퇴직을 했습니다. 그 친구들은 쌀의 생장주기를 닮았습니다. 무난하게 직장을 마쳤으며 또 무리한 일을 벌이지도 않았고, 급여는 적지만 나이에 맞는 일을 찾아 퇴직 후에도 크게 불안해하지 않고 살아갑니다. 반면 보리농사는 겨울이 다가올 무렵에 씨를 뿌립니다. 어떻게 보면 자연의 순리에 역행하는 듯이 보입니다. 추운 겨울바람을 맞고 봄에 이삭을 만들어 초여름에 추수를 하기 때문입니다.",
                    "확실히 쌀과는 다른 사이클을 지니고 있습니다. 이제 쌀과 보리를 실제 우리의 인생과 비유해서 말해보겠습니다. 만약 우리가 봄에 지은 쌀농사가 실패로 돌아간다면 다행스럽게도 우리에게는 가을에 보리를 파종할 수 있는 한 번의 기회가 더 있다는 것입니다. 그래서 인생의 초반에 실패하고 후반부에 결실을 맺는 부류들을 옛적에는 보리농사에 비유하곤 했던 것입니다. **이처럼 삶에는 자연의 순리에 따라 최소한 두 번의 기회가 주어집니다.** 이 비유는 제가 살아온 과정을 잘 설명해줘서 위로가 됩니다. 아시다시피 저는 36살에 모든 것을 접고 성공회대학교 신학과 3학년에 편입했습니다. 냉정하게 말하면 저는 보편적 순리인 쌀농사에는 실패한 사람이라는 것입니다. 제가 보리의 삶을 살고 있다면 지금 어디쯤일까를 생각해 봅니다. 객관적인 시간표나 나이에 상관없이 더 해야 할 일이 남아 있으며 추수까지는 시간이 더 걸릴 거라는 예감이 듭니다. 자신의 쌀농사가 실패로 돌아가고 이제는 보리농사에 모든 것을 걸 수밖에 없는 분들에게 큰 응원을 보내는 바입니다. 아무쪼록 지치지 말고 파이팅하시기 바랍니다.",
                    "3.",
                    "오늘 마태오복음은 하느님께서 세상을 어떠한 원리로 움직이고 계시는가에 대해 말하고 있습니다. 공중의 새들은 씨를 뿌리고 거두고 저장하지 않아도 하느님께서 먹여 살리십니다. 들판의 꽃들은 수고도 하지 않고 길쌈을 하지 않아도 솔로몬이 입은 옷보다 더 화려하게 피어납니다. 우리는 익히 자연의 관찰을 통하여 하느님께서 당신의 섭리를 어떻게 펼쳐내시는지 알고 있습니다. 하느님은 목숨이 음식보다 더 중하고 몸이 옷보다 소중하다고 강조하십니다. 그러나 공중의 새들과 오늘 피었다가 내일 아궁이로 들어갈 들꽃보다 더 귀한 존재인 인간은, 불행하게도 이 섭리를 깨우치지 못하고 무엇을 먹고 마시며 살아갈까, 또 몸에는 무엇을 걸칠까하고 걱정하면서 살아갑니다. 인간이 동물이나 식물과 다른 핵심적인 이유는 지성이 있기 때문입니다. 하느님의 모습과 가장 닮은 점이 바로 인간이 지니고 있는 지성입니다. 인간은 지성이 있기 때문에 신체적 열세에도 불구하고 만물의 영장이 되었습니다.",
                    "또 지성을 사용하여 주어진 환경에 만족하지 않고 자신들의 삶을 확장해 나갔습니다. 그러나 모든 것에는 순기능과 역기능이 있습니다. 지성의 역기능 중의 하나는 인간으로 하여금 불행한 상상력을 발휘하게 한다는 것입니다. 오늘 아무 걱정 없이 살아가는 사람들의 머릿속에 불현듯 “내가 누리는 모든 것이 내일 갑자기 사라지고 만다면?”이라는 불안이 찾아옵니다. 이제 인간은 다가오지도 않은 미래의 공포에 대비하기 위해 물건을 쌓아둡니다. 지금하지 않아도 될 걱정을 당겨서 하는 것입니다. 나의 곳간에서 썩어 문드러질 지언정, 미래에 대한 불안 때문에 나누는 삶을 잃어버리고 맙니다. **베풀면 다시 돌아온다는 하느님의 섭리를 믿지 못하게 되는 것입니다.** 예수님은 이런 부류의 사람들을 이방인이라고 규정 했습니다. 이방인은 하느님의 섭리와 규범을 받아들이지 못하는 사람들을 통칭하는 개념인 것입니다. 그러나 이방인들만 그럴까요? 우리 역시 모든 것을 하느님께 맡기기에는 믿음이 약한 사람일지도 모릅니다.",
                    "그래서 예수님은 우리에게 명확한 지침을 주십니다. “너희는 먼저 하느님의 나라와 하느님께서 의롭게 여기시는 것을 구하여라. 그러면 이 모든 것도 곁들여 받게 될 것이다.” 오늘 1독서인 신명기는 “사람이 빵만으로는 살지 못하고 야훼의 입에서 떨어지는 말씀을 따라 산다는 것을 가르쳐 주기 위해”[^3] 사십년의 광야생활이 있었다고 말합니다. 2독서인 히브리서는 이 세상이 살만한 곳이 못된다고 생각할 정도로 고난을 당했던 사람들조차, 하느님의 의가 무엇보다도 앞선다고 믿었기에, 하느님으로부터 인정을 받았다고 말합니다. 그러나 그들보다 더 사랑을 받는 우리들은, 하느님으로부터 약속된 것까지 받게 될 것이라고 말합니다. 그 약속이란 바로 예수 그리스도를 통한 구원인 것입니다. **먼저 하느님의 나라와 의를 구하는 가장 쉬운 방법은** 들에 자라는 벼와 보리처럼, 들판의 꽃이나 공중의 새처럼 하느님의 섭리를 온전하게 받아들이는 것입니다. 우리가 하느님의 섭리가 녹아든 자연을 귀감으로 삼고 우리도 자연의 일부라고 생각한다면, 우리와 하느님 사이의 거리가 좁혀질 것입니다.",
                    "이후 그리스도를 온전하게 의지한다면 어느덧 우리는 의인이 되어 있을 것입니다. 오늘 맥추감사주일을 통해 자연을 주재하시는 하느님의 섭리를 더욱 깊이 묵상하는 광명교회 교우 여러분이 되시기를 주님의 이름으로 기원합니다. 성부와 성자와 성령의 이름으로 말씀드렸습니다.",
                ]
            },
            {
                date: "2026-05-31",
                title: "우리 안에서의 삼위의 움직임",
                scripture: "창세 1:1-2:4상 / 시편 8 / 2고린 13:11-13 / 마태 28:16-22",
                preacher: "이남호(사도요한) 사제",
                source: { label: "원문 보기(네이버 블로그)", url: "https://m.blog.naver.com/brave9955/224301998494" },
                footnotes: [
                    "요한 1:1-3의 말씀입니다.",
                    "창세 1:26의 말씀입니다. 이 ‘우리’를 삼위일체와 연결하는 해석은 교회 전통의 한 해석이며, 다른 해석도 있습니다.",
                    "사도 1:3-9(승천)과 2:1-4(오순절 성령 강림)를 가리킵니다.",
                    "플라톤 『국가』에 나오는 영혼의 세 부분(이성·기개·욕망) 이론을 가리킵니다. 지성·의지·감정에 대응시키는 것은 설교자의 비유입니다.",
                ],
                paragraphs: [
                    "성부와 성자와 성령의 이름으로 말씀드립니다. 한 주간 동안 안녕하셨는지요? 오늘은 삼위일체대축일입니다. 삼위일체이신 성부와 성자와 성령의 은총이 광명교회 교우 분들과 함께 하시길 기도합니다. 오늘은 삼위일체에 대한 비유 한 가지와 제가 체험한 삼위일체에 대해 전달함으로써 설교를 마치고자 합니다. 먼저 우리가 주목해야 할 것은 제 1독서인 창세기입니다. 창세기는 영어로 genesis, 생성, 발생, 근원을 뜻합니다. 오늘 독서에서 하느님은 당신이 세상의 모든 것의 근원임을 밝히고 있습니다. 요한복음 1장에서 “말씀은 한 처음 천지가 창조되기 전부터[^1] 하느님과 함께 계셨다. 모든 것은 말씀을 통하여 생겨났고 이 말씀 없이 생겨난 것은 하나도 없다.”고 한 것처럼 말씀은 창조의 근원이었습니다. “빛이 생겨라!”는 말씀으로 시작된 하느님의 창조는, “우리 모습을 닮은 사람을 만들자![^2] 그래서 바다의 고기와 공중의 새, 또 집짐승과 모든 들짐승과 땅 위를 기어 다니는 모든 길짐승을 다스리게 하자!”는 인간의 창조에서 절정에 이릅니다.",
                    "여기서 주목해야 할 부분은 바로 ‘우리 모습’이라는 표현입니다. “나의 모습을 닮은 사람을 만들자”가 아니라 “우리모습을 닮은 사람을 만들자!” 라는 대목이 바로 하느님의 삼위일체성을 내포한다고 주장하는 학자들도 있습니다. 우리라는 표현은 이미 창세 이전부터 성부와 성자, 성령이 함께 하심을 말하고 있는 것입니다. 먼저 우리가 구약성서 전반을 통해 접할 수 있는 존재는 대체로 성부하느님입니다. 모세로부터 비롯된 유대교 신앙의 핵심은 하느님께서 사람들과 함께 계신다는 것이었습니다. 이처럼 우리는 시간적으로 가장 먼저 성부하느님을 알게 됩니다. 그리고 다음에 우리 가운데 예수님이 탄생하셨습니다. 말씀이 사람이 되시어 우리 가운데 계신 예수님은 순서상 우리가 두 번째로 접하는 성자하느님이십니다. 마지막으로 예수께서 승천하신 후 십일 후에[^3] 우리에게 협조자로 보내주신 성령하느님이 계십니다. 하느님은 한분이지만 당신은 이처럼 당신 자신에 대한 계시를 시간적인 순서를 따라 우리에게 알려주셨습니다. 과연 한분이지만 세 위격을 가진 존재를 어떻게 이해해야 할까요?",
                    "제 나름대로 하나이면서 셋일 수 있는 현상을 들어 설명해 보도록 하겠습니다. 참고로 이것은 정말 제가 독창적으로 생각해낸 비유입니다. 저는 이 비유를 생각해내고 무척 뿌듯해 했습니다. 이제 그 비유를 설명드리겠습니다. 인간에게는 마음, 소위 마인드로 불리는 것이 있습니다. 그런데 보통 이 마인드는 세 가지로 구성되어 있다고 합니다. 바로 그리스의 플라톤으로부터 내려오는 영혼 삼분설입니다.[^4] 마인드, 즉 마음의 세 가지 구성 요소는 지성, 의지, 감정입니다. 풀이하자면 지성은 생각하는 마음이고, 의지는 뜻하는 마음입니다. 그리고 감정은 느끼는 마음입니다. 이 세 가지는 하나의 마음이지만 각각의 성격은 다릅니다. 이 세 가지는 우리 안에서 한꺼번에 움직이지만, 때로는 지성이 주도권을 잡을 때도 있고, 때로는 의지가, 때로는 감정이 정신의 주도권을 잡기도 합니다.",
                    "뜻하지 않게 미로에 갇히게 되었다고 생각해 봅시다. 이때는 이 미로를 빠져나가려는 의지가 가장 앞설 것이고, 지성이 의지를 최대한 서포트 하면서 전략을 세웁니다. 이때 감정은 자신을 냉정하게 유지하면서 의지와 지성의 활동에 안정감을 주려할 것입니다. 이처럼 의지가 주도권을 잡는다고 해서 지성이나 감정이 사라지는 것은 아닙니다. 오히려 셋이 협력하여 가장 좋은 방법을 찾습니다. 이것은 상황에 따라 지성 또는 감정이 주도권을 잡을 때, 나머지 두 가지가 다른 한 가지를 서포트 해주는 것과 마찬가지입니다. **우리의 마음은 하나이지만 셋이고 셋이지만 하나이듯이 하느님도 한 분이지만 세 위격을 지니고 있다는 것입니다.** 저는 우리가 하느님의 모상이기에 이 비유가 아주 생뚱맞다고 생각하지 않습니다. 전지전능하신 하느님은 지성에 가까우시고, 우리를 위해 기꺼이 사람이 되신 성자하느님에게서 우리는 인간을 구원하려는 의지를 볼 수 있습니다. 또한 우리의 마음을 평화로 이끄는 성령하느님은 우리의 감정을 아우르십니다. 어떻게 성부, 성자, 성령과 지성, 의지, 감정이 비유가 잘 되시는지요?",
                    "2.",
                    "앞에서 말씀 드린 것처럼 이스라엘 사람들의 역사를 보면 시간의 순서에 따라 성부 하느님, 성자하느님, 성령하느님을 접하게 됩니다. 그런데 아마도 이것은 우리가 하느님을 체험하는 순서와 일치하지 않을까 하는 생각을 갖게 합니다. 이제 제가 체험한 삼위일체 하느님에 대해 말씀드리고자 합니다. 교회는 다녔지만 하느님의 존재에 대한 확신이 없었던 청년 시절, 하느님을 믿고 싶었지만 느낄 수 없고 체험할 수 없어서 너무 괴로워했던 시간이 있습니다. 그러던 어느 날, 저는 이러한 상황이 너무 힘들어서 정말 필사적으로 기도를 시작했습니다. 그렇게 기도를 하는 순간 저는 말 그대로 환상을 보게 되었습니다. 구름이 걷히고 빛이 제게 쫙 쏟아지는 광경이었습니다. 그 체험 이후로 저는 단 한 번도 하느님의 존재를 의심하지 않게 되었습니다. 제가 체험한 것을 한 마디로 말하라면 ‘하느님’이라고 밖에 할 수 없었습니다.",
                    "그 체험이 있은 뒤 12년이 지난 후, 저는 신학을 공부하는 처지에 놓이게 되었습니다. 청년시절 하느님에 대한 체험이 너무 강렬했기 때문에 부르심을 거절할 수 없었습니다. 그런데 제가 신학을 하면서 던졌던 가장 큰 질문 중의 하나는 도대체 예수님은 어떤 존재인가였습니다. 저는 그 분이 하느님의 아들이라는 사실이 잘 다가오지 않았습니다. 신학을 하고 성직과정을 밟으면서 저는 여러 어려움을 겪게 되었습니다. 그래서 하느님을 원망하기도 했으며 심지어는 하느님을 떠나고자하는 시도를 여러 번하기도 했습니다. 그러나 결국 제가 하느님의 자녀로 되돌아갈 수밖에 없다는 운명임을 받아들이게 되었습니다. 저는 제 경험을 통해 어쩌면 예수님도 저처럼 성부하느님과 분리될 수 없으며, 더 나아가 백퍼센트 하느님의 뜻에 맞춰 살 수밖에 없었기에 예수님이 하느님과 같은 분일 수 있다는 사실을 받아들이게 된 것입니다. 다음은 성령에 대한 체험입니다.",
                    "언제부터인가 성령의 인도라는 말이 다가왔습니다. 계속되는 어려움 속에서도 저는 성령하느님의 인도로 인해 올바른 방향으로 나아가고 있으며, 이것은 성령하느님이 저를 성부하느님의 뜻에 일치시키기 위한 인도라는 것을 깨달게 되었습니다. 저는 이처럼 성부하느님, 성자하느님, 성령하느님을 이스라엘 민족처럼 시간의 순서에 따라 체험하게 되었습니다. 아마 대부분의 교우 여러분들도 그러하리라 생각됩니다. 그러나 그 거리감은 시간의 순서와는 반대로 성령하느님, 성자하느님, 성부하느님 순서일 수 있다고 생각합니다. 왜냐하면 **성령 하느님은 지금 내 안에 계시고**, 예수님은 이천년 전에 이 땅에 오셨고, 성부하느님은 이 세상이 있기 전부터 계셨기 때문입니다.",
                    "위에서 말씀드린 것처럼 우리의 마음이 지성, 의지, 감정으로 이루어졌으며, 때로는 지성이, 때로는 의지가, 때로는 감정이 앞서듯이, 때로는 성부하느님이 우리를 주도하여 타인에게 한없이 자비로운 사람이 되라는 명령을 할 수도 있습니다. 반면 어떤 경우는 우리가 성자하느님의 뜻을 받들어 불의에 대해 공분해야 할 때도 있으며, 또 성령하느님의 인도에 그저 자신을 맡겨야 할 때도 있는 것입니다. **이처럼 삼위는 저의 처지에 따라 서로 협력하시면서 제 안에서 작동하시는 분이신 것입니다.** 이것이 바로 제가 체험한 성부하느님, 성자하느님, 성령하느님의 모습입니다. 제가 체험한 세 모습의 하느님을 광명교회 교우 여러분에게 전하는 것도 큰 축복이라고 생각합니다. 왜냐하면 하느님께서는 당신의 이러한 모습을 전하라고 하셨기 때문입니다. 아무쪼록 광명교회 교우 여러분 모두 신앙의 과정을 통하여 세 가지 모습의 하느님, 우리 앞에 계시는 성부하느님, 우리와 함께 계시는 성자하느님, 우리 안에 계시는 성령하느님을 두루 체험하는 은총이 함께 하시기를 기원합니다. 성부와 성자와 성령의 이름으로 말씀드렸습니다.",
                ]
            },
            {
                date: "2026-05-10",
                title: "예루살렘과 아테네가 무슨 상관이 있는가?",
                scripture: "사도 17:22-31 / 시편 66편 / 1베드 3:13-22 / 요한 14:15-21",
                preacher: "이남호(사도요한) 사제",
                source: { label: "원문 보기(네이버 블로그)", url: "https://m.blog.naver.com/brave9955/224288238997" },
                footnotes: [
                    "사도 17:19-22에 나오는 장소로, 아테네의 토론과 재판이 열리던 곳입니다.",
                    "에피쿠로스의 『메노이케우스에게 보내는 편지』의 취지를 옮긴 것입니다.",
                    "로마 시인 호라티우스의 『송가』 1권 11번에 나오는 구절입니다.",
                    "터툴리아누스의 『이단 반박론』 7장의 말로 알려져 있습니다.",
                    "칼 라너(Karl Rahner)의 ‘익명의 그리스도인’ 개념입니다. 제2차 바티칸 공의회 무렵의 신학 흐름과 맞닿아 있습니다.",
                ],
                paragraphs: [
                    "성부와 성자와 성령의 이름으로 말씀드립니다. 한 주간 동안 안녕하셨는지요? 오늘은 교회에서 가정주일로 지키는 날입니다. 아무쪼록 5월 가정의 달을 맞아 광명교회 모든 가정들이 주님의 은총 안에서 평안하기를 빌어봅니다. 오늘 제 1독서인 사도행전에서 우리는 그리스의 아테네로 전도여행을 떠난 사도 바울을 만납니다. 바울은 아주 헌신적이며 철두철미한 사람이었습니다. 에니어그램이라는 성격유형이론에 따르면 1유형으로 분류됩니다. 1유형은 완벽주의자, 이상주의자, 개혁가라는 별명을 지니고 있습니다. 1유형은 자신이 옳다고 생각하는 바를 거침없이 드러내는 공격적인 스타일입니다. 사도행전에서 바울은 베드로와의 논쟁도 불사했으며, 자신의 기준과 다르다는 이유로 같이 전도 여행을 다니던 바르나바와 미련 없이 돌아서기도 했습니다. 그런 바울이 당시 세계 문명의 중심인 그리스의 아테네로 와서 복음을 전파하기 시작한 것입니다. 아시다시피 아테네는 서양철학의 발원지였습니다.",
                    "사도 바울은 당시 세계의 변방 중의 변방인 유대로부터 와서 세계문명의 중심지인 아테네에 복음을 전하기 시작한 것입니다. 그래서인지 오늘 1독서의 앞부분인 사도행전 17장 18절에는 이런 말이 나옵니다. 에피쿠로스학파와 스토아학파의 몇몇 철학자들이 바울을 보고 “이 떠버리는 도대체 무슨 소리를 하려는 것인가?”라고 말합니다. 또 다른 사람들은 바울이 예수와 그의 부활에 관해 설교하는 것을 보고는 “다른 나라의 신들을 선전하는 모양이다.”라고 말하기도 합니다. 그런데 철학으로 단련된 아테네 사람들은 바울에게 “당신이 가르치는 그 새로운 가르침이 어떤 것인지를 알려 주겠소? 우리가 듣기에 생소한 말을 하는데 어디 그 설명을 들어봅시다.”라고 말합니다. 그리스는 철학적 토론이 일상화된 나라였기 때문에 가능했던 태도라고 여겨집니다. 그래서 바울은 오늘 독서에서 보듯이 아레오파고 법정에 서서 연설을 시작합니다.[^1] 바울은 복음 전도자답게 아테네 시내의 예배하는 곳을 돌아다니다 “알지 못하는 신에게”라는 제단을 보았다는 말로 자신의 설교를 시작합니다.",
                    "그리고 바울은 아테네 사람들이 말하는 그 “알지 못하는 신”이 바로 이스라엘의 하느님이라고 말합니다. 그는 창조주로서의 하느님, 하늘과 땅의 주인이기에 사람이 만든 신전에 살지 않는 하느님, 완벽한 존재로서의 하느님, 한 조상에게서 모든 인류를 내시고 그들이 살아갈 시대와 영토를 정해주신 하느님, 그래서 누구나 찾기만 하면 만날 수 있는 하느님에 대해 설교하였습니다. 이런 설교를 들은 아테네 사람들의 반응은 어떠했을까요? 죽은 자가 다시 살아난다는 말을 듣고 비웃는 사람도 있었고 나중에 다시 들어보겠다는 사람도 있었습니다. 그리고 바울의 말을 듣고 하느님을 믿게 된 사람들도 있었다고 사도행전은 전하고 있습니다. 당시 아테네의 주류 철학은 에피쿠로스학파와 스토아학파 였습니다.",
                    "흔히 쾌락주의 철학이라고 알려져 있는 에피쿠로스학파는 ‘아타락시아’라고 하는 마음의 평정을 최고의 가치로 삼는 철학이었습니다. 이 에피쿠로스학파는 자신들의 철학에 대한 자부심이 대단했습니다. 아마도 지금껏 존재했던 철학 중에 가장 쿨(cool)하고 나이스한 철학이 아마도 에피쿠로스학파일 것이라고 말하는 학자도 있습니다. 왜냐하면 에피쿠로스학파는 죽음에 대해 이렇게 말하고 있기 때문입니다. “가장 무서워해야할 악, 곧 죽음은 우리와는 아무 관계도 없다. 왜냐면 우리가 살아있는 한 죽음은 존재하지 않고, 죽음이 찾아왔을 때 우리는 더 이상 살아있지 않기 때문이다.”[^2] 그래서 에피쿠로스는 사람들에게 오직 지금, 곧 현재에 몰두할 것을 권합니다. 우리가 흔히 말하는 카르페 디엠 (지금을 잡아라)도 이 에피쿠로스의 사상입니다. 원래는 “카르페 디엠, 쿠암 미니멈 크레두라포스테로 (Carpe diem, quam minimum credula postero)” 로서, 그 뜻은 “지금을 잡아라, 되도록이면 내일이라는 말은 최소한만 믿어라”라고 합니다.[^3]",
                    "그런데 이것이 단지 에피쿠로스학파만의 독자적인 사상일까요? 우리는 이러한 정신을 성서에서도 찾아볼 수 있습니다. 솔로몬이 지었다고 하는 많은 지혜서의 성격이 현세를 긍정하는 에피쿠로스의 철학과 닮아 있습니다. 그리고 마태오 복음 7장에 보면 예수께서는 우리의 걱정이 목숨과 옷과 먹을 것을 해결해주지 못한다고 하십니다. 그리고 “내일 일은 걱정하지 마라. 내일 걱정은 내일에 맡겨라. 하루의 괴로움은 그날에 겪는 것만으로도 족하다.” 라고 말씀하십니다. 지금, 여기에 집중하라는 예수님 역시 에피쿠로스적인 태도를 갖고 있는 것입니다. 이렇듯 성서에도 이미 에피쿠로스적인 사상이 스며들어 있는 것입니다. 그렇다면 스토아학파는 어떨까요? 스토아 철학은 우리에게 금욕주의로도 알려져 있습니다.",
                    "스토아학파가 추구하는 것은 ‘아파테이아’로서, 에피쿠로스 학파의 ‘아타락시아’와 비슷하며, ‘흔들리지 않는 마음’ ‘부동심’을 뜻한다고 합니다. 이 스토아학파가 가지고 있는 중요한 개념 중의 하나가 바로 로고스(logos)입니다. 로고스는 “만물을 지배하는 신의 법, 또는 자연법”이라는 뜻을 지니고 있습니다. 요한복음의 “말씀이 사람이 되시어 우리 가운데 계시다.”에서 말씀이 스토아학파의 주요개념인 로고스로 표기됨으로써, 스토아 학파는 자연스럽게 기독교와 연결되었습니다. 이러한 사실들이 의미하는 바는 기독교가 로마와 그리스에 전파될 때에, 이미 로마와 그리스의 사상과 언어를 빌어서 이해되기 시작했다는 것입니다. 초대 교회의 교부인 터툴리안은 이런 말을 했습니다.[^4] “예루살렘과 아테네가 무슨 상관이 있는가?” 과연 예루살렘과 아테네는 무슨 상관이 있을까요? 지금부터 알아보도록 하겠습니다.",
                    "예루살렘에 살던 사도 바울은 아테네의 법정에서 변방으로부터 발생한 복음을 전파하였습니다. 그러나 그 복음이 아테네에 받아들여지기에는 무척 생소했습니다. 따라서 아테네와 로마사람들은 자신들의 언어와 사상으로 기독교를 이해해야만 했습니다. 즉 그들은 자신들의 철학인 에피쿠로스학파와 스토아학파의 개념과 사상을 가지고 기독교를 이해했으며, 그런 과정을 통해서 기독교가 당시 세계 문화의 중심지에서 자리를 잡게 되는 역사가 일어나게 된 것입니다. 만약 우리가 성서를 배경 지식 없이 읽으면, 마치 에피쿠로스학파나 스토아학파의 철학은 일종의 잡설이고, 불순하고 이단적인 사상으로 생각할 수 있습니다. 그러나 사상이라는 것이 하늘에서 뚝 떨어진 것이 아닌 이상 서로 영향을 주고받으면서 성립된다는 것입니다. 즉 현실은 생각보다 복잡하다는 것입니다. 그렇다면 이러한 맥락에서 오늘 복음에서 말하는 성령을 우리는 어떻게 이해해야 할까요? 오늘 2독서인 베드로서에는 양심이라는 말이 두 번이나 등장합니다.",
                    "“여러분은 언제나 깨끗한 양심을 지니고 사십시오.” “세례는 몸에서 더러운 때를 벗기는 것이 아니라 깨끗한 양심으로 살겠다고 하느님께 서약을 하는 것이며, 예수 그리스도의 부활로서 이루어지는 것입니다.” 오늘 아테네 사람들처럼 아직 예수님을 모르는 사람들은 양심에 비추어서 옳고 그름을 판단했습니다. 모든 인류는 하느님의 피조물이고 하느님을 닮은 모상이기에, 민족과 종교에 상관없이 양심을 부여 받았습니다. 로마서에서 바울은 아직 복음을 듣지 못한 이방인들의 마음속에는 율법이 새겨져 있다고 말합니다. 즉 양심은 인간의 마음에 새겨진 하느님의 율법인 것입니다.",
                    "이 양심이 있기에 우리가 도리에 어긋난 일을 하면 자신도 모르게 움찔하게 되는 것입니다. 이 양심이 있기에 아직 예수 그리스도를 알지 못하더라도 사람들에게 구원의 가능성이 열려 있는 것입니다. 그래서 가톨릭의 제2차 바티칸공의회에서 큰 역할을 감당했던 가톨릭의 사제이자 신학자인 칼 라너는, 비록 그리스도인은 아니지만 양심에 따라 행동한 사람들은 “익명의 그리스도인”이라고 불렀으며[^5], 비록 이들이 교회에 속해 있지 않더라도 구원의 가능성이 주어진다고 주장했던 것입니다. 이것은 성공회의 입장이기도 합니다. 이는 표면적으로는 착실히 교회를 다니지만 양심을 거스르거나 성령에 위배되는 행위를 하는 신자는, 신자라고 해도 구원의 가능성에서 멀어지는 것과 마찬가지인 것입니다. 이제 결론적으로 양심과 성령의 관계를 밝히도록 하겠습니다.",
                    "이것은 아테네와 예루살렘의 관계를 밝히는 일이기도 합니다. 인간에게는 하느님께서 주신 양심이 있고 그 양심은 어쩌면 성령과 같은 것일지도 모르며, 또는 성령이 머무르는 곳일지도 모릅니다. 그리고 무엇보다도 양심은 성령에 의해 더욱더 명료해지고 우리에게 의식화 될 수 있다는 것입니다. 양심이 우리 안에 있듯이 성령도 우리 안에 있어서 우리를 이끌어 주는 것입니다. **양심은 성령이 머무는 곳입니다.** “예루살렘과 아테네가 무슨 상관이 있는가?” 예루살렘은 성령으로 인해 양심이 무엇인지를 명확하게 알게 된 곳이었습니다. 아테네는 양심은 알고 있었으나 그 양심이 어떻게 작동하는지에 대해 아직 모르고 있는 곳이었습니다. 이제 바울의 미션은 명쾌해집니다. 이방인들의 양심을 성령을 통해 더 또렷하고 명쾌하게 만드는 일이었습니다. 즉 성령을 통해 양심을 의식화시키고 그 양심의 주인이 바로 예수 그리스도이심을 알리는 일이었습니다. 우리가 양심을 지키면서 사는 일은 성령이 우리 안에 머물 경우에만 의식적이고도 지속적인 힘을 갖습니다.",
                    "양심이 모든 일의 중심이 되는 사람만이 성령이 모든 일의 중심이 될 가능성이 있습니다. 성령이 우리의 중심이 된다면 예수님은 하느님 안에 있고 우리도 하느님 안에 있으며, 우리 모두가 연결되어 있고 또 새로운 공동체와 가정의 가능성도 열려 있다는 사실도 깨닫게 됩니다. 이제 예루살렘은 2026년 지금 여기를 사는 우리와도 관계가 있습니다. **성령은 양심의 의식화이자 명료화입니다.** 우리가 진정 양심대로 사는 방법은 바로 성령을 따라 사는 것입니다. 오늘 가정주일을 맞아 성령과 가정의 관계에 대해 생각해 봅니다. 우리는 성령이 중심이 되는 가정을 성가정이라는 이름으로 부릅니다. 우리는 그 예를 마리아와 요셉, 그리고 예수님의 가정에서 봅니다. 그러나 오늘날에는 1인 가정이 거대한 추세를 이룹니다. 겉보기에는 매우 쓸쓸하고 외롭게 보입니다. 그러나 **비록 1인 가정일지라도 성령이 그 가정의 중심이 된다면, 그것은 결코 1인 가정이 아니라 성가정을 이루고 있음을 우리는 알아야 합니다.** 이것이 바로 성령의 신비인 것입니다.",
                    "아무쪼록 저와 여러분의 가정 모두 성령이 중심이 되는 가정이 되기를 주님의 이름으로 기원합니다. 성부와 성자와 성령의 이름으로 말씀드렸습니다.",
                ]
            },
            {
                date: "2026-04-12",
                title: "순수한 믿음을 얻기 위해",
                scripture: "사도 2:14, 22-32 / 시편 16편 / 1베드 1:3-9 / 요한 20:19-31",
                preacher: "이남호(사도요한) 사제",
                source: { label: "원문 보기(네이버 블로그)", url: "https://m.blog.naver.com/brave9955/224288237127" },
                footnotes: [
                    "토마의 그리스어 이름 ‘디두모’는 ‘쌍둥이’라는 뜻입니다(요한 11:16, 20:24 참고).",
                    "요한 11:16의 말씀입니다.",
                    "요한 20:28의 말씀입니다.",
                    "요한 20:29의 말씀입니다.",
                    "요한복음은 대체로 기원후 90~110년 무렵 기록된 것으로 보는 것이 학계의 일반적인 견해입니다. 예수님의 부활(약 30년경으로 추정)에서 약 60~80년 뒤입니다.",
                    "덴마크의 철학자 키에르케고르가 가명 요하네스 클리마쿠스의 이름으로 쓴 『Concluding Unscientific Postscript』의 대목과 같은 취지입니다. 객관적 불확실성을 가장 열정적인 내면성으로 붙들 때 그것이 진리라는 내용입니다. 설교 문장은 번역을 옮긴 것입니다.",
                    "사도 토마가 인도 남부(말라바르)에 복음을 전했다는 전승이 있습니다. 전승은 기원후 52년경 도착을 말하지만, 역사적 근거는 학계에서 논쟁 중입니다.",
                ],
                paragraphs: [
                    "성부와 성자와 성령의 이름으로 말씀드립니다. 한 주간 동안 안녕하셨는지요? 오늘 1독서인 사도행전에서는 성령을 받은 베드로가 예수님의 정체를 일목요연하게 증언합니다. 예수님은 하느님께로부터 왔으며 하느님은 이것을 분명하게 보여주기 위해 예수님을 통해 여러 기적과 놀라운 징표를 보이셨다는 것, 이후 미리 정하신 당신의 뜻과 계획에 따라 예수님을 악인들의 손에 넘겨 십자가에서 죽음을 맞게 하시고 또 살리심으로 죽음의 세력으로부터 벗어나게 하셨다는 것입니다. 이어 2독서에서도 베드로는 ‘이렇게 예수 그리스도를 죽은 자들 가운데서 다시 살리신 까닭은 우리들에게 똑같은 희망을 주기 위함이었으며, 우리가 해야 할 일은 어떠한 시련 속에서도 이 희망을 믿음으로 지켜야 한다.’고 말합니다. 또한 없어지고 말 황금도 불로 단련을 받듯이 황금보다 더 귀한 우리의 믿음은 많은 단련을 받아 순수하게 되어 예수 그리스도로부터 칭찬과 영예를 차지하게 될 것이며, 그 믿음이 우리의 영혼을 구원하게 되리라는 것이 베드로서의 요지입니다.",
                    "그런데 과연 순수한 믿음은 어떻게 얻게 되는 것일까요? 의혹과 의심이 있어도 무턱대고 받아들이는 것이 순수한 믿음일까요, 아니면 의혹과 의심을 견지하면서도 명확한 답을 찾기 위한 번민의 길에 나서는 것이 순수한 믿음을 얻기 위한 과정일까요? 오늘 우리는 요한복음에 등장하는 사도 토마를 통해 우리의 믿음에 대해 다시 한 번 살펴볼 필요가 있습니다. 토마의 사례는 우리의 지성이 믿음에 필수불가결한 요소임을 보여주기 때문입니다.",
                    "2.",
                    "오늘 복음에는 예수님의 부활을 맞는 제자들의 모습이 그려집니다. 그러나 안타깝게도 제자들의 마음은 두려움으로 가득 차 있었습니다. 막달라 마리아가 예수님의 부활을 목격하고 그 소식을 전해 주었건만 이들은 믿을 수 없었기 때문입니다. 예수님의 부활을 믿을 수 없어 의기소침해 있던 제자들에게 예수님이 오셔서 “너희에게 평화가 있기를”이라고 인사하십니다. 예수님은 아직 우리가 경험하지 못한 육체로 닫힌 문을 통과해서 제자들 사이에 나타나십니다. 나타나신 방법이야 어찌 되었든 부활하신 예수님을 만난 제자들은 기뻐서 어쩔 줄 몰랐습니다. 예수님은 당신의 상처를 보여주시며 제자들에게 부활의 확신을 전하십니다. 그리고 하느님께서 인간을 창조하실 때 숨을 불어 넣으신 것처럼, 제자들의 새로운 창조를 위해 성령을 불어 넣으시는 일을 잊지 않으십니다. 그리고 예수님은 “누구의 죄든지 너희가 용서해주면 그들의 죄는 용서 받을 것이고 용서해 주지 않으면 용서 받지 못한 채로 남아있을 것”이라는 말씀을 남기시고 모습을 감추십니다.",
                    "이것은 예수께서 사도들에게 부여한 권한으로, “진심으로 회개한 사람들을 향한 사도들의 용서는 효력이 있을 것이나, 그렇지 않은 사람들에게는 여전히 형벌이 따를 수 있음”을 의미했습니다. 그런데 그 자리에는 쌍둥이라고 불리던 토마 사도는 없었습니다.[^1] 예수님의 부활은 토마를 제외한 제자들에게는 팩트가 되었지만, 그 자리에 있지 않았던 토마는 그것을 받아들일 수 없었고 자신이 직접 예수님의 손과 옆구리의 상처를 확인하지 않고서는 믿지 못하겠다고 선언합니다. 토마는 요한복음 11장에 라자로의 부활과 관련하여 처음 등장합니다. 유다인들이 신성모독으로 인해 예수님을 체포하려고 하자 예수님은 요르단 강 저편으로 피하셨습니다. 예수께서 잠시 그곳에 머무는 동안에 나사로의 누이들이 오빠가 병들어 앓고 있다는 전갈을 보내옵니다. 예수께서 다시 베다니아로 가시려고 하자 제자들은 죽을지도 모를 그곳에 왜 가려고 하느냐고 만류합니다. 이때 토마는 예수님을 지지하여 동료들에게 “우리도 주와 함께 죽으러 가자.”고 말합니다.[^2] 이처럼 토마에게는 주님께 대한 열정과 확신이 있었습니다.",
                    "토마는 요한복음 14장에 다시 등장합니다. 예수께서 제자들에게 “너희는 걱정하지 말라.”고 하시면서, 내가 아버지 집으로 가서 너희가 있을 곳을 마련하면 너희를 데려다가 내가 있는 곳에 같이 있겠다고 하십니다. 이후 예수님이 “너희는 내가 어디로 가는지 그 길을 알고 있다.”고 말하자 토마는 “주님, 저희는 주님이 어디로 가시는지도 모르는데 어떻게 그 길을 알겠습니까?”라고 되묻습니다. 이것으로 보아 토마는 남을 의식하지 않는 솔직한 감정표현과 더불어 궁금한 것에 대해 질문을 주저하지 않는 개방적인 사고를 지닌 사람이었습니다. 의문이 드는 것은 물어야만 하는 지적인 측면이 돋보이는 인물이었다는 것입니다. 따라서 예수님의 부활을 증언하는 제자들 앞에서, 자신은 보고야 믿겠노라고 대답한 토마의 대응은 자신의 성격을 일관되게 표현한 행동인 것입니다.",
                    "사람마다 믿음의 구조와 내용이 다르듯이, 토마 역시 자신의 타고난 성정 안에서 믿음을 세우고자 했습니다. “보고서야만 믿겠다.”는 자신의 신념을 공고히 할수록 역설적이게도 의심의 그림자가 깊어졌을 것입니다. 그러나 이것은 순수한 믿음으로 가기 위한 숙성의 시간이기도 했습니다. 황금이 불로 단련을 받듯이 의심과 회의를 통해 자신의 믿음을 더욱 순수하게 만드는 내적인 투쟁의 시간이었던 것입니다. 결국 예수님은 일주일이 지난 뒤 토마에게 모습을 드러내셨습니다. 그리고 부활하신 예수님을 보고 토마의 입에서 두 마디가 튀어나왔습니다. “나의 주님, 나의 하느님”[^3] 토마의 이 고백은 교회의 역사를 통해 예수 그리스도에 대한 가장 완벽한 고백이 되었습니다. **솔직한 의심이 완벽한 고백으로 승화된 것입니다.** 그런데 토마의 이러한 고백보다 우리의 가슴을 더욱 때리는 것은 바로 예수님의 마지막 말씀입니다. “너는 나를 보고야 믿느냐? **나를 보지 않고도 믿는 사람은 행복하다**.”[^4] 예수님의 이 말씀은 일차적으로 요한복음의 독자들을 겨냥하는 말씀입니다.",
                    "예수께서 부활하신 지 70년이 지난 시점에[^5] 기록된 요한복음을 읽은 사람들 누구도 직접 예수님을 보고서 믿은 사람은 없었기 때문입니다. 그리고 이차적으로는 지금을 살고 있는 우리들에게 하시는 말씀입니다. 우리 역시 결국 성서를 읽고 들음으로써 믿게 됩니다. 요한복음이 기록된 목적은 오늘 베드로의 설교와 다르지 않습니다. 그것은 예수님이 하느님의 아드님이심을 믿어서 그분의 이름으로 생명을 얻게 하려는 것입니다. 그리고 우리는 성령과의 교통을 통해서 믿음에 확신을 가지게 됩니다. 그리고 이러한 믿음은 온갖 슬픔과 고난을 통과하며 담금질되어 순수해집니다.",
                    "3.",
                    "정말 순수한 믿음은 어떻게 생기는 것일까요? 제 경우를 통해 말씀드려보겠습니다. 저는 성공회에 와서(저는 원래 가톨릭 신자였습니다) 제 믿음의 성장을 위해 여러 차례 제 자신을 던져 본 기억이 있습니다. 그 중에서 두 가지 정도만 말씀드려볼까 합니다. 제가 성직자가 될지도 모르겠다는 예감으로 성공회에 오면서 겪었던 가장 큰 사건은 참으로 얼토당토하지 않은 선배 성직자들을 많이 만나게 되었다는 것입니다. 지금 생각하니 한마디로 운이 없었고, 반면 꼭 필요한 과정이기도 했던 것 같습니다. 모든 부당함을 참아야만 서품을 받을 수 있기에 저는 몇 년을 그렇게 참았습니다. 그러다가 이것은 도저히 아니다 싶어 저는 점차 부당한 점에 대해 말하기 시작했습니다. 그때 제 마음 속에는 이런 생각이 들었습니다. “정말 하느님께서 내가 사제가 될 사람이라고 여기면 모든 것을 제자리에 돌려놓으실 것이고, 아니라고 생각하시면 나를 다른 길로 인도해 주실 것이다.” 저는 하느님의 뜻을 알기 위해 제 자신을 던지는 믿음의 여정을 떠났던 것입니다. 마치 야곱처럼 하느님과 씨름을 하기로 마음먹은 것입니다.",
                    "한편 선배 성직자들의 부당함을 지적한 것에 대한 대가는 참혹했습니다. 저는 2년 반 동안 강제로 휴직을 당했고, 부제에서 사제가 되기까지 무려 8년이라는 시간이 걸렸습니다. 성공회 백년사에 있어서 최장수 부제라는 설이 있습니다. 또한 저는 사제로서의 제 정체성을 증명하기 위해 마포들음교회라는 선교형교회를 세워 저를 지지해주는 분들의 후원과 제가 직접 번 돈, 그리고 교구에서 주는 소액의 지원금으로 9년 넘게 교회를 유지했습니다. 그 정도의 기간이면 저를 비난하던 사람들조차 지치고 남을 시간이 아닐까요? 다른 사건은 작년에 일어났습니다. 표면적으로는 제 스스로의 결정이었지만, 저는 하느님으로부터 그 일을 하라는 명령을 받았습니다. 마침 교회의 유지도 어려워, 저는 요양보호사 자격증을 따고 요양원에 입사를 하게 되었습니다. 아무 경험도 없는 남자 요양보호사를 받을 만큼 열악한 곳이기도 하였고 저 또한 낯설고 서툰 일이었기에, 갖은 구박을 당하면서 일을 하게 되었습니다.",
                    "몸은 매일 녹초가 되었습니다. 그런데 예수님이 제자들의 발을 씻겨준 것처럼, 저도 살면서 한번쯤은 타인의 똥을 치워주고 가야되지 않겠느냐는 마음도 들었습니다. 일종의 인생 버킷리스트라고 할까요? 야간근무 때는 혼자서 최다 열일곱 분의 기저귀를 교체했던 기억이 납니다. 이러다 쓰러지면 하느님께서 알아서 해주시겠지 라는 마음으로 일했습니다. 또 시작된 하느님과의 씨름이었습니다. 올린 것입니다. 그러다가 4개월이 지난 후 제가 진짜 쓰러질 만한 일이 생겼습니다. 대상포진이 발병하여 지금까지 저를 괴롭히고 있습니다. 또한 허리에도 이상이 와서 토요일 오전 시간은 통증의학과와 한의원을 다니며 보내고 있습니다. 그런데 그 일이 지금 제가 하고 있는 노인복지 일과 무관하지 않습니다. 이것이 바로 하느님의 섭리가 돌아가는 방식인 것입니다. 덴마크의 종교철학자 키에르케고르는 이렇게 말했습니다. “믿음이란, 신앙이란 객관적인 불확정성과 관계를 맺으려는 내면의 열정이다. 그 열정이 우리를 주체적인 인간으로 서게 하고 그런 열정 자체가 바로 진리적인 것이다.”[^6]",
                    "하느님은 객관적으로 규정할 수 없는 불확정성입니다. 누구에게나 불확실한 존재입니다. **그러한 불확실하고 불확정한 존재와 어떻게 해서라도 채널을 맞추려고 하는 내면의 열정, 그것이 바로 신앙이며**, 그 믿음이 우리를 주체적으로 만들고 또 진리에 다가선 존재로 만드는 것입니다. 사실 저는 성공회 안에서 정치적 감각도 없었고, 또 무엇이 되고자 노력한 적도 없었습니다. 다만 제가 말씀드릴 수 있는 것은 하느님을 알고자 하는 열정이 제 삶의 근본적인 원동력이었으며, 그 열정만큼은 누구 못지않았다는 것입니다. 또한 저는 인간과 세상에 펼쳐지는 하느님의 뜻을 아는 방법이 혹시 동양철학에 있지 않을까하여 기독교와 명리학을 비교하여 박사학위를 받기도 했습니다. 이 연구 또한 하느님을 알고자 하는 제 열정의 학문적 표현이었으며, 제 신앙의 한 모습인 것입니다. 그래서 저는 책을 썼는데 혹시 필요하신 분이 있다면 드리도록 하겠습니다. 그러나 이 모든 노력에도 불구하고 우리가 하느님에 대해 완벽한 이해를 갖는 것이 불가능함을 고백합니다.",
                    "모든 것이 희미할 따름입니다. 그럼에도 불구하고 우리가 하느님과 관계를 맺으려는 끊임없는 내면의 열정이 있다면, 즉 믿음이 있다면, 불현 듯 하느님은 우리에게 아무것도 감추지 않으시는 존재가 될 것입니다. 우리는 그 본보기를 복음을 전하기 위해 인도로 떠난 토마 사도[^7]를 통해 접할 수 있는 것입니다. 언젠가 성령의 힘으로 하느님과 일치를 이루는 은총이 저와 여러분에 내리기를 주님의 이름으로 기원합니다. 성부와 성자와 성령의 이름으로 말씀드렸습니다.",
                ]
            },
            {
                "date": "2026-11-08",
                "title": "추수감사절의 의미를 되새기며",
                "scripture": "신명 8:1-10 / 시편 65편 / 야고 1:17-18, 21-27 / 마태 6:25-33",
                "preacher": "이남호(사도요한) 사제",
                "footnotes": [
                    "1620년 11월 9일(구력, 그레고리력 11월 19일)은 승객들이 케이프코드 해안을 처음 본 날로 기록되어 있습니다. 배가 프로빈스타운 앞바다에 닻을 내린 날은 구력 11월 11일(그레고리력 11월 21일)입니다.",
                    "메이플라워호 승객은 100명 남짓이었고, 첫 겨울을 넘기고 살아남은 사람은 50여 명이었다고 전해집니다. 숫자는 자료마다 조금씩 다릅니다.",
                    "1621년의 수확 잔치는 정해진 날짜의 행사가 아니었습니다. 11월 마지막 목요일을 추수감사절로 정한 것은 1863년 링컨 대통령의 선언이고, 11월 넷째 목요일로 법으로 정한 것은 1941년입니다.",
                    "에이브러햄 매슬로의 「인간 동기의 이론」(A Theory of Human Motivation, 『Psychological Review』, 1943)에 바탕을 둡니다. 다섯 단계는 1954년 저서 『Motivation and Personality』에서 정리되었습니다. 흔히 보는 피라미드 그림은 매슬로가 직접 그린 것이 아닙니다.",
                ],
                "source": {
                    "label": "원문 보기(네이버 블로그)",
                    "url": "https://m.blog.naver.com/brave9955/224469229235"
                },
                "paragraphs": [
                    "성부와 성자와 성령의 이름으로 말씀드립니다. 한 주간 동안 잘 지내셨는지요? 보통 성공회에서는 11월 첫째 주일을 추수감사주일로 지키지만 꼭 정해진 것은 아니어서, 우리 광명교회는 11월 둘째 주일인 오늘을 추수감사주일로 지키게 되었습니다. 추수감사절은 우리나라의 명절이라고 할 수 없습니다. 아마도 가장 미국적이고 미국다운 명절이 바로 추수감사절일 것입니다. 이는 미국에서의 추수감사절이 주일을 포함하여 4일이기 때문입니다. 미국의 추수감사절의 탄생에는 순전히 부정적인 방향으로 영국 성공회가 큰 몫을 담당했습니다. 성공회는 16세기 종교개혁 이후 영국의 국교였습니다. 당시 성공회가 로마 가톨릭 교회로부터 독립했다고는 하나, 지금도 그러한 것처럼 가톨릭적인 요소가 여전히 남아 있는 교파였습니다.",
                    "그런데 퓨리탄이라고 불리는 영국 청교도들은 성공회에 남아 있는 가톨릭적인 측면을 더욱 개혁하고자 했습니다. 그리고 신자들에게 좀 더 엄격한 도덕적 순수성과 근면성, 청렴결백을 요구했습니다. 신학적으로도 성공회에서 강조하는 권위와 전통보다는 성서를 최우선 순위로 두었습니다. 한마디로 성공회보다는 더 급진적인 종교개혁파였던 것입니다. 신학도 다르고 신앙의 지향점도 다를 수밖에 없는 두 종파는 결국 갈등을 겪을 수밖에 없었습니다. 그리고 성공회는 국교회로서의 권력을 지니고 있었기에 청교도를 탄압하기 시작했습니다. 이에 1620년 9월, 101명의 청교도들은 영국을 떠나 2개월 후인 11월 9일에 미국에 도착하게 됩니다.[^1] 그러나 추위와 굶주림, 인디언들의 습격으로 인해 그 다음 해 봄까지 살아남은 사람은 불과 50여 명이었다고 합니다. 절반 이상이 사망한 것이었습니다.[^2]",
                    "이후 인디언들과 평화협정을 맺고 개간과 경작에 전념하여, 그해 11월 마지막 주 목요일을 추수감사절로 정하고[^3] 인디언들을 초청하여 신대륙 정착 후 생산한 첫 수확물을 나누며 하느님께 감사를 드린 것이 추수감사절의 유래라고 합니다. 저는 지난 2012년 9월부터 12월까지 서울교구의 프로그램에 따라 미국의 로스앤젤레스에 체류한 적이 있었습니다. 저는 그때 본토의 추수감사절을 경험했습니다. 미국의 추수감사절은 마치 우리나라의 추석과 유사했습니다. 그동안 서로 떨어져 있던 가족들이 비행기로 수천 킬로미터를 날아오거나 아니면 차로 달려와 가족들과 상봉합니다. 그리고 정말 큰 잔치를 벌입니다. 교포들도 한국의 고유 명절인 추석보다는 추수감사절을 더 큰 잔치로 받아들였습니다. 그도 그럴 것이 4일을 쉬게 되니 추석 같은 잔치 기분도 나서 추석 명절을 추수감사절에 맞춰 지내게 된 것 같습니다. 요즘은 흔한 용어가 되었지만 블랙프라이데이라고 하여, 일 년 중 미국에서 가장 큰 바겐 세일을 하는 시기여서 백화점과 마트는 사람으로 차고 넘쳤습니다.",
                    "이런 미국의 명절이 한국의 교회에서도 지켜지게 된 것은 한국에 들어온 선교사들의 영향이 컸습니다. 1900년대 초부터 장로교, 감리교 등 각 교파에서 추수감사절을 지내기 시작했다는 기록이 전해져 옵니다. 부정적인 측면에서 영국 성공회는 추수감사절의 탄생에 기여했지만, 한국 성공회는 개신교 전통의 영향을 받아 11월 첫째 주일을 추수감사주일로 지키고 있습니다. 이방 나라의 명절이 교회를 통해 들어와 우리 교회가 지키는 기념일이 된 추수감사절은, 적어도 우리나라 개신교에서는 확고하게 자리를 잡았습니다. 추석의 경우는 수확을 논하기에는 대체로 이른 시기여서 추수의 감흥을 주지 못하지만, 11월에는 모든 추수를 마무리하는 시기여서 가을을 정리하고 우리로 하여금 겨울과 대림절, 성탄절을 맞이하게 하는 시기이기 때문입니다.",
                    "만물이 동면의 시기로 들어가는 겨울의 문턱에서 이 모든 것을 베풀어주신 하느님께 다시 한 번 감사의 마음을 갖는다는 것은 우리의 삶과 신앙에도 긍정적인 영향을 끼치는 것 같습니다. 그래서 이왕 받아들인 것, 의미 부여를 잘하고 잘 보내는 것이 우리의 몫이 아닐까 하는 생각이 듭니다.",
                    "2.",
                    "오늘 제1독서 신명기에서는 모세가 지난 40년간의 광야 생활을 회고하는 장면이 나옵니다. 압제로부터의 해방과 새로운 땅을 얻기까지는 40년이라는 기나긴 광야의 시간이 있었습니다. 그 시간은 단순히 흘러가는 물리적인 시간이 아니라, 이스라엘 백성들이 하느님의 계획에 충실할 수 있도록 단련하는 교육의 시간이었습니다. 모세는 그 훈련의 시간이 마치 사람이 자기 자식이 잘되라고 고생시키듯이 하느님께서 이스라엘 백성을 고생시킨 시간이라고 말합니다. 더불어 모세는 그 시련의 기간 동안에도 하느님이 한시도 이스라엘 백성들을 돌보시는 데 소홀함이 없었음을 강조합니다. 그리고 무엇보다도 이스라엘 백성이 추구해야 할 것은 야훼의 입에서 떨어지는 말씀을 따라 살아야 한다는 것이었습니다.",
                    "오늘 복음의 말씀도 이 맥락에서 벗어나지 않습니다. 예수님은 우리에게 “무엇을 먹고 마시며 살아갈까, 또 몸에는 무엇을 걸칠까 하고 걱정하지 마라. **목숨이 음식보다 소중하지 않느냐?** 또 몸이 옷보다 소중하지 않느냐?”고 말씀하십니다. 또한 하늘에 계신 아버지께서는 공중의 새들도 먹여주시고 아무렇게나 핀 들꽃도 솔로몬의 옷보다 더 화려하게 만드시는데, 정작 공중의 새나 들꽃보다 더 소중한 인간은 하느님이 새나 들꽃보다 그들을 더 잘 먹여 주시고 더 잘 입혀주실 거라는 믿음을 갖고 있지 못한 것 같다고 탓하십니다. 그리고 인간은 여러 관심 중에서 가장 큰 관심인 목숨의 문제에 대해서 늘 걱정하는데, 이것 또한 걱정한다고 해서 한 시간이라도 늘일 수 없는 것임을 말씀하십니다. 사실 먹는 것, 입는 것, 사는 것, 이 모든 것에 대한 걱정은 인간이 육체를 가진 이상 어쩔 수 없이 생기는 고민인 것입니다. 따라서 인간이라면 누구라도 이 걱정으로부터 자유로울 수 없습니다. 매슬로우라는 널리 알려진 심리학자가 있습니다. 그는 인간의 욕구를 5단계로 나누어서 설명했습니다.[^4]",
                    "매슬로우는 가장 밑에 있는 첫째 단계의 욕구를 생리적 욕구라고 불렀습니다. 이 생리적 욕구는 인간에게 있어 가장 기본이라 할 수 있는 의, 식, 주, 따뜻함에 관한 욕구입니다. 춥고 배고픈 문제가 해결되지 않으면 다른 욕구들은 모습을 드러내지 않는다고 합니다. 두 번째 욕구는 안전의 욕구로서, 생리적 욕구가 어느 정도 충족되면 신체적 및 감정적 위험으로부터 보호되고 안전해지기를 바라는 욕구입니다. 이제 앞의 두 단계 욕구가 채워지면 생기는 세 번째 욕구인 소속감 및 애정의 욕구가 생겨난다고 합니다. 즉, “어느 집단에 속하고 싶다, 동료들과 친하게 지내고 싶다” 등의 욕구입니다. 세 번째 단계인 소속감 및 애정의 욕구가 채워지면, 인간은 집단의 단순한 구성원의 존재를 넘어서서 타인으로부터 주목을 받고 인정받으며 집단 내에서 지위를 확보하려는 욕구가 생긴다고 합니다. 이것을 네 번째 단계인 존경의 욕구라고 부릅니다.",
                    "그리고 이 욕구가 채워지면 이제 마지막 5단계인 자아실현 욕구가 드러난다고 합니다. 이 자아실현의 욕구는 계속적인 자기발전을 통하여 성장하고 자신의 잠재력을 극대화하여 자아를 완성시키려는 욕구입니다. 매슬로우의 욕구 5단계설이 과학적이고 객관적이라고 말할 수는 없습니다. 그래서 법칙이 아니라 “설”이라고 불리지만, 그래도 우리에게 시사하는 바가 크다고 생각합니다. 오늘 복음에서 예수께서 우리에게 걱정하지 말라고 하신 것은, 매슬로우의 욕구 5단계설에 비추어 본다면 첫 번째 단계인 바로 생리적 욕구입니다. 예수께서는 우리가 생리적인 욕구를 무시할 수는 없지만, 거기에 지나치게 얽매여 사는 것도 큰 문제라고 말씀하시는 것입니다. 물론 생활고로 인해 자살을 하는 사람들의 숫자도 무시하지 못합니다. 그러나 그런 경우에는 생활고의 문제라기보다는, 「칼의 노래」와 「남한산성」을 쓴 김훈 작가의 말을 빌자면 “밥벌이에 대한 지겨움과 염증”으로 인해 살고자 하는 의지나 욕구가 시들어 버렸기 때문에 벌어진 일이라고 추측해 봅니다.",
                    "단순히 먹고, 입고, 자는 문제만의 해결을 원한다면 지금의 대한민국 시스템에서는 관공서나 사회기관으로부터 어느 정도 도움을 받을 수 있습니다. 제가 예전에 일했던 곳이 살림터라고, 노숙 위기를 맞은 가족들을 보호하는 쉼터였습니다. 그곳에는 경제적으로 파산한 분들이 대부분이었습니다. 그러나 같은 처지라고 하더라도 삶의 의지만 있다면 열심히 일해서 자립해 나가지만, 그럴 의지가 없다면 알코올 중독 등으로 더 나락에 떨어지기도 합니다. 찾아보면 도움을 받을 수 있는 기관들이 분명히 있는데도 자살 등으로 삶을 마감하는 것을 보면, 단순히 의, 식, 주의 문제는 아닌 것 같습니다. 그것보다는 세상과 자신을 원망하다가 점차 마음이 세상을 등지게 되어 그러한 선택을 하는 것이라는 생각이 들었습니다. 객관적으로 보아도 대한민국은 국민들을 굶겨 죽이지 않는 경제력 정도는 가지고 있다는 생각이 듭니다.",
                    "3.",
                    "이처럼 우리가 진정 배고픈 이유는 이런 생리적인 욕구를 해결하지 못해서가 아니라, 우리의 정신적, 영적인 배고픔을 해결하지 못해서일지도 모릅니다. 남들이 명품 옷을 입고 명품 가방을 들고 다니는 것을 보면, 지금 내가 입고 있는 옷이나 들고 다니는 가방이 무가치해 보이고 나도 그들처럼 명품을 사기 위해 욕구에 몰입합니다. 지금 내가 타고 다니는 차가 다른 사람의 차에 비해 뒤떨어져 보이면 무리하게 렌탈을 통해서라도 차를 바꾸는 풍조가 만연합니다. 영끌을 통해 집을 사는 일도 마찬가지입니다. 이것은 우리 가치의 기준이 우리 내부에 있는 것이 아니라 외부에 있음을 말합니다. 타인의 기준에 맞춰진 욕망은 물을 붓고 또 부어도 채울 수 없는 밑 빠진 독이 되었습니다. 우리의 마음에는 그것보다 훨씬 더 소중한 것이 있는데, 그것을 모른 채 다람쥐 쳇바퀴처럼 욕망과 이기적인 에고의 굴레에 사로잡힙니다. 그래서 “인간은 자신의 욕망을 욕망하기보다는 타인의 욕망을 욕망한다.”라는 말이 있는 것입니다.",
                    "그렇게 타인의 욕망을 욕망하는 삶을 살다 보면 우리는 우리 안에 계시는 하느님을 끝끝내 발견하지 못할지도 모르며, 매슬로우의 말처럼 평생 일차적이고 저차원적인 욕구를 해결하느라 삶을 허송세월할 수도 있는 것입니다. 이것이야말로 작금의 배금주의가 인간에게 씌우는 굴레이며, 인간을 교묘하게 조종하는 자본주의의 악마성이 아닐까 하는 생각이 듭니다. 오늘 복음이 우리에게 전하고자 하는 바는 바로 이것을 과감하게 떨쳐버리라는 것입니다. 이제 그만 눈을 들어 하늘을 보라는 것입니다. 또한 귀를 기울여 우리 안에 계시는 성령의 목소리를 들으라는 것입니다. 인간을 단지 생리적 욕구의 충족에만 묶어 놓으려는 현실의 비루함을 떨쳐버리고, 무엇보다도 우리의 창조주가 우리를 세상에 내신 참뜻을 찾아 나서라는 것입니다. 그것이 바로 오늘 복음에서는 “너희는 먼저 하느님의 나라와 하느님께서 의롭게 여기시는 것을 구하여라. 그러면 이 모든 것도 곁들여 받게 될 것이다.”입니다.",
                    "우리가 생리적 욕구에만 머무르지 않고 **하느님 나라와 그분의 의를 찾아나서는 영적 여정**에 나선다면, 우리는 결국 매슬로우가 말한 욕구실현의 최고의 단계인 자아실현의 길에 도달할 수 있을 것입니다. 자아실현이란 주님께서 내게 주신 특별한 잠재력을 주님과 함께, 주님과 세상을 위해 사용할 때 드러나는 법입니다. 오늘 2독서인 야고보서도 이것을 강조합니다. “그저 듣기만 하여 자기 자신을 속이는 사람이 되지 말고 말씀대로 실천하는 사람이 되십시오. 하느님 아버지 앞에 떳떳하고 순수한 신앙생활을 하는 사람은 어려움을 당하고 있는 고아들과 과부들을 돌보아 주며 자기 자신을 지켜 세속에 물들지 않게 하는 사람입니다.” 친애하는 광명교회 교우 여러분 **우리에게는 이미 하느님께서 주신 지혜가 있습니다.** 그 지혜는 우리로 하여금 자기 자신을 지켜 세속에 물들지 않게 합니다. 그 지혜를 지키는 방법은 우리의 감사한 마음을 밖으로 드러내는 행위를 통해서입니다. 그것이 우리의 몫임을 깨닫는 2026년 추수감사주일이 되기를 주님의 이름으로 기도합니다. 성부와 성자와 성령의 이름으로 말씀드렸습니다.",
                ]
            },
            {
                "date": "2026-10-11",
                "title": "초대에 감사할 줄 아는 마음",
                "scripture": "이사 25:1-9 / 시편 23편 / 필립 4:1-9 / 마태 22:1-14",
                "preacher": "이남호(사도요한) 사제",
                "footnotes": [
                    "마태 22:14의 말씀입니다.",
                    "처음 초대받은 사람들을 이스라엘의 지도자로 보는 해석은 널리 알려진 해석 가운데 하나입니다. 학자마다 다른 해석도 있습니다.",
                    "고레에다 히로카즈 감독은 2018년 「어느 가족」(Shoplifters)으로 칸 황금종려상을 받았습니다. 「브로커」(2022)로는 송강호가 칸 남우주연상을 받았습니다.",
                ],
                "source": {
                    "label": "원문 보기(네이버 블로그)",
                    "url": "https://m.blog.naver.com/brave9955/224469225568"
                },
                "paragraphs": [
                    "1.",
                    "성부와 성자와 성령의 이름으로 말씀드립니다. 한 주간 동안 안녕하셨는지요? 가을이 무르익는 10월에 많은 행사나 잔치가 열리고 있습니다. 성소주일 같은 큰 행사 소식은 없지만, 그래도 여러 교회나 기관의 기념행사나 음악회, 결혼식 등을 알리는 초대장이 우편이나 온라인으로 날아듭니다. 한때 세태를 반영하는 뉴스 중의 하나가 “지인의 결혼식에 과연 얼마의 축의금을 내야 하는가?”였습니다. 이제는 어느 정도 금액이 굳어진 것 같지만, 가끔 소액의 축의금을 내고 식구들이나 친구들이 몰려가서 식사를 하는 것에 대한 찬반 의견으로 인해 인터넷이 달궈지기도 합니다. 제 스스로 결론을 내린다면, 아주 가깝지 않은 경우 그냥 소액의 축의금만 보내고 결혼식장에는 모습을 나타내지 않는 것이 최선이라는 생각도 듭니다.",
                    "또 드라마를 보면 예전에 헤어진 여자 친구가 자신의 친구 또는 가까운 지인과 결혼하는 장면이 나옵니다. 그래서 친구 혹은 지인이 자신에게 청첩장을 보냈지만 가야 할 것인가, 아니면 무시해야 할 것인가로 고민하는 장면을 보신 적도 있으실 겁니다. 나타나자니 옛 애인이 소스라치게 놀라는 장면이 그려지고, 가지 않으려고 하니 자신을 초대한 친구나 지인을 무시하는 것 같아 난감한 마음이 듭니다. 진퇴양난의 상황인 것입니다. 어떤 글에서 가톨릭 신부님이 말하기를, 자신이 신학교를 다니다가 군에서 제대하고 복학했는데 계속 성직의 길을 가는 것에 자신이 없어서 신학교를 그만두고 다시 일반대학에 들어가려는 생각을 품고 있었다고 합니다. 그런데 어머니께서 본당 부제님이 사제서품을 받으니 서품식에 가려고 하는데 입장권이 한 장 더 있으니 같이 가자고 그 신부님에게 권했다고 합니다. 그렇지 않아도 마음이 착잡한데 어머니가 가자고 하니 괜히 짜증이 나서 어머니의 청을 거절하고, 그날은 하루 종일 술만 마셨다고 합니다.",
                    "그 신부님은 그날의 기분이 오늘 복음처럼 잔치에 초대받았으나 응하지 않았던 사람들의 마음이 이러하지 않았을까 라고 말하고 있습니다. 꽤나 적절한 비유입니다. 이처럼 잔치에 초대받긴 했지만 가야 할지 말아야 할지가 애매했던 경우가 누구에게나 있는 것 같습니다.",
                    "2.",
                    "오늘 복음에서도 잔치에 초대를 받았으나 그 초대를 거절하는 사람들이 등장합니다. 어떤 임금이 자신의 아들의 혼인 잔치에 올 만한 사람들에게 초청장을 보냈습니다. 그런데 그 사람들은 모두 초대를 거절했습니다. 이들은 감히 임금의 초청을 거절할 만큼 뻔뻔하고 무례한 사람들이었습니다. 그리고 그 거절의 행태도 다양했습니다. 첫 번째 사람은 밭으로 가고, 두 번째 사람은 장사를 하러 가고, 심지어 마지막 사람은 초청의 소식을 전한 임금의 종을 때리거나 죽이기까지 했습니다. 이제 초청한 사람들이 오지 않으니 잔치는 낭패를 볼 수밖에 없는 지경에 이르게 되었습니다. 임금은 임금인지라 몹시 노하여 자신의 권력을 휘둘러 자기 종을 죽인 사람을 잡아 죽이고 동네를 불살라 버립니다. 그리고 종들에게 “혼인 잔치는 준비되었지만 전에 초청받은 자들은 그만한 자격이 없는 자들이었다. 그러니 너희는 거리에 나가서 아무나 만나는 대로 잔치에 청해 오너라.”고 명령합니다. 다급해진 종은 거리에 나가 나쁜 사람, 좋은 사람 가릴 것 없이 만나는 대로 데려왔습니다. 그리고 결국 잔치 집은 그들로 가득 차게 됩니다.",
                    "그런데 일이 여기서 끝난 것은 아니었습니다. 임금이 손님들을 살피면서 예복을 입지 않은 사람 하나를 찾아낸 것입니다. 그리고 “예복도 입지 않고 어떻게 여기에 들어왔느냐?”고 묻습니다. 그 사람이 대답을 하지 못하자 임금은 하인들에게, “이 사람의 손발을 묶어 바깥 어두운 데 내쫓아라. 거기서 가슴을 치며 통곡할 것이다.”하고 말하였습니다. 그리고는 다음과 같은 말을 덧붙입니다. “부르심을 받은 사람은 많지만 뽑히는 사람은 적다.”[^1] 저는 이 비유를 읽으면서, ‘잔치에 초대받았는데 초대를 거절하는 것도 어렵고, 그 초대에 맞게 예법을 갖춰서 참석하는 것도 힘들구나.’라는 생각을 하게 되었습니다.",
                    "어떤 학자에 의하면 먼저 초대받은 사람들은 이스라엘 사람들이고, 나중에 초대받은 사람은 이방인들이라고 합니다. 또 다른 학자는 위의 비유가 인간은 각자가 자기의 선택에 의해 하느님의 초대를 거부할 수도 있고 또는 수용할 수도 있다는 실존적 결단에 대해서 말하고 있음을 의미한다고 합니다. 그러나 가장 일반적인 해석은, 처음 초대받은 사람들은 바리사이파나 대사제, 율법학자들과 같은 이스라엘의 지도자들이고, 나중에 초대받은 사람들은 그들로부터 경멸을 받던 기층민이거나 천민, 또는 하느님의 사랑과 자비, 의에 굶주린 세리나 창녀 같은 죄인들이라는 것이었습니다. 이스라엘의 지도자들은 하느님의 초대를 거절했습니다.[^2] 그들의 거만함과 배타적인 마음이 하늘나라에 관한 복음을 거부한 것입니다. 그리고 그 소식을 전하러 간 세례 요한 같은 예언자들도 그들의 손에 죽고 말았습니다. 예수께서는 그들의 행동에 대한 응분의 벌이 준비되어 있다고 하셨습니다.",
                    "3.",
                    "그런데 여기서 좀 더 살펴보아야 할 문제는, 예복을 갖춰 입지 않은 사람이 쫓겨났다는 사실입니다. 이 비유가 뜻하는 바는 무엇일까요? 엉겁결에 초대를 받았더라도 그 초대를 가벼이 여기지 않고 예를 지키는 사람, 그 사람들만이 진정으로 하느님 나라의 잔치를 누릴 수 있다고 예수님은 말씀하고 계십니다. 그렇다면 예복을 갖춰 입지 않은 사람들이란 어떤 부류일까요? 그러한 사람들은 하느님의 초대를 받긴 했으나 그분의 뜻을 실천하지 않는 쭉정이 그리스도인을 말합니다. 즉 그들은 부르심은 있었지만 정작 하느님의 뜻을 제대로 행하지 않는 사람들인 것입니다. 마태오 복음에 의하면 그들은 부르심을 받았으나 그저 “주님, 주님” 부르짖기만 하고 하느님의 뜻을 행하지 않은 사람들인 것입니다. 흔히 마태오 복음을 교회의 교과서라고 말합니다. 마태오가 바라보는 교회는 성스러움과 속됨이 뒤범벅된 곳입니다. 또한 마태오 복음은 무엇보다도 실천을 강조하는 복음입니다.",
                    "우리의 믿음은 행위로 나타나야 하고, 이제 거꾸로 그 행위가 우리의 믿음을 증명해 줍니다. 이제 우리가 가야 할 길은 명백합니다. **우리의 믿음을 행위로 증명하는 것입니다.** 그 행위가 우리에게는 잘 차려 입은 예복이 되는 것입니다. 우리는 부르심은 받았으나 뽑히지 못하는 사람이 되어서는 안 됩니다. **부르심을 받고 그 부르심에 대해 우리의 전 인격으로 응답하는 사람이 되어야 합니다.** 하느님은 많은 사람들을 부르셨지만 정작 뽑히는 사람은 부르심을 받은 사람에 비해 숫자가 적을 것입니다. 이것은 우리 모두가 다 잘 아는 벼와 가라지의 비유와 의미가 상통하기도 합니다. 열매를 맺는 알곡이 될 것인가, 아무 쓸모없이 불구덩이에 던져지는 가라지가 될 것인가의 선택은 전적으로 우리에게 달려 있습니다.",
                    "4.",
                    "저는 몇 년 전에 일본인 영화감독으로 칸 영화제에서 황금종려상을 수상한 고레에다 히로카즈의 「브로커」라는 영화를 본 적이 있습니다.[^3] 배우 송강호는 이 영화로 칸 영화제 남우주연상을 수상했습니다. 흥행도 참패했고 대중적 평판도 좋지 않았지만, 확실히 거장의 영화는 사람의 가슴 속에 무언가를 남기는 힘이 있다는 것을 새삼 느끼게 한 영화였습니다. 최근 TV에서 본 박찬욱 감독의 영화 「어쩔 수가 없다」 역시 제게 묵직한 울림을 주었습니다. 브로커의 원래 의미는 중개인이지만 부정적인 의미에서는 불법적인 일을 알선하고 돈을 받는 사람들을 의미합니다. 영화에서 브로커의 의미는 버려진 아이들을 몰래 빼돌려 파는 사람들을 지칭하는 용어입니다. 버려진 아이들이나 아이를 버린 엄마나 브로커 일을 하는 영화 속 인물들이나 하나같이 세상으로부터 환대받지 못한 안타까운 존재들이었습니다.",
                    "그러나 세상에 초대받지 못했다고 해서 세상을 저버리거나 세상에 대해 앙심을 품고 살 수도 없는 것이 인간이기도 합니다. 영화는 참으로 아름다운 우리나라의 하늘과 산, 바다를 여러 차례 비춰줍니다. 동시에 그 밑에서 비루한 삶을 살아가는, 세상에 초대받지 못한 인간 군상을 집중적으로 조명합니다. 그러한 이들이 같이 길을 떠나게 되면서 스스로를 환대하는 법을 배우기 시작합니다. 세상이 정녕 우리를 환영하지 않는다면 우리끼리라도 서로를 환대하면서 사는 것은 어떠한가라고. 일종의 환대 공동체의 탄생이었습니다. 우리가 사는 삶이 그렇지 않습니까? 우리는 누군가와의 결속과 연대를 통해 우리를 환영하지 않는 세상에 맞서고 견뎌내는 법을 배웁니다. 감독은 함께 세상에 맞서고, 같이 세상을 견뎌내고, 서로를 환대한다면 그것이야말로 가족이며 공동체라는 통찰을 던져줍니다. 그런데 그러한 연대에의 초대가 하물며 아버지 하느님으로부터 온 것임을 알아차리는 안목이 있다면, 그 사람은 진정으로 마음이 가난한 사람이고, 아버지 하느님과도 충분히 가족을 이룰 수 있는 사람일 것입니다.",
                    "우리는 우리를 당신의 자녀로 초대하는 부르심에 대해 예를 갖춰 응답해야 합니다. 그 초대에 대한 응답이 간절해지기 위해서는 세상으로부터 나를 견뎌내게 하는 아버지 하느님과의 연대가 필요하다는 사실을 온몸으로 체험해 본 적이 있는 사람이어야 합니다. **그러한 사람이 바로 성서가 말하는 마음이 가난한 사람입니다.** 우리는 아버지 하느님의 초대를 거절하는 어리석음과 거만, 배타적인 마음을 씻어내고 우리 마음의 허전한 곳을 하느님으로 채울 수 있는 존재가 되어야 합니다. 마음이 가난해야 감사할 줄도 아는 법입니다. 제가 근무하는 바닷가 영흥의 사무실 뒷마당에는 몇 달 전부터 내지로부터 밀려난 고양이 가족이 머무르고 있습니다. 바짝 마른 어미 고양이와 주먹만 한 새끼 고양이 두 마리가 사무실 뒷마당을 배회했습니다. 오늘 복음의 관점으로 보자면 이것 역시 저에 대한 하느님의 초대라고 볼 수 있습니다. 저는 그 초대에 응해 예복을 갖춰 입고자 사료를 사서 열심히 먹였습니다. 어려운 이웃에 대한 약간의 선행이었습니다. 그랬더니 어미 고양이가 살이 오르고 새끼 고양이들도 무럭무럭 자라게 되었습니다.",
                    "그리고 저와 그들 사이에 묘한 연대감이 형성되었습니다. 저만의 짝사랑이기는 하지만 저는 그들과 가족이 된 것 같은 기분이 들었습니다. 더불어 한 가족을 돌보고 있다는 뿌듯한 마음이 저를 좀 더 인간답게, 사제답게 만드는 것 같았습니다. 여러 일로 인해 심신이 피곤할 때 창밖 너머 그 가족을 바라보는 것은 제게 큰 위로를 주었습니다. 아무쪼록 하느님께서 무심코 던지시는 초대의 기회를 잘 알아차리고 예를 다해 그 초대에 참여하는 사람이 되어야 합니다. 저와 여러분이 꼭 그러하기를 주님의 이름으로 기원합니다. 성부와 성자와 성령의 이름으로 말씀드렸습니다.",
                ]
            },
            {
                date: "2026-09-20",
                title: "물질을 넘어서는 가치",
                scripture: "신명 28:1-14 / 시편 65편 / 2고린 9:6-15 / 루가 12:16-30",
                preacher: "이남호(사도요한) 사제",
                "footnotes": [
                    "『군주론』 17장의 대목입니다. 영어 번역은 ‘a man is quicker to forget the death of his father than the loss of his patrimony’에 해당합니다.",
                    "2026년 9월 보도 기준입니다. 구광모 회장과 양어머니 김영식 씨는 2023년 제기된 상속재산 분할 소송에서 1심 패소 후 항소 중이며, 김 씨가 제기한 파양 소송은 2026년 9월 기각되었습니다.",
                    "루가 12:15의 말씀을 옮긴 것입니다.",
                    "칼 마르크스 『경제학 비판 서문』(1859)의 문장을 바탕으로 한 인용입니다. 원문은 ‘사람들의 사회적 존재가 그들의 의식을 규정한다’에 가깝습니다.",
                    "서울 종로구 성북동은 1970~80년대 대표적인 고급 주택가로 알려져 있습니다.",
                    "서울 강남구 도곡동에 있는 초고층 주상복합 아파트입니다.",
                    "1517년 마르틴 루터가 면죄부 판매를 비판하며 95개 조항을 발표한 일을 가리킵니다.",
                    "2000년 KBS2 드라마 〈가을동화〉에서 원빈이 연기한 한태석의 대사입니다.",
                    "마태 19:24, 마르 10:25, 루가 18:25에 같은 비유가 나옵니다.",
                ],
                source: { label: "원문 보기(네이버 블로그)", url: "https://m.blog.naver.com/brave9955/224474145070" },
                note: "본문 중 찬양 가사는 저작권을 고려해 싣지 않았습니다.",
                paragraphs: [
                    "성부와 성자와 성령의 이름으로 말씀드립니다. 한 주간 동안 잘 지내셨는지요? 어느덧 가을이 다가온 것 같습니다. 정말 지독히도 무더웠던 여름이었습니다. 아무쪼록 광명교회 교우 여러분 모두에게 신앙의 성장을 가져오는 2026년 가을이 되기를 주님의 이름으로 기도합니다. 르네상스 시대의 철학자이자 정치이론가인 마키아벨리가 다음과 같은 말을 했다고 합니다. “인간은 아버지의 죽음보다 유산의 상실을 더 오래 기억한다.”[^1] 저는 유산을 물려받은 일이 없어서 실감이 나지 않는 말이지만, 인간의 돈과 물질에 대한 집착을 미루어 볼 때 충분히 일리가 있는 의견이라고 생각합니다. 우리나라 대기업에서는 상속이나 후계 문제로 형제들끼리 갈라서는 경우가 꽤 있습니다. 현대나 두산 같은 그룹은 형제 중의 하나가 마음에 상처를 받아 자살한 경우도 있습니다. 지금 엘지의 경우도 회장과 입양모가 유산을 두고 법정다툼을 벌이고 있습니다.[^2]",
                    "굳이 이러한 거대 기업의 예를 들지 않더라도 우리의 일상사에서 유산을 두고 싸우는 일은 빈번합니다. 부모의 유산을 물려받기 위해 형제를 정신병원에 강제 입원시켜서 세간의 입에 오르내리는 사건이 있는가 하면, 칼부림이 일어나는 경우를 봅니다. 또한 형제자매가 유산 문제로 인해 평생을 담을 쌓고 지내기도 합니다. 오늘 복음의 앞부분에서는 어떤 사람이 그러한 문제를 해결해 달라고 예수님께 청원을 하는 장면이 나옵니다. 그러나 예수님은 “오냐, 그러마.” 하고 나서지 않는 대신, 재산과 생명을 대비해서 재산의 덧없음에 대해 말하고 계십니다. 결론은 이렇습니다. “어떤 탐욕에도 빠져들지 않도록 조심하여라. 사람이 제 아무리 부요하다 하더라도 **그의 재산이 생명을 보장해 주지는 못한다**.”[^3] 우리는 재산이 생명을 보장해주지 않는 사실은 알고 있습니다. 그러나 평소에 우리는 이 진실을 아주 까마득하게 잊고 살아갑니다. 왜 예수께서는 이토록 탐욕에 빠지지 말라고 경계하신 걸까요?",
                    "아마도 그것은 돈이나 재물이 돈과 재물 자체로 끝나는 문제가 아니기 때문에 말씀하신 거라는 생각이 듭니다. 그리고 현대는 성서가 기록되었던 2천 년 전보다도 훨씬 더 강력한 배금주의가 판을 치고 있는 세상입니다. 공산주의 철학의 완성자인 마르크스는 다음과 같이 말했습니다. “사회적 존재가 그 의식을 규정한다.”[^4] 여기서 사회적 존재라고 하는 것은 지금 우리 사회를 지배하는 경제체제인 자본주의를 말합니다. 마르크스는 자본주의라는 체제가 우리의 정신과 마음을 규정하는 마력이 있다고 말합니다. 마르크스는 돈이나 물질 그 자체가 문제가 아니라 돈이나 물질이 우리의 생각과 마음을 지배하게 되는데 문제가 있다고 지적했으며, 예수님 또한 이미 이러한 위험을 알아차리고 우리로 하여금 돈과 물질에 대해 어떤 태도를 가져야 할 것인가를 말씀하고 계십니다.",
                    "여러분의 가방에 5만 원 권 2000장으로 1억 원의 현금이 들어있다고 상상해 보시길 바랍니다. 교우 여러분의 마음은 어떨 것 같습니까? 여러분의 마음은 어디로 향합니까? 아마 다른 사람들의 말이 귀에 잘 들어오지 않을 것입니다. 여러분의 마음은 온통 돈을 담은 가방에 쏠려 있을 것입니다. **재물이 있는 곳에 마음이 있기 때문입니다.** 친구라도 다가오면 그 돈 가방 때문에 썩 마음이 편하지는 않을 것입니다. 우리는 돈을 지키기 위해 타인을 의심하고 움츠려 들며 경계하게 됩니다. 그래서 우리는 이제 상대방도 그 정도의 돈쯤은 갖고 있어서 내 돈을 빼앗아 가지 않을 것 같은 사람과 어울리게 됩니다. 비슷한 사람들이 모이면 그게 바로 계급이 되고 가장 돈이 많은 사람들은 high society, 즉 상류사회를 이루면서 살게 되는 것입니다. 물론 상류사회에 속하는 것이 꼭 돈이 많아서 되는 것은 아니지만 상류사회에 속하기 위해서 필수적인 것이 바로 돈인 것입니다.",
                    "그리고 소위 상류사회에 속한 사람들의 집을 보시기 바랍니다. 요즘에는 잘 주목하지 않지만 70-80년대까지만 해도 성북동이 그들의 주요 거주지였습니다.[^5] 그 동네를 가보신 분들은 알겠지만 일단 담이 엄청나게 높습니다. 그리고 곳곳에 방범초소가 그 부촌을 지키고 있습니다. 대중교통은 없으며 차를 타야만 집에 갈 수 있습니다. 그들의 높은 담은 그들이 지니고 있는 부를 지키기 위한 한 방편이지만, 그렇다고 담이 단순한 담으로 끝날까요? 저는 그렇게 생각하지 않습니다. 그들의 높은 담은 그들이 세상에 대해 둘러 친 높은 마음의 벽을 상징합니다. 즉 지킬 것이 많기 때문에 폐쇄적으로 변한 그들 마음을 실질적으로 보여주는 것입니다. 마르크스의 말대로 존재가, 물질이 그들의 의식을 어떻게 지배하는지를 정확하게 보여주는 실례인 것입니다. 그리고 21세기 최고 부촌의 상징이었던 타워팰리스를 보십시오.[^6] 그곳에 한 번 들어가기 위해서는 어렵고도 복잡한 절차가 필요합니다. 그들은 자신의 기득권을 지키기 위해서 비슷한 수준의 사람들과 어울리고, 같은 아파트 단지 내에서 혼담이 오고갑니다.",
                    "분명 인간은 물질과 돈이 필요한 존재이지만 그것을 넘어 영적이며 정신적인 존재이기도 합니다. 우리에게는 돈으로 환산할 수 없는 수많은 정신적 가치들이 존재합니다. 기독교는 그런 영적, 정신적 가치들이 물질보다 더 중요하다고 말하는 종교입니다. 모든 고등종교들이 인간의 정신적 가치에 대해 끊임없이 역설하고 있습니다. 그러나 우리가 살고 있는 이 자본주의, 즉 인간이 근본이 되는 사회가 아니라 물자가 근본이 되는 사회에서의 영적, 정신적 가치는 정말 대답 없는 메아리에 불과할 때가 있습니다. 남녀 간의 사랑이나 친구들 간의 우정, 그리고 돈을 뛰어넘어서 지키고 싶은 나만의 명예와 진실, 사람들 사이의 신의와 건강, 애국심 등, 돈으로 환산할 수 없는 가치가 우리의 마음속에서 물질로 환산될 수 있다는 확신을 불어넣어주는 사회가 바로 지금의 자본주의 사회인 것입니다.",
                    "모든 것은 돈으로 교환될 수 있다는 환상을 만들어내는 사회가 바로 자본주의 사회인 것입니다. 우리의 고귀한 신앙생활 끝에 얻어지는 구원이 몇 푼의 면죄부를 구입함으로써 가능하다고 설파했던 타락한 중세 가톨릭에 대해, 루터가 분연히 대항한 것은 그리스도인으로서 너무 당연한 것이었습니다.[^7] 예전에 가을동화라는 드라마에서 배우 원빈이 히트시켰던 말이 생각납니다.[^8] 그는 자주 이렇게 말합니다. “얼마면 돼?” 한 번쯤 이렇게 말하고 싶을 정도로 돈이라도 많아 봤으면 좋겠다는 생각을 해보기도 하지만, 그럼에도 불구하고 무척이나 씁쓸함을 느끼게 하는 대사였습니다. 예수님은 돈으로 환산될 수 없는 것조차 돈으로 교환될 수 있다고 믿는 우리들의 환상과 착각을 경계하라고 하시는 것입니다. 그래서 예수님은 부자가 하늘나라에 들어가는 경우는 낙타가 바늘구멍을 지나갈 만큼이나 적은 확률이라고 말씀하신 것입니다.[^9] 부자들일수록 돈으로 해결되는 것이 많다고 믿기 때문입니다.",
                    "이제 예수님은 우리가 물질에 대해 어떤 태도를 가져야 하는가에 대해 우리에게 말씀하고 계십니다. “그러니 잘 들어라. 너희는 무엇을 먹고 살아갈까, 또 몸에 무엇을 걸칠까 하고 걱정하지 말라. 목숨이 음식보다 더 귀하고 몸이 옷보다 더 귀하지 않느냐? 저 꽃들이 어떻게 자라나는가를 생각해 보아라. 그것들은 수고도 아니하고 길쌈도 하지 않는다. 오늘 피었다가 내일이면 아궁이에 던져질 들꽃도 하느님께서 이처럼 입히시거늘…” 그러나 우리 마음에 우리의 생존 지속성과 안전성에 대한 의혹이 끊임없이 생겨나고, 그것을 물질로 보장받아 보려는 마음이 우리를 지배할 것을 아시는 주님은 이렇게 말씀하십니다. “너희는 왜 그렇게도 믿음이 적으냐? 너희는 먼저 하느님의 나라를 찾아라. 그러면 이 모든 것도 곁들여 받게 될 것이다.” 결국 예수님은 우리가 무엇을 궁극적인 가치로 두는가가 중요하다고 말씀하시는 것입니다.",
                    "차마 교회를 다니지 않거나 하느님을 믿지 않는 사람들에게 이렇게 살아보라고는 하지 못하겠습니다. 그러나 스스로를 신앙인이라고 고백하는 우리들이라면 정말 굳은 믿음을 걸고 먼저 하느님의 나라, 하느님의 의를 구하는 것이 가장 필요할 것입니다. 살고자 하는 사람에게, 하느님의 뜻을 좇으려고 애쓰는 자에게 도움을 주시는 분이 하느님이지 찬물을 끼얹는 분이 아니라는 믿음이 있다면, 들꽃이나 날짐승이 주어진 명대로 자신의 생명을 이어가듯이, 우리 역시 하루하루의 삶을 걱정 없이 살아갈 수 있을 것입니다. 그분은 우리가 물질을 통해 불투명한 미래를 보장받기를 원하는 것이 아니라 당신의 인도로 살아가기를 바라시는 분이신 것입니다. 고전적인 복음성가가 생각납니다.",
                    "이런 삶을 바로 신학적인 용어로는 종말론적인 삶이라고 합니다. 종말론은 이단들이 말하는 어느 구체적인 시점을 이야기하는 것이 아니라 하루하루가 삶의 끝이라고 생각하고 살아가는 태도를 말합니다. 언제 그분이 나의 삶을 거두어갈지 모르기 때문에, 언젠가 나의 종말이 될지 모르기 때문에, 하루하루를 꽉 찬 삶으로 최선을 다해 살아가는 것, 그것이 주님이 바라시는 깨어 있는 삶인 것입니다. 이제 다시 한 번 정리하도록 하겠습니다. 우리가 가장 걸려 넘어지기 쉬운 것이 물질이자 돈이기 때문에 그 물질에 대한 집착을 버리고 하느님 나라와 의를 구하는 것이 신앙인으로서의 성숙의 척도라고 할 수 있으며, 그것이 우리 삶의 종말을 준비하는 바람직한 태도인 것입니다. 덴마크의 철학자 키에르케고르는 이렇게 말했습니다. “절망이란 현재를 살지 못하는 것이다.” 과거의 아픈 기억이나 아직 다가오지 않은 미래에 대한 불안 속에서 살면서 지금을 제대로 살아가지 못하는 것, 키에르케고르는 그것을 절망이라고 했습니다.",
                    "많은 사람들이 절망한 줄도 모르면서 절망의 상태를 살아갑니다. 우리가 절망의 삶을 살지 않으려면 **현재를 충실히 살아가야 합니다**. 현재를 충실히 사는 것, 신앙인으로서 도전해 볼 만한 일입니다. 창조절을 맞이하여 까마귀나 들풀처럼 하느님의 창조 질서 안에서 살아가는 것이 진정 복된 삶임을 깨닫는 저와 여러분이 되기를 주님의 이름으로 기원합니다. 성부와 성자와 성령의 이름으로 말씀드렸습니다.",
                ]
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
                { label: "설교와 강연",    href: "sermons.html" },
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
