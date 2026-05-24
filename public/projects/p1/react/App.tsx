/**
 * 한국형 AI 동화책 — App.tsx (라우터 진입점)
 * ────────────────────────────────────────────────────────────
 * 이 파일은 전체 라우팅만 담당합니다. 각 페이지의 실제 구현은
 * pages/ 폴더에 분리되어 있어요.
 *
 * 권장 폴더 구조:
 *   src/
 *     App.tsx              ← 라우터 (이 파일)
 *     supabase.ts          ← Supabase 클라이언트 단일 인스턴스
 *     types.ts             ← 도메인 타입 (Story, Scene 등)
 *     pages/
 *       HomePage.tsx       ← 홈 (소개 + 추천 동화)
 *       CreatePage.tsx     ← 동화 만들기 입력 폼
 *       ReaderPage.tsx     ← 동화 뷰어 (장면별 페이지 넘기기)
 *       LibraryPage.tsx    ← 내 동화 목록
 *     components/
 *       Nav.tsx            ← 공통 상단 네비
 *       StoryCard.tsx      ← 동화 카드
 *     styles/global.css    ← 공통 스타일 (style.css 참고)
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
// 아래는 같은 패턴으로 추가하면 됩니다 (이번 예시에선 HomePage만 분리).
// import CreatePage   from './pages/CreatePage';
// import ReaderPage   from './pages/ReaderPage';
// import LibraryPage  from './pages/LibraryPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/create"      element={<CreatePage />} /> */}
        {/* <Route path="/reader/:id"  element={<ReaderPage />} /> */}
        {/* <Route path="/library"     element={<LibraryPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
