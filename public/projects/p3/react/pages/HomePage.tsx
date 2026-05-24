/**
 * HomePage — 시대 타임라인 (홈)
 * ────────────────────────────────────────────────────────────
 * 10개 시대를 세로 타임라인으로. 각 시대의 학습 진도(정답률)와 함께 표시.
 *
 * 데이터 소스:
 *   - eras 테이블 → 시대 마스터 (ord 순)
 *   - analytics_by_era 뷰 → 사용자별 시대별 정답률
 *
 * 패턴:
 *   - useAsync 로 eras + progress 병렬 로드
 *   - 진도 자동 계산 (rate 기반 grade 추출)
 *   - 연속 학습 일수 계산
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchEras, fetchUserProgress, supabase } from '../supabase';
import { useAsync, useSession } from '../hooks';
import { Spinner, ErrorBox } from '../components/Common';
import type { Era, EraProgress } from '../types';

export default function HomePage() {
  const user = useSession();

  // ─── 시대 + 진도 + 연속 학습 일수 병렬 로드 ─────────
  const state = useAsync(async () => {
    const [eras, progress, attempts] = await Promise.all([
      fetchEras(),
      user ? fetchUserProgress() : Promise.resolve({} as Record<string, EraProgress>),
      user
        ? supabase.from('attempts').select('attempted_at').order('attempted_at', { ascending: false }).limit(60)
          .then(({ data }) => (data ?? []).map((a: any) => a.attempted_at.split('T')[0]))
        : Promise.resolve([] as string[]),
    ]);
    return { eras, progress, recentDates: attempts };
  }, [user?.id]);

  // 통계 계산
  const summary = useMemo(() => {
    if (state.status !== 'success') return { learned: 0, attempts: 0, avg: 0, streak: 0 };
    const learned = Object.keys(state.data.progress).length;
    const totalAttempts = Object.values(state.data.progress).reduce((s, p) => s + p.total, 0);
    const avgRate = learned
      ? Math.round(Object.values(state.data.progress).reduce((s, p) => s + p.rate, 0) / learned)
      : 0;
    // 연속 학습일: 오늘부터 거꾸로 며칠 연속인지
    const uniqueDays = Array.from(new Set(state.data.recentDates)).sort().reverse();
    let streak = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 0; i < uniqueDays.length; i++) {
      const d = new Date(uniqueDays[i]);
      const diff = (today.getTime() - d.getTime()) / 86400000;
      if (diff === i) streak++;
      else break;
    }
    return { learned, attempts: totalAttempts, avg: avgRate, streak };
  }, [state]);

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>📜 시대별 한국사 학습</h1>
        <p>고조선부터 현대까지 — 흥미로운 이야기로 한국사를 정복해 보세요.</p>
      </div>

      <div className="stats">
        <Stat label="학습한 시대" value={`${summary.learned} / 10`} />
        <Stat label="푼 문제"     value={summary.attempts.toLocaleString()} />
        <Stat label="평균 정답률" value={`${summary.avg}%`} />
        <Stat label="연속 학습"   value={summary.streak > 0 ? `🔥 ${summary.streak}일` : '-'} />
      </div>

      <main className="container">
        {state.status === 'loading' && <Spinner label="시대를 불러오는 중..." />}
        {state.status === 'error'   && <ErrorBox error={state.error} />}
        {state.status === 'success' && (
          <div className="timeline">
            {state.data.eras.map((era) => (
              <EraCard key={era.id} era={era} progress={state.data.progress[era.id]} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

// ─── 보조 ────────────────────────────────────────────

function Nav() {
  return (
    <header className="nav">
      <div className="brand">📜 한국사 마스터</div>
      <nav className="nav-links">
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
  return <div className="stat"><span>{label}</span><strong>{value}</strong></div>;
}

function EraCard({ era, progress }: { era: Era; progress?: EraProgress }) {
  const rate = progress?.rate ?? 0;
  const status = rate >= 80 ? '완료' : rate >= 50 ? '학습 중' : rate > 0 ? '시작' : '시작 전';
  const year = era.start_year < 0 ? `BC ${-era.start_year}` : `${era.start_year}`;

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
        <span className="progress__pct">{status}</span>
      </div>
    </Link>
  );
}
