/**
 * 청년톡톡 — App.tsx (라우터)
 *
 * 폴더 구조:
 *   src/
 *     App.tsx
 *     supabase.ts          ← Supabase + RAG 챗 + 정책 매칭
 *     types.ts             ← Policy, Profile, Message
 *     pages/
 *       ChatPage.tsx       ← 챗봇 메인 (홈)
 *       SearchPage.tsx     ← 정책 검색
 *       DetailPage.tsx     ← 정책 상세
 *       MyPage.tsx         ← 맞춤 정책
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/search"      element={<SearchPage />} /> */}
        {/* <Route path="/policy/:id"  element={<DetailPage />} /> */}
        {/* <Route path="/my"          element={<MyPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
