/**
 * HomePage — 우리문화재 검색 (홈)
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - 자연어 검색 → pgvector RAG (search_heritages 함수)
 *   - 빠른 검색 키워드 칩
 *   - 검색어 없을 땐 "오늘의 추천" 표시
 *
 * 패턴: useAsync 로 검색/추천 명시적 분기, 빈 결과 처리.
 */

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { searchHeritages, supabase } from '../supabase';
import { useAsync } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Heritage } from '../types';

const QUICK_KEYWORDS = ['경복궁', '석굴암', '첨성대', '훈민정음', '종묘', '남한산성'];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  const searchState = useAsync(async () => {
    if (!activeQuery) return [] as Heritage[];
    return await searchHeritages(activeQuery, 6);
  }, [activeQuery]);

  const recommendState = useAsync(async () => {
    const { data } = await supabase.from('heritages').select('*').limit(4).order('created_at', { ascending: false });
    return (data ?? []) as Heritage[];
  }, []);

  function handleSearch(e?: FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (q) setActiveQuery(q);
  }

  function quickSearch(keyword: string) {
    setQuery(keyword); setActiveQuery(keyword);
  }

  return (
    <>
      <Nav />
      <section className="hero">
        <h1>우리 문화재, AI에게 물어보세요</h1>
        <p>국보·보물·유적지를 검색하면 초·중·고·어른 수준별로 설명해드립니다.</p>

        <form className="search-box" onSubmit={handleSearch}>
          <div className="search-box__inner">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="예) 경복궁, 석굴암, 첨성대..."
              disabled={searchState.status === 'loading'}
            />
            <button type="submit" disabled={searchState.status === 'loading'}>
              {searchState.status === 'loading' ? '검색 중...' : '🔍 검색'}
            </button>
          </div>
        </form>

        <div className="quick">
          {QUICK_KEYWORDS.map((k) => (
            <button key={k} onClick={() => quickSearch(k)}>{k}</button>
          ))}
        </div>
      </section>

      <main className="container">
        {activeQuery ? (
          <>
            <h2 className="section-title">"{activeQuery}" 검색 결과</h2>
            <ResultGrid state={searchState} onClear={() => { setActiveQuery(''); setQuery(''); }} />
          </>
        ) : (
          <>
            <h2 className="section-title">🌟 오늘의 추천 문화재</h2>
            <ResultGrid state={recommendState} />
          </>
        )}
      </main>
    </>
  );
}

function ResultGrid({ state, onClear }: {
  state: ReturnType<typeof useAsync<Heritage[]>>;
  onClear?: () => void;
}) {
  if (state.status === 'loading') return <Spinner label="🤖 검색 중..." />;
  if (state.status === 'error')   return <ErrorBox error={state.error} />;
  if (state.status !== 'success') return null;

  if (state.data.length === 0) {
    return (
      <EmptyState
        emoji="🔍"
        title="검색 결과가 없어요"
        desc="다른 키워드를 시도해 보세요."
        action={onClear && <button onClick={onClear} className="btn btn--ghost">검색 초기화</button>}
      />
    );
  }

  return (
    <div className="heritage-grid">
      {state.data.map((h) => (
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
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">🏛 우리<span>문화재</span></div>
      <nav className="nav-links">
        <Link to="/" className="on">검색</Link>
        <Link to="/mission">탐방 미션</Link>
        <Link to="/history">학습 기록</Link>
        <Link to="/fav">즐겨찾기</Link>
      </nav>
    </header>
  );
}
