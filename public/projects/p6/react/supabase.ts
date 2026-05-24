/**
 * Supabase + STAR / 피드백 / 면접 헬퍼
 */

import { createClient } from '@supabase/supabase-js';
import type { Experience, StarBreakdown, Feedback, InterviewQuestion } from './types';

const url     = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anonKey) throw new Error('[supabase] 환경변수 누락');

export const supabase = createClient(url, anonKey);

/** 경험 저장 */
export async function saveExperience(input: Omit<Experience, 'id' | 'created_at'>): Promise<Experience> {
  const { data, error } = await supabase.from('experiences').insert(input).select().single();
  if (error) throw error;
  return data as Experience;
}

/**
 * STAR 구조화 (Solar Chat Edge Function 호출)
 *
 * 입력 raw_text + target_role → S/T/A/R + 자동 추출된 역량 점수
 */
export async function convertToStar(experienceId: string): Promise<StarBreakdown> {
  const { data, error } = await supabase.functions.invoke('star', {
    body: { experience_id: experienceId },
  });
  if (error) throw error;
  // 자동으로 star_breakdowns 테이블에도 저장됨
  return data as StarBreakdown;
}

/**
 * 자소서 문항 피드백 생성
 * 4영역 점수: 구체성·STAR·차별성·지원처 연결
 */
export async function requestFeedback(resumeQuestionId: string): Promise<Feedback> {
  const { data, error } = await supabase.functions.invoke('feedback', {
    body: { question_id: resumeQuestionId },
  });
  if (error) throw error;
  return data as Feedback;
}

/** 면접 예상 질문 12개 생성 */
export async function generateInterviewQuestions(resumeId: string): Promise<InterviewQuestion[]> {
  const { data, error } = await supabase.functions.invoke('interview', {
    body: { resume_id: resumeId },
  });
  if (error) throw error;
  return (data.questions ?? []) as InterviewQuestion[];
}
