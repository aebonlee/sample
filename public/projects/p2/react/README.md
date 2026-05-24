# 우리문화재 AI 해설 — React 19 + pgvector RAG

문화재를 검색하면 Solar 임베딩으로 RAG 검색하고, 초/중/고/일반 4단계 수준별 해설을 제공합니다.

## 빠른 시작

```bash
npm install
cp .env.example .env.local      # Supabase 값 입력
npm run dev
```

## 환경 변수

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## DB 사전 작업

1. `schema.sql` 실행 → 테이블·인덱스·RAG 함수 생성
2. `pgvector` extension 활성화 확인:
   ```sql
   create extension if not exists vector;
   ```
3. 문화재 데이터를 `heritages` 테이블에 시드
4. 각 문화재의 `full_text` 임베딩을 미리 계산해 `embedding` 컬럼에 저장

## Edge Functions

| 함수 | 역할 |
|---|---|
| `search-heritages` | 사용자 질의 → Solar embedding → pgvector RAG 검색 |
| `explain` | 문화재 + 수준 → Solar 해설 생성 → explanations 테이블 캐시 |
| `quiz/generate` | 문화재 → 5문항 객관식 자동 생성 |
| `quiz/grade` | 답안 채점 + 해설 |

## 폴더 구조

```
src/
├── App.tsx                 # 라우터
├── supabase.ts             # Supabase + RAG 헬퍼
├── types.ts                # Heritage, Explanation, Quiz
└── pages/
    ├── SearchPage.tsx      # 홈 / 검색
    ├── DetailPage.tsx      # 상세 + 수준별 해설
    ├── QuizPage.tsx        # 5문제 퀴즈
    └── MissionPage.tsx     # 탐방 미션 (Kakao Map)
```
