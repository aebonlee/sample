/**
 * TodayPage — 오늘의 체크인 (홈)
 *
 * 핵심:
 *   1) 기분 이모지 선택 (5개) → mood_score 1~10 자동 결정
 *   2) 오늘의 루틴 목록 → 완료 체크
 *   3) 이번 주 회복 점수 미니 그래프 (최근 7일)
 *
 * 디자인:
 *   - 모바일 폰 프레임 안에 모든 UI 배치
 *   - 따뜻한 오렌지/엠버 톤
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  submitCheckin, fetchTodayCheckin,
  fetchTodayRoutines, completeRoutine,
  fetchResilience,
} from '../supabase';
import type { Checkin, Routine, UserRoutine, ResilienceDay } from '../types';

/** 기분 옵션 — 이모지와 score 매핑 */
const MOODS = [
  { emoji: '😢', label: '많이 안 좋음', score: 1 },
  { emoji: '😟', label: '약간 안 좋음', score: 3 },
  { emoji: '😊', label: '보통',        score: 5 },
  { emoji: '😄', label: '좋음',        score: 7 },
  { emoji: '🤩', label: '매우 좋음',   score: 9 },
] as const;

type RoutineRow = UserRoutine & { routine: Routine; completed_today: boolean };

export default function TodayPage() {
  const [checkin, setCheckin]   = useState<Checkin | null>(null);
  const [routines, setRoutines] = useState<RoutineRow[]>([]);
  const [days, setDays]         = useState<ResilienceDay[]>([]);

  // ─── 초기 로드 ──────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetchTodayCheckin(),
      fetchTodayRoutines(),
      fetchResilience(7),
    ]).then(([c, r, d]) => {
      setCheckin(c);
      setRoutines(r);
      setDays(d);
    });
  }, []);

  // ─── 기분 선택 ──────────────────────────────────────────
  async function pickMood(emoji: string, score: number) {
    const c = await submitCheckin(emoji, score);
    setCheckin(c);
  }

  // ─── 루틴 완료 토글 ─────────────────────────────────────
  async function toggleRoutine(row: RoutineRow) {
    if (row.completed_today) return;   // 이미 완료
    await completeRoutine(row.routine_id, row.routine.duration_min * 60);
    setRoutines((prev) =>
      prev.map((r) => r.id === row.id ? { ...r, completed_today: true } : r),
    );
  }

  const doneCount = routines.filter((r) => r.completed_today).length;
  const dateStr   = new Date().toLocaleDateString('ko-KR', { dateStyle: 'full' });

  return (
    <div className="phone">
      <header className="greet">
        <p>{dateStr}</p>
        <h1>안녕하세요 🌱</h1>
      </header>

      {/* ─── 기분 체크인 ─── */}
      <section className="mood">
        <h2>오늘 기분이 어떠세요?</h2>
        <div className="mood__emojis">
          {MOODS.map((m) => (
            <button
              key={m.emoji}
              aria-label={m.label}
              className={checkin?.mood_emoji === m.emoji ? 'mood__emoji on' : 'mood__emoji'}
              onClick={() => pickMood(m.emoji, m.score)}
            >
              {m.emoji}
            </button>
          ))}
        </div>
        {checkin && <p style={{ opacity: .85, margin: '8px 0 0' }}>오늘 체크인 완료 ✓</p>}
      </section>

      {/* ─── 오늘의 루틴 ─── */}
      <section className="section">
        <h3>🌿 오늘의 루틴 ({doneCount} / {routines.length})</h3>
        <div className="routines">
          {routines.map((r) => (
            <RoutineRow key={r.id} row={r} onToggle={() => toggleRoutine(r)} />
          ))}
        </div>
      </section>

      {/* ─── 이번 주 회복 점수 ─── */}
      <section className="section">
        <h3>📊 이번 주 회복 점수</h3>
        <Link to="/chart" className="stat-card">
          <div className="stat-card__chart">
            {days.map((d, i) => (
              <div key={i} className="bar"
                   style={{ height: `${d.resilience_score ?? 0}%` }} />
            ))}
          </div>
          <div className="stat-card__text">
            <strong>{Math.round(days.reduce((a, d) => a + (d.resilience_score ?? 0), 0) / (days.length || 1))}점</strong>
            <span>지난 7일 평균</span>
          </div>
        </Link>
      </section>
    </div>
  );
}

// ─── 보조 컴포넌트 ─────────────────────────────────────────

function RoutineRow({ row, onToggle }: { row: RoutineRow; onToggle: () => void }) {
  return (
    <div className={row.completed_today ? 'routine done' : 'routine'} onClick={onToggle}>
      <div className="routine__ico">{row.routine.emoji}</div>
      <div style={{ flex: 1 }}>
        <p className="routine__title">{row.routine.name}</p>
        <p className="routine__meta">{row.scheduled_time ?? '시간 미정'}</p>
      </div>
      <button className="routine__check">{row.completed_today ? '✓' : '○'}</button>
    </div>
  );
}
