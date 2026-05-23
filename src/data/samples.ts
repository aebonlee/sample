export type SampleCategory =
  | 'personal'
  | 'company'
  | 'learning'
  | 'blog'
  | 'landing'
  | 'portfolio';

export const categoryLabels: Record<SampleCategory, string> = {
  personal: '개인 소개',
  company: '회사 사이트',
  learning: '학습 사이트',
  blog: '블로그',
  landing: '랜딩 페이지',
  portfolio: '포트폴리오',
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
];

export function getSample(id: string): Sample | undefined {
  return samples.find((s) => s.id === id);
}
