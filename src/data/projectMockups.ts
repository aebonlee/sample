// 각 프로젝트의 구현 페이지(목업) 목록 — public/projects/p<n>/<file> 에 위치
export interface MockupPage {
  id: string;       // file slug (without .html)
  title: string;    // 표시 제목
  desc?: string;    // 간단 설명
  status: 'done' | 'wip' | 'planned';
}

export interface SharedFile {
  filename: string;       // 'style.css' | 'schema.sql' | 'react/App.tsx' ...
  label: string;
  lang: 'css' | 'sql' | 'tsx' | 'ts' | 'js' | 'markup' | 'md';
  desc?: string;
}

export interface ProjectMockup {
  projectId: number;
  baseDir: string;        // public path (e.g., '/projects/p1')
  shared: SharedFile[];   // 프로젝트 공통 파일 (CSS / SQL / React 다중 파일)
  pages: MockupPage[];
}

// 각 프로젝트의 페이지 컴포넌트 매핑 (App.tsx에서 등록한 순서대로)
const PAGE_COMPONENTS: Record<number, Array<{ name: string; desc: string }>> = {
  1: [
    { name: 'HomePage',       desc: '홈 (소개 + 추천 동화)' },
    { name: 'CreatePage',     desc: '동화 만들기 입력 폼' },
    { name: 'GeneratingPage', desc: '생성 진행률 (Realtime)' },
    { name: 'ReaderPage',     desc: '동화 뷰어 (장면 페이지 넘기기)' },
    { name: 'ActivityPage',   desc: '독후활동 4종' },
    { name: 'LibraryPage',    desc: '내 동화 목록' },
  ],
  2: [
    { name: 'HomePage',       desc: '검색 (RAG)' },
    { name: 'DetailPage',     desc: '상세 + 수준별 해설' },
    { name: 'QuizPage',       desc: '5문제 퀴즈' },
    { name: 'MissionPage',    desc: '탐방 미션' },
    { name: 'HistoryPage',    desc: '학습 기록' },
    { name: 'FavoritesPage',  desc: '즐겨찾기' },
  ],
  3: [
    { name: 'HomePage',   desc: '시대 타임라인' },
    { name: 'StudyPage',  desc: '시대별 학습' },
    { name: 'QuizPage',   desc: '문제 풀기 (4유형)' },
    { name: 'NotePage',   desc: '오답 노트' },
    { name: 'ReportPage', desc: '성적표 & 취약점' },
    { name: 'MockPage',   desc: '한능검 모의고사' },
  ],
  4: [
    { name: 'HomePage',     desc: '자격증 선택' },
    { name: 'DiagnosePage', desc: '진단 평가' },
    { name: 'ResultPage',   desc: '채점 결과' },
    { name: 'WeaknessPage', desc: '취약점 (레이더 차트)' },
    { name: 'PlanPage',     desc: '학습 계획 캘린더' },
    { name: 'NotePage',     desc: '오답 노트 (코드)' },
  ],
  5: [
    { name: 'HomePage',      desc: '챗봇 메인' },
    { name: 'SearchPage',    desc: '정책 검색' },
    { name: 'DetailPage',    desc: '정책 상세 + 매칭' },
    { name: 'MyPage',        desc: '내 맞춤 정책' },
    { name: 'ChecklistPage', desc: '신청 체크리스트' },
    { name: 'CalendarPage',  desc: '마감일 캘린더' },
  ],
  6: [
    { name: 'HomePage',      desc: '경험 입력' },
    { name: 'StarPage',      desc: 'STAR 구조화 결과' },
    { name: 'WritePage',     desc: '자소서 작성 (3컬럼)' },
    { name: 'FeedbackPage',  desc: '피드백 + 수정 제안' },
    { name: 'InterviewPage', desc: '면접 Q&A 12선' },
    { name: 'MyPage',        desc: '내 자소서 관리' },
  ],
  7: [
    { name: 'HomePage',    desc: '오늘의 체크인' },
    { name: 'RoutinePage', desc: '루틴 추천' },
    { name: 'JournalPage', desc: '격려 & 성찰 저널' },
    { name: 'ChartPage',   desc: '회복 그래프' },
    { name: 'HistoryPage', desc: '루틴 히스토리' },
    { name: 'SettingPage', desc: '설정 (알림)' },
  ],
};

