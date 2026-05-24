/**
 * 자소서 코치 — App.tsx (라우터)
 *
 * 5단계 파이프라인: 경험 → STAR → 작성 → 피드백 → 면접
 *
 * 폴더 구조:
 *   src/
 *     App.tsx
 *     supabase.ts          ← Supabase + STAR / 피드백 / 면접 헬퍼
 *     types.ts             ← Experience, StarBreakdown, Resume, Feedback
 *     pages/
 *       ExperiencePage.tsx ← 경험 입력 (홈)
 *       StarPage.tsx       ← STAR 구조화 결과
 *       WritePage.tsx      ← 자소서 작성 (Tiptap 에디터)
 *       FeedbackPage.tsx   ← AI 피드백
 *       InterviewPage.tsx  ← 면접 준비 Q&A
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/star/:id"      element={<StarPage />} /> */}
        {/* <Route path="/write/:id"     element={<WritePage />} /> */}
        {/* <Route path="/feedback/:id"  element={<FeedbackPage />} /> */}
        {/* <Route path="/interview/:id" element={<InterviewPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
