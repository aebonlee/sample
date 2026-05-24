// ============================================================
// 회복탄력성 코치 — React 19 + Chart.js + 일일 체크인
// ============================================================

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
);

const MOODS = [
  { emoji: '😢', label: '많이 안 좋음', score: 1 },
  { emoji: '😟', label: '약간 안 좋음', score: 3 },
  { emoji: '😊', label: '보통', score: 5 },
  { emoji: '😄', label: '좋음', score: 7 },
  { emoji: '🤩', label: '매우 좋음', score: 9 },
];

interface Routine { id: string; name: string; emoji: string; duration_min: number; scheduled_time: string; }
interface ResilienceDay { day: string; resilience_score: number; mood: number; }

// ── 오늘 체크인 ──────────────────────────────────────────
function TodayCheckin() {
  const [selected, setSelected] = useState<number | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase
      .from('user_routines')
      .select('id, scheduled_time, routines(id, name, emoji, duration_min)')
      .eq('is_active', true)
      .then(({ data }) => {
        const list = (data ?? []).map((r: any) => ({
          ...r.routines,
          scheduled_time: r.scheduled_time,
        }));
        setRoutines(list as Routine[]);
      });
  }, []);

  async function submitMood(idx: number) {
    setSelected(idx);
    await supabase.from('checkins').insert({
      mood_emoji: MOODS[idx].emoji,
      mood_score: MOODS[idx].score,
    });
  }

  async function toggleRoutine(id: string) {
    if (completed.has(id)) return;
    await supabase.from('completions').insert({ routine_id: id });
    setCompleted((prev) => new Set([...prev, id]));
  }

  return (
    <div className="phone">
      <header className="greet">
        <p>{new Date().toLocaleDateString('ko-KR', { dateStyle: 'full' })}</p>
        <h1>안녕하세요 🌱</h1>
      </header>

      <section className="mood">
        <h2>오늘 기분이 어떠세요?</h2>
        <div className="mood__emojis">
          {MOODS.map((m, i) => (
            <button
              key={m.emoji}
              className={selected === i ? 'mood__emoji on' : 'mood__emoji'}
              onClick={() => submitMood(i)}
              aria-label={m.label}
            >{m.emoji}</button>
          ))}
        </div>
      </section>

      <section className="section">
        <h3>🌿 오늘의 루틴 ({completed.size}/{routines.length})</h3>
        <ul className="routines">
          {routines.map((r) => (
            <li key={r.id} className={completed.has(r.id) ? 'routine done' : 'routine'}>
              <div className="routine__ico">{r.emoji}</div>
              <p>{r.name}</p>
              <span>{r.scheduled_time}</span>
              <button onClick={() => toggleRoutine(r.id)}>
                {completed.has(r.id) ? '✓' : '○'}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// ── 회복 그래프 ──────────────────────────────────────────
function ResilienceChart() {
  const [days, setDays] = useState<ResilienceDay[]>([]);

  useEffect(() => {
    supabase
      .from('daily_resilience')
      .select('*')
      .order('day', { ascending: false })
      .limit(7)
      .then(({ data }) => setDays(((data ?? []).reverse()) as ResilienceDay[]));
  }, []);

  const avg = Math.round(days.reduce((a, d) => a + (d.resilience_score ?? 0), 0) / (days.length || 1));

  return (
    <div className="phone">
      <h1>📊 지난 7일 회복 점수</h1>
      <div className="hero"><div className="hero__num">{avg}</div></div>
      <div className="chart-bars">
        {days.map((d) => (
          <div key={d.day} className="chart-bar" style={{ height: `${d.resilience_score}%` }}>
            <span>{d.resilience_score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TodayCheckin />} />
        <Route path="/chart" element={<ResilienceChart />} />
      </Routes>
    </BrowserRouter>
  );
}
