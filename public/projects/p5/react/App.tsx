/**
 * 청년톡톡 — App.tsx (라우터)
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage      from './pages/HomePage';
import SearchPage    from './pages/SearchPage';
import DetailPage    from './pages/DetailPage';
import MyPage        from './pages/MyPage';
import ChecklistPage from './pages/ChecklistPage';
import CalendarPage  from './pages/CalendarPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<HomePage />} />
        <Route path="/search"     element={<SearchPage />} />
        <Route path="/policy/:id" element={<DetailPage />} />
        <Route path="/my"         element={<MyPage />} />
        <Route path="/checklist"  element={<ChecklistPage />} />
        <Route path="/calendar"   element={<CalendarPage />} />
      </Routes>
    </BrowserRouter>
  );
}
