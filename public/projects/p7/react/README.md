# 회복탄력성 코치 — React 19

매일의 감정·루틴을 기록해 회복력을 키우는 모바일 앱.

## 폴더 구조

```
src/
├── App.tsx
├── supabase.ts             # submitCheckin, completeRoutine, fetchResilience
├── types.ts                # Checkin, Routine, ResilienceDay
└── pages/
    ├── TodayPage.tsx       # 오늘의 체크인 (홈)
    ├── RoutinePage.tsx     # AI 루틴 추천
    ├── JournalPage.tsx     # 격려 + 성찰 저널
    ├── ChartPage.tsx       # 회복 그래프 (Chart.js)
    ├── HistoryPage.tsx     # 루틴 히스토리
    └── SettingPage.tsx     # 설정 (알림)
```

## DB 핵심: daily_resilience 뷰

```sql
-- 감정 점수 60% + 루틴 완수율 40% 가중 평균
create view daily_resilience as
  ... -- schema.sql 참고
```

## Edge Functions

| 함수 | 역할 |
|---|---|
| `routine` | 최근 체크인 패턴 → 맞춤 루틴 3-5개 추천 |
| `encourage` | 오늘 감정 → Solar Chat으로 격려 메시지 생성 |
| `reflect` | 하루 활동 → 성찰 질문 생성 |
| `stats` | 주간/월간 회복 통계 집계 |
