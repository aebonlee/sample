/**
 * DetailPage — 문화재 상세 + 수준별 해설
 * ────────────────────────────────────────────────────────────
 * 핵심: 초/중/고/일반 4단계 토글로 같은 문화재의 해설을 수준에 맞게 교체.
 *
 * 데이터:
 *   - heritages 테이블에서 기본 정보
 *   - explanations 테이블에서 수준별 캐시된 해설 (없으면 Edge Function 호출)
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase, getExplanation } from '../supabase';
import type { Heritage, Level } from '../types';

const LEVELS: { value: Level; label: string; sub: string }[] = [
  { value: 'elem',  label: '초등', sub: '쉽고 흥미롭게' },
  { value: 'mid',   label: '중등', sub: '역사적 맥락' },
  { value: 'high',  label: '고등', sub: '건축·사상' },
  { value: 'adult', label: '일반', sub: '심층 해설' },
];

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const [heritage, setHeritage] = useState<Heritage | null>(null);
  const [level, setLevel] = useState<Level>('high');
  const [body, setBody] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // ─── 문화재 기본 정보 ─────────────────────────────────
  useEffect(() => {
    if (!id) return;
    supabase.from('heritages').select('*').eq('id', id).single()
      .then(({ data }) => setHeritage(data as Heritage | null));
  }, [id]);

  // ─── 수준별 해설 로드 (캐시 우선) ──────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getExplanation(id, level)
      .then(setBody)
      .finally(() => setLoading(false));
  }, [id, level]);

  if (!heritage) return <p style={{ padding: 40 }}>로딩 중...</p>;

  return (
    <>
      <Nav />
      <section className="hero">
        <div className="hero__inner">
          <div className="hero__art">{heritage.emoji}</div>
          <div className="hero__body">
            <div className="hero__cat">{heritage.designation} · {heritage.era} 시대</div>
            <h1>{heritage.name}</h1>
            <p>{heritage.summary}</p>
            <div className="hero__actions">
              <Link to={`/quiz/${id}`} className="btn">🎯 퀴즈 도전</Link>
              <Link to="/mission" className="btn btn--ghost">📍 탐방 미션</Link>
              <button className="btn btn--ghost">⭐ 즐겨찾기</button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 수준 토글 ─── */}
      <div className="level-tabs">
        <div className="level-tabs__inner">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              className={`level-tab ${level === l.value ? 'on' : ''}`}
              onClick={() => setLevel(l.value)}
            >
              {l.label}<small>{l.sub}</small>
            </button>
          ))}
        </div>
      </div>

      <main className="container">
        <p className="crumb"><Link to="/">홈</Link> › {heritage.name}</p>

        <article className="card explain">
          <h2>🎓 {LEVELS.find((l) => l.value === level)?.label} 수준</h2>
          {loading
            ? <p style={{ color: 'var(--text-mute)' }}>해설을 불러오는 중...</p>
            : <div dangerouslySetInnerHTML={{ __html: body }} />
          }
        </article>
      </main>
    </>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">🏛 우리<span>문화재</span></div>
      <nav className="nav-links">
        <Link to="/">검색</Link>
        <Link to="/mission">탐방 미션</Link>
        <Link to="/history">학습 기록</Link>
        <Link to="/fav">즐겨찾기</Link>
      </nav>
    </header>
  );
}
