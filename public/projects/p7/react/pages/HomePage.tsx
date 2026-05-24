/**
 * HomePage — 오늘의 체크인 (회복탄력성 홈)
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   1) 기분 이모지 선택 (5개) → mood_score 자동 결정
 *   2) 오늘의 루틴 목록 → 완료 체크 (optimistic)
 *   3) 이번 주 회복 점수 미니 그래프 (최근 7일)
 *
 * 패턴:
 *   - useAsync 로 4가지 데이터 병렬 로드 (체크인 / 루틴 / 완료 / 회복점수)
 *   - 기분 선택 + 루틴 완료 즉시 UI 반영
 *   - 모바일 폰 프레임 + 하단 탭바
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  submitCheckin, fetchTodayCheckin,
  fetchTodayRoutines, completeRoutine,
  fetchResilience,
} from '../supabase';
import { useAsync } from '../hooks';
import { Spinner } from '../components/Common';
import type { Checkin, Routine, UserRoutine, ResilienceDay } from '../types';

const MOODS = [
  { emoji: '😢', label: '많이 안 좋음', score: 1 },
  { emoji: '😟', label: '약간 안 좋음', score: 3 },
  { emoji: '😊', label: '보통',        score: 5 },
  { emoji: '😄', label: '좋음',        score: 7 },
  { emoji: '🤩', label: '매우 좋음',   score: 9 },
] as const;

type RoutineRow = UserRoutine & { routine: Routine; completed_today: boolean };

export default function HomePage() {
  const [checkin, setCheckin] = useState<Checkin | null>(null);
  const [routines, setRoutines] = useState<RoutineRow[]>([]);
  const [pendingMood, setPendingMood] = useState<string | null>(null);

  // ─── 4가지 데이터 병렬 로드 ────────────────────────
  const state = useAsync(async () => {
    const [c, r, d] = await Promise.all([
      fetchTodayCheckin(),
      fetchTodayRoutines(),
      fetchResilience(7),
    ]);
    return { checkin: c, routines: r as RoutineRow[], days: d };
  }, []);

  // 첫 로드 동기화
  if (state.status === 'success') {
    if (!checkin && state.data.checkin) setCheckin(state.data.checkin);
    if (routines.length === 0 && state.data.routines.length > 0) setRoutines(state.data.routines);
  }

  // ─── 기분 선택 (optimistic) ────────────────────────
  async function pickMood(emoji: string, score: number) {
    setPendingMood(emoji);
    try {
      const c = await submitCheckin(emoji, score);
      setCheckin(c);
    } catch {
      alert('체크인 저장 실패');
    } finally {
      setPendingMood(null);
    }
  }

  // ─── 루틴 완료 (optimistic) ─────────────────────────
  async function toggleRoutine(row: RoutineRow) {
    if (row.completed_today) return;
    // UI 먼저
    setRoutines((prev) =>
      prev.map((r) => r.id === row.id ? { ...r, completed_today: true } : r),
    );
    try {
      await completeRoutine(row.routine_id, row.routine.duration_min * 60);
    } catch {
      // 롤백
      setRoutines((prev) =>
        prev.map((r) => r.id === row.id ? { ...r, completed_today: false } : r),
      );
    }
  }

  if (state.status === 'loading') return <div className="phone"><Spinner /></div>;
  if (state.status === 'error')   return <div className="phone"><p>로딩 실패</p></div>;

  const days = state.status === 'success' ? state.data.days : [];
  const doneCount = routines.filter((r) => r.completed_today).length;
  const dateStr = new Date().toLocaleDateString('ko-KR', { dateStyle: 'full' });
  const avgScore = days.length
    ? Math.round(days.reduce((s, d) => s + (d.resilience_score ?? 0), 0) / days.length)
    : 0;

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
              title={m.label}
              className={checkin?.mood_emoji === m.emoji ? 'mood__emoji on' : 'mood__emoji'}
              onClick={() => pickMood(m.emoji, m.score)}
              disabled={!!pendingMood}
            >
              {m.emoji}
            </button>
          ))}
        </div>
        {checkin && (
          <p style={{ margin: '10px 0 0', opacity: .85, fontSize: '.85rem' }}>
            오늘 체크인 완료 ✓️ {pendingMood && '저장 중...'}
          </p>
        )}
      </section>

      {/* ─── 오늘의 루틴 ─── */}
      <section className="section">
        <h3>🌿 오늘의 루틴 ({doneCount} / {routines.length})</h3>
        <div className="routines">
          {routines.length === 0 ? (
            <p style={{ color: 'var(--text-mute)', fontSize: '.85rem', padding: 14 }}>
              <Link to="/routine">+ 루틴 추가하기</Link>
            </p>
          ) : (
            routines.map((r) => (
              <RoutineRow key={r.id} row={r} onToggle={() => toggleRoutine(r)} />
            ))
          )}
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
            <strong>{avgScore}점</strong>
            <span>지난 7일 평균</span>
          </div>
        </Link>
      </section>

      <TabBar active="home" />
    </div>
  );
}

// ─── 보조 ─────────────────────────────────────────

function RoutineRow({ row, onToggle }: { row: RoutineRow; onToggle: () => void }) {
  return (
    <div className={row.completed_today ? 'routine done' : 'routine'} onClick={onToggle}>
      <div className="routine__ico">{row.routine.emoji}</div>
      <div style={{ flex: 1 }}>
        <p className="routine__title">{row.routine.name}</p>
        <p className="routine__meta">{row.scheduled_time ?? '시간 미정'}</p>
      </div>
      <button className="routine__check">{row.completed_today ? '✓️' : '○'}</button>
    </div>
  );
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
