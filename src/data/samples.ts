export type Platform = 'web' | 'app' | 'ai' | 'data' | 'game';

export type SampleCategory =
  | 'personal'
  | 'company'
  | 'learning'
  | 'blog'
  | 'landing'
  | 'portfolio'
  | 'auth';

export const platformLabels: Record<Platform, string> = {
  web: '웹개발',
  app: '앱개발',
  ai: 'AI',
  data: '데이터',
  game: '게임',
};

export const platformDescriptions: Record<Platform, string> = {
  web: '브라우저에서 그대로 동작하는 웹사이트 디자인 샘플들입니다. 개인 포트폴리오부터 SaaS 랜딩까지 다양한 스타일을 다룹니다.',
  app: '모바일 앱(React Native, Flutter, 네이티브) UI/구조 샘플들입니다. 곧 추가될 예정입니다.',
  ai: 'LLM 기반 챗봇, 이미지 생성, 음성 인식 등 AI 기능이 포함된 샘플들입니다. 곧 추가될 예정입니다.',
  data: '대시보드, 차트, 데이터 시각화 중심 샘플들입니다. 곧 추가될 예정입니다.',
  game: '브라우저 게임, 인터랙티브 비주얼 샘플들입니다. 곧 추가될 예정입니다.',
};

export const categoryLabels: Record<SampleCategory, string> = {
  personal: '개인 소개',
  company: '회사 사이트',
  learning: '학습 사이트',
  blog: '블로그',
  landing: '랜딩 페이지',
  portfolio: '포트폴리오',
  auth: '인증 / 운영',
};

export interface Sample {
  id: string;
  title: string;
  description: string;
  platform: Platform;
  category: SampleCategory;
  tags: string[];
  stack: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  files: string[];
  guide?: string;
}

