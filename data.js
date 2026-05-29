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
        advent:    { name: "대림절",       colorName: "자색", color: "#6b4f8f", colorLight: "#f0eaf7", symbol: "🕯️", note: "주님의 오심을 기다리는 시간" },
        christmas: { name: "성탄절",       colorName: "백색", color: "#b8860b", colorLight: "#fbf3df", symbol: "⭐",   note: "말씀이 사람이 되시다"   },
        epiphany:  { name: "공현절 후",    colorName: "녹색", color: "#3d6b4a", colorLight: "#eef2ec", symbol: "✨",   note: "주님이 세상에 드러나심" },
        lent:      { name: "사순절",       colorName: "자색", color: "#6b4f8f", colorLight: "#f0eaf7", symbol: "✝️",  note: "회개와 절제의 시간"     },
        holyweek:  { name: "성주간",       colorName: "적색", color: "#c0390f", colorLight: "#fdf2ee", symbol: "🌿",   note: "주님의 수난을 묵상"     },
        easter:    { name: "부활절",       colorName: "백색", color: "#b8860b", colorLight: "#fbf3df", symbol: "🌅",   note: "다시 살아나신 주님"     },
        pentecost: { name: "성령강림절",   colorName: "적색", color: "#c0390f", colorLight: "#fdf2ee", symbol: "🔥",   note: "성령께서 임하시다"      },
        ordinary:  { name: "성령강림 후",  colorName: "녹색", color: "#3d6b4a", colorLight: "#eef2ec", symbol: "🌿",   note: "그리스도인의 일상"      }
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
                { icon: "📖", title: "성경", desc: "하느님의 말씀인 성경은 신앙과 삶의 최고 권위입니다. 예배마다 구약·서신서·복음서를 함께 봉독합니다." },
                { icon: "🏛", title: "전통", desc: "초대교회로부터 이어진 사도적 전통과 2,000년 공동체의 지혜를 신앙의 안내자로 삼습니다." },
                { icon: "💡", title: "이성", desc: "하느님이 주신 이성으로 말씀을 해석하고, 그 신앙을 일상에서 실천합니다." }
            ],
            pillarNote: "16세기 신학자 리처드 후커(Richard Hooker)가 정립한 '세 기둥'입니다. 성경·전통·이성이 균형을 이룰 때 신앙이 온전해진다는 가르침입니다."
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
            ]
        }
    },

    logo: {
        eyebrow: "Our Symbol",
        title: "캔터베리 십자가",
        desc: "캔터베리 십자가(Canterbury Cross)는 세계 성공회 공동체를 잇는 상징입니다. 9세기 영국 캔터베리에서 발굴된 앵글로색슨 브로치에서 유래했으며, 성공회의 보편성과 연대 정신을 담고 있습니다.",
        colors: "짙은 녹색은 생명과 성장을, 흰색 십자가는 그리스도의 부활과 빛을 상징합니다."
    },

    ministerSection: {
        categories: [
            { id: "성직자", title: "성직자" },
            { id: "사역자", title: "사역자" },
            { id: "교회위원", title: "교회위원" }
        ]
    },

    clergy: [
        {
            category: "성직자",
            name: "민숙희(마가렛)",
            title: "관할사제 · 서울교구 서부교무구 총사제",
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
                    "대한성공회 여성 성직자회 회장(현)",
                    "대한성공회 정의평화사제단 회장(현)"
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
            ordained: "",
            quote: "",
            desc: "연세대학교 불어불문학과를 졸업한 뒤 성공회대학교 신학과에 편입해 사제가 되었습니다. 가톨릭대학교 상담심리대학원에서 상담심리학 석사 학위와 상담심리사 자격을 취득했으며, 동방문화대학원대학교에서 주역·명리학을 전공해 철학박사 학위를 받았습니다. 성공회대학교와 한겨레문화센터에서 강의했으며, 현재 옹진 재가노인지원서비스센터장과 광명교회 협동사제로 섬기고 있습니다.",
            contact: "",
            kyoboUrl: "https://www.aladin.co.kr/m/mproduct.aspx?itemid=287238568"
        }
    ],

    philosophy: {
        title: "우리가 지향하는 교회",
        values: [
            {
                icon: "🌿",
                title: "녹색 교회",
                desc: "생태와 환경 보전을 신앙의 과제로 삼고 실천합니다."
            },
            {
                icon: "🤲",
                title: "열린 교회",
                desc: "성소수자·장애인·이주민 등 사회적 소수자와 모든 생명에 열려 있습니다."
            },
            {
                icon: "⚖️",
                title: "평등한 교회",
                desc: "성별·나이·배경에 관계없이 동등하게 예배에 참여합니다."
            },
            {
                icon: "✝️",
                title: "전례 중심",
                desc: "성공회 기도서에 따른 전례와 성찬을 예배의 중심에 둡니다."
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
                desc: "성공회 전례의 중심인 감사성찬례(Eucharist)입니다. 말씀과 성찬 안에서 예수 그리스도를 만나는 시간이며, 세례받은 모든 그리스도인이 성체를 모실 수 있습니다."
            },
            {
                id: "children",
                title: "어린이 예배",
                time: "매주 일요일 오전 11:00",
                desc: "교육관에서 드리는 어린이 예배입니다. 성공회 전례를 어린이 눈높이에 맞추어 구성합니다."
            }
        ],
        guide: "",
        resources: [
            {
                icon: "📖",
                title: "성공회 기도서",
                desc: "주일 예배에서 함께 펴는 공동기도서(BCP)입니다.",
                url: "https://dulkuka12.github.io/kbcp/"
            },
            {
                icon: "🎵",
                title: "성가집",
                desc: "예배 성가를 온라인으로 펼쳐 함께 부를 수 있습니다.",
                url: "https://dulkuka12.github.io/khymn/"
            },
            {
                icon: "✝️",
                title: "공동번역 성서",
                desc: "성공회 예배에서 봉독하는 공동번역 성서입니다.",
                url: "https://bible.anglican.kr/"
            }
        ]
    },

    community: {
        groups: [
            {
                id: "hopecenter",
                title: "광명 희망터",
                desc: "지역의 소외된 이웃과 함께하는 나눔과 돌봄의 사역입니다.",
                icon: "🌱",
                detailUrl: "hopecenter.html"
            },
            {
                id: "emmaus",
                title: "엠마우스 코스",
                desc: "편안한 대화 속에서 그리스도교 신앙의 기초를 함께 배우는 과정입니다.",
                icon: "📖",
                detailUrl: "emmaus.html"
            },
            {
                id: "smallgroup",
                title: "소그룹 모임",
                desc: "성서를 함께 묵상하고 신앙을 나누는 작은 모임입니다.",
                icon: "🤝",
                detailUrl: "smallgroup.html"
            }
        ]
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
            year: "2025",
            media: "성공회신문",
            title: "서울교구 최초 여성 총사제 민숙희 마가렛 사제 인터뷰",
            date: "2025",
            url: "http://www.skhnews.or.kr/news/articleView.html?idxno=768"
        },
        {
            year: "2021",
            media: "뉴스앤조이",
            title: "대한성공회 여성 사제 서품 20주년…여성 성직 역사는 교단 여성들의 투쟁기",
            date: "2021.09",
            url: "https://www.newsnjoy.or.kr/news/articleView.html?idxno=303297"
        },
        {
            year: "2016",
            media: "뉴스앤조이",
            title: "개업 축복식도 하면서, 동물은 왜 안 되나? — 반려동물 축복식 집전한 민숙희 사제 인터뷰",
            date: "2016.10",
            url: "https://www.newsnjoy.or.kr/news/articleView.html?idxno=206450"
        },
        {
            year: "2005",
            media: "여성신문",
            title: "대한성공회 서울교구 첫 여성성직자 민숙희, 김기리 부제",
            date: "2005.05",
            url: "https://www.womennews.co.kr/news/articleView.html?idxno=15941"
        }
    ],

    liveUrl: "https://youtu.be/5tTJvrTX4aA",

    navigation: [
        {
            label: "교회 소개",
            href: "clergy.html",
            items: [
                { label: "성공회란?",   href: "clergy.html#what-is-anglican" },
                { label: "대한성공회",  href: "clergy.html#ack" },
                { label: "섬기는 이들", href: "clergy.html#priest-section" },
                { label: "교회 철학",  href: "clergy.html#philosophy" },
                { label: "로고 소개",  href: "clergy.html#logo-intro" },
                { label: "언론 보도",  href: "clergy.html#press" }
            ]
        },
        {
            label: "예배",
            href: "worship.html",
            items: [
                { label: "주일 감사성찬례", href: "worship.html#main" },
                { label: "어린이 예배",    href: "worship.html#children" }
            ]
        },
        {
            label: "처음 오신 분",
            href: "worship.html#newcomer",
            items: [
                { label: "참여 안내",      href: "worship.html#firsttime" },
                { label: "성공회 전례란?", href: "worship.html#liturgy" },
                { label: "예배 자료",      href: "worship.html#resources" },
                { label: "예배 순서",      href: "worship.html#eucharist-order" },
                { label: "영성체 안내",    href: "worship.html#communion" },
                { label: "문의하기",       href: "worship.html#contact" }
            ]
        },
        {
            label: "공동체",
            href: "community.html",
            items: [
                { label: "광명 희망터",  href: "community.html#hopecenter" },
                { label: "엠마우스 코스", href: "community.html#emmaus" },
                { label: "소그룹 모임", href: "community.html#smallgroup" }
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