/** 프로젝트별 공통 파일 묶음 (style/sql/README + React 인프라 + 모든 페이지 컴포넌트) */
function buildShared(projectId: number): SharedFile[] {
  const pages = PAGE_COMPONENTS[projectId] ?? [];
  return [
    // 디자인 / DB / 문서
    { filename: 'style.css',       label: 'style.css',       lang: 'css', desc: '공통 디자인 토큰·레이아웃' },
    { filename: 'schema.sql',      label: 'schema.sql',      lang: 'sql', desc: 'Supabase/PostgreSQL 스키마' },
    { filename: 'react/README.md', label: 'react/README.md', lang: 'md',  desc: '설치·실행·폴더 구조 가이드' },
    // React 인프라
    { filename: 'react/App.tsx',     label: 'react/App.tsx',     lang: 'tsx', desc: '라우터 (6개 페이지 등록)' },
    { filename: 'react/supabase.ts', label: 'react/supabase.ts', lang: 'ts',  desc: 'Supabase 클라이언트 + API 헬퍼' },
    { filename: 'react/types.ts',    label: 'react/types.ts',    lang: 'ts',  desc: '도메인 타입 정의' },
    // 페이지 컴포넌트들
    ...pages.map((p) => ({
      filename: `react/pages/${p.name}.tsx`,
      label:    `react/pages/${p.name}.tsx`,
      lang:     'tsx' as const,
      desc:     p.desc,
    })),
  ];
}

export const PROJECT_MOCKUPS: ProjectMockup[] = [
  {
    projectId: 1,
    baseDir: '/projects/p1',
    shared: buildShared(1),
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
    shared: buildShared(2),
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
    shared: buildShared(3),
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
    shared: buildShared(4),
    pages: [
      { id: 'home',     title: '자격증 선택',           desc: '카테고리·진도·합격률',                status: 'done' },
      { id: 'diagnose', title: '진단 평가',             desc: '시작 안내 + 3초 카운트다운',          status: 'done' },
      { id: 'result',   title: '채점 결과 & 해설',      desc: '원형 게이지 + 과목별 막대 + 등급',    status: 'done' },
      { id: 'weakness', title: '취약점 분석 대시보드',  desc: '레이더 차트 + 약점 TOP5 + AI 인사이트', status: 'done' },
      { id: 'plan',     title: '학습 계획 (캘린더)',    desc: '4주 진도 + 오늘 학습 + D-day',        status: 'done' },
      { id: 'note',     title: '오답 노트',             desc: '코드 블록 + 비교 + 핵심 해설',         status: 'done' },
    ],
  },
  {
    projectId: 5,
    baseDir: '/projects/p5',
    shared: buildShared(5),
    pages: [
      { id: 'home',     title: '챗봇 메인',     desc: '대화형 + 정책 카드 + 사이드바',  status: 'done' },
      { id: 'search',   title: '정책 검색',     desc: '키워드 + 카테고리 + 마감 뱃지',  status: 'done' },
      { id: 'detail',   title: '정책 상세',     desc: '자격조건 자동 매칭 + 신청 절차', status: 'done' },
      { id: 'my',       title: '내 맞춤 정책',  desc: '프로필 기반 + 진행 단계 추적',   status: 'done' },
      { id: 'checklist',title: '신청 체크리스트', desc: '5단계 진행률 + 체크박스',      status: 'done' },
      { id: 'calendar', title: '정책 캘린더',   desc: '월간 뷰 + 마감 임박 사이드바',   status: 'done' },
    ],
  },
  {
    projectId: 6,
    baseDir: '/projects/p6',
    shared: buildShared(6),
    pages: [
      { id: 'home',     title: '경험 입력',         desc: '5단계 스텝퍼 + 자유 기술',         status: 'done' },
      { id: 'star',     title: 'STAR 구조화 결과',  desc: 'S/T/A/R 4단 분해 + 역량 자동 추출', status: 'done' },
      { id: 'write',    title: '자소서 작성',       desc: '문항별 에디터 + AI 실시간 코칭',   status: 'done' },
      { id: 'feedback', title: '피드백 & 수정 제안', desc: '구체성/STAR/지원처 4영역 채점',   status: 'done' },
      { id: 'interview',title: '면접 준비 Q&A',     desc: '12문항 예상 질문 + 모범 답안',     status: 'done' },
      { id: 'my',       title: '내 자소서 관리',     desc: '회사별 자소서 + 상태 추적',         status: 'done' },
    ],
  },
  {
    projectId: 7,
    baseDir: '/projects/p7',
    shared: buildShared(7),
    pages: [
      { id: 'home',    title: '오늘의 체크인',     desc: '감정 + 루틴 + 회복 그래프',         status: 'done' },
      { id: 'routine', title: '오늘의 루틴 추천',  desc: 'AI 추천 + 카테고리 필터 + 추가',    status: 'done' },
      { id: 'journal', title: '격려 & 성찰 저널',  desc: '오늘의 격려 + 성찰 질문 + 작성',    status: 'done' },
      { id: 'chart',   title: '회복 그래프',       desc: '주간 막대 + 감정 막대 + 인사이트',  status: 'done' },
      { id: 'history', title: '루틴 히스토리',     desc: '월간 활동 캘린더 + 일별 체크',      status: 'done' },
      { id: 'setting', title: '설정 (알림)',       desc: '5개 알림 + 시간 칩 + 보안/데이터', status: 'done' },
    ],
  },
];

export function getProjectMockup(projectId: number): ProjectMockup | undefined {
  return PROJECT_MOCKUPS.find((p) => p.projectId === projectId);
}
