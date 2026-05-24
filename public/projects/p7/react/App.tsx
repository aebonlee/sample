/**
 * 회복탄력성 코치 — App.tsx (라우터)
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage    from './pages/HomePage';
import RoutinePage from './pages/RoutinePage';
import JournalPage from './pages/JournalPage';
import ChartPage   from './pages/ChartPage';
import HistoryPage from './pages/HistoryPage';
import SettingPage from './pages/SettingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<HomePage />} />
        <Route path="/routine" element={<RoutinePage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/chart"   element={<ChartPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/setting" element={<SettingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
