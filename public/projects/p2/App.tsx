// ============================================================
// 우리문화재 AI 해설 — React 19 + RAG 검색
// ============================================================

import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
);

type Level = 'elem' | 'mid' | 'high' | 'adult';

interface Heritage {
  id: string;
  name: string;
  designation: string;
  era: string;
  region: string;
  emoji: string;
  gradient: string;
}

// ── RAG 검색 (Edge Function 호출) ─────────────────────────
async function searchHeritages(query: string): Promise<Heritage[]> {
  const { data, error } = await supabase.functions.invoke('search-heritages', {
    body: { query, limit: 6 },
  });
  if (error) throw error;
  return data.results as Heritage[];
}

// ── 수준별 해설 (캐시 우선, 없으면 Solar 호출) ───────────
async function getExplanation(heritageId: string, level: Level): Promise<string> {
  const { data } = await supabase
    .from('explanations')
    .select('body')
    .eq('heritage_id', heritageId)
    .eq('level', level)
    .single();
  if (data?.body) return data.body;

  const { data: gen } = await supabase.functions.invoke('explain', {
    body: { heritage_id: heritageId, level },
  });
  return gen.body;
}

// ── Layout ──────────────────────────────────────────────────
function Nav({ active }: { active?: string }) {
  return (
    <header className="nav">
      <div className="brand">🏛 우리<span>문화재</span></div>
      <nav className="nav-links">
        <Link to="/" className={active === 'home' ? 'on' : ''}>검색</Link>
        <Link to="/mission" className={active === 'mission' ? 'on' : ''}>탐방 미션</Link>
        <Link to="/history" className={active === 'history' ? 'on' : ''}>학습 기록</Link>
        <Link to="/fav" className={active === 'fav' ? 'on' : ''}>즐겨찾기</Link>
      </nav>
    </header>
  );
}

// ── Pages ───────────────────────────────────────────────────
function Search() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Heritage[]>([]);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setResults(await searchHeritages(q));
  }

  return (
    <>
      <Nav active="home" />
      <section className="hero">
        <h1>우리 문화재, AI에게 물어보세요</h1>
        <form className="search-box" onSubmit={onSearch}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="경복궁, 석굴암, 첨성대..." />
          <button type="submit">🔍 검색</button>
        </form>
      </section>

      <main className="container">
        <div className="heritage-grid">
          {results.map((h) => (
            <Link key={h.id} to={`/heritage/${h.id}`} className="card">
              <div className="card__img" style={{ background: h.gradient }}>{h.emoji}</div>
              <div className="card__body">
                <div className="card__cat">{h.designation} · {h.era}</div>
                <h3 className="card__title">{h.name}</h3>
                <p className="card__loc">📍 {h.region}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

function Detail() {
  const { id } = useParams<{ id: string }>();
  const [level, setLevel] = useState<Level>('high');
  const [body, setBody] = useState<string>('');

  async function loadLevel(l: Level) {
    if (!id) return;
    setLevel(l);
    setBody('로딩 중...');
    setBody(await getExplanation(id, l));
  }

  return (
    <>
      <Nav />
      <div className="level-tabs">
        {(['elem', 'mid', 'high', 'adult'] as Level[]).map((l) => (
          <button key={l} className={level === l ? 'on' : ''} onClick={() => loadLevel(l)}>
            {l === 'elem' ? '초등' : l === 'mid' ? '중등' : l === 'high' ? '고등' : '일반'}
          </button>
        ))}
      </div>
      <main className="container">
        <article className="explain" dangerouslySetInnerHTML={{ __html: body }} />
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/heritage/:id" element={<Detail />} />
      </Routes>
    </BrowserRouter>
  );
}
