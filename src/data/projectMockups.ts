// 각 프로젝트의 구현 페이지(목업) 목록 — public/projects/p<n>/<file> 에 위치
export interface MockupPage {
  id: string;       // file slug (without .html)
  title: string;    // 표시 제목
  desc?: string;    // 간단 설명
  status: 'done' | 'wip' | 'planned';
}

export interface ProjectMockup {
  projectId: number;
  baseDir: string;  // public path (e.g., '/projects/p1')
  pages: MockupPage[];
}

export const PROJECT_MOCKUPS: ProjectMockup[] = [
  {
    projectId: 1,
    baseDir: '/projects/p1',
    pages: [
      { id: 'home',       title: '홈',           desc: '소개 & 시작 · 추천 동화', status: 'done' },
      { id: 'create',     title: '동화 만들기',  desc: '나이·소재·가치 입력 폼',  status: 'done' },
      { id: 'generating', title: '생성 중',      desc: '5단계 진행률 + 로딩',     status: 'done' },
      { id: 'reader',     title: '동화 뷰어',    desc: '장면별 페이지 넘기기',    status: 'done' },
      { id: 'activity',   title: '독후활동',     desc: '질문·그림·만들기·역할',  status: 'done' },
      { id: 'library',    title: '내 동화 목록', desc: '저장·검색·즐겨찾기',      status: 'done' },
    ],
  },
  {
    projectId: 2,
    baseDir: '/projects/p2',
    pages: [
      { id: 'home',    title: '홈 · 문화재 검색', desc: '검색 + 추천 문화재 카드',         status: 'done' },
      { id: 'detail',  title: '문화재 상세',      desc: '수준별 해설 4단계 토글 + 키워드',  status: 'done' },
      { id: 'quiz',    title: '퀴즈 풀기',        desc: '5문제 + 즉시 채점 + 결과 화면',    status: 'done' },
      { id: 'mission', title: '탐방 미션 (지도)', desc: '지도 핀 + 미션 카드 + 포인트',     status: 'done' },
      { id: 'history', title: '학습 기록',        desc: '캘린더 + 활동 통계 + 뱃지',        status: 'done' },
      { id: 'fav',     title: '즐겨찾기',         desc: '시대/지역/종목별 그룹 + 검색',     status: 'done' },
    ],
  },
  {
    projectId: 3,
    baseDir: '/projects/p3',
    pages: [
      { id: 'home',   title: '시대 타임라인',     desc: '10대 시대 + 진도 + 통계',         status: 'done' },
      { id: 'study',  title: '시대별 학습',       desc: '사이드바 + 수준 토글 + 연표/인물', status: 'done' },
      { id: 'quiz',   title: '문제 풀기',         desc: '4유형 + 사료 분석 + 즉시 채점',    status: 'done' },
      { id: 'note',   title: '오답 노트',         desc: '시대/유형 필터 + 횟수 + 해설',     status: 'done' },
      { id: 'report', title: '성적표 & 취약점',   desc: '원형 게이지 + 시대별/유형별 분석', status: 'done' },
      { id: 'mock',   title: '한능검 모의고사',   desc: '시험지 + OMR + 타이머',           status: 'done' },
    ],
  },
  {
    projectId: 4,
    baseDir: '/projects/p4',
    pages: [
      { id: 'home', title: '자격증 선택', desc: '카테고리·진도·합격률', status: 'done' },
      { id: 'diagnose', title: '진단 평가',         status: 'planned' },
      { id: 'result',   title: '채점 결과 & 해설',  status: 'planned' },
      { id: 'weakness', title: '취약점 분석 대시보드', status: 'planned' },
      { id: 'plan',     title: '학습 계획 (캘린더)', status: 'planned' },
      { id: 'note',     title: '오답 노트',          status: 'planned' },
    ],
  },
  {
    projectId: 5,
    baseDir: '/projects/p5',
    pages: [
      { id: 'home', title: '챗봇 메인', desc: '대화형 + 정책 카드 + 사이드바', status: 'done' },
      { id: 'search',   title: '정책 검색',       status: 'planned' },
      { id: 'detail',   title: '정책 상세',       status: 'planned' },
      { id: 'my',       title: '내 맞춤 정책',    status: 'planned' },
      { id: 'checklist',title: '신청 체크리스트', status: 'planned' },
      { id: 'calendar', title: '정책 캘린더',     status: 'planned' },
    ],
  },
  {
    projectId: 6,
    baseDir: '/projects/p6',
    pages: [
      { id: 'home', title: '경험 입력', desc: '5단계 스텝퍼 + 자유 기술', status: 'done' },
      { id: 'star',     title: 'STAR 구조화 결과', status: 'planned' },
      { id: 'write',    title: '자소서 작성',       status: 'planned' },
      { id: 'feedback', title: '피드백 & 수정 제안', status: 'planned' },
      { id: 'interview',title: '면접 준비 Q&A',     status: 'planned' },
      { id: 'my',       title: '내 자소서 관리',     status: 'planned' },
    ],
  },
  {
    projectId: 7,
    baseDir: '/projects/p7',
    pages: [
      { id: 'home', title: '오늘의 체크인', desc: '감정 + 루틴 + 회복 그래프', status: 'done' },
      { id: 'routine', title: '오늘의 루틴 추천', status: 'planned' },
      { id: 'journal', title: '격려 & 성찰 저널',  status: 'planned' },
      { id: 'chart',   title: '회복 그래프',       status: 'planned' },
      { id: 'history', title: '루틴 히스토리',     status: 'planned' },
      { id: 'setting', title: '설정 (알림)',       status: 'planned' },
    ],
  },
];

export function getProjectMockup(projectId: number): ProjectMockup | undefined {
  return PROJECT_MOCKUPS.find((p) => p.projectId === projectId);
}
