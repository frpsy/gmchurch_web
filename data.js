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
        address: "(14335) 경기도 광명시 아방리 2길 10",
        addressShort: "경기도 광명시 아방리 2길 10",
        phone: "02-2686-0091",
        fax: "02-2686-0092",
        email: "bsyg2000@hanmail.net"
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
            title: "협동사제",
            ordained: "",
            quote: "",
            desc: "연세대 불어불문학과를 졸업하고 36세에 성공회대 신학과에 편입해 성직자가 되었습니다. 가톨릭대학교 상담심리대학원에서 상담심리석사 학위와 상담심리사 자격을 취득하였으며, 동방문화대학원대학교에서 주역·명리학을 전공하고 철학박사 학위를 받았습니다. 성공회대학교 및 한겨레문화센터에서 강의하였고, 현재 광명교회 협동사제로 섬기고 있습니다.",
            contact: "",
            kyoboUrl: "https://search.kyobobook.co.kr/search?keyword=%EC%9D%B4%EB%82%A8%ED%98%B8%20%EC%8B%A0%EB%B6%80"
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
        guide: "성공회 전례가 처음이신가요? 기도서와 성가집은 안내위원이 전해드립니다. 복장은 편안한 차림으로 오시면 됩니다. 세례 여부와 무관하게 모든 분을 환영합니다.",
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
        instagram: "https://instagram.com/gmskh",
        diocesan: "https://seoul.anglican.kr/"
    },

    press: [
        {
            year: "2025",
            media: "가톨릭신문",
            title: "[인터뷰] 대한성공회 서울교구 첫 여성 총사제 임명된 민숙희 신부",
            date: "2025.04.07",
            url: "https://www.catholictimes.org/list/21"
        },
        {
            year: "2023",
            media: "동아일보",
            title: ""하나님의 사랑이 설마 인간에게만 국한됐을 리가 있을까요?"",
            date: "2023.11.29",
            url: "https://www.donga.com"
        },
        {
            year: "2022",
            media: "뉴스앤조이",
            title: ""참사 후 신속해야 할 것은 유가족과 시민을 단속하는 일이 아닙니다"",
            date: "2022.11.11",
            url: "https://www.newsnjoy.or.kr"
        },
        {
            year: "2021",
            media: "국민일보",
            title: "여성 성직자로 16년은 분투의 역사… 성평등 지향 않는 교회 도태될 것",
            date: "2021.10.14",
            url: "https://www.kmib.co.kr"
        },
        {
            year: "2019",
            media: "국민일보",
            title: ""남녀 양성 배제 받지 않을 때 조화로운 교회 될 것"",
            date: "2019.01.07",
            url: "https://www.kmib.co.kr"
        }
    ],

    liveUrl: "https://youtu.be/5tTJvrTX4aA",

    navigation: [
        {
            label: "교회 소개",
            href: "clergy.html",
            items: [
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
                { label: "어린이 예배", href: "worship.html#children" },
                { label: "성공회 전례 안내", href: "worship.html#newcomer" }
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
