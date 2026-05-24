/**
 * 자격증 코치 — App.tsx (라우터)
 *
 * 폴더 구조:
 *   src/
 *     App.tsx
 *     supabase.ts          ← Supabase + 진단/취약점 헬퍼
 *     types.ts             ← Cert, Subject, Question, Diagnosis
 *     pages/
 *       CertListPage.tsx   ← 자격증 선택 (홈)
 *       DiagnosePage.tsx   ← 진단 평가
 *       WeaknessPage.tsx   ← 취약점 대시보드 (Chart.js)
 *       PlanPage.tsx       ← 학습 계획 캘린더
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/diagnose/:certId" element={<DiagnosePage />} /> */}
        {/* <Route path="/weakness/:certId" element={<WeaknessPage />} /> */}
        {/* <Route path="/plan/:certId"     element={<PlanPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
