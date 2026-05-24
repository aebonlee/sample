/**
 * PlanPage — 학습 계획 캘린더 (4주 자동 생성)
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - Edge Function `plan` 호출 → 4주 일정 자동 생성 → study_plans 저장
 *   - 일자별 학습 토픽 캘린더 표시
 *   - 오늘의 학습 카드 + D-day
 *
 * 패턴:
 *   - useAsync 로 기존 계획 로드
 *   - 별도 state 로 새로 생성된 schedule 보관 (생성 후 즉시 반영)
 *   - useMemo 로 캘린더 셀 계산
 *   - 시험일(exam_date) 은 자격증별로 다르게 ─ certs 테이블에서 조회
 */

import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase, generatePlan } from '../supabase';
import { useAsync } from '../hooks';
import { Spinner, ErrorBox } from '../components/Common';

interface PlanItem { date: string; topics: string[]; hours: number; type: 'study' | 'review' | 'mock'; }

const TYPE_CLASS = { study: 'day__tag--db', review: 'day__tag--review', mock: 'day__tag--system' };

export default function PlanPage() {
  const { certId } = useParams<{ certId: string }>();
  const [schedule, setSchedule] = useState<PlanItem[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<Error | null>(null);

  // ─── 자격증 정보 + 기존 계획 병렬 로드 ───────────────
  const state = useAsync(async () => {
    if (!certId) throw new Error('자격증을 선택해주세요');
    const [cert, planRes] = await Promise.all([
      supabase.from('certs').select('name, exam_date').eq('id', certId).single()
        .then(({ data }) => data as { name: string; exam_date: string } | null),
      supabase.from('study_plans').select('schedule')
        .eq('cert_id', certId).order('created_at', { ascending: false }).limit(1).maybeSingle()
        .then(({ data }) => (data?.schedule as PlanItem[] | undefined) ?? null),
    ]);
    return { cert, plan: planRes };
  }, [certId]);

  // 로드된 plan 을 schedule state 에 동기화 (1회)
  if (state.status === 'success' && schedule === null && state.data.plan) {
    setSchedule(state.data.plan);
  }

  // ─── AI 계획 생성 ─────────────────────────────────
  async function createPlan() {
    if (!certId || generating) return;
    setGenerating(true); setGenError(null);
    try {
      const examDate = state.status === 'success' && state.data.cert?.exam_date
        ? state.data.cert.exam_date : '2026-07-18';
      const sch = await generatePlan(certId, examDate, 10);
      setSchedule(sch);
    } catch (err) {
      setGenError(err as Error);
    } finally {
      setGenerating(false);
    }
  }

  // 일자 → PlanItem 매핑
  const itemMap = useMemo(() => {
    const map: Record<string, PlanItem> = {};
    (schedule ?? []).forEach((s) => { map[s.date] = s; });
    return map;
  }, [schedule]);

  if (state.status === 'loading') return <><Nav /><Spinner /></>;
  if (state.status === 'error')   return <><Nav /><ErrorBox error={state.error} /></>;
  if (state.status !== 'success') return null;

  const cells = buildCalendarCells(itemMap);
  const today = new Date().toISOString().split('T')[0];
  const todayPlan = itemMap[today];
  const examDate = state.data.cert?.exam_date ?? '2026-07-18';
  const dday = Math.max(0, Math.ceil(
    (new Date(examDate).getTime() - Date.now()) / 86400000
  ));

  return (
    <>
      <Nav />
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1>📅 4주 합격 학습 계획</h1>
          <p>진단 결과 기반 · AI가 자동 생성한 일정</p>
        </div>
        <div className="deadline">
          D-<strong>{dday}</strong>
          <span style={{ display: 'block', opacity: .85 }}>{examDate} 응시</span>
        </div>
      </div>

      {genError && <ErrorBox error={genError} />}

      {(!schedule || schedule.length === 0) ? (
        <div className="progress-bar" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ marginBottom: 16, color: 'var(--text-mute)' }}>
            아직 학습 계획이 없어요. AI가 약점 데이터를 바탕으로 4주 일정을 만들어드려요.
          </p>
          <button className="btn btn--primary" onClick={createPlan} disabled={generating}>
            {generating ? '🤖 AI 생성 중...' : '✨️ AI 학습 계획 만들기'}
          </button>
        </div>
      ) : (
        <>
          <section className="calendar">
            <div className="cal-head">
              <h2>📅 이번 달 — 1주차 (취약점 집중)</h2>
              <button className="btn btn--ghost" onClick={createPlan} disabled={generating}>
                {generating ? '재생성 중...' : '↻ 다시 생성'}
              </button>
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
                <Link to={`/diagnose/${certId}`} className="btn btn--primary">▶️ 오늘 학습 시작</Link>
              </article>
            </section>
          )}
        </>
      )}
    </>
  );
}

// ─── 유틸 ─────────────────────────────────────────────────

function buildCalendarCells(itemMap: Record<string, PlanItem>) {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const offset = first.getDay();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const cells: Array<{ day: number; empty: boolean; isToday: boolean; item?: PlanItem }> = [];
  for (let i = 0; i < offset; i++) cells.push({ day: 0, empty: true, isToday: false });
  for (let d = 1; d <= lastDay; d++) {
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, empty: false, isToday: d === today.getDate(), item: itemMap[key] });
  }
  return cells;
}

function dayCellClass(c: { empty: boolean; isToday: boolean; item?: PlanItem }) {
  if (c.empty) return 'day empty';
  return `day ${c.isToday ? 'today' : ''} ${c.item ? 'done' : ''}`;
}

function Nav() {
  return (
    <header className="nav">
      <div className="brand">🎓 자격증 코치</div>
      <nav className="nav-links">
        <Link to="/">자격증 선택</Link>
        <Link to="/weakness">취약점</Link>
        <Link to="/plan" className="on">학습 계획</Link>
        <Link to="/note">오답 노트</Link>
      </nav>
    </header>
  );
}
