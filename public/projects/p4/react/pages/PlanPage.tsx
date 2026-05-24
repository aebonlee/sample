/**
 * PlanPage — 학습 계획 캘린더
 *
 * Edge Function `plan` 으로 4주 일정 자동 생성 → study_plans 테이블 저장.
 * 캘린더에 일자별 학습 토픽 표시.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase, generatePlan } from '../supabase';

interface PlanItem { date: string; topics: string[]; hours: number; type: 'study' | 'review' | 'mock'; }

const TYPE_CLASS = { study: 'day__tag--db', review: 'day__tag--review', mock: 'day__tag--system' };

export default function PlanPage() {
  const { certId } = useParams<{ certId: string }>();
  const [schedule, setSchedule] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!certId) return;
    (async () => {
      // 기존 계획 불러오기
      const { data } = await supabase.from('study_plans').select('*')
        .eq('cert_id', certId).order('created_at', { ascending: false }).limit(1).single();
      if (data?.schedule) setSchedule(data.schedule as PlanItem[]);
    })();
  }, [certId]);

  async function createPlan() {
    if (!certId) return;
    setLoading(true);
    try {
      const examDate = '2026-07-18';
      const sch = await generatePlan(certId, examDate, 10);
      setSchedule(sch);
    } finally {
      setLoading(false);
    }
  }

  // 일자 → PlanItem 매핑
  const itemMap = useMemo(() => {
    const map: Record<string, PlanItem> = {};
    schedule.forEach((s) => { map[s.date] = s; });
    return map;
  }, [schedule]);

  // 이번 달 캘린더
  const cells = buildCalendarCells(itemMap);
  const today = new Date().toISOString().split('T')[0];
  const todayPlan = itemMap[today];

  return (
    <>
      <Nav />
      <div className="page-head">
        <div>
          <h1>📅 4주 합격 학습 계획</h1>
          <p>진단 결과 기반 · AI가 자동 생성한 일정</p>
        </div>
        <div className="deadline">
          D-<strong>55</strong>
          <span style={{ display: 'block', opacity: .85 }}>2026.07.18 응시</span>
        </div>
      </div>

      {schedule.length === 0 && (
        <div className="progress-bar" style={{ textAlign: 'center', padding: 40 }}>
          <button className="btn btn--primary" onClick={createPlan} disabled={loading}>
            {loading ? '🤖 AI 생성 중...' : '✨ AI 학습 계획 만들기'}
          </button>
        </div>
      )}

      {schedule.length > 0 && (
        <>
          <section className="calendar">
            <div className="cal-head">
              <h2>📅 이번 달 — 1주차 (취약점 집중)</h2>
            </div>
            <div className="cal-grid">
              {['일','월','화','수','목','금','토'].map((w) => (
                <div key={w} className="cal-wk">{w}</div>
              ))}
              {cells.map((c, i) => (
                <div key={i} className={dayCellClass(c)}>
                  {!c.empty && <span className="day__num">{c.day}</span>}
                  {c.item?.topics.map((topic, j) => (
                    <span key={j} className={`day__tag ${TYPE_CLASS[c.item!.type]}`}>{topic}</span>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {todayPlan && (
            <section className="today-card">
              <article className="card today-card__inner">
                <div>
                  <h3>📌 오늘의 학습</h3>
                  <p className="today-card__title">{todayPlan.topics.join(' + ')}</p>
                  <p className="today-card__meta">약 {todayPlan.hours}시간 예상</p>
                </div>
                <Link to={`/diagnose/${certId}`} className="btn btn--primary">▶ 오늘 학습 시작</Link>
              </article>
            </section>
          )}
        </>
      )}
    </>
  );
}

// ─── 유틸 ─────────────────────────────────────────────────

function buildCalendarCells(itemMap: Record<string, any>) {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const offset = first.getDay();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const cells: Array<{ day: number; empty: boolean; isToday: boolean; item?: any }> = [];
  for (let i = 0; i < offset; i++) cells.push({ day: 0, empty: true, isToday: false });
  for (let d = 1; d <= lastDay; d++) {
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, empty: false, isToday: d === today.getDate(), item: itemMap[key] });
  }
  return cells;
}

function dayCellClass(c: { empty: boolean; isToday: boolean; item?: any }) {
  if (c.empty) return 'day empty';
  return `day ${c.isToday ? 'today' : ''} ${c.item ? 'done' : ''}`;
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">🎓 자격증 코치</div>
      <nav className="nav-links">
        <Link to="/">자격증 선택</Link>
        <Link to="/plan" className="on">학습 계획</Link>
      </nav>
    </header>
  );
}
