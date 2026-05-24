/**
 * 우리문화재 AI 해설 — App.tsx (라우터 진입점)
 * ────────────────────────────────────────────────────────────
 * RAG 검색 + 수준별 해설 + 탐방 미션이 핵심인 앱입니다.
 *
 * 폴더 구조:
 *   src/
 *     App.tsx              ← 라우터 (이 파일)
 *     supabase.ts          ← Supabase 클라이언트 + pgvector RAG 호출
 *     types.ts             ← Heritage, Explanation 타입
 *     pages/
 *       SearchPage.tsx     ← 홈 / 검색
 *       DetailPage.tsx     ← 문화재 상세 + 수준별 해설
 *       QuizPage.tsx       ← 5문제 퀴즈
 *       MissionPage.tsx    ← 탐방 미션 (지도)
 *       HistoryPage.tsx    ← 학습 기록
 *       FavoritesPage.tsx  ← 즐겨찾기
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage";
// import DetailPage    from './pages/DetailPage';
// import QuizPage      from './pages/QuizPage';
// import MissionPage   from './pages/MissionPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/heritage/:id" element={<DetailPage />} /> */}
        {/* <Route path="/quiz/:id"     element={<QuizPage />} /> */}
        {/* <Route path="/mission"      element={<MissionPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
