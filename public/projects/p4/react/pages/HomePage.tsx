/**
 * HomePage — 자격증 선택 (홈)
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - 모든 자격증 카드 그리드 표시
 *   - 검색 + 카테고리 필터 (클라이언트 사이드)
 *   - 진행 중인 자격증 우선 표시 (diagnoses 테이블 join)
 *
 * 패턴:
 *   - useAsync 로 cert + 사용자 진행 상태 병렬 로드
 *   - useDebounce 로 검색어 지연 (성능)
 *   - useMemo 로 필터링 캐싱
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCertifications, supabase } from '../supabase';
import { useAsync, useDebounce, useSession } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Certification, Diagnosis } from '../types';

const CATEGORIES = ['전체', 'IT/SW', '어학', '경영/금융', '공무원/공기업', '기술'];

export default function HomePage() {
  const user = useSession();
  const [rawQuery, setRawQuery] = useState('');
  const query = useDebounce(rawQuery, 300);
  const [cat, setCat] = useState('전체');

  // ─── 자격증 + 진단 결과 병렬 로드 ─────────────────────
  const state = useAsync(async () => {
    const [certs, diagnoses] = await Promise.all([
      fetchCertifications(),
      user
        ? supabase.from('diagnoses').select('cert_id, score, taken_at')
            .order('taken_at', { ascending: false })
            .then(({ data }) => (data ?? []) as Pick<Diagnosis, 'cert_id' | 'score' | 'taken_at'>[])
        : Promise.resolve([]),
    ]);

    // cert_id 별 최신 진단
    const latestDiag = new Map<string, { score: number; taken_at: string }>();
    diagnoses.forEach((d) => {
      if (!latestDiag.has(d.cert_id)) latestDiag.set(d.cert_id, d);
    });

    return { certs, diagnoses: latestDiag };
  }, [user?.id]);

  // 필터링 (검색 + 카테고리)
  const filtered = useMemo(() => {
    if (state.status !== 'success') return [];
    const q = query.trim().toLowerCase();
    return state.data.certs.filter((c) => {
      if (cat !== '전체' && c.category !== cat) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [state, query, cat]);

  return (
    <>
      <Nav />

      <div className="page-head">
        <h1>🎓 어떤 자격증을 준비하시나요?</h1>
        <p>먼저 진단 평가로 현재 실력을 파악하고, 취약점에 집중하는 학습 계획을 만들어드립니다.</p>
      </div>

      <div className="search-bar">
        <input
          type="search"
          value={rawQuery}
          onChange={(e) => setRawQuery(e.target.value)}
          placeholder="자격증명 검색 (예: 정보처리기사, 토익, ADsP...)"
        />
      </div>

      <main className="container">
        <div className="cat-tabs">
          {CATEGORIES.map((c) => (
            <span key={c}
              className={`cat ${c === cat ? 'on' : ''}`}
              onClick={() => setCat(c)}>{c}</span>
          ))}
        </div>

        {state.status === 'loading' && <Spinner />}
        {state.status === 'error'   && <ErrorBox error={state.error} />}
        {state.status === 'success' && (
          filtered.length === 0 ? (
            <EmptyState
              emoji="🔍"
              title="조건에 맞는 자격증이 없어요"
              action={<button onClick={() => { setRawQuery(''); setCat('전체'); }} className="btn btn--ghost">초기화</button>}
            />
          ) : (
            <div className="grid">
              {filtered.map((c) => (
                <CertCard
                  key={c.id}
                  cert={c}
                  diagnosis={state.data.diagnoses.get(c.id)}
                />
              ))}
            </div>
          )
        )}
      </main>
    </>
  );
}

// ─── 보조 ─────────────────────────────────────────

function CertCard({ cert, diagnosis }: { cert: Certification; diagnosis?: { score: number; taken_at: string } }) {
  const isStarted = !!diagnosis;
  return (
    <Link to={`/diagnose/${cert.id}`} className="cert">
      {isStarted && <span className="badge">진행 중 · {diagnosis.score}점</span>}
      <div className="cert__head">
        <div className="cert__ico">📜</div>
        <div>
          <h3 className="cert__title">{cert.name}</h3>
          <p className="cert__sub">{cert.organization}</p>
        </div>
      </div>
      <div className="cert__meta">
        {cert.avg_months && <span>📚 평균 <strong>{cert.avg_months}개월</strong></span>}
        {cert.pass_rate && <span>📈 합격률 <strong>{cert.pass_rate}%</strong></span>}
      </div>
      {isStarted && (
        <div className="cert__progress">
          <div className="cert__fill" style={{ width: `${diagnosis.score}%` }} />
        </div>
      )}
    </Link>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">🎓 자격증 코치</div>
      <nav className="nav-links">
        <Link to="/" className="on">자격증 선택</Link>
        <Link to="/diagnose">진단</Link>
        <Link to="/weakness">취약점</Link>
        <Link to="/plan">학습 계획</Link>
        <Link to="/note">오답 노트</Link>
      </nav>
    </header>
  );
}
