# 갤러리 사진 폴더

갤러리(`gallery.html`)에 사용되는 사진을 카테고리별로 보관합니다.

## 폴더 구조

| 폴더 | 카테고리 | 예시 |
|---|---|---|
| `worship/` | 예배 | 주일 성찬예배, 어린이 예배, 새벽 성무일도 |
| `community/` | 공동체 | 주일 애찬, 엠마우스 코스, 소그룹 모임 |
| `seasons/` | 절기·행사 | 대림절, 부활절, 세례식, 성탄절 |
| `scenery/` | 교회 풍경 | 성전 내부, 교회 마당 |

## 사진 추가 방법

1. 해당 카테고리 폴더에 사진 파일 업로드
2. `data.js`의 `photoGallery.photos` 배열에 항목 추가:

```js
{
    id: "p13",           // 순서대로 번호 부여
    title: "제목",
    desc: "짧은 설명",
    category: "예배",    // worship·community·seasons·scenery 카테고리명과 일치
    date: "2026.06",
    src: "images/gallery/worship/파일명.jpg",
    thumb: "images/gallery/worship/파일명.jpg",  // 별도 썸네일 없으면 동일하게
    alt: "스크린리더용 대체 텍스트"
}
```

## 권장 사양

- 형식: JPG (사진), PNG (투명 배경 필요 시)
- 원본(`src`): 900×600 px 이상
- 파일명: 영문 소문자·숫자·하이픈만 사용 (예: `easter-2026.jpg`)
