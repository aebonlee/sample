/**
 * 한국사 마스터 — App.tsx (라우터)
 *
 * 6개 페이지 라우팅.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage   from './pages/HomePage';
import StudyPage  from './pages/StudyPage';
import QuizPage   from './pages/QuizPage';
import NotePage   from './pages/NotePage';
import ReportPage from './pages/ReportPage';
import MockPage   from './pages/MockPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<HomePage />} />
        <Route path="/study/:eraId" element={<StudyPage />} />
        <Route path="/quiz/:eraId?" element={<QuizPage />} />
        <Route path="/note"         element={<NotePage />} />
        <Route path="/report"       element={<ReportPage />} />
        <Route path="/mock"         element={<MockPage />} />
      </Routes>
    </BrowserRouter>
  );
}
