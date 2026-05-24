/**
 * Supabase 클라이언트 + RAG 검색 헬퍼
 * ────────────────────────────────────────────────────────────
 * 이 프로젝트는 pgvector 임베딩 기반 RAG 검색을 사용합니다.
 * (schema.sql 의 search_heritages 함수 참고)
 *
 * .env.local 설정:
 *   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJhbGc...
 */

import { createClient } from '@supabase/supabase-js';
import type { Heritage } from './types';

const url     = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) throw new Error('[supabase] 환경변수 누락');

export const supabase = createClient(url, anonKey);

/**
 * RAG 검색 — 자연어 질의를 임베딩한 뒤 pgvector 코사인 유사도로 검색
 *
 * 흐름:
 *   1) Edge Function `search-heritages` 호출
 *   2) 함수 내부에서 Solar embedding 생성 → search_heritages(SQL) 호출
 *   3) 유사도 상위 6건 반환
 */
export async function searchHeritages(query: string, limit = 6): Promise<Heritage[]> {
  const { data, error } = await supabase.functions.invoke('search-heritages', {
    body: { query, limit },
  });
  if (error) throw error;
  return data.results as Heritage[];
}

/**
 * 수준별 해설 가져오기 (캐시 우선)
 *
 * - 먼저 explanations 테이블에서 캐시 조회
 * - 캐시 없으면 Edge Function `explain` 호출 → Solar LLM이 생성 → 캐시 저장
 */
export async function getExplanation(heritageId: string, level: 'elem' | 'mid' | 'high' | 'adult') {
  // 1) 캐시 조회
  const { data: cached } = await supabase
    .from('explanations')
    .select('body')
    .eq('heritage_id', heritageId)
    .eq('level', level)
    .single();

  if (cached?.body) return cached.body as string;

  // 2) 캐시 미스 → Edge Function 호출
  const { data } = await supabase.functions.invoke('explain', {
    body: { heritage_id: heritageId, level },
  });
  return data.body as string;
}
