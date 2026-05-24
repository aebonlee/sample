/**
 * 한국사 마스터 — App.tsx (라우터)
 *
 * 폴더 구조:
 *   src/
 *     App.tsx              ← 라우터 (이 파일)
 *     supabase.ts          ← Supabase 클라이언트
 *     types.ts             ← Era, Question, Attempt
 *     pages/
 *       TimelinePage.tsx   ← 시대 타임라인 (홈)
 *       StudyPage.tsx      ← 시대별 학습
 *       QuizPage.tsx       ← 문제 풀기
 *       NotePage.tsx       ← 오답 노트
 *       ReportPage.tsx     ← 성적표 & 취약점
 *       MockPage.tsx       ← 한능검 모의고사
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/study/:eraId" element={<StudyPage />} /> */}
        {/* <Route path="/quiz/:eraId"  element={<QuizPage />} /> */}
        {/* <Route path="/note"         element={<NotePage />} /> */}
        {/* <Route path="/report"       element={<ReportPage />} /> */}
        {/* <Route path="/mock"         element={<MockPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
