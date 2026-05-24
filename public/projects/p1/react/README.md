# 한국형 AI 동화책 — React 19 프로젝트

전래동화·명절·지역 설화 같은 한국적 소재로 아이의 나이와 관심사에 맞춘
동화를 Solar LLM이 자동 생성하는 앱입니다.

## 빠른 시작

```bash
# 1) 의존성 설치
npm install

# 2) 환경 변수 설정
cp .env.example .env.local
# .env.local 을 열어 Supabase 값을 채우세요.

# 3) DB 스키마 적용 (Supabase SQL Editor 에서 실행)
#    schema.sql 의 내용을 그대로 붙여 넣고 Run

# 4) 개발 서버
npm run dev
```

## 환경 변수 (.env.local)

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_SOLAR_API_KEY=up_...      # Solar Chat / Vision 호출용 (선택)
```

## 폴더 구조

```
src/
├── App.tsx                 # 라우터
├── supabase.ts             # Supabase 단일 인스턴스
├── types.ts                # 도메인 타입 (Story, Scene, ...)
├── pages/
│   ├── HomePage.tsx        # 홈
│   ├── CreatePage.tsx      # 동화 만들기 폼
│   ├── ReaderPage.tsx      # 동화 뷰어
│   └── LibraryPage.tsx     # 내 동화 목록
└── components/
    ├── Nav.tsx
    └── StoryCard.tsx
```

## Supabase Edge Functions

`/supabase/functions/` 에 아래 함수가 필요합니다:

| 함수 | 역할 |
|---|---|
| `generate-story` | 사용자 입력 → Solar Chat 으로 동화 본문 + 장면 분할 + 삽화 프롬프트 |
| `save-story` | 생성된 동화를 stories/scenes 테이블에 저장 |
| `generate-activities` | 동화 → 4종 독후활동 생성 |

## RLS (Row Level Security)

`schema.sql` 에 모든 테이블 RLS 정책이 포함되어 있습니다.
사용자는 자기 동화만 조회/수정할 수 있습니다.

## 다음 단계

1. `pages/CreatePage.tsx` 구현 (생성 폼)
2. Edge Function `generate-story` 작성
3. `pages/ReaderPage.tsx` 구현 (장면 페이지 넘기기)
4. `pages/LibraryPage.tsx` 구현 (즐겨찾기/검색)
