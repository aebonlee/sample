/**
 * 도메인 타입 — 청년톡톡
 */

/** 정책 카테고리 */
export type PolicyCategory = '주거' | '취업·창업' | '금융·자산' | '교육·역량' | '건강';

/** 정책 (policies) */
export interface Policy {
  id: string;
  title: string;
  organization: string;
  category: PolicyCategory;
  region: string;            // 'national', '서울' 등
  amount_summary: string;    // '월 20만 원 × 12개월'
  amount_max: number;
  duration_months?: number;
  apply_url: string;
  apply_deadline?: string;
  description: string;
}

/** 사용자 프로필 (profiles) */
export interface Profile {
  user_id: string;
  name: string;
  birth_year: number;
  region: string;
  employment: '직장인' | '구직중' | '학생' | '기타';
  income_class: '50%' | '100%' | '150%';
  housing: '월세' | '전세' | '자가' | '부모 동거';
  marital: '미혼' | '기혼';
  custom_tags: string[];
}

/** 챗 메시지 (messages) */
export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'bot';
  content: string;
  policy_refs?: string[];    // 봇 응답이 참조한 policies.id 목록
  created_at: string;
}

/** 신청 진행 (applications) */
export interface Application {
  id: string;
  user_id: string;
  policy_id: string;
  status: 'preparing' | 'submitted' | 'reviewing' | 'approved' | 'rejected';
  checklist: Record<string, boolean>;
  submitted_at?: string;
  result_at?: string;
  notes?: string;
}
