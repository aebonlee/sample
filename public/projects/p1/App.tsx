// ============================================================
// 한국형 AI 동화책 — React 19 + TypeScript + Vite
// ============================================================
// 정적 HTML 모형을 React 컴포넌트로 옮긴 예시.
// 실제 프로젝트에서는 라우터/Supabase 클라이언트/Tailwind 등을 함께 사용합니다.

import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
);

// ── Types ───────────────────────────────────────────────────
type AgeRange = '5-7' | '8-10' | '11-12';
type Origin = '전래동화' | '명절' | '지역설화' | '역사인물';

interface Story {
  id: string;
  title: string;
  age_range: AgeRange;
  cover_emoji: string;
  cover_gradient: string;
  reading_minutes: number;
  is_favorite: boolean;
}

interface Scene {
  scene_order: number;
  title: string;
  body: string;
  art_emoji: string;
  bg_gradient: string;
}

// ── Layout ──────────────────────────────────────────────────
function Nav({ active }: { active?: string }) {
  const link = (id: string, to: string, label: string) => (
    <Link to={to} className={active === id ? 'on' : ''}>{label}</Link>
  );
  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to="/" className="brand"><span className="brand__mark">📚</span> 동화공방</Link>
        <nav className="nav__links">
          {link('home', '/', '홈')}
          {link('create', '/create', '동화 만들기')}
          {link('library', '/library', '내 동화')}
        </nav>
      </div>
    </header>
  );
}

// ── Pages ───────────────────────────────────────────────────
function Home({ recommended }: { recommended: Story[] }) {
  return (
    <>
      <Nav active="home" />
      <section className="hero">
        <span className="hero__eyebrow">한국적 소재 · AI 생성</span>
        <h1>우리 아이만을 위한<br/><span className="accent">한국형 동화책</span>을 만들어요</h1>
        <Link to="/create" className="btn btn--primary">✨ 동화 만들기 시작</Link>
      </section>

      <main className="container">
        <section className="stories">
          <h2>오늘의 추천 동화</h2>
          <div className="stories__grid">
            {recommended.map((s) => (
              <Link key={s.id} to={`/reader/${s.id}`} className="story-card">
                <div className="story-card__cover" style={{ background: s.cover_gradient }}>
                  {s.cover_emoji}
                </div>
                <div className="story-card__body">
                  <p className="story-card__title">{s.title}</p>
                  <p className="story-card__meta">{s.age_range}세 · {s.reading_minutes}분</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function Create() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', age: '8-10' as AgeRange, origin: '전래동화' as Origin, values: ['우정', '배려'] as string[], note: '',
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase.from('stories').insert({
      title: '생성 중...',
      age_range: form.age,
      origin: form.origin,
      values_tags: form.values,
      custom_request: form.note,
      status: 'generating',
    }).select().single();
    if (error || !data) return alert(error?.message);
    navigate(`/generating/${data.id}`);
  }

  return (
    <>
      <Nav active="create" />
      <form className="form" onSubmit={onSubmit}>
        <div className="field">
          <label>아이 이름 (선택)</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label>나이대</label>
          {(['5-7', '8-10', '11-12'] as AgeRange[]).map((a) => (
            <label key={a}>
              <input type="radio" name="age" value={a}
                checked={form.age === a}
                onChange={() => setForm({ ...form, age: a })}
              /> {a}세
            </label>
          ))}
        </div>
        <button type="submit" className="btn btn--primary">✨ 동화 만들기</button>
      </form>
    </>
  );
}

function Reader({ scenes }: { scenes: Scene[] }) {
  const [i, setI] = useState(0);
  const s = scenes[i];
  return (
    <>
      <Nav />
      <main className="book-wrap">
        <div className="book">
          <div className="scene" style={{ background: s.bg_gradient }}>
            <div className="scene__art">{s.art_emoji}</div>
          </div>
          <div className="text">
            <h2>{s.title}</h2>
            <p>{s.body}</p>
          </div>
          <nav className="pager">
            <button onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>← 이전</button>
            <span>{i + 1} / {scenes.length}</span>
            <button onClick={() => setI((x) => Math.min(scenes.length - 1, x + 1))}>다음 →</button>
          </nav>
        </div>
      </main>
    </>
  );
}

// ── Router ──────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home recommended={[]} />} />
        <Route path="/create" element={<Create />} />
        <Route path="/reader/:id" element={<Reader scenes={[]} />} />
      </Routes>
    </BrowserRouter>
  );
}
