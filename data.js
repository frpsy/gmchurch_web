/**
 * [Data Module] 
 * 주보 사진 검증 데이터 + 기획안 상세 내용
 */
const CHURCH_DATA = {
    info: {
        name: "대한성공회 광명교회",
        subName: "성 디모테오 성당",
        slogan: "녹색 교회, 모든 생명을 환대하는 교회",
        vision: "하느님 나라를 살아가는 사랑의 공동체",
        established: "1990년 2월 11일",
        address: "(14335) 경기도 광명시 아방리 2길 10",
        phone: "02-2686-0091",
        fax: "02-2686-0092",
        email: "contact@gmskh.org"
    },
    clergy: {
        priest: "민숙희(마가렛) 사제",
        assistant: "이남호(사도요한) 사제",
        contact: "010-8652-0688"
    },
    worship: {
        main: [
            { title: "주일 감사성찬례", time: "매주 일요일 오전 11:00", desc: "전례와 성찬 중심의 깊은 예배" },
            { title: "어린이 예배", time: "매주 일요일 오전 11:00", desc: "아이들의 눈높이에 맞춘 전례" }
        ],
        guide: "성공회 전례가 처음이신가요? 기도서와 성가집은 안내위원이 전해드립니다. 복장은 마음 가볍게 편안한 차림으로 오시면 됩니다."
    },
    community: {
        groups: [
            { title: "광명 희망터", desc: "이웃을 섬기는 나눔 사역", icon: "🌱" },
            { title: "엠마우스 코스", desc: "신앙 기초 교육 과정", icon: "📖" },
            { title: "소그룹 모임", desc: "삶과 말씀의 깊은 나눔", icon: "🤝" }
        ]
    },
    giving: {
        bank: "국민은행 2680-100-14008",
        holder: "재단법인대한성공회",
        report: "투명한 재정 운영을 위해 분기별 사역 재정 보고를 공유합니다."
    },
    sns: {
        youtube: "https://youtube.com/@gmskh",
        instagram: "https://instagram.com/gmskh",
        diocesan: "https://seoul.anglican.kr/"
    },
    liveUrl: "https://youtube.com/@gmskh", // 매주 업데이트
    navigation: [
        {
            label: "예배",
            href: "worship.html",
            items: [
                { label: "주일 감사성찬례", href: "worship.html#main" },
                { label: "어린이 예배", href: "worship.html#children" },
                { label: "새신자 안내", href: "worship.html#newcomer" }
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
            label: "헌금과 살림",
            href: "giving.html",
            items: [
                { label: "봉헌 안내", href: "giving.html#offering" },
                { label: "재정 보고", href: "giving.html#report" },
                { label: "오시는 길", href: "giving.html#location" }
            ]
        }
    ]
};