/**
 * 도메인 타입 정의 — 한국형 AI 동화책
 * ────────────────────────────────────────────────────────────
 * schema.sql 의 테이블 구조와 1:1로 매핑됩니다.
 * Supabase select 결과의 타입 안전성을 위해 사용합니다.
 *
 * 사용 예시:
 *   const { data } = await supabase
 *     .from('stories')
 *     .select('*')
 *     .returns<Story[]>();
 */

/** 자녀 나이대 (어휘 수준 결정에 사용) */
export type AgeRange = '5-7' | '8-10' | '11-12';

/** 동화의 한국적 소재 분류 */
export type Origin = '전래동화' | '명절' | '지역설화' | '역사인물';

/** 동화 생성 상태 */
export type StoryStatus = 'generating' | 'done' | 'error';

/** stories 테이블 매핑 */
export interface Story {
  id: string;
  user_id: string;
  title: string;
  age_range: AgeRange;
  origin: Origin;
  values_tags: string[];        // ['우정', '배려'] 등
  custom_request?: string;
  status: StoryStatus;
  cover_emoji: string;          // '🐯', '🌕' 등
  cover_gradient: string;       // 'linear-gradient(135deg,#fb923c,#fbbf24)'
  total_scenes: number;
  reading_minutes?: number;
  is_favorite: boolean;
  created_at: string;
}

/** scenes 테이블 매핑 — 동화의 한 장면 */
export interface Scene {
  id: string;
  story_id: string;
  scene_order: number;          // 1, 2, 3 ...
  title: string;                // "제1장 — 깊은 산속의 호랑이"
  body: string;                 // 본문 텍스트
  art_emoji: string;            // 대표 이모지
  art_prompt: string;           // 삽화 생성용 프롬프트
  art_url?: string;             // 생성된 이미지 URL (선택)
  bg_gradient: string;
}

/** 독후활동 — 4가지 타입 중 하나 */
export type ActivityType = 'question' | 'drawing' | 'craft' | 'roleplay';

export interface Activity {
  id: string;
  story_id: string;
  type: ActivityType;
  title: string;
  description: string;
  /**
   * 타입별 content 구조:
   * - question: { questions: string[] }
   * - drawing:  { instruction: string }
   * - craft:    { materials: string[], steps: string[] }
   * - roleplay: { roles: string[], guide: string }
   */
  content: Record<string, unknown>;
}

/** 동화 생성 폼 입력 값 */
export interface CreateStoryInput {
  childName?: string;
  ageRange: AgeRange;
  origin: Origin;
  valueTags: string[];
  customRequest?: string;
}