export const samples: Sample[] = [
  {
    id: 'personal-01',
    title: '미니멀 개인 포트폴리오',
    description:
      '한 페이지 스크롤형 개인 소개 사이트. 히어로 · 소개 · 프로젝트 · 연락처 섹션으로 구성되어 있습니다.',
    platform: 'web',
    category: 'personal',
    tags: ['반응형', '다크모드', '스크롤'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'beginner',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '순수 HTML/CSS/JS만으로 구성된 가장 단순한 형태입니다. CSS 변수로 다크모드를 토글하고, IntersectionObserver로 스크롤 애니메이션을 처리합니다. 자기 콘텐츠로 바꾸려면 `index.html`의 텍스트와 `style.css`의 색상 변수만 수정하면 됩니다.',
  },
  {
    id: 'company-01',
    title: '디지털 스튜디오 회사 소개',
    description:
      '서비스 · 사례 · 팀 · 연락처가 한 페이지에 정리된 회사 소개 사이트. 상단 sticky 내비게이션과 그라데이션 히어로가 특징입니다.',
    platform: 'web',
    category: 'company',
    tags: ['반응형', 'sticky-nav', 'CTA-form'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'beginner',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '회사·스튜디오 홈페이지의 기본 골격입니다. 섹션 단위로 자유롭게 추가·삭제할 수 있게 클래스가 일관됩니다. 폼은 데모용 alert로 처리되어 있으므로 백엔드(Resend/Formspree 등) 연동을 추가해 주세요.',
  },
  {
    id: 'learning-01',
    title: '강좌 카탈로그 대시보드',
    description:
      '사이드바 + 검색 + 강좌 카드 그리드 + 진도 바. 북마크/검색/진도 애니메이션 등 인터랙션 포함.',
    platform: 'web',
    category: 'learning',
    tags: ['대시보드', '사이드바', '북마크', '검색'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '학습 플랫폼·SaaS 대시보드의 전형적인 레이아웃입니다. 사이드바는 모바일에서 자동으로 숨겨지고, 강좌 카드는 `auto-fit minmax`로 반응형 그리드를 구성합니다. JS에서 검색 필터, 북마크 토글(localStorage), 진도 바 카운트업을 처리합니다.',
  },
  {
    id: 'blog-01',
    title: '잡지풍 블로그',
    description:
      '세리프 타이포 + 사이드바 위젯 + 검색 + 좋아요. 글이 주인공이 되는 차분한 톤의 블로그 템플릿.',
    platform: 'web',
    category: 'blog',
    tags: ['세리프', '사이드바', '좋아요', '검색'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'beginner',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '편집형 블로그를 위한 템플릿입니다. 본문은 산세리프, 제목은 세리프(Playfair Display + Noto Serif KR)로 대비를 줬습니다. JS에서 검색, 좋아요(localStorage), 스크롤 리빌 애니메이션을 처리합니다.',
  },
  {
    id: 'landing-01',
    title: 'SaaS 마케팅 랜딩',
    description:
      'Hero → 기능 → 가격(월/연 토글) → FAQ → CTA. 부드러운 스크롤, 리빌 애니메이션 포함.',
    platform: 'web',
    category: 'landing',
    tags: ['마케팅', '가격표', '가격토글', 'FAQ'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      'SaaS 제품 랜딩의 표준 흐름(Hero → Social Proof → Features → Pricing → FAQ → CTA → Footer)을 그대로 따릅니다. JS에서 부드러운 앵커 스크롤, 가격 월/연 토글(20% 할인 시뮬레이션), FAQ 아코디언(동적 추가), 스크롤 리빌을 처리합니다.',
  },
  {
    id: 'app-01',
    title: '모바일 할 일 앱 (Today)',
    description:
      '폰 프레임 안에서 동작하는 할 일 앱 UI. 체크/삭제/추가 + 진행률 바 + 우선순위 + localStorage 저장.',
    platform: 'app',
    category: 'personal',
    tags: ['모바일', 'FAB', 'localStorage', '모달'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '모바일 앱의 핵심 UI 패턴(상단바, FAB, 바텀 탭, 모달, 진행률)을 모두 담은 샘플입니다. 폰 프레임은 CSS box-shadow 두 줄로 표현했습니다. 데이터는 localStorage에 저장되어 새로고침에도 유지됩니다.',
  },
  {
    id: 'ai-01',
    title: 'AI 챗봇 UI (Nova)',
    description:
      '사이드바 + 대화 스레드 + 입력창. 가짜 응답 시뮬레이션(타이핑 인디케이터, 점진 출력) + 프롬프트 추천.',
    platform: 'ai',
    category: 'auth',
    tags: ['챗', '타이핑', '프롬프트', '사이드바'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      'ChatGPT/Claude 류 챗 인터페이스의 표준 구조입니다. 메시지 키워드에 따라 미리 준비된 응답을 점진 출력해 진짜 LLM처럼 보이게 합니다. 실제 API 연동은 fetch로 OpenAI/Anthropic 엔드포인트를 호출하면 됩니다.',
  },
  {
    id: 'data-01',
    title: '분석 대시보드 (Pulse)',
    description:
      'KPI 카드 + 라인/도넛/막대 차트 + 주문 테이블. Chart.js 사용, KPI 카운트업 애니메이션 포함.',
    platform: 'data',
    category: 'learning',
    tags: ['차트', 'KPI', 'Chart.js', '테이블'],
    stack: ['HTML', 'CSS', 'JavaScript', 'Chart.js'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '대시보드의 정보 위계(KPI → 추세 → 분해 → 상세)를 정직하게 따른 레이아웃입니다. Chart.js는 CDN으로 로드해 빌드 도구 없이 동작합니다. 색 토큰을 CSS 변수와 JS 상수에서 일치시켜 일관된 팔레트를 유지합니다.',
  },
  {
    id: 'game-01',
    title: '메모리 카드 매치',
    description:
      '같은 그림 카드 짝 맞추기 게임. 난이도 3단계, 타이머, 이동 카운터, 최고 기록(localStorage).',
    platform: 'game',
    category: 'auth',
    tags: ['게임', '카드', '타이머', '최고기록'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '클래식 메모리 매치 게임입니다. 카드 뒤집기는 CSS 3D 변환(`transform-style: preserve-3d`)으로 구현했고, 게임 로직은 ~100줄로 단순합니다. 새 난이도를 추가하려면 LEVELS 객체에 항목을 추가하면 됩니다.',
  },
  {
    id: 'portfolio-01',
    title: '스튜디오 작업물 포트폴리오',
    description:
      '어두운 배경에 큰 작업물 그리드 + 카테고리 필터. 디자인/제작 스튜디오의 자기 PR 사이트.',
    platform: 'web',
    category: 'portfolio',
    tags: ['다크', '그리드', '필터'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css'],
    guide:
      '작업물(works)이 가장 크게 보이도록 설계된 갤러리형 포트폴리오입니다. `card--wide` 클래스를 섞어 마사니식 리듬을 만들고, 상단 칩으로 카테고리 필터(자바스크립트 한 줄)로 동작합니다.',
  },
  {
    id: 'supabase-auth-01',
    title: 'Supabase OAuth 로그인 (Google + Kakao)',
    description:
      '빌드 도구 없이 정적 HTML에서 Supabase JS 클라이언트로 Google · Kakao 소셜 로그인을 구현한 데모.',
    platform: 'web',
    category: 'auth',
    tags: ['Supabase', 'OAuth', 'Google', 'Kakao'],
    stack: ['HTML', 'CSS', 'JavaScript', 'Supabase'],
    difficulty: 'advanced',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '실제 사용하려면 Supabase 프로젝트의 URL과 anon key가 필요합니다. 시크릿은 코드에 절대 박지 말고, 화면의 "⚙ Supabase 설정 입력" 버튼으로 브라우저 localStorage에만 저장하도록 설계했습니다. 그 외 Supabase 대시보드에서 Authentication → Providers에 Google/Kakao를 활성화하고, Redirect URL에 현재 페이지를 등록해야 합니다.',
  },
];

export function getSample(id: string): Sample | undefined {
  return samples.find((s) => s.id === id);
}

export function samplesByPlatform(p: Platform): Sample[] {
  return samples.filter((s) => s.platform === p);
}
