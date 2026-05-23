export type SampleCategory =
  | 'personal'
  | 'company'
  | 'learning'
  | 'blog'
  | 'landing'
  | 'portfolio'
  | 'auth';

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
      '좌측 사이드바 + 상단 검색바 + 강좌 카드 그리드. 학습 플랫폼의 대시보드 패턴을 보여 줍니다.',
    category: 'learning',
    tags: ['대시보드', '사이드바', '카드그리드'],
    stack: ['HTML', 'CSS'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css'],
    guide:
      '학습 플랫폼·SaaS 대시보드의 전형적인 레이아웃입니다. 사이드바는 모바일에서 자동으로 숨겨지고, 강좌 카드는 `auto-fit minmax`로 반응형 그리드를 구성합니다. 실제 콘텐츠는 정적이지만, API 응답을 받아 같은 마크업으로 렌더하면 됩니다.',
  },
  {
    id: 'blog-01',
    title: '잡지풍 블로그',
    description:
      '세리프 타이포 + 우측 사이드바 위젯 + 페이지네이션. 글이 주인공이 되는 차분한 톤의 블로그 템플릿.',
    category: 'blog',
    tags: ['세리프', '사이드바', '에디토리얼'],
    stack: ['HTML', 'CSS'],
    difficulty: 'beginner',
    files: ['index.html', 'style.css'],
    guide:
      '편집형 블로그를 위한 템플릿입니다. 본문은 산세리프, 제목은 세리프(Playfair Display + Noto Serif KR)로 대비를 줬습니다. 사이드바 위젯은 자유롭게 빼고 더할 수 있도록 `widget` 컴포넌트로 통일했습니다.',
  },
  {
    id: 'landing-01',
    title: 'SaaS 마케팅 랜딩',
    description:
      '히어로 + 로고 라인 + 기능 그리드 + 가격 + CTA 밴드. SaaS 제품 출시용 단일 페이지 랜딩.',
    category: 'landing',
    tags: ['마케팅', '가격표', 'CTA'],
    stack: ['HTML', 'CSS'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css'],
    guide:
      'SaaS 제품 랜딩의 표준 흐름(Hero → Social Proof → Features → Pricing → CTA → Footer)을 그대로 따릅니다. 가격표는 카드 3장 구조이고, "가장 인기"는 `plan--featured` 클래스로 강조합니다. 색은 CSS 변수 두 줄만 바꾸면 브랜드에 맞출 수 있습니다.',
  },
  {
    id: 'portfolio-01',
    title: '스튜디오 작업물 포트폴리오',
    description:
      '어두운 배경에 큰 작업물 그리드 + 카테고리 필터. 디자인/제작 스튜디오의 자기 PR 사이트.',
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
