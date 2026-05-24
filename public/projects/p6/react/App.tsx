/**
 * 자소서 코치 — App.tsx (라우터)
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage      from './pages/HomePage';
import StarPage      from './pages/StarPage';
import WritePage     from './pages/WritePage';
import FeedbackPage  from './pages/FeedbackPage';
import InterviewPage from './pages/InterviewPage';
import MyPage        from './pages/MyPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<HomePage />} />
        <Route path="/star/:id"       element={<StarPage />} />
        <Route path="/write/:id"      element={<WritePage />} />
        <Route path="/feedback/:id"   element={<FeedbackPage />} />
        <Route path="/interview/:id"  element={<InterviewPage />} />
        <Route path="/my"             element={<MyPage />} />
      </Routes>
    </BrowserRouter>
  );
}
