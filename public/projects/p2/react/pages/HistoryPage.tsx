/**
 * HistoryPage — 학습 기록 (캘린더 + 활동 통계)
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - activity_log 집계: 일자별 활동 수 (캘린더 강도)
 *   - quiz_attempts: 평균 정답률 + 연속 학습일
 *   - 8개 뱃지 (획득/잠금)
 *
 * 패턴:
 *   - useAsync 로 통계 + 캘린더 + 뱃지 병렬 로드
 *   - useMemo 로 캘린더 셀 계산
 *   - 일자별 활동 강도 4단계 (없음/적음/보통/많음)
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync, useSession } from '../hooks';
import { Spinner, ErrorBox } from '../components/Common';

const BADGES = [
  { id: 'first',       icon: '🥇', label: '첫 탐방',     unlock: (s: Summary) => s.heritages >= 1 },
  { id: 'palace',      icon: '🏛', label: '궁궐 마스터', unlock: (s: Summary) => s.heritages >= 10 },
  { id: 'streak30',    icon: '📚', label: '30일 연속',   unlock: (s: Summary) => s.streak >= 30 },
  { id: 'quizMaster',  icon: '🎯', label: '퀴즈왕',      unlock: (s: Summary) => s.accuracy >= 90 },
  { id: 'points1000',  icon: '💎', label: '1000pt',     unlock: (s: Summary) => s.quizzes >= 100 },
  { id: 'nationwide',  icon: '🗺',  label: '전국 일주',  unlock: () => false },
  { id: 'scholar',     icon: '🎓', label: '유적 박사',   unlock: (s: Summary) => s.heritages >= 50 },
  { id: 'nightShot',   icon: '🌙', label: '야경 사진',   unlock: () => false },
];

interface Summary {
  heritages: number; quizzes: number; accuracy: number; streak: number;
}

export default function HistoryPage() {
  const user = useSession();

  // ─── 통계 + 일자별 활동 + 최근 활동 병렬 로드 ────────
  const state = useAsync(async () => {
    if (!user) throw new Error('로그인이 필요해요');

    const monthStart = new Date();
    monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

    const [
      { count: heritages },
      { data: quizzes },
      { data: logs },
      { data: recent },
    ] = await Promise.all([
      supabase.from('activity_log').select('heritage_id', { count: 'exact', head: true }),
      supabase.from('quiz_attempts').select('total, correct'),
      supabase.from('activity_log').select('occurred_at').gte('occurred_at', monthStart.toISOString()),
      supabase.from('activity_log').select('action, occurred_at, heritage:heritages(name, emoji)')
        .order('occurred_at', { ascending: false }).limit(5),
    ]);

    const totalQ = (quizzes ?? []).reduce((s, q: any) => s + q.total, 0);
    const totalC = (quizzes ?? []).reduce((s, q: any) => s + q.correct, 0);

    const dayMap: Record<string, number> = {};
    (logs ?? []).forEach((l: any) => {
      const d = l.occurred_at.split('T')[0];
      dayMap[d] = (dayMap[d] ?? 0) + 1;
    });

    const sortedDays = Object.keys(dayMap).sort().reverse();
    const streak = calcStreak(sortedDays);

    const summary: Summary = {
      heritages: heritages ?? 0,
      quizzes: quizzes?.length ?? 0,
      accuracy: totalQ ? Math.round((totalC / totalQ) * 100) : 0,
      streak,
    };

    return { summary, dayMap, recent: (recent ?? []) as any[] };
  }, [user?.id]);

  // 캘린더 셀 (이번 달)
  const calendarCells = useMemo(() => {
    if (state.status !== 'success') return [];
    return buildCalendar(state.data.dayMap);
  }, [state]);

  if (state.status === 'loading') return <><Nav /><Spinner /></>;
  if (state.status === 'error')   return <><Nav /><ErrorBox error={state.error} /></>;
  if (state.status !== 'success') return null;

  const { summary, recent } = state.data;

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>📊 나의 학습 기록</h1>
        <p>지금까지 학습한 문화재와 활동을 한눈에 확인해보세요.</p>
      </div>

      {/* 4종 통계 */}
      <div className="summary">
        <Sum label="학습한 문화재" value={summary.heritages} suffix="개" />
        <Sum label="푼 퀴즈"       value={summary.quizzes}   suffix="회" />
        <Sum label="평균 정답률"   value={summary.accuracy}  suffix="%" />
        <Sum label="연속 학습"     value={summary.streak}    suffix="일" />
      </div>

      <main className="layout">
        <div>
          {/* 월간 활동 캘린더 */}
          <article className="card cal">
            <div className="cal__head">
              <h3>📅 {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}</h3>
            </div>
            <div className="cal__weekdays">
              {['일','월','화','수','목','금','토'].map((w) => <span key={w}>{w}</span>)}
            </div>
            <div className="cal__grid">
              {calendarCells.map((d, i) => (
                <span key={i} className={dayClass(d)} title={d.count > 0 ? `${d.count}회 활동` : ''}>
                  {d.day || ''}
                </span>
              ))}
            </div>
          </article>

          {/* 뱃지 */}
          <article className="card badges" style={{ marginTop: 18 }}>
            <h3>🏅 획득한 뱃지</h3>
            <div className="badges__grid">
              {BADGES.map((b) => {
                const unlocked = b.unlock(summary);
                return (
                  <div key={b.id} className={`badge-tile ${unlocked ? '' : 'locked'}`}
                       title={unlocked ? '획득' : '잠금'}>
                    {unlocked ? b.icon : '🔒'}
                    <small>{b.label}</small>
                  </div>
                );
              })}
            </div>
          </article>
        </div>

        {/* 최근 활동 */}
        <article className="card recent">
          <h3>📜 최근 활동</h3>
          <div className="recent__list">
            {recent.length === 0 ? (
              <p style={{ color: 'var(--text-mute)', padding: 20, textAlign: 'center' }}>
                활동 기록이 아직 없어요.
              </p>
            ) : recent.map((r, i) => (
              <RecentItem key={i} item={r} />
            ))}
          </div>
        </article>
      </main>
    </>
  );
}

