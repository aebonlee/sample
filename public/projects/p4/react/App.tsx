/**
 * 자격증 코치 — App.tsx (라우터)
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage     from './pages/HomePage';
import DiagnosePage from './pages/DiagnosePage';
import ResultPage   from './pages/ResultPage';
import WeaknessPage from './pages/WeaknessPage';
import PlanPage     from './pages/PlanPage';
import NotePage     from './pages/NotePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                 element={<HomePage />} />
        <Route path="/diagnose/:certId" element={<DiagnosePage />} />
        <Route path="/result/:id"       element={<ResultPage />} />
        <Route path="/weakness/:certId" element={<WeaknessPage />} />
        <Route path="/plan/:certId"     element={<PlanPage />} />
        <Route path="/note"             element={<NotePage />} />
      </Routes>
    </BrowserRouter>
  );
}
