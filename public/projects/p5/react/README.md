# 청년톡톡 — React 19 + pgvector RAG 챗봇

청년 지원 정책을 자연어로 상담받고, 본인 프로필 기반으로 맞춤 정책을 추천받는 챗봇.

## 폴더 구조

```
src/
├── App.tsx
├── supabase.ts             # sendChat, matchPolicies, fetchMessages
├── types.ts                # Policy, Profile, Message
└── pages/
    ├── ChatPage.tsx        # 챗봇 메인
    ├── SearchPage.tsx      # 정책 검색
    ├── DetailPage.tsx      # 정책 상세
    ├── MyPage.tsx          # 맞춤 정책
    ├── ChecklistPage.tsx   # 신청 체크리스트
    └── CalendarPage.tsx    # 마감일 캘린더
```

## DB 핵심: match_policies_for 함수

```sql
-- 사용자 프로필 기반 자격 매칭 → 점수 0~1 반환
create function match_policies_for(p_user uuid)
returns table(policy_id uuid, score numeric) ...
```

## Edge Functions

| 함수 | 역할 |
|---|---|
| `chat` | 사용자 메시지 → RAG 검색 → Solar LLM 응답 + 정책 IDs |
| `search` | 키워드/카테고리/지역 필터 검색 |
| `match` | 프로필 → 맞춤 정책 매칭 |
| `checklist` | 정책 → 단계별 체크리스트 자동 생성 |
