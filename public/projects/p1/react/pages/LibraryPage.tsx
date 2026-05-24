/**
 * LibraryPage — 내 동화 목록
 * ────────────────────────────────────────────────────────────
 * 사용자가 만든 모든 동화를 목록으로 보여줍니다.
 *
 * 기능:
 *   - 나이대별 / 즐겨찾기 필터
 *   - 제목 검색
 *   - 카드 클릭 → /reader/:id
 *   - ★ 버튼 클릭 → is_favorite 토글 (optimistic update)
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Story, AgeRange } from '../types';

type Filter = 'all' | AgeRange | 'fav';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all',   label: '전체' },
  { value: '5-7',   label: '5~7세' },
  { value: '8-10',  label: '8~10세' },
  { value: '11-12', label: '11~12세' },
  { value: 'fav',   label: '⭐ 즐겨찾기' },
];

export default function LibraryPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [filter, setFilter]   = useState<Filter>('all');
  const [query, setQuery]     = useState('');
  const [loading, setLoading] = useState(true);

  // ─── 초기 로드 ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('stories')
        .select('*')
        .eq('status', 'done')
        .order('created_at', { ascending: false });
      setStories((data ?? []) as Story[]);
      setLoading(false);
    })();
  }, []);

  // ─── 클라이언트 필터링 ──────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stories.filter((s) => {
      if (filter === 'fav' && !s.is_favorite) return false;
      if (filter !== 'all' && filter !== 'fav' && s.age_range !== filter) return false;
      if (q && !s.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [stories, filter, query]);

  // ─── 즐겨찾기 토글 (optimistic) ─────────────────────────
  async function toggleFav(id: string) {
    setStories((prev) => prev.map((s) =>
      s.id === id ? { ...s, is_favorite: !s.is_favorite } : s,
    ));
    const target = stories.find((s) => s.id === id);
    if (target) {
      await supabase.from('stories').update({ is_favorite: !target.is_favorite }).eq('id', id);
    }
  }

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>📚 내가 만든 동화</h1>
        <p>지금까지 만든 동화 <strong>{stories.length}</strong>권 — 즐겁게 읽고 활동까지 마치셨네요!</p>
      </div>

      {/* ─── 필터 + 검색 ─── */}
      <div className="filters">
        <input
          className="search"
          type="search"
          placeholder="동화 제목 검색…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`chip ${filter === f.value ? 'is-on' : ''}`}
            onClick={() => setFilter(f.value)}
          >{f.label}</button>
        ))}
      </div>

      {/* ─── 동화 그리드 ─── */}
      <div className="lib">
        {loading
          ? <p style={{ gridColumn: '1/-1', color: 'var(--text-mute)' }}>📖 불러오는 중...</p>
          : filtered.length === 0
            ? <Empty />
            : filtered.map((s) => (
                <BookCard key={s.id} story={s} onToggleFav={toggleFav} />
              ))
        }
      </div>
    </>
  );
}

// ─── 보조 컴포넌트 ─────────────────────────────────────────

function BookCard({ story, onToggleFav }: { story: Story; onToggleFav: (id: string) => void }) {
  return (
    <Link to={`/reader/${story.id}`} className="book">
      <div className="book__cover" style={{ background: story.cover_gradient }}>
        {story.cover_emoji}
        <span className="book__age">{story.age_range}세</span>
        <button
          className={`book__fav ${story.is_favorite ? 'is-on' : ''}`}
          onClick={(e) => { e.preventDefault(); onToggleFav(story.id); }}
        >
          {story.is_favorite ? '★' : '☆'}
        </button>
      </div>
      <div className="book__body">
        <p className="book__title">{story.title}</p>
        <p className="book__meta">
          {new Date(story.created_at).toLocaleDateString('ko-KR')} · {story.age_range}세
        </p>
      </div>
    </Link>
  );
}

function Empty() {
  return (
    <div className="empty" style={{ gridColumn: '1/-1' }}>
      <span>📖</span>
      조건에 맞는 동화가 없어요.
      <br/>
      <Link to="/create" className="btn btn--primary" style={{ marginTop: 12, display: 'inline-block' }}>
        ✨ 새 동화 만들기
      </Link>
    </div>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to="/" className="brand"><span className="brand__mark">📚</span> 동화공방</Link>
        <nav className="nav__links">
          <Link to="/">홈</Link>
          <Link to="/create">동화 만들기</Link>
          <Link to="/library" className="is-on">내 동화</Link>
        </nav>
        <div className="nav__cta">
          <Link to="/create" className="btn btn--primary">+ 새 동화</Link>
        </div>
      </div>
    </header>
  );
}
