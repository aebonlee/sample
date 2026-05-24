/**
 * 도메인 타입 — 자격증 코치
 */

/** 자격증 (certifications) */
export interface Certification {
  id: string;
  name: string;              // '정보처리기사'
  category: string;          // 'IT/SW', '어학', '금융' ...
  organization: string;
  avg_months?: number;
  pass_rate?: number;
  description?: string;
}

/** 과목 */
export interface Subject {
  id: string;
  cert_id: string;
  ord: number;
  name: string;              // '데이터베이스 구축'
  weight: number;
}

/** 단원 */
export interface Topic {
  id: string;
  subject_id: string;
  name: string;              // '정규화'
  difficulty: number;
}

/** 문제 */
export interface Question {
  id: string;
  topic_id: string;
  type: 'mc' | 'code' | 'short';
  question: string;
  code_snippet?: string;     // C/자바/SQL 코드 (있을 수 있음)
  options?: string[];
  answer_index?: number;
  answer_text?: string;
  explanation: string;
}

/** 진단 평가 결과 */
export interface Diagnosis {
  id: string;
  user_id: string;
  cert_id: string;
  total_q: number;
  correct: number;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  subject_scores: Record<string, number>;   // {DB: 40, 언어: 80, ...}
  taken_at: string;
}

/** 취약점 단원 (weakness_by_topic 뷰) */
export interface WeaknessTopic {
  topic_id: string;
  topic_name: string;
  subject_name: string;
  attempts: number;
  correct: number;
  accuracy: number;          // 0~100
  avg_sec: number;
}
