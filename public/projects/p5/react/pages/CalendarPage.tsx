/**
 * CalendarPage — 정책 마감일 캘린더
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - policies (apply_deadline) + applications (submitted/result) 병합
 *   - 월간 뷰 (이전/다음 달 이동)
 *   - 다가오는 일정 5건 (D-day 정렬)
 *   - 셀 클릭 시 해당 일자 이벤트 목록
 *
 * 패턴:
 *   - useAsync 로 정책 + 신청 병합 로드
 *   - useState 로 현재 보고 있는 월(viewYM)
 *   - useMemo 로 이벤트 맵 + 캘린더 셀 계산
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync, useSession } from '../hooks';
import { Spinner, ErrorBox } from '../components/Common';

type EventType = 'start' | 'end' | 'rev' | 'info';

interface CalEvent {
  date: string;            // 'YYYY-MM-DD'
  type: EventType;
  label: string;
  policyId?: string;
}

const TYPE_CLASS: Record<EventType, string> = {
  start: 'day__ev--start',
  end:   'day__ev--end',
  rev:   'day__ev--rev',
  info:  'day__ev--info',
};

export default function CalendarPage() {
  const user = useSession();
  const today = new Date();
  const [viewYM, setViewYM] = useState({ y: today.getFullYear(), m: today.getMonth() });

  // ─── 정책 + 신청 병렬 로드 ────────────────────────
  const state = useAsync(async () => {
    const [{ data: policies }, { data: apps }] = await Promise.all([
      supabase.from('policies')
        .select('id, title, start_date, apply_deadline')
        .not('apply_deadline', 'is', null),
      user
        ? supabase.from('applications')
            .select('id, submitted_at, result_at, policy:policies(title)')
            .eq('user_id', user.id)
        : Promise.resolve({ data: [] }),
    ]);

    const evs: CalEvent[] = [];
    (policies ?? []).forEach((p: any) => {
      if (p.apply_deadline) evs.push({
        date: p.apply_deadline.split('T')[0],
        type: 'end',
        label: `⚠ ${p.title.slice(0, 12)} D-Day`,
        policyId: p.id,
      });
      if (p.start_date) evs.push({
        date: p.start_date.split('T')[0],
        type: 'start',
        label: `▶ ${p.title.slice(0, 12)} 시작`,
        policyId: p.id,
      });
    });
    (apps ?? []).forEach((a: any) => {
      if (a.result_at) evs.push({
        date: a.result_at.split('T')[0],
        type: 'rev',
        label: `📋 ${a.policy?.title?.slice(0, 12) ?? '결과'} 발표`,
      });
    });
    return evs;
  }, [user?.id]);

  // 이벤트 맵
  const eventsByDate = useMemo(() => {
    if (state.status !== 'success') return {};
    const map: Record<string, CalEvent[]> = {};
    state.data.forEach((e) => { (map[e.date] ??= []).push(e); });
    return map;
  }, [state]);

  // 다가오는 5건
  const upcoming = useMemo(() => {
    if (state.status !== 'success') return [];
    const todayKey = new Date().toISOString().split('T')[0];
    return state.data
      .filter((e) => e.date >= todayKey)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [state]);

  function prevMonth() {
    setViewYM(({ y, m }) => m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 });
  }
  function nextMonth() {
    setViewYM(({ y, m }) => m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 });
  }
  function goToday() {
    setViewYM({ y: today.getFullYear(), m: today.getMonth() });
  }

  if (state.status === 'loading') return <><Nav /><Spinner /></>;
  if (state.status === 'error')   return <><Nav /><ErrorBox error={state.error} /></>;

  const calendarCells = buildCalendar(eventsByDate, viewYM.y, viewYM.m);
  const monthLabel = new Date(viewYM.y, viewYM.m, 1)
    .toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });

  return (
    <>
      <Nav />
      <div className="page-head">
        <div>
          <h1>📅 정책 캘린더</h1>
          <p>마감일·발표일·시작일을 한눈에. 셀을 클릭하면 정책 상세로 이동합니다.</p>
        </div>
      </div>

      <main className="layout">
        <section className="card cal-wrap">
          <div className="cal-head">
            <h2>{monthLabel}</h2>
            <div className="cal-head__nav">
              <button onClick={prevMonth}>‹</button>
              <button className="cal-head__today" onClick={goToday}>오늘</button>
              <button onClick={nextMonth}>›</button>
            </div>
          </div>

          <div className="cal-grid">
            {['일','월','화','수','목','금','토'].map((w) => <div key={w} className="wk">{w}</div>)}
            {calendarCells.map((c, i) => (
              <div key={i} className={cellClass(c)}>
                {!c.empty && <span className="day__num">{c.day}</span>}
                {c.events.slice(0, 2).map((e, j) => (
                  <span key={j} className={`day__ev ${TYPE_CLASS[e.type]}`}>{e.label}</span>
                ))}
                {c.events.length > 2 && (
                  <span className="day__more">+{c.events.length - 2}</span>
                )}
              </div>
            ))}
          </div>
        </section>

        <aside className="side">
          <div className="card">
            <h3>🔔 곧 다가오는 일정</h3>
            {upcoming.length === 0 ? (
              <p style={{ color: 'var(--text-mute)', padding: 16 }}>예정된 일정이 없어요.</p>
            ) : upcoming.map((e) => {
              const days = Math.ceil((new Date(e.date).getTime() - Date.now()) / 86400000);
              const item = e.policyId ? (
                <Link key={e.date + e.label} to={`/policy/${e.policyId}`}
                      className={`upcoming-item upcoming-item--${e.type}`}>
                  <p className="upcoming-item__title">{e.label}</p>
                  <p className="upcoming-item__date">{e.date}</p>
                  <span className="upcoming-item__d">D-{days}</span>
                </Link>
              ) : (
                <article key={e.date + e.label} className={`upcoming-item upcoming-item--${e.type}`}>
                  <p className="upcoming-item__title">{e.label}</p>
                  <p className="upcoming-item__date">{e.date}</p>
                  <span className="upcoming-item__d">D-{days}</span>
                </article>
              );
              return item;
            })}
          </div>
        </aside>
      </main>
    </>
  );
}

// ─── 유틸 ─────────────────────────────────────────────

function buildCalendar(events: Record<string, CalEvent[]>, year: number, month: number) {
  const today = new Date();
  const first = new Date(year, month, 1);
  const offset = first.getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const isCurMonth = today.getFullYear() === year && today.getMonth() === month;

  const cells: Array<{ day: number; empty: boolean; isToday: boolean; events: CalEvent[] }> = [];
  for (let i = 0; i < offset; i++) cells.push({ day: 0, empty: true, isToday: false, events: [] });
  for (let d = 1; d <= lastDay; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      day: d, empty: false,
      isToday: isCurMonth && d === today.getDate(),
      events: events[key] ?? [],
    });
  }
  return cells;
}

function cellClass(c: { empty: boolean; isToday: boolean; events: CalEvent[] }) {
  if (c.empty) return 'day empty';
  return `day ${c.isToday ? 'today' : ''} ${c.events.length > 0 ? 'has-ev' : ''}`;
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">💬 청년톡톡</div>
      <nav className="nav-links">
        <Link to="/">챗봇</Link>
        <Link to="/search">검색</Link>
        <Link to="/my">맞춤 정책</Link>
        <Link to="/checklist">체크리스트</Link>
        <Link to="/calendar" className="on">캘린더</Link>
      </nav>
    </header>
  );
}
