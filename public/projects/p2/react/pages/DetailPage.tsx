/**
 * DetailPage — 문화재 상세 + 수준별 해설
 * ────────────────────────────────────────────────────────────
 * 핵심 흐름:
 *   1) heritages 테이블에서 기본 정보 로드
 *   2) 사용자가 수준 선택 → explanations 캐시 우선 조회
 *   3) 캐시 미스 시 Edge Function 'explain' 호출 → Solar LLM 생성 → 캐시 저장
 *   4) 즐겨찾기·퀴즈로 이동·activity_log 자동 기록
 *
 * 주요 패턴:
 *   - useAsync 로 비동기 상태 3단(loading/success/error) 처리
 *   - 즐겨찾기 토글은 optimistic update (UI 먼저 → 실패 시 롤백)
 *   - 페이지 진입 시 activity_log 자동 기록 (학습 통계용)
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase, getExplanation } from '../supabase';
import { useAsync, useSession } from '../hooks';
import { Spinner, ErrorBox } from '../components/Common';
import type { Heritage, Level } from '../types';

const LEVELS: { value: Level; label: string; sub: string }[] = [
  { value: 'elem',  label: '초등', sub: '쉽고 흥미롭게' },
  { value: 'mid',   label: '중등', sub: '역사적 맥락' },
  { value: 'high',  label: '고등', sub: '건축·사상' },
  { value: 'adult', label: '일반', sub: '심층 해설' },
];

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useSession();
  const [level, setLevel] = useState<Level>('high');
  const [isFav, setIsFav] = useState(false);

  // ─── 문화재 기본 정보 ─────────────────────────────────
  const heritageState = useAsync(async () => {
    if (!id) throw new Error('잘못된 접근입니다.');
    const { data, error } = await supabase
      .from('heritages').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Heritage;
  }, [id]);

  // ─── 수준별 해설 (캐시 우선) ──────────────────────────
  const explanationState = useAsync(async () => {
    if (!id) return '';
    return await getExplanation(id, level);
  }, [id, level]);

  // ─── 즐겨찾기 상태 + activity_log 기록 ────────────────
  useEffect(() => {
    if (!user || !id) return;
    supabase.from('favorites')
      .select('heritage_id').eq('user_id', user.id).eq('heritage_id', id)
      .maybeSingle()
      .then(({ data }) => setIsFav(!!data));

    // 학습 통계를 위해 조회 액션 자동 기록
    supabase.from('activity_log').insert({
      heritage_id: id, action: 'view',
    });
  }, [user, id]);

  // ─── 즐겨찾기 토글 (optimistic update) ───────────────
  async function toggleFav() {
    if (!user || !id) { alert('로그인이 필요해요'); return; }
    const next = !isFav;
    setIsFav(next);   // UI 먼저
    try {
      if (next) await supabase.from('favorites').insert({ heritage_id: id });
      else await supabase.from('favorites').delete().eq('heritage_id', id);
    } catch {
      setIsFav(!next);   // 실패 시 롤백
      alert('즐겨찾기 변경 실패');
    }
  }

  if (heritageState.status === 'loading') return <><Nav /><Spinner label="문화재 정보를 불러오는 중..." /></>;
  if (heritageState.status === 'error')   return <><Nav /><ErrorBox error={heritageState.error} /></>;
  if (heritageState.status !== 'success') return null;

  const heritage = heritageState.data;
  const currentLevel = LEVELS.find((l) => l.value === level)!;

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
            <div className="hero__meta">
              <MetaItem label="위치" value={heritage.location_address} />
              <MetaItem label="분류" value={heritage.category} />
              <MetaItem label="시대" value={heritage.era} />
              <MetaItem label="지역" value={heritage.region} />
            </div>
            <div className="hero__actions">
              <Link to={`/quiz/${id}`} className="btn">🎯 퀴즈 도전</Link>
              <Link to="/mission" className="btn btn--ghost">📍 탐방 미션</Link>
              <button className={`btn btn--ghost ${isFav ? 'is-on' : ''}`} onClick={toggleFav}>
                {isFav ? '★️ 즐겨찾기됨' : '☆️ 즐겨찾기'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="level-tabs">
        <div className="level-tabs__inner">
          {LEVELS.map((l) => (
            <button key={l.value}
              className={`level-tab ${level === l.value ? 'on' : ''}`}
              onClick={() => setLevel(l.value)}>
              {l.label}<small>{l.sub}</small>
            </button>
          ))}
        </div>
      </div>

      <main className="container">
        <p className="crumb"><Link to="/">홈</Link> › {heritage.name}</p>

        <article className="card explain">
          <h2>🎓 {currentLevel.label} 수준 — {currentLevel.sub}</h2>

          {explanationState.status === 'loading' && <Spinner label="🤖 Solar LLM 이 해설을 만들고 있어요..." />}
          {explanationState.status === 'error'   && <ErrorBox error={explanationState.error} />}
          {explanationState.status === 'success' && (
            <div dangerouslySetInnerHTML={{ __html: explanationState.data }} />
          )}
        </article>

        <NextSteps heritageId={id!} />
      </main>
    </>
  );
}

// ─── 보조 컴포넌트 ─────────────────────────────────────────

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

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span style={{ color: 'var(--text-mute)', fontSize: '.75rem' }}>{label}</span>
      <strong style={{ display: 'block', fontSize: '.92rem' }}>{value}</strong>
    </div>
  );
}

function NextSteps({ heritageId }: { heritageId: string }) {
  return (
    <section className="card" style={{ marginTop: 20, padding: 22 }}>
      <h3 style={{ marginTop: 0 }}>📚 다음 단계</h3>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <Link to={`/quiz/${heritageId}`}
              style={{ padding: 14, background: 'var(--bg)', borderRadius: 10, display: 'block' }}>
          🎯 <strong>5문제 퀴즈로 확인</strong>
          <p style={{ margin: '4px 0 0', fontSize: '.82rem', color: 'var(--text-dim)' }}>
            이 문화재 관련 5문항을 풀어보세요
          </p>
        </Link>
        <Link to="/mission"
              style={{ padding: 14, background: 'var(--bg)', borderRadius: 10, display: 'block' }}>
          📍 <strong>실제로 가보기</strong>
          <p style={{ margin: '4px 0 0', fontSize: '.82rem', color: 'var(--text-dim)' }}>
            방문 인증으로 포인트 획득
          </p>
        </Link>
      </div>
    </section>
  );
}
