/**
 * LibraryPage — 내 동화 목록
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - 사용자가 만든 동화 전체 (status='done')
 *   - 나이대 / 즐겨찾기 필터
 *   - 제목 검색 (useDebounce)
 *   - 즐겨찾기 토글 (optimistic update)
 *   - 정렬 (최근/제목/즐겨찾기)
 *
 * 패턴:
 *   - useAsync 로 목록 로드
 *   - useLocalStorage 로 필터/정렬 영속화
 *   - useDebounce 로 검색어 지연
 *   - useMemo 로 필터링 캐싱
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync, useDebounce, useLocalStorage, useSession } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Story, AgeRange } from '../types';

type Filter = 'all' | AgeRange | 'fav';
type Sort = 'recent' | 'title' | 'fav';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all',   label: '전체' },
  { value: '5-7',   label: '5~7세' },
  { value: '8-10',  label: '8~10세' },
  { value: '11-12', label: '11~12세' },
  { value: 'fav',   label: '⭐ 즐겨찾기' },
];

export default function LibraryPage() {
  const user = useSession();
  const [filter, setFilter] = useLocalStorage<Filter>('p1:lib:filter', 'all');
  const [sort, setSort]     = useLocalStorage<Sort>('p1:lib:sort', 'recent');
  const [rawQuery, setRawQuery] = useState('');
  const query = useDebounce(rawQuery, 300);
  const [stories, setStories] = useState<Story[]>([]);

  // ─── 동화 목록 로드 ─────────────────────────────────
  const state = useAsync(async () => {
    if (!user) return [] as Story[];
    const { data, error } = await supabase
      .from('stories').select('*')
      .eq('status', 'done')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Story[];
  }, [user?.id]);

  // 첫 로드 동기화
  if (state.status === 'success' && stories.length === 0 && state.data.length > 0) {
    setStories(state.data);
  }

  // ─── 필터링 + 정렬 ────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = stories.filter((s) => {
      if (filter === 'fav' && !s.is_favorite) return false;
      if (filter !== 'all' && filter !== 'fav' && s.age_range !== filter) return false;
      if (q && !s.title.toLowerCase().includes(q)) return false;
      return true;
    });

    switch (sort) {
      case 'title': list.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'fav':   list.sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite)); break;
      case 'recent':
      default: /* 이미 created_at desc */ break;
    }
    return list;
  }, [stories, filter, sort, query]);

  // ─── 즐겨찾기 토글 (optimistic) ─────────────────────
  async function toggleFav(id: string) {
    const target = stories.find((s) => s.id === id);
    if (!target) return;
    const next = !target.is_favorite;
    setStories((prev) => prev.map((s) =>
      s.id === id ? { ...s, is_favorite: next } : s,
    ));
    try {
      await supabase.from('stories').update({ is_favorite: next }).eq('id', id);
    } catch {
      // 롤백
      setStories((prev) => prev.map((s) =>
        s.id === id ? { ...s, is_favorite: !next } : s,
      ));
      alert('즐겨찾기 변경 실패');
    }
  }

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>📚 내가 만든 동화</h1>
        <p>
          {state.status === 'loading' ? '...' : `총 ${stories.length}권 만들었어요`}
          {query && ` · "${query}" 결과 ${filtered.length}권`}
        </p>
      </div>

      <div className="filters">
        <input
          className="search" type="search"
          placeholder="동화 제목 검색…"
          value={rawQuery}
          onChange={(e) => setRawQuery(e.target.value)}
        />
        {FILTERS.map((f) => (
          <button key={f.value}
            className={`chip ${filter === f.value ? 'is-on' : ''}`}
            onClick={() => setFilter(f.value)}>{f.label}</button>
        ))}
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}
                style={{ marginLeft: 'auto', padding: '6px 10px', borderRadius: 8,
                        border: '1px solid var(--border)' }}>
          <option value="recent">최근 순</option>
          <option value="title">제목 순</option>
          <option value="fav">즐겨찾기 우선</option>
        </select>
      </div>

      <div className="lib">
        {state.status === 'loading' && <div style={{ gridColumn: '1/-1' }}><Spinner label="📖 동화를 불러오는 중..." /></div>}
        {state.status === 'error'   && <div style={{ gridColumn: '1/-1' }}><ErrorBox error={state.error} /></div>}
        {state.status === 'success' && (
          filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1' }}>
              <EmptyState
                emoji="📖"
                title={query ? '검색 결과가 없어요' : '아직 동화가 없어요'}
                desc={query ? '다른 검색어를 시도해 보세요' : '첫 동화를 만들어 보세요!'}
                action={!query && (
                  <Link to="/create" className="btn btn--primary">✨ 새 동화 만들기</Link>
                )}
              />
            </div>
          ) : (
            filtered.map((s) => <BookCard key={s.id} story={s} onToggleFav={toggleFav} />)
          )
        )}
      </div>
    </>
  );
}

// ─── 보조 ─────────────────────────────────────────

function BookCard({ story, onToggleFav }: { story: Story; onToggleFav: (id: string) => void }) {
  return (
    <Link to={`/reader/${story.id}`} className="book">
      <div className="book__cover" style={{ background: story.cover_gradient }}>
        {story.cover_emoji}
        <span className="book__age">{story.age_range}세</span>
        <button
          className={`book__fav ${story.is_favorite ? 'is-on' : ''}`}
          aria-label={story.is_favorite ? '즐겨찾기 해제' : '즐겨찾기'}
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
