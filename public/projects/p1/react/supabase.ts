/**
 * Supabase 클라이언트 (단일 인스턴스)
 * ────────────────────────────────────────────────────────────
 * 앱 전체에서 import 해서 쓰는 단일 인스턴스입니다.
 * 새로운 클라이언트를 매번 만들지 않도록 주의하세요.
 *
 * .env.local 에 아래 값을 설정해야 합니다:
 *   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJhbGc...
 *
 * 주의: service_role 키는 절대 클라이언트에 넣지 마세요.
 *       anon key 만 사용하고, 데이터 보호는 RLS 정책으로 합니다.
 *       (schema.sql 의 RLS 섹션 참고)
 */

import { createClient } from '@supabase/supabase-js';

const url     = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 .env.local 에 설정되어야 합니다.',
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,   // 새로고침해도 로그인 유지
    autoRefreshToken: true, // 토큰 만료 시 자동 갱신
  },
});
