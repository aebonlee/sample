/**
 * HistoryPage — 학습 기록 (캘린더 + 활동 통계)
 * ────────────────────────────────────────────────────────────
 * 데이터:
 *   - activity_log 테이블에서 일자별 활동 집계
 *   - quiz_attempts 테이블에서 평균 정답률
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

interface DayActivity { date: string; count: number; }
interface Summary {
  heritages: number;
  quizzes: number;
  accuracy: number;
  streak: number;
}

export default function HistoryPage() {
  const [summary, setSummary]     = useState<Summary>({ heritages: 0, quizzes: 0, accuracy: 0, streak: 0 });
  const [activity, setActivity]   = useState<Record<string, number>>({});  // 'YYYY-MM-DD' → count

  // ─── 통계 + 활동 캘린더 동시 로드 ──────────────────────
  useEffect(() => {
    (async () => {
      // 1) 학습한 문화재 수 (distinct heritage_id)
      const { count: heritages } = await supabase
        .from('activity_log').select('heritage_id', { count: 'exact', head: true });

      // 2) 푼 퀴즈 수 + 평균 정답률
      const { data: quizzes } = await supabase
        .from('quiz_attempts').select('total, correct');
      const totalQ = quizzes?.reduce((s, q: any) => s + q.total, 0) ?? 0;
      const totalC = quizzes?.reduce((s, q: any) => s + q.correct, 0) ?? 0;

      // 3) 일자별 활동 (이번 달)
      const monthStart = new Date();
      monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
      const { data: logs } = await supabase
        .from('activity_log').select('occurred_at')
        .gte('occurred_at', monthStart.toISOString());

      const dayMap: Record<string, number> = {};
      (logs ?? []).forEach((l: any) => {
        const d = new Date(l.occurred_at).toISOString().split('T')[0];
        dayMap[d] = (dayMap[d] ?? 0) + 1;
      });

      setSummary({
        heritages: heritages ?? 0,
        quizzes: quizzes?.length ?? 0,
        accuracy: totalQ ? Math.round((totalC / totalQ) * 100) : 0,
        streak: calcStreak(Object.keys(dayMap).sort().reverse()),
      });
      setActivity(dayMap);
    })();
  }, []);

  // ─── 이번 달 캘린더 그리드 ──────────────────────────────
  const calendarDays = useMemo(() => buildCalendar(activity), [activity]);

  return (
    <>
      <Nav />
      <div className="page-head">
        <h1>📊 나의 학습 기록</h1>
        <p>지금까지 학습한 문화재와 활동을 한눈에 확인해보세요.</p>
      </div>

      <div className="summary">
        <Sum label="학습한 문화재" value={summary.heritages} suffix="개" />
        <Sum label="푼 퀴즈"       value={summary.quizzes}   suffix="회" />
        <Sum label="평균 정답률"   value={summary.accuracy}  suffix="%" />
        <Sum label="연속 학습"     value={summary.streak}    suffix="일" />
      </div>

      <main className="layout">
        <article className="card cal">
          <div className="cal__head">
            <h3>📅 {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}</h3>
          </div>
          <div className="cal__weekdays">
            {['일','월','화','수','목','금','토'].map((w) => <span key={w}>{w}</span>)}
          </div>
          <div className="cal__grid">
            {calendarDays.map((d, i) => (
              <span key={i} className={dayClass(d)}>{d.day}</span>
            ))}
          </div>
        </article>
      </main>
    </>
  );
}

// ─── 유틸 ─────────────────────────────────────────────────

function buildCalendar(activity: Record<string, number>) {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const offset = first.getDay();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const cells: Array<{ day: string; count: number; isToday: boolean; empty?: boolean }> = [];
  for (let i = 0; i < offset; i++) cells.push({ day: '', count: 0, isToday: false, empty: true });
  for (let d = 1; d <= lastDay; d++) {
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      day: String(d),
      count: activity[dateKey] ?? 0,
      isToday: d === today.getDate(),
    });
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
  let streak = 1;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const d1 = new Date(sortedDates[i]);
    const d2 = new Date(sortedDates[i + 1]);
    if ((d1.getTime() - d2.getTime()) === 86400000) streak++;
    else break;
  }
  return streak;
}

// ─── 보조 컴포넌트 ─────────────────────────────────────────

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
