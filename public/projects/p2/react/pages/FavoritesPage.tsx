/**
 * FavoritesPage — 즐겨찾기 (시대/지역/종목별 그룹)
 * ────────────────────────────────────────────────────────────
 * 데이터:
 *   - favorites 테이블 JOIN heritages
 *   - 클라이언트에서 그룹 키별로 묶음
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Heritage } from '../types';

type GroupKey = 'all' | 'era' | 'region' | 'category';

const GROUPS: { value: GroupKey; label: string }[] = [
  { value: 'all',      label: '전체' },
  { value: 'era',      label: '시대별' },
  { value: 'region',   label: '지역별' },
  { value: 'category', label: '종목별' },
];

export default function FavoritesPage() {
  const [favs, setFavs]   = useState<Heritage[]>([]);
  const [group, setGroup] = useState<GroupKey>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('favorites')
        .select('heritage:heritages(*)');
      const list = (data ?? []).map((f: any) => f.heritage as Heritage);
      setFavs(list);
    })();
  }, []);

  // ─── 검색 필터 ─────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return favs;
    return favs.filter((h) =>
      h.name.toLowerCase().includes(q) ||
      h.region.toLowerCase().includes(q),
    );
  }, [favs, query]);

  // ─── 그룹화 ────────────────────────────────────────────
  const grouped = useMemo(() => {
    if (group === 'all') return { '전체': filtered };
    const key = group === 'era' ? 'era' : group === 'region' ? 'region' : 'category';
    const map: Record<string, Heritage[]> = {};
    filtered.forEach((h) => {
      const k = h[key] || '기타';
      (map[k] ??= []).push(h);
    });
    return map;
  }, [filtered, group]);

  // ─── 즐겨찾기 해제 ─────────────────────────────────────
  async function unfav(heritageId: string) {
    await supabase.from('favorites').delete().eq('heritage_id', heritageId);
    setFavs((prev) => prev.filter((h) => h.id !== heritageId));
  }

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>⭐ 즐겨찾기</h1>
        <p>나중에 다시 보고 싶은 문화재를 모아두는 공간입니다.</p>
      </div>

      <div className="filters">
        <input
          className="search"
          type="search"
          placeholder="문화재 이름·지역 검색…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="group">
          {GROUPS.map((g) => (
            <button
              key={g.value}
              className={group === g.value ? 'on' : ''}
              onClick={() => setGroup(g.value)}
            >{g.label}</button>
          ))}
        </div>
      </div>

      <main className="body">
        {Object.entries(grouped).map(([key, list]) => (
          <section key={key} className="section">
            <div className="section__head">
              <h2>{key}</h2>
              <span>{list.length}개</span>
            </div>
            <div className="grid">
              {list.map((h) => <FavCard key={h.id} heritage={h} onUnfav={unfav} />)}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <div className="empty">
            <span>⭐</span>
            즐겨찾기한 문화재가 없어요.
          </div>
        )}
      </main>
    </>
  );
}

// ─── 보조 컴포넌트 ─────────────────────────────────────────

function FavCard({ heritage, onUnfav }: { heritage: Heritage; onUnfav: (id: string) => void }) {
  return (
    <Link to={`/heritage/${heritage.id}`} className="card-item">
      <div className="card-item__img" style={{ background: heritage.gradient }}>
        {heritage.emoji}
        <button
          className="card-item__star"
          aria-label="즐겨찾기 해제"
          onClick={(e) => { e.preventDefault(); onUnfav(heritage.id); }}
        >★</button>
      </div>
      <div className="card-item__body">
        <div className="card-item__cat">{heritage.designation}</div>
        <h3 className="card-item__title">{heritage.name}</h3>
        <p className="card-item__loc">📍 {heritage.region}</p>
      </div>
    </Link>
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
        <Link to="/fav" className="on">즐겨찾기</Link>
      </nav>
    </header>
  );
}
