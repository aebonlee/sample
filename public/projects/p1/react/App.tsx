/**
 * 한국형 AI 동화책 — App.tsx (라우터 진입점)
 * ────────────────────────────────────────────────────────────
 * 6개 페이지를 라우팅합니다. 각 페이지의 구현은 pages/ 폴더에 분리.
 *
 * 폴더 구조:
 *   src/
 *     App.tsx                  ← 라우터 (이 파일)
 *     supabase.ts              ← Supabase 단일 인스턴스
 *     types.ts                 ← 도메인 타입
 *     pages/
 *       HomePage.tsx           ← 홈 (소개 + 추천 동화)
 *       CreatePage.tsx         ← 동화 만들기 폼
 *       GeneratingPage.tsx     ← 생성 진행률 (Realtime 구독)
 *       ReaderPage.tsx         ← 동화 뷰어 (장면 페이지 넘기기)
 *       ActivityPage.tsx       ← 독후활동 4종
 *       LibraryPage.tsx        ← 내 동화 목록 (필터·검색·즐겨찾기)
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage       from './pages/HomePage';
import CreatePage     from './pages/CreatePage';
import GeneratingPage from './pages/GeneratingPage';
import ReaderPage     from './pages/ReaderPage';
import ActivityPage   from './pages/ActivityPage';
import LibraryPage    from './pages/LibraryPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                  element={<HomePage />} />
        <Route path="/create"            element={<CreatePage />} />
        <Route path="/generating/:id"    element={<GeneratingPage />} />
        <Route path="/reader/:id"        element={<ReaderPage />} />
        <Route path="/activity/:id"      element={<ActivityPage />} />
        <Route path="/library"           element={<LibraryPage />} />
      </Routes>
    </BrowserRouter>
  );
}
