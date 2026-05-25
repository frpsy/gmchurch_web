/**
 * [ChurchData] Single source of truth
 * SOLID: Single Responsibility — 모든 콘텐츠 데이터만 담당
 */
const CHURCH_DATA = {
    info: {
        name: "대한성공회 광명교회",
        subName: "성 디모테오 성당",
        slogan: "모든 생명을 환대하는 교회",
        vision: "하느님 나라를 살아가는 사랑의 공동체",
        established: "1990년 2월 11일",
        address: "경기도 광명시 아방리 2길 10",
        addressShort: "경기도 광명시 아방리 2길 10",
        phone: "02-2686-0091",
        fax: "02-2686-0092",
        email: "bsyg2000@hanmail.net"
    },

    anglican: {
        welcome: "이 페이지에서는 성공회가 어떤 교회인지, 대한성공회는 어떤 역사를 걸어왔는지, 그리고 광명교회가 어떤 사람들과 함께 신앙의 길을 걷고 있는지를 소개합니다.",
        what: {
            eyebrow: "Anglican Church",
            title: "성공회란?",
            paras: [
                "성공회(聖公會)는 '거룩하고 공번된 교회'라는 뜻입니다. 16세기 종교개혁 시기 영국에서 시작된 교회로, 가톨릭의 풍부한 전례 전통과 개신교의 성서 중심 신앙을 함께 품는 <strong>'중도의 길(Via Media)'</strong>을 걸어왔습니다.",
                "오늘날 성공회는 전 세계 165개국, 약 1억 명의 신자가 함께하는 세계 공동체입니다. 특정 교리를 강요하거나 한 지도자에게 권위를 집중하지 않으며, <strong>말씀과 성찬을 중심으로 다양한 사람들이 함께 신앙을 나누는 공동체</strong>를 지향합니다."
            ],
            pillars: [
                { icon: "📖", title: "성경", desc: "하느님의 말씀인 성경은 신앙과 삶의 최고 권위입니다. 예배 때마다 구약·서신서·복음서가 봉독됩니다." },
                { icon: "🏛", title: "전통", desc: "초대교회로부터 이어진 사도적 전통과 2,000년 공동체의 지혜를 신앙의 안내자로 삼습니다." },
                { icon: "💡", title: "이성", desc: "하느님이 주신 이성으로 말씀을 해석하고 신앙을 현실 속에서 살아냅니다." }
            ],
            pillarNote: "16세기 신학자 리처드 후커(Richard Hooker)가 정립한 '세 기둥' — 성경·전통·이성이 균형을 이룰 때 신앙은 온전해진다고 봅니다."
        },
        korea: {
            eyebrow: "Anglican Church of Korea",
            title: "대한성공회",
            founded: "1890",
            paras: [
                "1890년, 영국 성공회 선교사 찰스 존 코프(Charles John Corfe) 주교가 처음 한국 땅을 밟으면서 대한성공회의 역사가 시작되었습니다. 선교 초기부터 병원과 학교를 세워 몸과 마음을 함께 돌보는 통전적 선교를 실천했습니다.",
                "일제강점기와 민주화 운동 시기에도 사회적 약자와 함께했으며, 오늘날에도 교육·의료·사회복지 사업을 통해 하느님 나라를 이 땅에 이루어 가고 있습니다."
            ],
            highlights: [
                { icon: "⛪", text: "서울·부산·대전 3개 교구, 전국 200여 교회" },
                { icon: "🎓", text: "성공회대학교, 의료복지재단 등 교육·사회 사업 운영" },
                { icon: "🌐", text: "세계성공회공동체(Anglican Communion) 정식 회원 교회" },
                { icon: "⚖️", text: "여성 사제 서품(2001년~), 사회 정의와 인권을 위한 목소리" }
            ]
        }
    },

    logo: {
        eyebrow: "Our Identity",
        title: "ACGM — 광명교회의 모노그램",
        desc: "ACGM은 광명교회의 정체성을 네 글자에 담은 모노그램입니다. <strong>A</strong>nglican <strong>C</strong>hurch of <strong>G</strong>wangmyeong, <strong>M</strong>ission — 광명에 자리한 성공회 교회의 사명을 표현합니다.",
        letters: [
            { letter: "A", word: "Anglican", desc: "성공회 — 말씀과 성찬을 함께 중시하는 전례 교회 전통" },
            { letter: "C", word: "Church", desc: "교회 — 모든 사람에게 열려 있는 공번된 공동체" },
            { letter: "G", word: "Gwangmyeong", desc: "광명(光明) — 우리가 자리한 도시이자 비추고자 하는 빛" },
            { letter: "M", word: "Mission", desc: "사명 — 환대·평등·생명을 실천하는 부르심" }
        ],
        colors: "짙은 녹색은 성공회 전통과 생명의 색, 흰색은 모든 이를 향한 환대와 빛을 상징합니다."
    },

    clergy: [
        {
            name: "민숙희(마가렛)",
            title: "관할사제 · 서울교구 서부교무구 총사제",
            ordained: "2005년 서품",
            quote: "교회는 모든 이를 위해 존재해야 하며, 누구도 소외받지 않아야 합니다.",
            desc: "성공회대학교 신학과(1988학번)를 졸업하고 서울교구 최초의 여성 성직 과정생으로 사제서품을 받았습니다. 2025년 3월에는 대한성공회 서울교구 최초의 여성 총사제로 임명되었습니다. 성평등한 교회, 녹색교회를 지향하며 광명교회를 섬기고 있습니다.",
            contact: "010-8652-0688",
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
                    "한국기독청년연합회(EYCK) 서울지회장(1997)",
                    "한국기독교교회협의회(NCCK) 여성위원장(67~68회기)",
                    "대한성공회 제2대 여성국장",
                    "관구 윤리위원회 위원",
                    "대한성공회 여성 성직자회 회장(현)"
                ],
                ministryNote: "대한성공회 최초로 반려동물 축복식을 시작해 12년째 이어오고 있습니다. 이를 기반으로 '노아의 방주 예배공동체'를 이끌며 유기견 보호소 봉사, 수의사 초청 강연 등 생명 존중 사역을 이어가고 있습니다. '경계가 없는 교회, 모든 생명에게 열려 있는 교회, 차별과 혐오에 맞서는 교회' — 민숙희 사제가 평생 가꾸어 온 사목의 비전입니다.",
                source: {
                    title: "《여성들이 함께 길을 내고 걷는 우리들의 사제》",
                    author: "대한성공회 전국여성성직자회",
                    publisher: "성공회출판사",
                    year: "2021"
                }
            }
        },
        {
            name: "이남호(사도요한)",
            title: "협동사제",
            ordained: "",
            quote: "",
            desc: "연세대 불어불문학과를 졸업하고 36세에 성공회대 신학과에 편입해 성직자가 되었습니다. 가톨릭대학교 상담심리대학원에서 상담심리석사 학위와 상담심리사 자격을 취득하였으며, 동방문화대학원대학교에서 주역·명리학을 전공하고 철학박사 학위를 받았습니다. 성공회대학교 및 한겨레문화센터에서 강의하였고, 현재 광명교회 협동사제로 섬기고 있습니다.",
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
        liturgicalSeason: {
            name: "성령강림절",
            color: "#c0390f",
            colorLight: "#fdf2ee",
            colorName: "적색",
            symbol: "🔥",
            note: "2026년 5월"
        },
        main: [
            {
                id: "main",
                title: "주일 감사성찬례",
                time: "매주 일요일 오전 11:00",
                desc: "성공회 전례의 핵심인 감사성찬례(Eucharist). 말씀 전례와 성찬 전례 두 부분으로 이루어집니다. 모든 세례 교인이 성체를 모시며, 처음 오신 분도 환영합니다."
            },
            {
                id: "children",
                title: "어린이 예배",
                time: "매주 일요일 오전 11:00",
                desc: "교육관에서 어린이들의 눈높이에 맞는 전례로 함께 드립니다. 아이들이 신앙의 언어를 몸으로 배우는 시간입니다."
            }
        ],
        guide: "처음 오시는 분도 편안하게 오세요. 문 앞에서 기도서와 성가집을 받으시면 됩니다. 복장은 자유롭고, 세례 여부와 관계없이 누구나 환영합니다.",
        liturgyInfo: [
            {
                id: "newcomer",
                title: "성공회 전례란?",
                desc: "성공회(Anglican Church)는 말씀과 성찬을 함께 중시하는 전례 교회입니다. 예배는 성공회 기도서(Book of Common Prayer)에 따라 드리며, 회중이 함께 기도하고 응답하는 대화 형식으로 진행됩니다. 모든 신자가 성직자와 동등하게 예배를 '드리는' 주체입니다."
            },
            {
                title: "감사성찬례 순서",
                desc: "입당예식 → 말씀의 전례(성경 봉독·설교·신앙고백·중보기도) → 성찬의 전례(빵과 포도주 축성·영성체) → 파송예식"
            },
            {
                title: "영성체 안내",
                desc: "세례받은 모든 그리스도인은 영성체(성체를 모시는 것)에 참여하실 수 있습니다. 세례를 받지 않으셨더라도 제대 앞에 나오셔서 강복을 받으실 수 있습니다."
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
                desc: "삶과 말씀의 깊은 나눔. 작은 공동체 안에서 서로를 돌보며 함께 성장합니다.",
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
                { label: "성공회 소개", href: "clergy.html#what-is-anglican" },
                { label: "관할사제", href: "clergy.html#priest" },
                { label: "교회 철학", href: "clergy.html#philosophy" },
                { label: "언론 보도", href: "clergy.html#press" }
            ]
        },
        {
            label: "예배",
            href: "worship.html",
            items: [
                { label: "주일 감사성찬례", href: "worship.html#main" },
                { label: "어린이 예배", href: "worship.html#children" }
            ]
        },
        {
            label: "새신자",
            href: "worship.html#newcomer",
            items: [
                { label: "성공회 전례 안내", href: "worship.html#newcomer" },
                { label: "감사성찬례 순서", href: "worship.html#eucharist-order" },
                { label: "영성체 안내", href: "worship.html#communion" },
                { label: "처음 오신 분들께", href: "worship.html#firsttime" }
            ]
        },
        {
            label: "공동체",
            href: "community.html",
            items: [
                { label: "광명 희망터", href: "community.html#hopecenter" },
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
        },
        {
            label: "헌금",
            href: "giving.html",
            items: [
                { label: "봉헌 계좌", href: "giving.html#offering" },
                { label: "재정 보고", href: "giving.html#report" }
            ]
        }
    ]
};
