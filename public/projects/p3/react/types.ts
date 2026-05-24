/**
 * 도메인 타입 — 한국사 마스터
 */

/** 시대 (10개 마스터) */
export interface Era {
  id: string;
  ord: number;               // 1~10
  name: string;              // '삼국시대'
  start_year: number;        // BC 는 음수
  end_year: number;
  summary: string;
  cover_color: string;
}

/** 시대별 학습 진도 (analytics_by_era 뷰) */
export interface EraProgress {
  total: number;
  correct: number;
  rate: number;              // 0~100
}

/** 문제 유형 */
export type QuestionType = 'mc' | 'source' | 'map' | 'image';
//                          ┃     ┃         ┃      ┗ 유물·문화재 이미지
//                          ┃     ┃         ┗ 지도에서 위치 찾기
//                          ┃     ┗ 사료 제시문 분석
//                          ┗ 일반 객관식 5지선다

/** 문제 1개 */
export interface Question {
  id: string;
  era_id: string;
  type: QuestionType;
  difficulty: number;        // 1~5
  question: string;
  source_text?: string;      // 사료 분석 유형일 때
  source_meta?: string;
  image_url?: string;
  options: string[];
  answer_index: number;
  explanation: string;
  tags?: string[];
}

/** 풀이 시도 1건 (attempts 테이블) */
export interface Attempt {
  id: number;
  user_id: string;
  question_id: string;
  picked_index: number;
  is_correct: boolean;
  spent_sec: number;
  attempted_at: string;
}

/** 한능검 모의고사 세션 */
export interface MockExam {
  id: string;
  grade: '기본' | '심화';
  total_q: number;
  duration_min: number;
  started_at: string;
  submitted_at?: string;
  score?: number;
  answer_sheet: Record<number, number>;
}
