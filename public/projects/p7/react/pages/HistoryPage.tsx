/**
 * HistoryPage — 루틴 히스토리
 *
 * 월간 활동 강도 캘린더 + 일별 루틴 완료 기록.
 * 데이터: completions 테이블 + routines.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Completion, Routine } from '../types';

interface DayGroup {
  date: string;
  items: Array<{ routine: Routine; completedAt: string; skipped?: boolean }>;
}

export default function HistoryPage() {
  const [groups, setGroups]   = useState<DayGroup[]>([]);
  const [streak, setStreak]   = useState(0);
  const [monthly, setMonthly] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      // 최근 7일 완료 + 루틴 정보
      const since = new Date(Date.now() - 7 * 86400_000).toISOString();
      const { data: comps } = await supabase
        .from('completions')
        .select('*, routine:routines(*)')
        .gte('completed_at', since)
        .order('completed_at', { ascending: false });

      // 날짜별 그룹화
      const groupMap: Record<string, DayGroup> = {};
      (comps ?? []).forEach((c: any) => {
        const date = c.completed_at.split('T')[0];
        groupMap[date] ??= { date, items: [] };
        groupMap[date].items.push({
          routine: c.routine,
          completedAt: c.completed_at,
        });
      });
      setGroups(Object.values(groupMap));

      // 월간 강도 (이번 달)
      const monthStart = new Date();
      monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
      const { data: monthly } = await supabase
        .from('completions')
        .select('completed_at')
        .gte('completed_at', monthStart.toISOString());

      const monthlyMap: Record<string, number> = {};
      (monthly ?? []).forEach((c: any) => {
        const day = c.completed_at.split('T')[0];
        monthlyMap[day] = (monthlyMap[day] ?? 0) + 1;
      });
      setMonthly(monthlyMap);

      // 연속 일수 계산
      const sortedDays = Object.keys(monthlyMap).sort().reverse();
      setStreak(calcStreak(sortedDays));
    })();
  }, []);

  const calendarCells = useMemo(() => buildCalendar(monthly), [monthly]);

  return (
    <div className="phone">
      <header className="greet">
        <p>📅 지난 기록</p>
        <h1>루틴 히스토리</h1>
      </header>

      {/* 요약 통계 */}
      <div className="summary">
        <div className="summary__item">
          <div className="summary__num">{streak}일</div>
          <div className="summary__lab">🔥 연속 체크인</div>
        </div>
        <div className="summary__item">
          <div className="summary__num">{Object.values(monthly).reduce((s, n) => s + n, 0)}</div>
          <div className="summary__lab">이번 달 루틴</div>
        </div>
      </div>

      {/* 월간 캘린더 */}
      <article className="card calendar">
        <h3>📅 이번 달 활동 강도</h3>
        <div className="cal-grid">
          {calendarCells.map((c, i) => (
            <div key={i} className={dayClass(c)}>{c.day || ''}</div>
          ))}
        </div>
        <div className="legend">
          없음 <i style={{ background: 'var(--soft)' }} />
          <i style={{ background: 'rgba(234,88,12,.15)' }} />
          <i style={{ background: 'rgba(234,88,12,.4)' }} />
          <i style={{ background: 'var(--accent)' }} /> 많음
        </div>
      </article>

      {/* 일별 그룹 */}
      {groups.map((g) => (
        <DayGroupSection key={g.date} group={g} />
      ))}

      <TabBar active="history" />
    </div>
  );
}

// ─── 보조 ──────────────────────────────────────────

function DayGroupSection({ group }: { group: DayGroup }) {
  const dateLabel = formatDate(group.date);
  return (
    <section className="day-group">
      <div className="day-group__head">
        <span className="day-group__date">{dateLabel}</span>
        <span className="day-group__count">{group.items.length}개 완료</span>
      </div>
      {group.items.map((it, i) => (
        <div key={i} className={`routine-item ${it.skipped ? 'skip' : ''}`}>
          <span className="routine-item__time">
            {new Date(it.completedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="routine-item__ico">{it.routine.emoji}</div>
          <div className="routine-item__body">
            <p className="routine-item__name">{it.routine.name}</p>
            <span className="routine-item__cat">{it.routine.category}</span>
          </div>
          <span className="routine-item__check">{it.skipped ? '✗' : '✓'}</span>
        </div>
      ))}
    </section>
  );
}

function buildCalendar(monthly: Record<string, number>) {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const offset = first.getDay();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const cells: Array<{ day: number; count: number; isToday: boolean; empty?: boolean }> = [];
  for (let i = 0; i < offset; i++) cells.push({ day: 0, count: 0, isToday: false, empty: true });
  for (let d = 1; d <= lastDay; d++) {
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, count: monthly[key] ?? 0, isToday: d === today.getDate() });
  }
  return cells;
}

function dayClass(c: any) {
  if (c.empty) return 'cal-day';
  const lvl = c.count >= 5 ? 'l3' : c.count >= 3 ? 'l2' : c.count >= 1 ? 'l1' : '';
  return `cal-day ${lvl} ${c.isToday ? 'today' : ''}`;
}

function formatDate(date: string): string {
  const d = new Date(date);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400_000);
  if (diff === 0) return `오늘 · ${d.getMonth() + 1}월 ${d.getDate()}일`;
  if (diff === 1) return `어제 · ${d.getMonth() + 1}월 ${d.getDate()}일`;
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${'일월화수목금토'[d.getDay()]})`;
}

function calcStreak(sorted: string[]): number {
  if (!sorted.length) return 0;
  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const d1 = new Date(sorted[i]);
    const d2 = new Date(sorted[i + 1]);
    if (d1.getTime() - d2.getTime() === 86400_000) streak++;
    else break;
  }
  return streak;
}

function TabBar({ active }: { active: string }) {
  return (
    <nav className="tabbar">
      <Link to="/" className={`tab ${active === 'home' ? 'on' : ''}`}><span>🏠</span>홈</Link>
      <Link to="/routine" className={`tab ${active === 'routine' ? 'on' : ''}`}><span>🌿</span>루틴</Link>
      <Link to="/journal" className={`tab ${active === 'journal' ? 'on' : ''}`}><span>📓</span>저널</Link>
      <Link to="/chart" className={`tab ${active === 'chart' ? 'on' : ''}`}><span>📊</span>그래프</Link>
      <Link to="/setting" className={`tab ${active === 'setting' ? 'on' : ''}`}><span>⚙</span>설정</Link>
    </nav>
  );
}
