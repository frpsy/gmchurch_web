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
        advent:    { key: "advent",    name: "대림절",       colorName: "자색", color: "#6b4f8f", colorLight: "#f0eaf7", onColor: "#fff",     symbol: "🕯️", note: "주님의 오심을 기다리는 시간" },
        christmas: { key: "christmas", name: "성탄절",       colorName: "백색", color: "#b8860b", colorLight: "#fbf3df", onColor: "#1a1a1a", symbol: "⭐",   note: "말씀이 사람이 되시다"   },
        epiphany:  { key: "epiphany",  name: "공현절 후",    colorName: "녹색", color: "#3d6b4a", colorLight: "#eef2ec", onColor: "#fff",     symbol: "✨",   note: "주님이 세상에 드러나심" },
        lent:      { key: "lent",      name: "사순절",       colorName: "자색", color: "#6b4f8f", colorLight: "#f0eaf7", onColor: "#fff",     symbol: "✝️",  note: "회개와 절제의 시간"     },
        holyweek:  { key: "holyweek",  name: "성주간",       colorName: "적색", color: "#c0390f", colorLight: "#fdf2ee", onColor: "#fff",     symbol: "🌿",   note: "주님의 수난을 묵상"     },
        easter:    { key: "easter",    name: "부활절",       colorName: "백색", color: "#b8860b", colorLight: "#fbf3df", onColor: "#1a1a1a", symbol: "🌅",   note: "다시 살아나신 주님"     },
        pentecost: { key: "pentecost", name: "성령강림절",   colorName: "적색", color: "#c0390f", colorLight: "#fdf2ee", onColor: "#fff",     symbol: "🔥",   note: "성령께서 임하시다"      },
        ordinary:  { key: "ordinary",  name: "성령강림 후",  colorName: "녹색", color: "#3d6b4a", colorLight: "#eef2ec", onColor: "#fff",     symbol: "🌿",   note: "그리스도인의 일상"      }
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
        slogan: "모든 생명을 환대하는 교회",
        vision: "하느님 나라를 살아가는 사랑의 공동체",
        diocese: "대한성공회 서울교구 서부교무구",
        aboutLead: "성공회 기도서를 따라 예배하며, 생태 보전을 신앙의 과제로 삼는 광명의 녹색 교회입니다.",
        aboutDesc: "주일 애찬에는 비건 음식도 함께 마련합니다.",
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

    anglican: {
        welcome: "광명교회를 찾아 주셔서 감사합니다. 성공회의 역사와 신앙, 광명교회가 걸어온 길을 소개합니다.",
        what: {
            eyebrow: "Anglican Church",
            title: "성공회란?",
            paras: [
                "성공회(聖公會)는 '거룩하고 공번된 교회'라는 뜻입니다. 16세기 잉글랜드 종교개혁에 뿌리를 두며, 가톨릭의 전례 전통과 개신교의 성서 중심 신앙을 함께 품는 <strong>'중도의 길(Via Media)'</strong>을 걸어왔습니다.",
                "오늘날 성공회는 전 세계 165개국, 약 1억 명의 신자가 함께하는 세계 공동체입니다. 특정 교리를 강요하지 않으며, 한 지도자에게 권위를 집중시키지도 않습니다. <strong>말씀과 성찬을 중심으로 하는 공동 신앙</strong>을 원칙으로 삼습니다."
            ],
            pillars: [
                { icon: "📖", title: "성서", desc: "하느님의 말씀인 성서는 신앙과 삶의 최고 권위입니다. 예배마다 구약·서신서·복음서를 함께 봉독합니다." },
                { icon: "💡", title: "이성", desc: "하느님이 주신 이성으로 말씀을 해석하고, 그 신앙을 일상에서 실천합니다." },
                { icon: "🏛", title: "전통", desc: "초대교회로부터 이어진 사도적 전통과 2,000년 공동체의 지혜를 신앙의 안내자로 삼습니다." }
            ],
            pillarNote: "16세기 신학자 리처드 후커(Richard Hooker)가 정립한 '세 기둥'입니다. 성서·이성·전통이 균형을 이룰 때 신앙이 온전해진다는 가르침입니다.",
            mission: {
                eyebrow: "Five Marks of Mission",
                title: "성공회 선교정신",
                intro: "성공회는 그리스도를 따르는 선교 공동체로서, The Mission of the Church is the Mission of Christ",
                marks: [
                    { num: "01", ko: "하느님 나라의 기쁜 소식을 전합니다.", en: "To proclaim the Good News of the Kingdom" },
                    { num: "02", ko: "새 신자를 가르치고, 세례 주고, 양육합니다.", en: "To teach, baptize and nurture new believers" },
                    { num: "03", ko: "사랑의 섬김으로 이웃의 필요에 응답합니다.", en: "To respond to human need by loving service" },
                    { num: "04", ko: "불의한 사회를 변화시키기 위해 노력합니다.", en: "To seek to transform unjust structures of society" },
                    { num: "05", ko: "창조질서를 보존하며, 지구생명의 회복과 유지에 헌신합니다.", en: "To strive to safeguard the integrity of creation and sustain and renew the life of the earth" }
                ],
                note: "성공회선교정신(The Five Marks of Mission)은 세계성공회협의회(Anglican Consultative Council)와 람베스회의(Lambeth Conference)를 통해 확인된 세계성공회의 공통된 선교원칙입니다."
            }
        },
        korea: {
            eyebrow: "Anglican Church of Korea",
            title: "대한성공회",
            founded: "1890",
            paras: [
                "1890년, 영국 성공회 선교사 찰스 존 코프(Charles John Corfe) 주교가 한국에 도착하면서 대한성공회의 역사가 시작되었습니다. 선교 초기부터 병원과 학교를 세워 의료와 교육 사역을 함께 펼쳐 왔습니다.",
                "일제강점기와 민주화 시기에도 사회적 책임을 이어왔으며, 오늘날에도 선교·교육·사회복지 분야에서 활동을 계속하고 있습니다."
            ],
            highlights: [
                { icon: "⛪", text: "서울·부산·대전 3개 교구, 전국 200여 교회" },
                { icon: "🎓", text: "성공회대학교 등 교육·사회 사업 운영" },
                { icon: "🌐", text: "세계성공회공동체(Anglican Communion) 정식 회원 교회" },
                { icon: "⚖️", text: "2001년 여성 사제 서품 시작, 사회 정의와 인권 옹호" }
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
        title: "캔터베리 십자가",
        subtitle: "Canterbury Cross",
        desc: "세계성공회 공동체를 하나로 잇는 상징으로, 1867년 영국 캔터베리에서 발굴된 9세기 앵글로색슨 브로치에서 유래했습니다. 아름다운 원형 디자인 안에 복음과 삼위일체, 세계 교회의 연대라는 성공회 신앙의 핵심이 담겨 있습니다.",
        colors: "짙은 녹색 바탕은 생명과 성장을, 흰색 십자가는 그리스도의 부활과 빛을 상징합니다.",
        history: "1867년 영국 캔터베리 성 어거스틴 수도원 터 발굴 당시 출토된 앵글로색슨 청동 브로치(9세기경 제작)를 원형으로 합니다.¹ 이 브로치는 현재 캔터베리 대성당 박물관에 소장되어 있으며, 세계성공회는 이를 전 세계 성공회 공동체의 공식 상징으로 채택했습니다.² 대한성공회 역시 이 십자가를 교단의 공식 상징으로 사용하며, 광명교회 또한 이를 교회 로고로 삼고 있습니다.³",
        elements: [
            { label: "십자가", desc: "그리스도의 구속과 부활. 성공회 신앙의 중심입니다." },
            { label: "네 날개", desc: "마태·마가·누가·요한, 사복음서를 상징합니다." },
            { label: "삼엽 문양", desc: "각 날개 끝의 세 잎은 성부·성자·성령, 삼위일체를 나타냅니다." },
            { label: "중앙 원", desc: "하느님의 영원하심과 세계 성공회의 일치를 상징합니다." }
        ],
        refs: [
            "Canterbury Cathedral Museum, <em>The Canterbury Cross</em>, Canterbury (1867년 발굴, 현 캔터베리 대성당 박물관 소장).",
            "The Anglican Communion Office, <em>Symbols of Anglican Identity</em>, London.",
            "대한성공회, 《성공회 예식서》, 성공회출판사, 2004."
        ]
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
            photo: "priest-portrait.jpg",
            ordained: "2005년 서품",
            quote: "교회는 모든 이를 위해 존재해야 하며, 그 누구도 소외되어서는 안 됩니다.",
            desc: "성공회대학교 신학과(1988학번)를 졸업하고 2005년 사제로 서품되었습니다. 2025년 3월 서울교구 최초의 여성 총사제로 임명되었으며, 성평등과 생태 존중을 지향하며 광명교회를 섬기고 있습니다.",
            contact: "bsyg2000@hanmail.net",
            bio: {
                milestones: [
                    { year: "1988", text: "성공회대학교 신학과 입학" },
                    { year: "1998", text: "서울교구 신학대학원 성직과정 입학 — 교구 최초 여성 성직 과정생", first: true },
                    { year: "2005", text: "사제 서품" },
                    { year: "2006", text: "동두천교회 보좌사제 — 서울교구 여성 사목자 최초 일반교회 단독 사목", first: true },
                    { year: "—", text: "동두천·성북 나눔의집 원장 역임 — 서울교구 첫 여성 원장", first: true },
                    { year: "2014", text: "강화 송산교회 관할사제 부임 — 서울교구 첫 여성 관할사제", first: true },
                    { year: "2025", text: "서울교구 서부교무구 총사제 임명 — 교구 최초 여성 총사제", first: true }
                ],
                roles: [
                    "서울교구 청년연합회장(1996)",
                    "대한성공회 제2대 여성국장",
                    "관구 윤리위원회 위원",
                    "대한성공회 여성 성직자회 회장(전)",
                    "대한성공회 정의평화사제단 회장(현)",
                    "성공회대학교 동물권리 과정 수강(현)"
                ],
                externalRoles: [
                    "한국기독청년연합회(EYCK) 서울지회장(1997)",
                    "한국기독교교회협의회(NCCK) 여성위원장(67~68회기)",
                    "NCCK 종교간대화위원회 위원장(현)"
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
            photo: "priest-portrait-2.jpg",
            ordained: "",
            quote: "목회와 상담의 공통 원칙은 공감이며, 타인의 아픔을 공감하는 것은 주님이 주시는 능력입니다.",
            desc: "문학, 신학, 상담심리, 동양철학을 두루 공부한 성공회 사제입니다. 35세에 늦깎이로 신학의 길에 들어서 사제 서품을 받았으며, 마포들음교회에서 상담센터를 운영하는 등 사목과 상담을 접목한 사역을 이어왔습니다. 현재 광명교회 협동사제로 섬기고 있습니다.",
            contact: "",
            kyoboUrl: "https://www.aladin.co.kr/m/mproduct.aspx?itemid=287238568",
            blogUrl: "https://m.blog.naver.com/brave9955",
            bio: {
                milestones: [
                    { year: "—", text: "서울 출생, 서대문·은평 지역에서 성장 — 충암초·중학교, 명지고등학교 졸업" },
                    { year: "—", text: "연세대학교 불어불문학과 졸업, 직장인으로 생활" },
                    { year: "37세", text: "성공회대학교 신학대학원 입학 — 늦깎이로 사제의 길을 선택" },
                    { year: "—", text: "사제 서품" },
                    { year: "—", text: "성공회 살림터(노숙위기가정 보호시설) 소장" },
                    { year: "—", text: "마포들음교회 관할사제 — 교회 내 들음상담센터 개설·운영" },
                    { year: "45세", text: "가톨릭대학교 상담심리대학원 상담심리학 석사, 상담심리사 자격 취득" },
                    { year: "55세", text: "동방문화대학원대학교 주역·명리학 철학박사 취득" },
                    { year: "—", text: "성공회대학교·한겨레문화센터 강의" },
                    { year: "현재", text: "옹진 재가노인지원서비스센터장, 광명교회 협동사제" }
                ],
                roles: [
                    "성공회 살림터 소장",
                    "성공회대학교 강사",
                    "한겨레문화센터 강사",
                    "마포들음교회 들음상담센터 운영",
                    "옹진 재가노인지원서비스센터장(현)",
                    "광명교회 협동사제(현)"
                ],
                ministryNote: "부제 시절 '사람에 대한 이해가 부족하다'는 자각이 상담심리 공부의 계기가 되었습니다. 평일엔 상담센터, 주일엔 예배당으로 운영했던 마포들음교회의 경험처럼, 그의 사목은 아픈 마음을 공감으로 돌보는 일과 분리되지 않습니다. 저서 『기독교, 명리학과 만나다』는 신앙과 동양적 성찰이 만나는 지점을 탐구한 작업입니다."
            }
        }
    ],

    // 평신도 임원진 — 주보(제1844호) 기준. category는 ministerSection.categories와 매칭
    officers: [
        { category: "교회위원", role: "신자회장",   members: ["이문희"] },
        { category: "교회위원", role: "사제회장",   members: ["최명숙"] },
        { category: "교회위원", role: "교회위원",   members: ["문운영", "박광식", "임경식", "나영숙", "박종미"] },
        { category: "교회위원", role: "건축위원장", members: ["정순진"] },
        { category: "교회위원", role: "희망터 총무", members: ["신효심"] },
        { category: "사역자",   role: "신자 사역자", members: ["정동숙(엘리사벳)", "박종미(수산나)"] }
    ],

    bishop: {
        name: "김장환(엘리야)",
        title: "제7대 서울교구장 주교",
        diocese: "대한성공회 서울교구",
        ordained: "2024년 9월 26일 서품 및 승좌",
        photo: "bishop-portrait.jpg",
        desc: "대한성공회 제7대 서울교구장 주교로, 2024년 9월 26일 서울주교좌성당에서 서품식과 승좌식을 거쳐 취임했습니다. 1964년생으로, 서강대 불어불문학과를 졸업한 뒤 1995년 성공회 사목신학연구원을 마쳤으며, 1998년 사제 서품을 받았습니다. 오산세마대교회 관할사제, 서울교구 선교교육훈련국장, 대학로교회 관할사제 등을 지냈습니다. 취임사에서는 '사도성을 회복하는 성공회'를 강조하며 세계성공회 선교정신에 따라 교회와 세상을 위해 기도하고 복음을 선포하는 데 전념하겠다고 밝혔습니다.",
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
                icon: "🌿",
                title: "녹색교회",
                desc: "생태와 환경 보전을 신앙의 과제로 삼고 실천합니다. 녹색교회·동물복지·환경보호를 실천하며 생명을 돌봅니다. 주일 애찬에는 비건 음식도 함께 준비합니다."
            },
            {
                icon: "🤲",
                title: "열린 교회",
                desc: "성소수자·장애인·이주노동자·어린이·노인·동물 등 사회적 소수자와 모든 생명에 열려 있습니다."
            },
            {
                icon: "⚖️",
                title: "평등한 교회",
                desc: "성별·나이·지위에 관계없이 누구나 동등하게 예배에 참여하고 봉사합니다."
            },
            {
                icon: "✝️",
                title: "전례 중심",
                desc: "성공회 기도서에 따른 전례와 성찬을 예배의 중심에 둡니다."
            }
        ],
        closing: "광명교회는 신앙과 일상, 사람과 이웃이 연결되는 열린 공동체입니다."
    },

    worship: {
        liturgicalSeason: LiturgicalCalendar.compute(),
        currentReadings: {
            week: "성령강림 후 제2주일",
            year: "A년",
            date: "2026년 6월 7일",
            note: "대한성공회 공동 전례독서(RCL)에 따릅니다. 매주 갱신됩니다.",
            items: [
                { role: "구약", ref: "호세아 5:15-6:6" },
                { role: "시편", ref: "시편 50:7-15" },
                { role: "서신서", ref: "로마서 4:13-25" },
                { role: "복음서", ref: "마태복음 9:9-13, 18-26" }
            ]
        },
        nextReadings: {
            week: "성령강림 후 제3주일",
            year: "A년",
            date: "2026년 6월 14일",
            items: [
                { role: "구약", ref: "출애굽기 19:2-8" },
                { role: "시편", ref: "시편 100" },
                { role: "서신서", ref: "로마서 5:1-8" },
                { role: "복음서", ref: "마태복음 9:35-10:8" }
            ]
        },
        main: [
            {
                id: "main",
                title: "주일 감사성찬례",
                time: "매주 일요일 오전 11:00",
                desc: "성공회 전례의 중심인 감사성찬례(Eucharist)입니다. 말씀과 성찬 안에서 예수 그리스도를 만나는 시간이며, 세례받은 모든 그리스도인이 성체를 모실 수 있습니다. 반려동물과 함께 오신 분은 예배 후 신부님께 강복을 청할 수 있습니다."
            },
            {
                id: "children",
                title: "어린이 예배",
                time: "매주 일요일 오전 11:00",
                desc: "교육관에서 드리는 어린이 예배입니다. 성공회 전례를 어린이 눈높이에 맞추어 구성합니다.",
                verse: "나는 분명히 말한다. 너희가 생각을 바꾸어 어린이와 같이 되지 않으면 결코 하늘 나라에 들어가지 못할 것이다.",
                verseRef: "마태 18:3",
                detail: "주일학교 선생님들과 해당 주일 전례독서에 따라 찬양과 말씀 관련 활동을 하고, 영성체 시간에 어른들과 함께 영성체를 합니다. 세례받은 모든 어린이는 성체(흰색 밀 면병)를 받고, 보혈(무알콜 포도즙)을 받을 수 있습니다."
            }
        ],
        guide: "",
        eucharistIntro: "성공회 주일 예배의 중심은 <strong>감사성찬례</strong>입니다. 천주교의 '미사', 개신교의 '성만찬'과 같은 예배로, 그리스도교 예배의 출발이자 핵심입니다.",
        eucharistIntroQuote: "감사성찬례는 예수님의 마지막 만찬에서 비롯되었으며, <strong>공동체가 함께 모여 말씀을 듣고 성찬을 나누는</strong> 시간입니다.",
        eucharistOrder: [
            {
                title: "입당예식",
                items: [
                    "입당 성가와 함께 집전자가 입장합니다.",
                    "회중은 모두 일어나 하느님께 예배드릴 준비를 합니다.",
                    "죄를 고백하고 용서를 구합니다."
                ]
            },
            {
                title: "말씀의 전례",
                items: [
                    "구약 성서 봉독 · 시편 화답송 · 서신서 봉독",
                    "복음환호송(<em>\"알렐루야, 알렐루야\"</em>) 후 <strong>복음서 봉독</strong>과 설교",
                    "사도신경 또는 니케아 신경으로 신앙을 함께 고백합니다.",
                    "교회와 세상, 이웃과 자신을 위한 중보기도 — 회중은 <em>\"주여, 우리의 기도를 들으소서\"</em>로 응답합니다."
                ]
            },
            {
                title: "성찬의 전례",
                items: [
                    "평화의 인사를 나눕니다.",
                    "빵과 포도주, 헌금을 봉헌하고 집전자가 <strong>빵과 포도주를 축성</strong>합니다.",
                    "주님의 기도 후 <strong>영성체</strong> — 그리스도의 몸과 피를 모십니다."
                ]
            },
            {
                title: "파송예식",
                items: [
                    "감사 기도와 강복을 받습니다.",
                    "<em>\"나가서 주님의 복음을 전합시다 / 평화를 이룹시다 / 사랑을 나눕시다\"</em>",
                    "회중: <em>\"그리스도의 이름으로. 아멘\"</em> — 우리는 세상으로 파송되는 선교사가 됩니다."
                ]
            }
        ],
        spaceGuide: {
            intro: "성공회 성당에 처음 들어서면 낯선 공간과 물건들을 만나게 됩니다.",
            items: [
                {
                    icon: "💧",
                    name: "성수대",
                    en: "Holy Water",
                    desc: "예배당 입구에 놓인 성수입니다. 세례를 통해 하느님의 백성이 되었음을 기억하며, 손끝에 적셔 십자 성호를 긋고 예배의 자리로 들어섭니다."
                },
                {
                    icon: "📖",
                    name: "독서대",
                    en: "Ambo · Lectern",
                    desc: "하느님의 말씀을 봉독하고 설교를 선포하는 자리입니다. 구약·서신서·복음서가 이곳에서 회중에게 선포됩니다."
                },
                {
                    icon: "🍞",
                    name: "제대",
                    en: "Altar",
                    desc: "감사성찬례의 중심이 되는 거룩한 식탁입니다. 빵과 포도주를 축성하여 그리스도의 몸과 피를 나누는, 예배의 가장 거룩한 자리입니다."
                },
                {
                    icon: "⛪",
                    name: "성막",
                    en: "Tabernacle",
                    desc: "축성된 성체를 모셔 두는 곳입니다. 거동이 어려운 병자나 교우를 방문하여 성체를 나눌 때 이곳에 보관된 성체를 사용합니다."
                },
                {
                    icon: "🕯️",
                    name: "부활초",
                    en: "Paschal Candle",
                    desc: "부활하신 그리스도의 빛과 새 생명·영생의 소망을 상징합니다. 부활절에 새로 축복하여 밝히며, 세례와 장례 예식에서도 함께합니다."
                }
            ]
        },
        resources: [
            {
                icon: "📖",
                title: "성공회 기도서",
                desc: "공동기도서(BCP)입니다.",
                url: "https://dulkuka12.github.io/kbcp/"
            },
            {
                icon: "🎵",
                title: "성가집",
                desc: "예배 성가를 온라인으로 볼 수 있습니다.",
                url: "https://dulkuka12.github.io/khymn/"
            },
            {
                icon: "✝️",
                title: "공동번역 성서",
                desc: "성공회 예배에서 봉독하는 공동번역 성서입니다.",
                url: "https://bible.anglican.kr/"
            }
        ],
        prayer: {
            dailyOfficeIntro: [
                "성무일도(聖務日課)는 정해진 시간에 드리는 교회의 공적 기도입니다. \"쉬지 말고 기도하십시오\"(1테살 5,17)라는 말씀을 따라, 초대교회와 수도원 전통에서 이어져 온 기도의 리듬입니다.",
                "성공회 기도서는 하루의 흐름에 따른 네 가지 기도를 제공합니다. 시편과 성서 봉독, 찬가와 기도로 구성되며, 공동체나 개인이 매일 같은 기도문으로 하느님 앞에 하루를 열고 닫습니다.",
                "정해진 기도문을 날마다 되풀이하는 일은 단조로워 보일 수 있지만, 같은 말씀을 거듭 새기며 하루의 때를 거룩하게 구별하는 데 그 뜻이 있습니다. 아래 기도서를 따라 누구나 지금 함께 기도할 수 있습니다."
            ],
            dailyOffice: [
                {
                    icon: "🌅",
                    title: "아침기도",
                    en: "Morning Prayer",
                    desc: "하루를 시작하며 드리는 기도입니다. 찬가·시편·성서 봉독·기도로 구성됩니다.",
                    url: "https://dulkuka12.github.io/kbcp/morning-prayer.html"
                },
                {
                    icon: "☀️",
                    title: "낮기도",
                    en: "Noonday Prayer",
                    desc: "하루의 한가운데서 잠시 멈추어 드리는 짧은 기도입니다.",
                    url: "https://dulkuka12.github.io/kbcp/noonday-prayer.html"
                },
                {
                    icon: "🌆",
                    title: "저녁기도",
                    en: "Evening Prayer",
                    desc: "하루를 마감하며 감사와 참회로 드리는 기도입니다. 성모찬가(마그니피캇)를 포함하며, 빛이신 그리스도를 찬양합니다.",
                    url: "https://dulkuka12.github.io/kbcp/evening-prayer.html"
                },
                {
                    icon: "🌙",
                    title: "밤기도",
                    en: "Compline",
                    desc: "수도원 전통에서 비롯된 짧고 고요한 기도입니다. 잠자리에 들기 전 하루를 마감합니다.",
                    url: "https://dulkuka12.github.io/kbcp/compline-prayer.html"
                }
            ],
            intercession: {
                icon: "🌍",
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
                icon: "🌱",
                detailUrl: "hopecenter.html"
            },
            {
                id: "emmaus",
                title: "엠마우스 코스",
                desc: "그리스도교 신앙의 기초를 배우는 과정",
                icon: "📖",
                detailUrl: "emmaus.html"
            },
            {
                id: "smallgroup",
                title: "소그룹 모임",
                desc: "기도하고 이야기 나누는 작은 모임",
                icon: "🤝",
                detailUrl: "smallgroup.html"
            },
            {
                id: "agape",
                title: "주일 애찬",
                desc: "예배 후 함께 음식을 나누는 자리",
                note: "비건 음식도 함께 준비됩니다",
                footnote: "* 비건: 계란·우유도 포함하지 않는 완전 채식",
                icon: "🍚"
            }
        ],
        smallgroups: {
            intro: "교재나 정해진 형식 없이, 솔직한 만남을 중심에 두는 작은 모임입니다.",
            groups: [
                {
                    id: "parents",
                    icon: "🏡",
                    title: "주일학교 양육자모임",
                    en: "Sunday School Parents",
                    schedule: "매월 셋째 주일 애찬 후",
                    desc: "아이를 신앙 안에서 키우는 일은 부모 혼자 감당하기 어렵습니다. 이 모임은 주일학교 자녀를 둔 양육자들이 함께 모여, 가정 안의 신앙 교육을 솔직하게 이야기하고 서로를 위해 기도하는 자리입니다.",
                    details: [
                        "매월 셋째 주일 애찬을 마친 후, 교회 내 소모임 공간에서 진행합니다.",
                        "정해진 교재나 커리큘럼 없이, 그 달의 관심사나 고민을 자유롭게 나눕니다.",
                        "기도와 나눔으로 마무리하며, 한 시간 안팎으로 진행합니다.",
                        "주일학교에 아이가 다니고 있다면 누구나 참여할 수 있습니다."
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
            url: "http://www.skhnews.or.kr/news/articleView.html?idxno=768"
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
                desc: "주일 성찬예배가 끝난 후, 성도들이 함께 모여 밥을 나누는 애찬 시간을 담은 영상입니다.",
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
                    { name: "대한성공회 성 프란시스 수도회(네이버 지도)", url: "https://naver.me/xB77Wcf2",                                          desc: "한국 개신교 역사상 사실상 사라졌던 수도원 전통을 이어받아 1993년에 설립된 대한성공회 유일의 남자 수도회", external: true },
                    { name: "대한성공회 성가수도회",         url: "https://www.sister.or.kr",                                           desc: "1925년에 설립된 한국 기독교 역사상 최초의 자생(방인) 여성 수도회" }
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
                icon: "✝️",
                items: [
                    {
                        q: "성공회는 이단인가요?",
                        a: "아닙니다. 현재 세계 165개국, 약 8,500만 명 이상의 신자들이 캔터베리 대주교와 상징적 관계를 맺고 자치하고 있는 그리스도교 전통에 뿌리를 둔 교단입니다.\n\n16세기 종교개혁으로 로마가톨릭을 믿던 서유럽은 분열됩니다. 독일과 북유럽은 종교개혁가 마르틴 루터를 따르는 루터교가 국가교회로 설립되었고, 스위스와 프랑스 일부, 스코틀랜드에는 쟝 깔뱅을 따르는 장로교가 생겼습니다. 잉글랜드는 국왕 헨리 8세가 로마 교황을 거부하면서 국교회의 수장이 되면서 성공회가 생겨났습니다. 지금도 국왕이 교회의 수장이지만, 상징에 불과합니다.",
                        refs: [
                            { label: "성공회 (Wikipedia)", url: "https://ko.wikipedia.org/wiki/%EC%84%B1%EA%B3%B5%ED%9A%8C" },
                            { label: "성공회 (나무위키)", url: "https://namu.wiki/w/%EC%84%B1%EA%B3%B5%ED%9A%8C" },
                            { label: "세계성공회공동체 (나무위키)", url: "https://namu.wiki/w/%EC%84%B8%EA%B3%84%EC%84%B1%EA%B3%B5%ED%9A%8C%EA%B3%B5%EB%8F%99%EC%B2%B4" }
                        ]
                    },
                    {
                        q: "헨리 8세가 결혼(이혼)을 위해 만든 교단인가요?",
                        a: "결혼 문제는 계기일 뿐, 핵심은 <strong>왕위 계승 위기</strong>와 유럽 종교개혁의 흐름이었습니다.\n\n헨리 8세는 남성 후계자 없이 생길 내전을 우려해 교황에게 이혼을 청했지만, 당시 교황은 왕비의 친정(에스파냐) 군대에 포위된 처지라 거절할 수밖에 없었습니다. 이에 헨리 8세는 로마와 관계를 끊고 국교회 수장이 되었고, 유럽의 종교개혁 세력이 이를 지지했습니다. 이후 크랜머 대주교 등의 영향으로 <strong>'개신교 교리에 가톨릭 전통의 예배 형식'</strong>을 갖춘 오늘날 성공회로 자리 잡았습니다.",
                        refs: [
                            { label: "잉글랜드의 종교 개혁 (Wikipedia)", url: "https://ko.wikipedia.org/wiki/%EC%9E%89%EA%B8%80%EB%9E%9C%EB%93%9C%EC%9D%98_%EC%A2%85%EA%B5%90_%EA%B0%9C%ED%98%81" },
                            { label: "토머스 크랜머 (Wikipedia)", url: "https://ko.wikipedia.org/wiki/%ED%86%A0%EB%A8%B8%EC%8A%A4_%ED%81%AC%EB%9E%9C%EB%A8%B8" }
                        ]
                    },
                    {
                        q: "천주교(가톨릭)인가요, 개신교인가요?",
                        a: "한국에서는 법적·통계적으로 <strong>개신교</strong>로 분류됩니다. 다만 성공회는 가톨릭과 개신교 중 하나로 딱 잘라 말하기 어려운 교단입니다.\n\n16세기 잉글랜드 종교개혁에서 비롯되어 가톨릭의 전례 전통(주교직·성사·예배 형식)과 개신교의 성서 중심 신앙을 함께 품고 있습니다. 교황의 수위권은 인정하지 않으며, 이 균형을 <strong>’중도의 길(Via Media)’</strong>이라 부릅니다.",
                        refs: [
                            { label: "성서·이성·전통과 리처드 후커 (Via Media)", url: "https://liturgy.co.nz/scripture-tradition-reason-and-richard-hooker" },
                            { label: "대한성공회 (Wikipedia)", url: "https://ko.wikipedia.org/wiki/%EB%8C%80%ED%95%9C_%EC%84%B1%EA%B3%B5%ED%9A%8C" }
                        ]
                    },
                    {
                        q: "톰 라이트·존 스토트 책으로 성공회를 처음 알게 됐는데, 왜 한국성공회는 느낌이 다른가요?",
                        a: "성공회 안에는 신학 성향과 예배 스타일에 따라 크게 세 흐름이 공존합니다. <strong>저교회파(Low Church, 복음주의)</strong>는 성서의 권위와 설교를 중시하고, <strong>고교회파(High Church, 앵글로-가톨릭주의)</strong>는 초대교회 전승과 성사·전례를 강조하며, <strong>광교회파(Broad Church)</strong>는 이성·학문과 사회 참여를 중심에 둡니다.\n\n존 스토트(1921–2011)와 톰 라이트(N.T. Wright) 같은 영국 신학자들은 <strong>복음주의(저교회파) 전통</strong> 안에서 활동했습니다. 성서 중심의 설교와 개인 신앙을 강조하는 이 전통은 가톨릭적 의례 중심 예배와 분위기가 크게 다릅니다.\n\n대한성공회가 가톨릭처럼 느껴지는 이유는 <strong>1890년 첫 선교사들이 고교회파 계열</strong>이었기 때문입니다. 초대 주교 고요한(Charles Corfe)을 비롯한 선교사들은 19세기 영국에서 가톨릭의 역사적 전통과 전례를 회복하고자 일어난 <strong>'옥스퍼드 운동(Oxford Movement)'</strong>의 영향을 받았습니다. 이 뿌리로 인해 성당 건축·사제 제복·감사성찬례 형식이 가톨릭과 유사한 모습을 갖추게 되었습니다.\n\n그럼에도 저·고·광교회파 모두 '성서·전통·이성'의 세 기둥과 <strong>'중도의 길(Via Media)'</strong> 안에서 하나의 성공회를 이룹니다. 어떤 흐름으로 성공회를 처음 만나셨든, 같은 믿음의 공동체 안에 함께합니다.",
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
                        a: "아닙니다. 대한성공회는 <strong>1993년 세계성공회로부터 독립 자치권을 인정받은 한국 교단</strong>입니다.\n\n1890년 영국 선교사 고요한(Charles Corfe) 주교가 설립했지만, 이후 한국화 과정을 거쳐 운영과 의사결정을 한국 교단이 자치적으로 합니다. 캔터베리 대주교와는 상하 관계가 아닌 동등한 ‘교제와 일치’의 관계입니다.",
                        refs: [
                            { label: "대한성공회의 역사 (공식)", url: "https://www.skh.or.kr/3" },
                            { label: "대한성공회 (Wikipedia)", url: "https://ko.wikipedia.org/wiki/%EB%8C%80%ED%95%9C_%EC%84%B1%EA%B3%B5%ED%9A%8C" }
                        ]
                    }
                ]
            },
            {
                id: "faith",
                title: "신앙과 성사",
                icon: "🕊",
                items: [
                    {
                        q: "구원을 어떻게 이해하나요?",
                        a: "구원은 조건을 채워 얻어내는 것이 아니라, <strong>예수 그리스도를 통해 하느님께서 거저 주시는 선물(은총)</strong>이라고 믿습니다.\n\n특정 교단 소속이나 정해진 ‘공식’을 구원의 조건으로 삼지 않으며, 성서를 구원에 필요한 모든 것을 담은 말씀으로 고백합니다.",
                        refs: [
                            { label: "시카고-램베스 사대강령 — 성서의 권위", url: "https://www.anglicancommunion.org/the-chicago-lambeth-quadrilateral/" }
                        ]
                    },
                    {
                        q: "성찬의 빵과 포도주를 어떻게 보나요?",
                        a: "그리스도께서 성찬에 <strong>참으로 임재</strong>하신다고 믿되, ‘어떻게’ 임재하시는지를 특정 교리로 규정하지 않습니다.\n\n빵과 포도주의 실체가 변한다는 가톨릭의 <strong>화체설은 따르지 않으며</strong>(39개조 제28조), 그 신비를 믿음으로 받아 모시는 것을 중요하게 여깁니다.",
                        refs: [
                            { label: "성공회 신앙의 39개조 — 성찬론", url: "https://namu.wiki/w/%EC%84%B1%EA%B3%B5%ED%9A%8C%2039%EA%B0%9C%20%EC%8B%A0%EC%A1%B0" }
                        ]
                    },
                    {
                        q: "다른 교회에서 받은 세례를 다시 받아야 하나요?",
                        a: "아닙니다. <strong>삼위일체 하느님의 이름(성부·성자·성령)으로 물로 받은 세례</strong>는 교단과 관계없이 유효한 세례로 인정합니다.\n\n천주교·개신교에서 세례를 받으셨다면 다시 받을 필요가 없습니다.",
                        refs: [
                            { label: "시카고-램베스 사대강령 — 세례 성사", url: "https://www.anglicancommunion.org/the-chicago-lambeth-quadrilateral/" },
                            { label: "세례 (Wikipedia)", url: "https://ko.wikipedia.org/wiki/%EC%84%B8%EB%A1%80" }
                        ]
                    },
                    {
                        q: "마리아와 성인을 숭배하나요?",
                        a: "아닙니다. 성모 마리아와 성인들을 <strong>신앙의 모범으로 공경</strong>하지만, 예배와 기도의 대상은 오직 삼위일체 하느님입니다.\n\n성인을 신처럼 섬기거나 구원의 중개자로 삼지 않습니다. 이 점에서 가톨릭의 성인 공경과 구별됩니다.",
                        refs: [
                            { label: "성공회 신앙의 39개조 — 제22조", url: "https://namu.wiki/w/%EC%84%B1%EA%B3%B5%ED%9A%8C%2039%EA%B0%9C%20%EC%8B%A0%EC%A1%B0" }
                        ]
                    }
                ]
            },
            {
                id: "society",
                title: "평등과 사회참여",
                icon: "⚖️",
                items: [
                    {
                        q: "성공회는 ‘좌파 교회’인가요?",
                        a: "성공회의 사회 참여는 정당이나 이념이 아니라 <strong>신앙에서 나옵니다</strong>.\n\n세계성공회가 공유하는 ‘선교의 다섯 표지’ 네 번째가 <em>’불의한 사회 구조를 변화시키는 것’</em>입니다. 대한성공회는 1970년대부터 빈민·산업 선교와 민주화운동에 함께해 왔으며, 이는 특정 정파를 지지하는 것과 다른 신앙적 실천입니다.",
                        refs: [
                            { label: "성공회 선교정신 — 다섯 표지 (세계성공회)", url: "https://www.anglicancommunion.org/five-marks-of-mission/" },
                            { label: "성공회대학교 인권센터", url: "https://humanrights.skhu.ac.kr/" }
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
                        a: "세계성공회 안에 <strong>단일한 공식 입장은 없으며</strong>, 대한성공회는 동성결혼을 공식 예식으로 시행하지 않습니다.\n\n관구에 따라 동성결혼을 허용하는 곳도 있고, 전통적 혼인관(1998년 람베스 회의 결의 I.10)을 유지하는 곳도 있어 논의 중입니다. 대한성공회는 <strong>성소수자를 정죄·배제하지 않으며 혐오와 차별에 반대</strong>합니다. 광명교회는 찾아오시는 누구도 문 앞에서 돌려보내지 않습니다.",
                        refs: [
                            { label: "람베스 회의 1998 결의 I.10 (세계성공회)", url: "https://www.anglicancommunion.org/resources/document-library/lambeth-conference/1998/section-i-called-to-full-humanity/section-i10-human-sexuality" }
                        ]
                    }
                ]
            },
            {
                id: "join",
                title: "함께하기",
                icon: "🤝",
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
                symbol: "🕯️",
                period: "성탄 4주 전 주일 ~ 성탄 전날",
                desc: "주님의 오심을 기다리며 준비하는 시간. 교회력의 새해가 시작됩니다."
            },
            {
                key: "christmas",
                name: "성탄절",
                en: "Christmas",
                colorName: "백색·금색",
                color: "#b8860b",
                symbol: "⭐",
                period: "12월 25일 ~ 1월 5일",
                desc: "말씀이 사람이 되신 기쁨을 기념합니다. 성탄 후 12일간 이어집니다."
            },
            {
                key: "epiphany",
                name: "주현절 후",
                en: "Epiphany",
                colorName: "녹색",
                color: "#3d6b4a",
                symbol: "✨",
                period: "1월 6일 ~ 재의 수요일 전날",
                desc: "주님께서 세상에 자신을 드러내신 것을 기념합니다. 주현절과 주님의 세례 주일을 포함합니다."
            },
            {
                key: "lent",
                name: "사순절",
                en: "Lent",
                colorName: "자색",
                color: "#6b4f8f",
                symbol: "✝️",
                period: "재의 수요일 ~ 성주간 전날 (40일)",
                desc: "회개와 절제로 부활을 준비하는 시간. 재의 수요일에 시작됩니다."
            },
            {
                key: "holyweek",
                name: "성주간",
                en: "Holy Week",
                colorName: "적색",
                color: "#c0390f",
                symbol: "🌿",
                period: "종려주일 ~ 성토요일",
                desc: "주님의 수난을 묵상하는 한 주간. 종려주일·성목요일·성금요일·성토요일을 포함합니다."
            },
            {
                key: "easter",
                name: "부활절",
                en: "Easter",
                colorName: "백색·금색",
                color: "#b8860b",
                symbol: "🌅",
                period: "부활주일 ~ 성령강림 전날 (50일)",
                desc: "다시 살아나신 주님을 기리는 기쁨의 계절. 50일간 이어집니다."
            },
            {
                key: "pentecost",
                name: "성령강림절",
                en: "Pentecost",
                colorName: "적색",
                color: "#c0390f",
                symbol: "🔥",
                period: "부활 후 50일째 주일",
                desc: "성령께서 제자들에게 임하신 날을 기념합니다. 교회가 시작된 날입니다."
            },
            {
                key: "ordinary",
                name: "성령강림 후",
                en: "Ordinary Time",
                colorName: "녹색",
                color: "#3d6b4a",
                symbol: "🌿",
                period: "성령강림 다음 주 ~ 대림절 전날",
                desc: "그리스도인의 일상을 살아가는 긴 계절. 왕이신 그리스도 주일로 마무리됩니다."
            }
        ],
        specialSundays: [
            {
                name: "주현절",
                en: "Epiphany",
                date: "1월 6일 또는 직후 주일",
                origin: "세계성공회",
                desc: "동방박사들의 방문을 통해 예수님이 온 세상에 드러나신 날입니다. 주현절 후 첫 주일은 주님의 세례 주일로 지킵니다."
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
                desc: "성부·성자·성령 삼위일체 하나님을 고백하는 날. 성공회 교회력에서 특별히 강조하는 교리 주일입니다."
            },
            {
                name: "환경주일",
                en: "Environment Sunday",
                date: "6월 첫째 주일",
                origin: "KNCC · 대한성공회",
                desc: "하나님의 창조세계를 돌보는 청지기 사명을 새기는 날. 1984년부터 한국교회가 함께 지킵니다."
            },
            {
                name: "창조절",
                en: "Season of Creation",
                date: "9월 1일 ~ 10월 4일",
                origin: "세계교회 · 대한성공회",
                desc: "1989년 에큐메니컬 총대주교 디미트리오스 1세의 선포로 시작. WCC가 절기로 확대했으며, 10월 4일 성 프란체스코 축일에 마무리됩니다."
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
        intro: "예배 순서와 공동체 소식을 담은 주간 주보입니다.",
        note: "예배 전에 미리 열어 두시면 도움이 됩니다.",
        items: [
            {
                date: "2026-06-08",
                label: "2026년 6월 8일",
                season: "성령강림 후 제2주일",
                file: "bulletins/20260608.pdf"
            },
            {
                date: "2026-06-01",
                label: "2026년 6월 1일",
                season: "삼위일체 주일",
                file: "bulletins/20260601.pdf"
            },
            {
                date: "2026-05-25",
                label: "2026년 5월 25일",
                season: "성령강림주일",
                file: "bulletins/20260525.pdf"
            }
        ]
    },

    // 사진 게시판 (gallery.html) — 초안. 실제 교회 사진으로 교체 예정.
    photoGallery: {
        intro: "예배, 애찬, 절기 행사 등 광명교회 공동체의 순간들을 모았습니다.",
        badge: "초안",
        note: "샘플 이미지로 구성된 초안입니다. 실제 교회 사진으로 교체 예정입니다.",
        categories: ["전체", "예배", "공동체", "절기·행사", "교회 풍경"],
        photos: [
            {
                id: "p01",
                title: "주일 성찬예배",
                desc: "매주 주일, 공동체가 모여 성찬을 나눕니다.",
                category: "예배",
                date: "2025.03",
                src: "https://picsum.photos/seed/gmc-worship1/900/600",
                thumb: "https://picsum.photos/seed/gmc-worship1/480/320",
                alt: "주일 성찬예배 모습"
            },
            {
                id: "p02",
                title: "어린이 예배",
                desc: "어린이들이 함께 참여하는 주일 예배.",
                category: "예배",
                date: "2025.04",
                src: "https://picsum.photos/seed/gmc-worship2/900/600",
                thumb: "https://picsum.photos/seed/gmc-worship2/480/320",
                alt: "어린이 예배 모습"
            },
            {
                id: "p03",
                title: "새벽 성무일도",
                desc: "고요한 새벽, 시편과 기도로 하루를 엽니다.",
                category: "예배",
                date: "2025.02",
                src: "https://picsum.photos/seed/gmc-worship3/900/600",
                thumb: "https://picsum.photos/seed/gmc-worship3/480/320",
                alt: "새벽 성무일도"
            },
            {
                id: "p04",
                title: "주일 애찬",
                desc: "성찬예배 후 함께 나누는 식사.",
                category: "공동체",
                date: "2025.03",
                src: "https://picsum.photos/seed/gmc-community1/900/600",
                thumb: "https://picsum.photos/seed/gmc-community1/480/320",
                alt: "주일 애찬 풍경"
            },
            {
                id: "p05",
                title: "엠마우스 코스",
                desc: "신앙의 길을 함께 걷는 엠마우스 여정.",
                category: "공동체",
                date: "2024.11",
                src: "https://picsum.photos/seed/gmc-community2/900/600",
                thumb: "https://picsum.photos/seed/gmc-community2/480/320",
                alt: "엠마우스 코스 모임"
            },
            {
                id: "p06",
                title: "소그룹 모임",
                desc: "소그룹이 모여 말씀을 나누고 기도합니다.",
                category: "공동체",
                date: "2025.01",
                src: "https://picsum.photos/seed/gmc-community3/900/600",
                thumb: "https://picsum.photos/seed/gmc-community3/480/320",
                alt: "소그룹 모임"
            },
            {
                id: "p07",
                title: "대림절 촛불 점화",
                desc: "대림절 4주간, 촛불을 하나씩 밝히며 기다림을 삽니다.",
                category: "절기·행사",
                date: "2024.12",
                src: "https://picsum.photos/seed/gmc-season1/900/600",
                thumb: "https://picsum.photos/seed/gmc-season1/480/320",
                alt: "대림절 촛불 점화"
            },
            {
                id: "p08",
                title: "부활절 새벽 예배",
                desc: "해가 뜨기 전 모여 부활을 선포합니다.",
                category: "절기·행사",
                date: "2025.04",
                src: "https://picsum.photos/seed/gmc-season2/900/600",
                thumb: "https://picsum.photos/seed/gmc-season2/480/320",
                alt: "부활절 새벽 예배"
            },
            {
                id: "p09",
                title: "세례식",
                desc: "물과 성령으로 새로운 삶을 시작합니다.",
                category: "절기·행사",
                date: "2025.04",
                src: "https://picsum.photos/seed/gmc-season3/900/600",
                thumb: "https://picsum.photos/seed/gmc-season3/480/320",
                alt: "세례식"
            },
            {
                id: "p10",
                title: "성탄절 예배",
                desc: "말씀이 육신이 되어 우리 가운데 오심을 기억합니다.",
                category: "절기·행사",
                date: "2024.12",
                src: "https://picsum.photos/seed/gmc-season4/900/600",
                thumb: "https://picsum.photos/seed/gmc-season4/480/320",
                alt: "성탄절 예배"
            },
            {
                id: "p11",
                title: "성전 내부",
                desc: "캔터베리 십자가가 이끄는 예배 공간.",
                category: "교회 풍경",
                date: "2025.01",
                src: "https://picsum.photos/seed/gmc-space1/900/600",
                thumb: "https://picsum.photos/seed/gmc-space1/480/320",
                alt: "성전 내부 모습"
            },
            {
                id: "p12",
                title: "교회 마당",
                desc: "예배 전후 사람들이 모이는 공간.",
                category: "교회 풍경",
                date: "2025.03",
                src: "https://picsum.photos/seed/gmc-space2/900/600",
                thumb: "https://picsum.photos/seed/gmc-space2/480/320",
                alt: "교회 마당"
            }
        ]
    },

    navigation: [
        {
            label: "교회 소개",
            href: "clergy.html",
            items: [
                { label: "성공회란?",   href: "clergy.html#what-is-anglican" },
                { label: "대한성공회",  href: "clergy.html#ack" },
                { label: "섬기는 이들", href: "clergy.html#priest-section" },
                { label: "교회 철학",  href: "clergy.html#philosophy" },
                { label: "교회 이야기", href: "clergy.html#identity" }
            ]
        },
        {
            label: "예배와 기도",
            href: "worship.html",
            items: [
                { label: "주일 감사성찬례", href: "worship.html#main" },
                { label: "어린이 예배",    href: "worship.html#children" },
                { label: "주일 주보",      href: "bulletin.html", badge: "초안" },
                { label: "감사성찬례 순서", href: "worship.html#eucharist-order" },
                { label: "성무일도",       href: "worship.html#daily-office" },
                { label: "세계성공회 중보기도", href: "worship.html#intercession" },
                { label: "예배 자료",      href: "worship.html#resources" }
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
                { label: "소그룹 모임",  href: "smallgroup.html" },
                { label: "녹색교회",     href: "greenchurch.html" }
            ]
        },
        {
            label: "미디어·자료",
            href: "media.html",
            items: [
                { label: "교회 영상",     href: "media.html#videos" },
                { label: "사진 게시판",   href: "gallery.html", badge: "초안" },
                { label: "관련 기관",     href: "media.html#links" }
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
