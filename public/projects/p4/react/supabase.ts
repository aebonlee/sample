/**
 * Supabase 클라이언트 + 자격증 학습 헬퍼
 */

import { createClient } from '@supabase/supabase-js';
import type { Certification, WeaknessTopic, Diagnosis } from './types';

const url     = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anonKey) throw new Error('[supabase] 환경변수 누락');

export const supabase = createClient(url, anonKey);

/** 자격증 카탈로그 전체 조회 */
export async function fetchCertifications(): Promise<Certification[]> {
  const { data } = await supabase
    .from('certifications')
    .select('*')
    .order('name');
  return (data ?? []) as Certification[];
}

/**
 * 취약점 상위 N개 (weakness_by_topic 뷰 사용)
 * - 자격증별 + 시도 3회 이상인 단원만
 * - 정답률 오름차순 → 가장 약한 것 먼저
 */
export async function fetchWeakness(certId: string, limit = 5): Promise<WeaknessTopic[]> {
  const { data } = await supabase
    .from('weakness_by_topic')
    .select('*')
    .eq('cert_id', certId)
    .order('accuracy', { ascending: true })
    .limit(limit);
  return (data ?? []) as WeaknessTopic[];
}

/** 진단 평가 결과 저장 */
export async function saveDiagnosis(d: Omit<Diagnosis, 'id' | 'taken_at'>): Promise<Diagnosis> {
  const { data, error } = await supabase
    .from('diagnoses')
    .insert(d)
    .select()
    .single();
  if (error) throw error;
  return data as Diagnosis;
}

/** 학습 계획 자동 생성 (Edge Function 호출) */
export async function generatePlan(certId: string, examDate: string, weeklyHours = 10) {
  const { data } = await supabase.functions.invoke('plan', {
    body: { cert_id: certId, exam_date: examDate, weekly_hours: weeklyHours },
  });
  return data.schedule;
}
