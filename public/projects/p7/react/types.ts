/**
 * 도메인 타입 — 회복탄력성 코치
 */

/** 감정 체크인 (1일 1~N회) */
export interface Checkin {
  id: number;
  user_id: string;
  mood_emoji: string;        // '😢' ~ '🤩'
  mood_score: number;        // 1~10
  note?: string;
  checked_at: string;
}

/** 루틴 카테고리 */
export type RoutineCategory = 'mind' | 'body' | 'sleep' | 'journal' | 'relation';

/** 루틴 마스터 (시스템 + 사용자 정의) */
export interface Routine {
  id: string;
  name: string;              // '호흡 명상 3분'
  description?: string;
  category: RoutineCategory;
  emoji: string;
  duration_min: number;
  is_system: boolean;
}

/** 사용자가 구독한 루틴 */
export interface UserRoutine {
  id: string;
  user_id: string;
  routine_id: string;
  scheduled_time?: string;   // '07:00'
  is_active: boolean;
  added_at: string;
}

/** 루틴 완료 1건 */
export interface Completion {
  id: number;
  user_id: string;
  routine_id: string;
  completed_at: string;
  duration_sec?: number;
}

/** 일별 회복 점수 (daily_resilience 뷰) */
export interface ResilienceDay {
  day: string;
  mood?: number;
  done?: number;
  total?: number;
  resilience_score: number;  // 0~100 (감정 60% + 루틴 완수율 40% 가중)
}

/** 저널 1건 */
export interface Journal {
  id: string;
  user_id: string;
  prompt?: string;           // AI 제안 질문
  body: string;
  mood_emoji?: string;
  tags?: string[];
  written_at: string;
}
