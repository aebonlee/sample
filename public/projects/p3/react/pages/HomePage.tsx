/**
 * TimelinePage — 시대 타임라인 (홈)
 * ────────────────────────────────────────────────────────────
 * 10개 시대를 세로 타임라인으로 보여줍니다.
 * 각 시대의 학습 진도(정답률)도 함께 표시.
 *
 * 데이터 소스:
 *   - eras 테이블 → 시대 마스터
 *   - analytics_by_era 뷰 → 사용자 진도
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchEras, fetchUserProgress } from '../supabase';
import type { Era, EraProgress } from '../types';

export default function TimelinePage() {
  const [eras, setEras]         = useState<Era[]>([]);
  const [progress, setProgress] = useState<Record<string, EraProgress>>({});
  const [loading, setLoading]   = useState(true);

  // ─── 시대 + 진도 동시 로딩 ──────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [e, p] = await Promise.all([fetchEras(), fetchUserProgress()]);
        if (cancelled) return;
        setEras(e);
        setProgress(p);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 학습한 시대 수 / 평균 정답률 등 통계
  const learnedCount = Object.keys(progress).length;
  const totalAttempts = Object.values(progress).reduce((s, p) => s + p.total, 0);
  const avgRate = learnedCount
    ? Math.round(Object.values(progress).reduce((s, p) => s + p.rate, 0) / learnedCount)
    : 0;

  return (
    <>
      <Nav />

      <div className="page-head">
        <h1>📜 시대별 한국사 학습</h1>
        <p>고조선부터 현대까지 — 흥미로운 이야기로 한국사를 정복해 보세요.</p>
      </div>

      {/* ─── 상단 통계 4종 ─── */}
      <div className="stats">
        <Stat label="학습한 시대" value={`${learnedCount} / 10`} />
        <Stat label="푼 문제"     value={totalAttempts.toLocaleString()} />
        <Stat label="평균 정답률" value={`${avgRate}%`} />
        <Stat label="연속 학습"   value="🔥 -" />
      </div>

      {/* ─── 시대 타임라인 ─── */}
      <main className="container">
        {loading ? (
          <p style={{ color: 'var(--text-mute)' }}>📜 시대를 불러오는 중...</p>
        ) : (
          <div className="timeline">
            {eras.map((era) => (
              <EraCard key={era.id} era={era} progress={progress[era.id]} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

// ─── 보조 컴포넌트 ─────────────────────────────────────────

function Nav() {
  return (
    <header className="nav">
      <div className="brand">📜 한국사 마스터</div>
      <nav>
        <Link to="/" className="on">타임라인</Link>
        <Link to="/quiz">문제 풀기</Link>
        <Link to="/note">오답 노트</Link>
        <Link to="/report">성적표</Link>
        <Link to="/mock">모의고사</Link>
      </nav>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EraCard({ era, progress }: { era: Era; progress?: EraProgress }) {
  const rate = progress?.rate ?? 0;
  const grade = rate >= 80 ? '완료' : rate >= 50 ? '학습 중' : rate > 0 ? '시작' : '시작 전';

  // BC 표시 (start_year < 0)
  const year = era.start_year < 0
    ? `BC ${-era.start_year}`
    : `${era.start_year}`;

  return (
    <Link to={`/study/${era.id}`} className="era">
      <span className="era__dot" />
      <div className="era__head">
        <h2 className="era__title">{era.name}</h2>
        <span className="era__year">{year} ~ {era.end_year}</span>
      </div>
      <p className="era__desc">{era.summary}</p>
      <div className="progress">
        <span>진도</span>
        <div className="progress__bar">
          <div className="progress__fill" style={{ width: `${rate}%` }} />
        </div>
        <span className="progress__pct">{grade}</span>
      </div>
    </Link>
  );
}
