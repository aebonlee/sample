# 한국사 마스터 — React 19 + Chart.js

10개 시대를 적응형으로 학습하는 한능검 대비 앱.

## 빠른 시작

```bash
npm install
cp .env.example .env.local
npm run dev
```

## DB 사전 작업

1. `schema.sql` 실행
2. `eras` 테이블에 10개 시대 시드:
   ```sql
   insert into eras (ord, name, start_year, end_year, summary) values
     (1, '고조선·부여·삼한', -2333, -108, '단군 신화부터 시작되는...'),
     (2, '삼국시대', -57, 668, '고구려·백제·신라 세 나라의 경쟁'),
     -- ...
   ```
3. `questions` 테이블에 문제 시드 (시대당 최소 20문제 권장)

## Edge Functions

| 함수 | 역할 |
|---|---|
| `explain` | 시대 + 수준 → Solar 해설 생성 |
| `quiz/generate` | 시대 → 유형별 문제 자동 생성 |
| `quiz/grade` | 답안 채점 + 해설 |
| `analytics` | 학습 통계 집계 (analytics_by_era 뷰 사용) |
| `recommend` | 다음 복습 추천 (정답률 낮은 시대 우선) |

## 폴더 구조

```
src/
├── App.tsx
├── supabase.ts             # fetchEras, fetchUserProgress, recordAttempt
├── types.ts                # Era, Question, Attempt
└── pages/
    ├── TimelinePage.tsx    # 홈
    ├── StudyPage.tsx       # 시대별 학습
    ├── QuizPage.tsx        # 문제 풀기
    ├── NotePage.tsx        # 오답 노트
    ├── ReportPage.tsx      # 성적표
    └── MockPage.tsx        # 한능검 모의고사
```
