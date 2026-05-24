/**
 * CalendarPage — 정책 마감일 캘린더
 *
 * policies.apply_deadline + applications 의 result_at 등을 모아
 * 월간 뷰로 표시.
 *
 * 데이터 소스:
 *   - policies (start_date / apply_deadline)
 *   - applications (submitted_at, result_at)
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

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
  const [events, setEvents] = useState<CalEvent[]>([]);

  useEffect(() => {
    (async () => {
      const { data: policies } = await supabase
        .from('policies')
        .select('id, title, apply_deadline')
        .not('apply_deadline', 'is', null);

      const evs: CalEvent[] = (policies ?? []).map((p: any) => ({
        date: p.apply_deadline.split('T')[0],
        type: 'end',
        label: `⚠ ${p.title.slice(0, 12)} D-Day`,
        policyId: p.id,
      }));
      setEvents(evs);
    })();
  }, []);

  // 일자별 이벤트 맵
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    events.forEach((e) => { (map[e.date] ??= []).push(e); });
    return map;
  }, [events]);

  // 다가오는 이벤트 (정렬)
  const upcoming = useMemo(() => {
    const todayKey = new Date().toISOString().split('T')[0];
    return events
      .filter((e) => e.date >= todayKey)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [events]);

  const calendarCells = buildCalendar(eventsByDate);

  return (
    <>
      <Nav />
      <div className="page-head">
        <div>
          <h1>📅 정책 캘린더</h1>
          <p>마감일·발표일·예정일을 한눈에. 알림 등록도 가능합니다.</p>
        </div>
      </div>

      <main className="layout">
        <section className="card cal-wrap">
          <div className="cal-head">
            <h2>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}</h2>
            <div className="cal-head__nav">
              <button>‹</button>
              <button className="cal-head__today">오늘</button>
              <button>›</button>
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
              </div>
            ))}
          </div>
        </section>

        <aside className="side">
          <div className="card">
            <h3>🔔 곧 다가오는 일정</h3>
            {upcoming.map((e) => {
              const days = Math.ceil((new Date(e.date).getTime() - Date.now()) / 86400000);
              return (
                <article key={e.date + e.label} className="upcoming-item upcoming-item--end">
                  <p className="upcoming-item__title">{e.label}</p>
                  <p className="upcoming-item__date">{e.date}</p>
                  <span className="upcoming-item__d">D-{days}</span>
                </article>
              );
            })}
          </div>
        </aside>
      </main>
    </>
  );
}

// ─── 유틸 ─────────────────────────────────────────────

function buildCalendar(events: Record<string, CalEvent[]>) {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const offset = first.getDay();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const cells: Array<{ day: number; empty: boolean; isToday: boolean; events: CalEvent[] }> = [];
  for (let i = 0; i < offset; i++) cells.push({ day: 0, empty: true, isToday: false, events: [] });
  for (let d = 1; d <= lastDay; d++) {
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      day: d, empty: false,
      isToday: d === today.getDate(),
      events: events[key] ?? [],
    });
  }
  return cells;
}

function cellClass(c: { empty: boolean; isToday: boolean; events: any[] }) {
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
