/**
 * 회복탄력성 코치 — App.tsx (라우터)
 *
 * 폴더 구조:
 *   src/
 *     App.tsx
 *     supabase.ts          ← Supabase + 체크인/루틴 헬퍼
 *     types.ts             ← Checkin, Routine, Journal, Resilience
 *     pages/
 *       TodayPage.tsx      ← 오늘의 체크인 (홈)
 *       RoutinePage.tsx    ← 루틴 추천
 *       JournalPage.tsx    ← 저널
 *       ChartPage.tsx      ← 회복 그래프
 *       HistoryPage.tsx    ← 루틴 히스토리
 *       SettingPage.tsx    ← 설정
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/routine" element={<RoutinePage />} /> */}
        {/* <Route path="/journal" element={<JournalPage />} /> */}
        {/* <Route path="/chart"   element={<ChartPage />} /> */}
        {/* <Route path="/history" element={<HistoryPage />} /> */}
        {/* <Route path="/setting" element={<SettingPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
