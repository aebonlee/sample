/**
 * Supabase + RAG 챗 + 정책 매칭
 */

import { createClient } from '@supabase/supabase-js';
import type { Policy, Profile, Message } from './types';

const url     = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anonKey) throw new Error('[supabase] 환경변수 누락');

export const supabase = createClient(url, anonKey);

/** 현재 사용자 프로필 조회 */
export async function fetchProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
  return data as Profile | null;
}

/**
 * 챗봇 메시지 전송 (Edge Function `chat` 호출)
 *
 * 흐름:
 *   1) user 메시지 저장
 *   2) Edge Function 호출 → RAG 검색 → Solar LLM 응답
 *   3) bot 메시지 저장
 *   4) 응답에 참조된 정책 IDs 반환
 */
export async function sendChat(conversationId: string, text: string) {
  // 1) user 메시지
  await supabase.from('messages').insert({
    conversation_id: conversationId,
    role: 'user',
    content: text,
  });

  // 2) Edge Function 호출
  const { data, error } = await supabase.functions.invoke('chat', {
    body: { conversation_id: conversationId, message: text },
  });
  if (error) throw error;

  // 3) bot 메시지는 Edge Function 내부에서 저장됨
  return {
    reply:       data.reply as string,
    policy_refs: (data.policy_refs ?? []) as string[],
  };
}

/** 맞춤 정책 매칭 (자격 조건 모두 충족 시 score 1.0) */
export async function matchPolicies(): Promise<Array<Policy & { score: number }>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: scores } = await supabase.rpc('match_policies_for', { p_user: user.id });
  if (!scores) return [];

  const ids = scores.filter((s: any) => s.score >= 0.7).map((s: any) => s.policy_id);
  const { data: policies } = await supabase.from('policies').select('*').in('id', ids);

  // 점수 합치기
  const scoreMap: Record<string, number> = {};
  scores.forEach((s: any) => { scoreMap[s.policy_id] = s.score; });

  return (policies ?? []).map((p: any) => ({ ...p, score: scoreMap[p.id] })) as Array<Policy & { score: number }>;
}

/** 대화의 메시지 이력 조회 */
export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at');
  return (data ?? []) as Message[];
}
