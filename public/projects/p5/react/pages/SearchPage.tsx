/**
 * SearchPage — 정책 검색 (키워드 + 카테고리 + 정렬 + 마감 임박)
 * ────────────────────────────────────────────────────────────
 * 핵심 패턴:
 *   - useDebounce 로 검색어 300ms 지연 → 입력마다 쿼리 안 함
 *   - useLocalStorage 로 필터·정렬 상태 영속화
 *   - useMemo 로 정렬/필터링 캐싱
 *   - 즐겨찾기는 optimistic update + Set 으로 빠른 lookup
 *
 * URL 동기화 (옵션): useSearchParams 로 ?q=... 처리하면 공유 가능
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync, useDebounce, useLocalStorage, useSession } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Policy, PolicyCategory } from '../types';

const CATS: { value: PolicyCategory | 'all'; emoji: string; label: string }[] = [
  { value: 'all',        emoji: '📋', label: '전체' },
  { value: '주거',       emoji: '🏠', label: '주거' },
  { value: '취업·창업',  emoji: '💼', label: '취업·창업' },
  { value: '금융·자산',  emoji: '💰', label: '금융·자산' },
  { value: '교육·역량',  emoji: '📚', label: '교육·역량' },
  { value: '건강',       emoji: '🏥', label: '건강' },
];

type SortKey = 'popular' | 'deadline' | 'recent' | 'amount';

export default function SearchPage() {
  const user = useSession();
  const [params, setParams] = useSearchParams();
  const [rawQuery, setRawQuery] = useState(params.get('q') ?? '');
  const query = useDebounce(rawQuery, 300);

  const [cat, setCat]   = useLocalStorage<PolicyCategory | 'all'>('p5:search:cat', 'all');
  const [sort, setSort] = useLocalStorage<SortKey>('p5:search:sort', 'popular');
  const [favIds, setFavIds] = useState<Set<string>>(new Set());

  // ─── URL ↔ 검색어 동기화 ───────────────────────────
  useEffect(() => {
    setParams(query ? { q: query } : {}, { replace: true });
  }, [query, setParams]);

  // ─── 정책 목록 ─────────────────────────────────────
  const policiesState = useAsync(async () => {
    const { data, error } = await supabase
      .from('policies').select('*').order('apply_deadline', { nullsFirst: false });
    if (error) throw error;
    return (data ?? []) as Policy[];
  }, []);

  // ─── 즐겨찾기 IDs ─────────────────────────────────
  useEffect(() => {
    if (!user) return;
    supabase.from('bookmarks').select('policy_id').then(({ data }) => {
      setFavIds(new Set((data ?? []).map((r: any) => r.policy_id)));
    });
  }, [user?.id]);

  // ─── 필터 + 정렬 ────────────────────────────────────
  const filtered = useMemo(() => {
    if (policiesState.status !== 'success') return [];
    const q = query.trim().toLowerCase();
    let list = policiesState.data.filter((p) => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (q && !(p.title + ' ' + p.description + ' ' + p.organization).toLowerCase().includes(q)) return false;
      return true;
    });

    switch (sort) {
      case 'deadline':
        list = list.sort((a, b) => (a.apply_deadline ?? '9999').localeCompare(b.apply_deadline ?? '9999'));
        break;
      case 'amount':
        list = list.sort((a, b) => (b.amount_max ?? 0) - (a.amount_max ?? 0));
        break;
      case 'recent':
        list = list.sort(() => 0);   // 실제로는 created_at 추가
        break;
      case 'popular':
      default:
        // 인기순 = 즐겨찾기 수 기준 (실제: bookmarks count 조인)
        break;
    }
    return list;
  }, [policiesState, query, cat, sort]);

  // ─── 즐겨찾기 토글 (optimistic) ──────────────────
  async function toggleFav(policyId: string) {
    if (!user) { alert('로그인이 필요해요'); return; }
    const next = new Set(favIds);
    const wasFav = next.has(policyId);
    if (wasFav) next.delete(policyId);
    else next.add(policyId);
    setFavIds(next);

    try {
      if (wasFav) {
        await supabase.from('bookmarks').delete().eq('policy_id', policyId);
      } else {
        await supabase.from('bookmarks').insert({ policy_id: policyId });
      }
    } catch {
      // 롤백
      setFavIds(favIds);
      alert('즐겨찾기 변경 실패');
    }
  }

  if (policiesState.status === 'loading') return <><Nav /><Spinner /></>;
  if (policiesState.status === 'error')   return <><Nav /><ErrorBox error={policiesState.error} /></>;

  return (
    <>
      <Nav />
      <div className="page-head"><h1>🔍 정책 검색</h1></div>

      {/* 검색 박스 */}
      <div className="search-box">
        <div className="search-box__inner">
          <input
            type="search"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="예) 청년 월세, 창업 지원금, 자격증 응시료..."
          />
          <button>🔍 검색</button>
        </div>
      </div>

      {/* 카테고리 */}
      <div className="cats">
        {CATS.map((c) => {
          const count = c.value === 'all'
            ? policiesState.data?.length ?? 0
            : (policiesState.data ?? []).filter((p) => p.category === c.value).length;
          return (
            <span key={c.value}
              className={`cat ${cat === c.value ? 'on' : ''}`}
              onClick={() => setCat(c.value)}>
              {c.emoji} {c.label} {count > 0 && count}
            </span>
          );
        })}
      </div>

      <main className="results">
        <div className="results-bar">
          <h3>{query ? `"${query}"` : '전체'} 검색 결과 <strong>{filtered.length}건</strong></h3>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="popular">인기순</option>
            <option value="deadline">마감 임박순</option>
            <option value="amount">지원금 큰 순</option>
            <option value="recent">최신순</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            emoji="🔍"
            title={query ? `"${query}" 결과 없음` : '정책이 없어요'}
            desc="다른 검색어나 카테고리를 시도해 보세요."
            action={query && <button onClick={() => setRawQuery('')} className="btn btn--ghost">검색 초기화</button>}
          />
        ) : (
          <div className="grid">
            {filtered.map((p) =>
              <PolicyCard key={p.id} policy={p} isFav={favIds.has(p.id)} onToggleFav={toggleFav} />,
            )}
          </div>
        )}
      </main>
    </>
  );
}

