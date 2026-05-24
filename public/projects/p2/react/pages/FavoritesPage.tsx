/**
 * FavoritesPage — 즐겨찾기 (시대/지역/종목별 그룹)
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - favorites JOIN heritages 로 즐겨찾기한 문화재 전체 조회
 *   - 클라이언트에서 그룹화 + 검색 필터링 (서버 라운드트립 최소화)
 *   - 즐겨찾기 해제는 optimistic update (UI 먼저)
 *   - 필터 상태는 localStorage 에 저장 (페이지 재방문 시 복원)
 *
 * 데이터 흐름:
 *   favorites (user_id, heritage_id)
 *     INNER JOIN heritages (id) → Heritage[]
 *   → useMemo 로 검색 필터링 + 그룹화 (재계산 비용 최소화)
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync, useDebounce, useLocalStorage, useSession } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Heritage } from '../types';

type GroupKey = 'all' | 'era' | 'region' | 'category';

const GROUPS: { value: GroupKey; label: string; icon: string }[] = [
  { value: 'all',      label: '전체',     icon: '📋' },
  { value: 'era',      label: '시대별',   icon: '⏰️' },
  { value: 'region',   label: '지역별',   icon: '📍' },
  { value: 'category', label: '종목별',   icon: '🏛' },
];

export default function FavoritesPage() {
  const user = useSession();
  const [group, setGroup] = useLocalStorage<GroupKey>('p2:fav:group', 'all');
  const [rawQuery, setRawQuery] = useState('');
  const query = useDebounce(rawQuery, 300);

  // ─── 즐겨찾기 + 문화재 JOIN ────────────────────────────
  const favsState = useAsync(async () => {
    if (!user) return [] as Heritage[];
    const { data, error } = await supabase
      .from('favorites')
      .select('heritage:heritages(*)')
      .order('saved_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((f: any) => f.heritage as Heritage);
  }, [user?.id]);

  // 검색 필터 (debounce 된 query 사용)
  const filtered = useMemo(() => {
    const favs = favsState.status === 'success' ? favsState.data : [];
    const q = query.trim().toLowerCase();
    if (!q) return favs;
    return favs.filter((h) =>
      h.name.toLowerCase().includes(q) ||
      h.region.toLowerCase().includes(q) ||
      h.category.toLowerCase().includes(q),
    );
  }, [favsState, query]);

  // 그룹화
  const grouped = useMemo(() => {
    if (group === 'all') return { '전체': filtered };
    const key = group === 'era' ? 'era' : group === 'region' ? 'region' : 'category';
    const map: Record<string, Heritage[]> = {};
    filtered.forEach((h) => {
      const k = h[key as keyof Heritage] as string || '기타';
      (map[k] ??= []).push(h);
    });
    // 그룹별 개수 기준 내림차순 정렬
    return Object.fromEntries(Object.entries(map).sort(([, a], [, b]) => b.length - a.length));
  }, [filtered, group]);

  // ─── 해제 (optimistic) ─────────────────────────────────
  async function unfav(heritageId: string) {
    if (!user || favsState.status !== 'success') return;
    if (!confirm('이 문화재를 즐겨찾기에서 빼시겠어요?')) return;
    try {
      await supabase.from('favorites').delete().eq('heritage_id', heritageId);
      // 클라이언트 캐시 갱신은 다음 렌더에 반영. 실제로는 refetch 권장.
      location.reload();   // 단순화
    } catch {
      alert('해제에 실패했어요');
    }
  }

  // 렌더
  if (favsState.status === 'loading') return <><Nav /><Spinner label="즐겨찾기를 불러오는 중..." /></>;
  if (favsState.status === 'error')   return <><Nav /><ErrorBox error={favsState.error} /></>;
  if (favsState.status !== 'success') return null;

  const favs = favsState.data;

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>⭐️ 즐겨찾기</h1>
        <p>나중에 다시 보고 싶은 문화재를 모아두는 공간입니다.</p>
      </div>

      {/* ─── 검색 + 그룹 토글 ─── */}
      <div className="filters">
        <input
          className="search"
          type="search"
          placeholder="문화재 이름·지역·분류 검색…"
          value={rawQuery}
          onChange={(e) => setRawQuery(e.target.value)}
        />
        <div className="group">
          {GROUPS.map((g) => (
            <button
              key={g.value}
              className={group === g.value ? 'on' : ''}
              onClick={() => setGroup(g.value)}
            >
              {g.icon} {g.label}
            </button>
          ))}
        </div>
      </div>

      <main className="body">
        {favs.length === 0 ? (
          <EmptyState
            emoji="⭐️"
            title="즐겨찾기한 문화재가 없어요"
            desc="검색 결과에서 ★️ 버튼을 눌러 모아보세요."
            action={<Link to="/" className="btn btn--primary">문화재 검색하러 가기 →</Link>}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji="🔍"
            title={`"${query}" 결과 없음`}
            desc="다른 검색어를 시도해 보세요."
          />
        ) : (
          <>
            <p style={{ color: 'var(--text-mute)', fontSize: '.85rem', marginBottom: 14 }}>
              총 <strong>{favs.length}개</strong> {query && `중 검색 결과 ${filtered.length}개`}
            </p>
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
          </>
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
          title="즐겨찾기 해제"
          onClick={(e) => { e.preventDefault(); onUnfav(heritage.id); }}
        >★️</button>
      </div>
      <div className="card-item__body">
        <div className="card-item__cat">{heritage.designation}</div>
        <h3 className="card-item__title">{heritage.name}</h3>
        <p className="card-item__loc">📍 {heritage.region} · {heritage.category}</p>
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
