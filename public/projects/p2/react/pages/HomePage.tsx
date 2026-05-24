/**
 * SearchPage — 우리문화재 홈/검색
 * ────────────────────────────────────────────────────────────
 * 사용자가 자연어로 검색하면 pgvector RAG 로 유사 문화재를 찾아주는 페이지.
 *
 * 핵심 동작:
 *   1) 검색어 입력 → searchHeritages() 호출
 *   2) 결과 6건을 카드 그리드로 표시
 *   3) 카드 클릭 시 /heritage/:id 로 이동
 *
 * 검색 외에도:
 *   - 빈 상태에서는 "오늘의 추천 문화재" 4건 표시
 *   - 빠른 검색 키워드 칩 제공
 */

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { searchHeritages } from '../supabase';
import type { Heritage } from '../types';

const QUICK_KEYWORDS = ['경복궁', '석굴암', '첨성대', '훈민정음', '종묘', '남한산성'];

export default function SearchPage() {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<Heritage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // ─── 검색 실행 ────────────────────────────────────────────
  async function handleSearch(e?: FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    try {
      const list = await searchHeritages(q, 6);
      setResults(list);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // 빠른 키워드 클릭
  function quickSearch(keyword: string) {
    setQuery(keyword);
    setTimeout(() => handleSearch(), 0);   // state 반영 후 검색
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
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? '검색 중...' : '🔍 검색'}
            </button>
          </div>
        </form>

        {/* 빠른 키워드 */}
        <div className="quick">
          {QUICK_KEYWORDS.map((k) => (
            <button key={k} onClick={() => quickSearch(k)}>{k}</button>
          ))}
        </div>
      </section>

      <main className="container">
        {error && (
          <div style={{ padding: 20, background: '#fee', borderRadius: 12 }}>
            ❌ 검색 실패: {error}
          </div>
        )}

        {results.length > 0 ? (
          <>
            <h2 className="section-title">검색 결과 ({results.length}건)</h2>
            <HeritageGrid items={results} />
          </>
        ) : (
          <>
            <h2 className="section-title">🌟 오늘의 추천 문화재</h2>
            <RecommendedSection />
          </>
        )}
      </main>
    </>
  );
}

// ─── 보조 컴포넌트 ─────────────────────────────────────────

function Nav() {
  return (
    <header className="nav">
      <div className="brand">🏛 우리<span>문화재</span></div>
      <nav>
        <Link to="/" className="on">검색</Link>
        <Link to="/mission">탐방 미션</Link>
        <Link to="/history">학습 기록</Link>
        <Link to="/fav">즐겨찾기</Link>
      </nav>
    </header>
  );
}

function HeritageGrid({ items }: { items: Heritage[] }) {
  return (
    <div className="heritage-grid">
      {items.map((h) => (
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

function RecommendedSection() {
  // 실제로는 supabase에서 즐겨찾기 많은 순으로 4건 조회
  // 여기서는 데모용으로 빈 안내
  return (
    <p style={{ color: 'var(--text-mute)', padding: 20 }}>
      문화재를 검색하거나 위의 빠른 키워드를 눌러보세요.
    </p>
  );
}