// ─── 유틸 ─────────────────────────────────────────

function buildCalendar(activity: Record<string, number>) {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const offset = first.getDay();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const cells: Array<{ day: string; count: number; isToday: boolean; empty?: boolean }> = [];
  for (let i = 0; i < offset; i++) cells.push({ day: '', count: 0, isToday: false, empty: true });
  for (let d = 1; d <= lastDay; d++) {
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: String(d), count: activity[key] ?? 0, isToday: d === today.getDate() });
  }
  return cells;
}

function dayClass(d: { count: number; isToday: boolean; empty?: boolean }) {
  if (d.empty) return 'day empty';
  const lvl = d.count >= 3 ? 'lvl3' : d.count === 2 ? 'lvl2' : d.count === 1 ? 'lvl1' : '';
  return `day ${d.count > 0 ? `active ${lvl}` : ''} ${d.isToday ? 'today' : ''}`;
}

function calcStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0;
  let streak = 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 0; i < sortedDates.length; i++) {
    const d = new Date(sortedDates[i]);
    if ((today.getTime() - d.getTime()) / 86400000 === i) streak++;
    else break;
  }
  return streak;
}

// ─── 보조 ─────────────────────────────────────────

function Nav() {
  return (
    <header className="nav">
      <div className="brand">🏛 우리<span>문화재</span></div>
      <nav className="nav-links">
        <Link to="/">검색</Link>
        <Link to="/mission">탐방 미션</Link>
        <Link to="/history" className="on">학습 기록</Link>
        <Link to="/fav">즐겨찾기</Link>
      </nav>
    </header>
  );
}

function Sum({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div className="sum">
      <span className="sum__label">{label}</span>
      <strong>{value}<em>{suffix}</em></strong>
    </div>
  );
}

function RecentItem({ item }: { item: any }) {
  const cls = item.action === 'quiz' ? 'recent__act--quiz'
    : item.action === 'mission' ? 'recent__act--mission'
    : 'recent__act--read';
  const label = item.action === 'quiz' ? '퀴즈' : item.action === 'mission' ? '탐방' : '학습';

  return (
    <a className="recent__item">
      <span className="recent__ico" style={{ background: 'linear-gradient(135deg,#B45309,#fbbf24)' }}>
        {item.heritage?.emoji ?? '📜'}
      </span>
      <div className="recent__body">
        <p className="recent__title">{item.heritage?.name ?? '문화재'}</p>
        <p className="recent__meta">
          {new Date(item.occurred_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <span className={`recent__act ${cls}`}>{label}</span>
    </a>
  );
}
