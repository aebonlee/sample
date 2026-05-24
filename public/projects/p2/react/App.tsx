/**
 * 우리문화재 AI 해설 — App.tsx (라우터)
 * ────────────────────────────────────────────────────────────
 * 6개 페이지를 라우팅합니다.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage      from './pages/HomePage';
import DetailPage    from './pages/DetailPage';
import QuizPage      from './pages/QuizPage';
import MissionPage   from './pages/MissionPage';
import HistoryPage   from './pages/HistoryPage';
import FavoritesPage from './pages/FavoritesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<HomePage />} />
        <Route path="/heritage/:id" element={<DetailPage />} />
        <Route path="/quiz/:id"     element={<QuizPage />} />
        <Route path="/mission"      element={<MissionPage />} />
        <Route path="/history"      element={<HistoryPage />} />
        <Route path="/fav"          element={<FavoritesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
