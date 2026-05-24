/**
 * RoutinePage — 오늘의 루틴 추천
 *
 * AI 추천 + 카테고리 필터로 루틴 탐색 + 내 루틴에 추가.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Routine, RoutineCategory } from '../types';

const CATS: { value: RoutineCategory | 'all'; emoji: string; label: string }[] = [
  { value: 'all',      emoji: '',    label: '전체' },
  { value: 'mind',     emoji: '🧘',  label: '마음' },
  { value: 'body',     emoji: '🏃',  label: '몸' },
  { value: 'sleep',    emoji: '💤',  label: '수면' },
  { value: 'journal',  emoji: '📓',  label: '기록' },
  { value: 'relation', emoji: '🤝',  label: '관계' },
];

export default function RoutinePage() {
  const [routines, setRoutines]   = useState<Routine[]>([]);
  const [myIds, setMyIds]         = useState<Set<string>>(new Set());
  const [cat, setCat]             = useState<RoutineCategory | 'all'>('all');
  const [aiRec, setAiRec]         = useState<string>('');

  // ─── 루틴 카탈로그 + 내 구독 ──────────────────────────
  useEffect(() => {
    (async () => {
      const [{ data: all }, { data: mine }] = await Promise.all([
        supabase.from('routines').select('*').order('category'),
        supabase.from('user_routines').select('routine_id').eq('is_active', true),
      ]);
      setRoutines((all ?? []) as Routine[]);
      setMyIds(new Set((mine ?? []).map((m: any) => m.routine_id)));
    })();

    // AI 추천 메시지 (Edge Function)
    supabase.functions.invoke('routine', { body: { user_id: 'me' } })
      .then(({ data }) => setAiRec(data?.recommendation ?? '오후 산책과 호흡 명상을 추천드려요.'));
  }, []);

  // ─── 추가 / 해제 ──────────────────────────────────────
  async function toggleAdd(routineId: string) {
    if (myIds.has(routineId)) {
      await supabase.from('user_routines').delete()
        .eq('routine_id', routineId);
    } else {
      await supabase.from('user_routines').insert({ routine_id: routineId, is_active: true });
    }
    setMyIds((prev) => {
      const next = new Set(prev);
      if (next.has(routineId)) next.delete(routineId);
      else next.add(routineId);
      return next;
    });
  }

  // 카테고리 그룹
  const grouped = useMemo(() => {
    const filtered = cat === 'all' ? routines : routines.filter((r) => r.category === cat);
    const map: Record<string, Routine[]> = {};
    filtered.forEach((r) => { (map[r.category] ??= []).push(r); });
    return map;
  }, [routines, cat]);

  return (
    <div className="phone">
      <header className="greet">
        <p>{new Date().toLocaleString('ko-KR', { dateStyle: 'long', timeStyle: 'short' })}</p>
        <h1>🌿 오늘 어떤 루틴을 해볼까요?</h1>
      </header>

      <article className="ai-recommend">
        <div className="ai-recommend__ico">✨</div>
        <h3 className="ai-recommend__title">최근 체크인 패턴 기반 추천</h3>
        <p className="ai-recommend__msg">{aiRec}</p>
        <button className="ai-recommend__btn">✓ 추천 모두 추가</button>
      </article>

      <section className="section">
        <div className="filters">
          {CATS.map((c) => (
            <span
              key={c.value}
              className={`chip ${cat === c.value ? 'on' : ''}`}
              onClick={() => setCat(c.value)}
            >
              {c.emoji} {c.label}
            </span>
          ))}
        </div>
      </section>

      <section className="section">
        {Object.entries(grouped).map(([catKey, list]) => {
          const meta = CATS.find((c) => c.value === catKey);
          return (
            <div key={catKey} className="category">
              <p className="cat-title">{meta?.emoji} {meta?.label} ({list.length})</p>
              {list.map((r) => (
                <RoutineCard
                  key={r.id}
                  routine={r}
                  isAdded={myIds.has(r.id)}
                  onToggle={() => toggleAdd(r.id)}
                />
              ))}
            </div>
          );
        })}
      </section>

      <TabBar active="routine" />
    </div>
  );
}

function RoutineCard({ routine, isAdded, onToggle }: {
  routine: Routine; isAdded: boolean; onToggle: () => void;
}) {
  return (
    <article className={`rec-card ${isAdded ? 'added' : ''}`}>
      <div className="rec-card__ico">{routine.emoji}</div>
      <div className="rec-card__body">
        <p className="rec-card__title">{routine.name}</p>
        <p className="rec-card__meta">{routine.description}</p>
      </div>
      <button className="rec-card__add" onClick={onToggle}>
        {isAdded ? '✓' : '+ 추가'}
      </button>
    </article>
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