// ─── 보조 ─────────────────────────────────────────

function PolicyCard({ policy, isFav, onToggleFav }: {
  policy: Policy; isFav: boolean; onToggleFav: (id: string) => void;
}) {
  const daysLeft = policy.apply_deadline
    ? Math.ceil((new Date(policy.apply_deadline).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <Link to={`/policy/${policy.id}`} className="card policy" style={{ position: 'relative' }}>
      <button
        style={{ position: 'absolute', top: 14, right: 14, background: 'transparent',
                border: 0, fontSize: '1.2rem', color: isFav ? '#fbbf24' : 'var(--text-mute)',
                cursor: 'pointer' }}
        onClick={(e) => { e.preventDefault(); onToggleFav(policy.id); }}
        aria-label={isFav ? '즐겨찾기 해제' : '즐겨찾기'}
      >
        {isFav ? '★️' : '☆️'}
      </button>

      <span className="policy__cat">{policy.category}</span>
      <h3 className="policy__title">{policy.title}</h3>
      <p className="policy__org">{policy.organization}</p>
      <p className="policy__amount">{policy.amount_summary}</p>

      {daysLeft !== null && daysLeft > 0 && (
        <span className={`deadline ${daysLeft > 30 ? 'deadline--soft' : ''}`}>
          D-{daysLeft} 마감
        </span>
      )}
      {daysLeft !== null && daysLeft <= 0 && (
        <span className="deadline" style={{ background: 'rgba(107,114,128,.15)', color: '#6b7280' }}>
          마감됨
        </span>
      )}
    </Link>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">💬 청년톡톡</div>
      <nav className="nav-links">
        <Link to="/">챗봇</Link>
        <Link to="/search" className="on">검색</Link>
        <Link to="/my">맞춤 정책</Link>
        <Link to="/checklist">체크리스트</Link>
        <Link to="/calendar">캘린더</Link>
      </nav>
    </header>
  );
}
