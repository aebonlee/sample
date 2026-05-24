/**
 * Supabase + 체크인/루틴 헬퍼
 */

import { createClient } from '@supabase/supabase-js';
import type { Checkin, Routine, UserRoutine, Completion, ResilienceDay } from './types';

const url     = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anonKey) throw new Error('[supabase] 환경변수 누락');

export const supabase = createClient(url, anonKey);

/** 감정 체크인 기록 */
export async function submitCheckin(emoji: string, score: number, note?: string): Promise<Checkin> {
  const { data, error } = await supabase
    .from('checkins')
    .insert({ mood_emoji: emoji, mood_score: score, note })
    .select()
    .single();
  if (error) throw error;
  return data as Checkin;
}

/** 오늘 체크인 여부 확인 (1일 1회 권장) */
export async function fetchTodayCheckin(): Promise<Checkin | null> {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('checkins')
    .select('*')
    .gte('checked_at', `${today}T00:00:00`)
    .order('checked_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as Checkin | null;
}

/** 사용자가 구독한 루틴 목록 (오늘 완료 여부 포함) */
export async function fetchTodayRoutines(): Promise<Array<UserRoutine & { routine: Routine; completed_today: boolean }>> {
  const today = new Date().toISOString().split('T')[0];

  const { data: userRoutines } = await supabase
    .from('user_routines')
    .select('*, routines(*)')
    .eq('is_active', true);

  const { data: doneToday } = await supabase
    .from('completions')
    .select('routine_id')
    .gte('completed_at', `${today}T00:00:00`);

  const doneSet = new Set((doneToday ?? []).map((c: any) => c.routine_id));

  return (userRoutines ?? []).map((ur: any) => ({
    ...ur,
    routine: ur.routines,
    completed_today: doneSet.has(ur.routine_id),
  }));
}

/** 루틴 완료 체크 */
export async function completeRoutine(routineId: string, durationSec?: number): Promise<Completion> {
  const { data, error } = await supabase
    .from('completions')
    .insert({ routine_id: routineId, duration_sec: durationSec })
    .select()
    .single();
  if (error) throw error;
  return data as Completion;
}

/** 최근 N일 회복 점수 (daily_resilience 뷰) */
export async function fetchResilience(days = 7): Promise<ResilienceDay[]> {
  const { data } = await supabase
    .from('daily_resilience')
    .select('*')
    .order('day', { ascending: false })
    .limit(days);
  return ((data ?? []).reverse()) as ResilienceDay[];
}
