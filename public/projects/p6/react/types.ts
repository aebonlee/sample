/**
 * 도메인 타입 — 자소서 코치
 */

/** 사용자 경험 (experiences) */
export interface Experience {
  id: string;
  user_id: string;
  title: string;
  raw_text: string;          // 자유 기술 원문
  target_role?: string;      // '카카오 백엔드'
  emphasis?: string[];       // ['리더십', '문제해결']
  created_at: string;
}

/** STAR 4단 분해 결과 */
export interface StarBreakdown {
  experience_id: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  competencies: Record<string, number>;   // {리더십: 94, 협업: 88, ...}
}

/** 지원 회사 */
export interface Target {
  id: string;
  user_id: string;
  company: string;
  role: string;
  logo_color?: string;
  apply_deadline?: string;
}

/** 자소서 (회사당 1개) */
export interface Resume {
  id: string;
  user_id: string;
  target_id: string;
  title: string;
  status: 'draft' | 'reviewing' | 'submitted' | 'passed' | 'rejected';
  overall_score?: number;
  is_favorite: boolean;
  submitted_at?: string;
}

/** 자소서 문항 */
export interface ResumeQuestion {
  id: string;
  resume_id: string;
  ord: number;
  question_text: string;
  max_chars: number;
  answer_text: string;
  experience_id?: string;
  status: 'empty' | 'draft' | 'reviewed' | 'done';
}

/** AI 피드백 (문항별) */
export interface Feedback {
  question_id: string;
  scores: {
    specificity: number;     // 구체성
    star: number;            // STAR 구조
    differentiation: number; // 차별성
    target_fit: number;      // 지원처 연결
  };
  overall_score: number;
  highlights: Array<{
    type: 'good' | 'bad';
    range: [number, number];
    message: string;
  }>;
  suggestions: Array<{
    old: string;
    new: string;
    reason: string;
  }>;
}

/** 면접 예상 질문 */
export interface InterviewQuestion {
  id: string;
  resume_id: string;
  category: string;
  difficulty: 'easy' | 'mid' | 'hard' | 'xhard';
  question: string;
  source_qid?: string;
  model_answer: string;
  checklist: string[];
}
