# AI 자소서·면접 코치 — React 19

5단계 파이프라인: 경험 → STAR → 작성 → 피드백 → 면접

## 폴더 구조

```
src/
├── App.tsx
├── supabase.ts             # saveExperience, convertToStar, requestFeedback, generateInterview
├── types.ts                # Experience, StarBreakdown, Resume, Feedback
└── pages/
    ├── ExperiencePage.tsx  # 경험 입력
    ├── StarPage.tsx        # STAR 결과
    ├── WritePage.tsx       # 자소서 작성 (Tiptap)
    ├── FeedbackPage.tsx    # AI 피드백
    ├── InterviewPage.tsx   # 면접 Q&A
    └── MyPage.tsx          # 내 자소서
```

## Edge Functions

| 함수 | 역할 |
|---|---|
| `star` | raw_text → Solar Chat으로 S/T/A/R 분해 + 역량 추출 |
| `generate` | 문항 + STAR → 자소서 초안 생성 |
| `feedback` | 자소서 답안 → 4영역 점수 + 수정 제안 |
| `interview` | 자소서 전체 → 12개 예상 면접 질문 + 모범 답안 |
