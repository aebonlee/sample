# 자격증 코치 — React 19 + Chart.js

진단 평가로 취약점을 자동 파악하고, AI가 맞춤 학습 계획을 짜주는 자격증 학습 앱.

## 폴더 구조

```
src/
├── App.tsx
├── supabase.ts             # fetchCertifications, fetchWeakness, generatePlan
├── types.ts                # Certification, Question, Diagnosis
└── pages/
    ├── CertListPage.tsx    # 자격증 선택
    ├── DiagnosePage.tsx    # 진단 평가
    ├── ResultPage.tsx      # 채점 결과
    ├── WeaknessPage.tsx    # 취약점 대시보드 (Chart.js 레이더)
    ├── PlanPage.tsx        # 학습 계획 캘린더
    └── NotePage.tsx        # 오답 노트
```

## Edge Functions

| 함수 | 역할 |
|---|---|
| `diagnose` | 진단 평가 시작 → 25문제 선별 |
| `grade` | 채점 + 과목별 점수 계산 + 등급 결정 |
| `explain` | 오답 해설 자동 생성 |
| `plan` | 시험일·약점·주간 학습량 → 4주 일정 자동 생성 |

## DB 핵심: weakness_by_topic 뷰

```sql
-- 시도 3회 이상인 단원의 정답률을 자동 집계
create view weakness_by_topic as
select user_id, cert_id, topic_id, topic_name, subject_name,
  count(*) as attempts,
  count(*) filter (where is_correct) as correct,
  round(count(*) filter (where is_correct) * 100.0 / count(*), 1) as accuracy
from attempts join questions on ... join topics on ...
group by ... having count(*) >= 3;
```
