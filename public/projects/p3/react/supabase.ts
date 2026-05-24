/**
 * Supabase 클라이언트 + 적응형 학습 헬퍼
 *
 * .env.local:
 *   VITE_SUPABASE_URL=...
 *   VITE_SUPABASE_ANON_KEY=...
 */

import { createClient } from '@supabase/supabase-js';
import type { Era, EraProgress, Attempt } from './types';

const url     = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) throw new Error('[supabase] 환경변수 누락');

export const supabase = createClient(url, anonKey);

/** 시대 목록을 ord 순으로 조회 */
export async function fetchEras(): Promise<Era[]> {
  const { data, error } = await supabase
    .from('eras')
    .select('*')
    .order('ord')
    .returns<Era[]>();
  if (error) throw error;
  return data ?? [];
}

/** 사용자의 시대별 정답률 집계 (analytics_by_era 뷰 사용) */
export async function fetchUserProgress(): Promise<Record<string, EraProgress>> {
  const { data } = await supabase
    .from('analytics_by_era')
    .select('era_id, total, correct, rate');

  const map: Record<string, EraProgress> = {};
  data?.forEach((r: any) => {
    map[r.era_id] = { total: r.total, correct: r.correct, rate: r.rate };
  });
  return map;
}

/** 문제 풀이 시도 기록 (정답률 자동 집계됨) */
export async function recordAttempt(payload: Omit<Attempt, 'id' | 'attempted_at'>) {
  return supabase.from('attempts').insert({
    question_id:  payload.question_id,
    picked_index: payload.picked_index,
    is_correct:   payload.is_correct,
    spent_sec:    payload.spent_sec,
  });
}
