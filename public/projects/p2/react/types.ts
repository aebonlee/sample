/**
 * 도메인 타입 — 우리문화재
 */

/** 해설 수준 — 초/중/고/일반 */
export type Level = 'elem' | 'mid' | 'high' | 'adult';

/** 문화재 (heritages 테이블) */
export interface Heritage {
  id: string;
  name: string;              // '경복궁 근정전'
  designation: string;       // '국보 제223호'
  era: string;               // '조선'
  region: string;            // '서울'
  category: string;          // '궁궐'
  location_address: string;
  location_lat: number;
  location_lng: number;
  emoji: string;             // '🏯'
  gradient: string;          // CSS gradient
  summary: string;
  full_text?: string;
}

/** 수준별 캐시된 해설 */
export interface Explanation {
  id: string;
  heritage_id: string;
  level: Level;
  body: string;
  generated_by: string;      // 'solar-mini'
  cached_at: string;
}

/** 퀴즈 1문항 */
export interface Quiz {
  id: string;
  heritage_id: string;
  category: string;
  emoji: string;
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
}

/** 탐방 미션 */
export interface Mission {
  id: string;
  group_name: string;        // '서울 궁궐 5대 탐방'
  heritage_id: string;
  points: number;
  unlock_after: number;
  // join 후 채워지는 필드
  heritage?: Heritage;
  is_done?: boolean;
}
