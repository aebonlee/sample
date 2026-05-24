/**
 * RoutinePage — 오늘의 루틴 추천
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - 루틴 카탈로그 + 내 활성 루틴 + AI 추천 병렬 로드
 *   - 카테고리 필터 (마음/몸/수면/기록/관계)
 *   - 추가/해제 옵티미스틱 토글
 *   - "추천 모두 추가" 버튼
 *
 * 패턴:
 *   - useAsync 로 병렬 로드
 *   - useState + Set 으로 추가된 ID 추적
 *   - useLocalStorage 로 마지막 카테고리 영속화
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAsync, useLocalStorage } from '../hooks';
import { Spinner, ErrorBox, EmptyState } from '../components/Common';
import type { Routine, RoutineCategory } from '../types';

const CATS: { value: RoutineCategory | 'all'; emoji: string; label: string }[] = [
  { value: 'all',      emoji: '',    label: '전체' },
  { value: 'mind',     emoji: '🧘',  label: '마음' },
  { value: 'body',     emoji: '🏃',  label: '몸' },
  { value: 'sleep',    emoji: '💤',  label: '수면' },
  { value: 'journal',  emoji: '📓',  label: '기록' },
  { value: 'relation', emoji: '🤝',  label: '관계' },
];

interface AiData { recommendation: string; suggestedIds: string[]; }

export default function RoutinePage() {
  const [cat, setCat] = useLocalStorage<RoutineCategory | 'all'>('p7:routine:cat', 'all');
  const [myIds, setMyIds] = useState<Set<string>>(new Set());

  // ─── 루틴 + 내 구독 + AI 추천 병렬 로드 ──────────
  const state = useAsync(async () => {
    const [{ data: all }, { data: mine }, ai] = await Promise.all([
      supabase.from('routines').select('*').order('category'),
      supabase.from('user_routines').select('routine_id').eq('is_active', true),
      supabase.functions.invoke('routine', { body: { user_id: 'me' } })
        .then(({ data }) => ({
          recommendation: data?.recommendation ?? '오후 산책과 호흡 명상을 추천드려요.',
          suggestedIds: data?.suggested_ids ?? [],
        } as AiData))
        .catch(() => ({ recommendation: '오후 산책과 호흡 명상을 추천드려요.', suggestedIds: [] })),
    ]);
    return {
      routines: (all ?? []) as Routine[],
      mineIds: new Set((mine ?? []).map((m: any) => m.routine_id)),
      ai,
    };
  }, []);

  // 로드 완료 시 myIds 초기화
  useEffect(() => {
    if (state.status === 'success') setMyIds(new Set(state.data.mineIds));
  }, [state.status]);

  // ─── 추가/해제 (옵티미스틱) ────────────────────────
  async function toggleAdd(routineId: string) {
    const wasAdded = myIds.has(routineId);
    const next = new Set(myIds);
    if (wasAdded) next.delete(routineId);
    else next.add(routineId);
    setMyIds(next); // 즉시 반영

    try {
      if (wasAdded) {
        await supabase.from('user_routines').delete().eq('routine_id', routineId);
      } else {
        await supabase.from('user_routines').upsert({ routine_id: routineId, is_active: true });
      }
    } catch {
      // 롤백
      setMyIds(myIds);
    }
  }

  // ─── 추천 모두 추가 ───────────────────────────────
  async function addAllSuggested() {
    if (state.status !== 'success') return;
    const ids = state.data.ai.suggestedIds.filter((id) => !myIds.has(id));
    if (ids.length === 0) return;
    const next = new Set(myIds);
    ids.forEach((id) => next.add(id));
    setMyIds(next);
    try {
      await supabase.from('user_routines')
        .upsert(ids.map((id) => ({ routine_id: id, is_active: true })));
    } catch {
      setMyIds(myIds);
    }
  }

  // ─── 카테고리 그룹 ────────────────────────────────
  const grouped = useMemo(() => {
    if (state.status !== 'success') return {};
    const filtered = cat === 'all'
      ? state.data.routines
      : state.data.routines.filter((r) => r.category === cat);
    const map: Record<string, Routine[]> = {};
    filtered.forEach((r) => { (map[r.category] ??= []).push(r); });
    return map;
  }, [state, cat]);

  if (state.status === 'loading') return <div className="phone"><Spinner /></div>;
  if (state.status === 'error')   return <div className="phone"><ErrorBox error={state.error} /></div>;
  if (state.status !== 'success') return null;

  return (
    <div className="phone">
      <header className="greet">
        <p>{new Date().toLocaleString('ko-KR', { dateStyle: 'long', timeStyle: 'short' })}</p>
        <h1>🌿 오늘 어떤 루틴을 해볼까요?</h1>
      </header>

      <article className="ai-recommend">
        <div className="ai-recommend__ico">✨️</div>
        <h3 className="ai-recommend__title">최근 체크인 패턴 기반 추천</h3>
        <p className="ai-recommend__msg">{state.data.ai.recommendation}</p>
        {state.data.ai.suggestedIds.length > 0 && (
          <button className="ai-recommend__btn" onClick={addAllSuggested}>
            ✓️ 추천 {state.data.ai.suggestedIds.length}개 모두 추가
          </button>
        )}
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
        {Object.keys(grouped).length === 0 ? (
          <EmptyState
            emoji="🌿"
            title="이 카테고리에 루틴이 없어요"
            desc="다른 카테고리를 선택해보세요."
          />
        ) : (
          Object.entries(grouped).map(([catKey, list]) => {
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
          })
        )}
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
        {isAdded ? '✓️ 추가됨' : '+ 추가'}
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
