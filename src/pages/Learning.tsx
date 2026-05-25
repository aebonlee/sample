import { useState } from 'react';

/**
 * 학습 사이트 (Learning) — Sample Gallery 의 샘플들을 만들기 위해 배워야 할
 * 핵심 학습 사이트들을 카테고리별로 모은 페이지.
 *
 * - HTML/CSS, JavaScript, 통합 학습 플랫폼, 디자인 영감/갤러리, 도구/리소스
 * - 모두 외부 사이트 → 새 탭으로 열고 rel="noreferrer" 보장
 */

type Category = 'html-css' | 'javascript' | 'platform' | 'design' | 'tools';

interface LearningSite {
  id: string;
  category: Category;
  title: string;
  url: string;
  description: string;
  features: string[];
  level: '입문' | '중급' | '고급' | '입문~중급' | '중급~고급' | '입문~고급';
  language: '한국어' | '영어' | '한국어/영어';
  free: boolean;
  emoji: string;
  color: string;
}

const SITES: LearningSite[] = [
  // ───── HTML / CSS ─────
  {
    id: 'mdn',
    category: 'html-css',
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/ko/',
    description:
      'Mozilla 가 운영하는 웹 표준 공식 레퍼런스. HTML/CSS/JS API 의 가장 정확하고 최신화된 문서. 본 사이트 샘플의 모든 시맨틱 요소·CSS 속성이 여기에 정리되어 있습니다.',
    features: ['공식 레퍼런스', '한국어 일부', '예제 코드', '브라우저 호환표'],
    level: '입문~고급',
    language: '한국어/영어',
    free: true,
    emoji: '📖',
    color: '#000000',
  },
  {
    id: 'w3schools',
    category: 'html-css',
    title: 'W3Schools',
    url: 'https://www.w3schools.com/',
    description:
      '브라우저에서 바로 코드를 실행하며 배우는 인터랙티브 튜토리얼. HTML/CSS/JS 입문자에게 가장 친절한 사이트로, "Try it Yourself" 에디터가 강점입니다.',
    features: ['브라우저 에디터', '단계별 튜토리얼', '레퍼런스', '인증 시험'],
    level: '입문',
    language: '영어',
    free: true,
    emoji: '🪜',
    color: '#04AA6D',
  },
  {
    id: 'css-tricks',
    category: 'html-css',
    title: 'CSS-Tricks',
    url: 'https://css-tricks.com/',
    description:
      'CSS 의 모든 것. 갤러리·그리드·플렉스·애니메이션 등 본 사이트 portfolio 와 landing 샘플에서 쓴 거의 모든 패턴을 설명·예시·코드와 함께 제공합니다.',
    features: ['실전 패턴', 'Flexbox/Grid 완전 가이드', '아티클', '비디오'],
    level: '중급',
    language: '영어',
    free: true,
    emoji: '🎨',
    color: '#FF6B6B',
  },
  {
    id: 'web-dev',
    category: 'html-css',
    title: 'web.dev',
    url: 'https://web.dev/learn/',
    description:
      'Google 이 운영하는 모던 웹 학습 사이트. Learn HTML / Learn CSS / Learn Responsive Design 등 체계적인 무료 코스. 접근성·성능까지 한 번에 익힐 수 있습니다.',
    features: ['Google 공식', '체계적 코스', '실습 과제', '성능/접근성'],
    level: '입문~중급',
    language: '영어',
    free: true,
    emoji: '🚀',
    color: '#4285F4',
  },

  // ───── JavaScript ─────
  {
    id: 'javascript-info',
    category: 'javascript',
    title: 'The Modern JavaScript Tutorial',
    url: 'https://ko.javascript.info/',
    description:
      '한국어 번역이 잘 된 모던 자바스크립트 튜토리얼. 변수·DOM·이벤트·비동기까지 깊이 있는 설명과 작은 과제로 구성. 본 사이트 게임 샘플(블랙잭/테트리스)의 패턴이 여기서 출발합니다.',
    features: ['한국어 완역', '깊이 있는 설명', '작은 과제', '비동기/모듈'],
    level: '입문~고급',
    language: '한국어',
    free: true,
    emoji: '⚡',
    color: '#F7DF1E',
  },
  {
    id: 'mdn-js',
    category: 'javascript',
    title: 'MDN JavaScript 가이드',
    url: 'https://developer.mozilla.org/ko/docs/Web/JavaScript',
    description:
      'JS 언어 사양·내장 객체·API 레퍼런스. 본 사이트 데이터·AI 샘플에서 사용한 fetch / Promise / localStorage 같은 API 가 모두 정리되어 있습니다.',
    features: ['언어 가이드', 'API 레퍼런스', '예제', '브라우저 지원'],
    level: '중급~고급',
    language: '한국어/영어',
    free: true,
    emoji: '🧠',
    color: '#000000',
  },
  {
    id: 'eloquent-js',
    category: 'javascript',
    title: 'Eloquent JavaScript',
    url: 'https://eloquentjavascript.net/',
    description:
      'Marijn Haverbeke 의 명저. 무료 온라인 풀버전 제공. 데이터 구조·고차 함수·HTTP·노드 등 본격 학습에 가장 깊이 있는 책 중 하나입니다.',
    features: ['전문 도서', '온라인 무료', '브라우저 실습', '프로젝트 챕터'],
    level: '중급~고급',
    language: '영어',
    free: true,
    emoji: '📕',
    color: '#1f2937',
  },

  // ───── 통합 학습 플랫폼 ─────
  {
    id: 'freecodecamp',
    category: 'platform',
    title: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/learn',
    description:
      '풀스택 개발자가 되기까지 무료 커리큘럼. Responsive Web Design / JavaScript Algorithms / Front End Libraries 등 각 트랙별 인증서까지. 본 사이트 샘플을 처음부터 만들 수 있는 기초가 여기서 다져집니다.',
    features: ['100% 무료', '단계별 트랙', '인증서', '수천 개 실습'],
    level: '입문~고급',
    language: '영어',
    free: true,
    emoji: '🏕️',
    color: '#0a0a23',
  },
  {
    id: 'odin',
    category: 'platform',
    title: 'The Odin Project',
    url: 'https://www.theodinproject.com/',
    description:
      '"한 길로 끝까지" 풀스택 커리큘럼. HTML→CSS→JS→Node 까지 단일 경로로 안내하며 매 단계 실전 프로젝트로 검증합니다.',
    features: ['풀스택 커리큘럼', '실전 프로젝트', '오픈소스 커뮤니티', '진도 트래킹'],
    level: '입문~고급',
    language: '영어',
    free: true,
    emoji: '🛤️',
    color: '#CE973E',
  },
  {
    id: 'frontend-mentor',
    category: 'platform',
    title: 'Frontend Mentor',
    url: 'https://www.frontendmentor.io/',
    description:
      '실무 챌린지로 포트폴리오 채우기. Figma 디자인이 주어지고 그대로 구현 → 다른 개발자에게 리뷰 받기. 본 사이트의 portfolio·landing 샘플과 정확히 같은 학습 방식입니다.',
    features: ['디자인 → 구현', '코드 리뷰', '난이도 구분', '무료/유료 챌린지'],
    level: '중급~고급',
    language: '영어',
    free: true,
    emoji: '🎯',
    color: '#3F54A3',
  },
  {
    id: 'inflearn',
    category: 'platform',
    title: '인프런',
    url: 'https://www.inflearn.com/',
    description:
      '한국어 개발 강의 플랫폼. 김영한·노마드코더 등 유명 강사의 HTML/CSS/JS/React 입문~심화 강의 다수. 일부 무료 + 대부분 유료지만 한국어 영상이 강점입니다.',
    features: ['한국어 영상', '커뮤니티 Q&A', '입문~심화', '실무 강의'],
    level: '입문~고급',
    language: '한국어',
    free: false,
    emoji: '🎬',
    color: '#1dc078',
  },
  {
    id: 'nomad',
    category: 'platform',
    title: '노마드 코더',
    url: 'https://nomadcoders.co/',
    description:
      '클론 코딩으로 배우는 한국어 강의 플랫폼. 트위터/넷플릭스/줌 클론처럼 큰 서비스를 따라 만들며 익히는 방식. 무료 강의도 다수.',
    features: ['클론 코딩', '한국어 영상', '무료 코스', 'Discord 커뮤니티'],
    level: '입문~중급',
    language: '한국어',
    free: false,
    emoji: '🌊',
    color: '#EE2B47',
  },

  // ───── 디자인 영감 / 갤러리 ─────
  {
    id: 'dribbble',
    category: 'design',
    title: 'Dribbble',
    url: 'https://dribbble.com/',
    description:
      '디자이너들이 작업물을 공유하는 가장 큰 갤러리. 본 사이트 portfolio·landing·shop 샘플의 색감·레이아웃 아이디어 대부분이 여기서 영감을 받았습니다.',
    features: ['디자인 갤러리', '색감/레이아웃', '디자이너 팔로우', '소스 파일'],
    level: '입문~고급',
    language: '영어',
    free: true,
    emoji: '🏀',
    color: '#EA4C89',
  },
  {
    id: 'awwwards',
    category: 'design',
    title: 'Awwwards',
    url: 'https://www.awwwards.com/',
    description:
      '"올해의 사이트" 시상식. 실험적·고품질 웹 디자인의 최전선. 카테고리별 우수 사이트 + 점수 + 인터뷰까지 제공해 트렌드 파악에 최고입니다.',
    features: ['우수 사이트 큐레이션', '카테고리/점수', '튜토리얼', '컨퍼런스'],
    level: '중급~고급',
    language: '영어',
    free: true,
    emoji: '🏆',
    color: '#222222',
  },
  {
    id: 'behance',
    category: 'design',
    title: 'Behance',
    url: 'https://www.behance.net/',
    description:
      'Adobe 가 운영하는 디자인 포트폴리오 플랫폼. 웹·UX·브랜딩·일러스트 등 폭넓은 카테고리. 한국 디자이너 작품도 많아 한글 타이포그래피 영감을 얻기 좋습니다.',
    features: ['디자이너 포트폴리오', '한국 작품', '브랜딩/UX', '무드보드'],
    level: '입문~고급',
    language: '한국어/영어',
    free: true,
    emoji: '🅱️',
    color: '#1769FF',
  },
  {
    id: 'siteinspire',
    category: 'design',
    title: 'SiteInspire',
    url: 'https://www.siteinspire.com/',
    description:
      '큐레이션된 웹사이트 갤러리. 스타일·타입·주제로 필터링이 깔끔해 "이런 톤의 회사 사이트" 같은 영감을 빠르게 찾기 좋습니다.',
    features: ['큐레이션', '필터링', '카테고리/스타일', '주간 추천'],
    level: '입문~고급',
    language: '영어',
    free: true,
    emoji: '✨',
    color: '#000000',
  },

  // ───── 도구 / 리소스 ─────
  {
    id: 'figma',
    category: 'tools',
    title: 'Figma Community',
    url: 'https://www.figma.com/community',
    description:
      '디자인 시안 + 디자인 시스템 무료 공유 허브. 본 사이트 샘플의 컬러 토큰·타이포그래피·스페이싱 체계가 여기 공유된 디자인 시스템에서 영감을 받았습니다.',
    features: ['무료 디자인 시안', '디자인 시스템', '플러그인', '아이콘 라이브러리'],
    level: '입문~고급',
    language: '영어',
    free: true,
    emoji: '🎨',
    color: '#F24E1E',
  },
  {
    id: 'codepen',
    category: 'tools',
    title: 'CodePen',
    url: 'https://codepen.io/',
    description:
      '브라우저에서 HTML/CSS/JS 를 즉시 실행·공유하는 플레이그라운드. 다른 사람의 Pen 을 fork 해서 직접 수정하며 배울 수 있습니다.',
    features: ['브라우저 IDE', 'Pen 공유/fork', '챌린지', '커뮤니티'],
    level: '입문~고급',
    language: '영어',
    free: true,
    emoji: '✏️',
    color: '#000000',
  },
  {
    id: 'unsplash',
    category: 'tools',
    title: 'Unsplash',
    url: 'https://unsplash.com/',
    description:
      '무료 고해상도 사진 라이브러리. 본 사이트 portfolio-01/02 의 작업 카드 이미지가 모두 Unsplash 에서 온 것입니다. 상업적 사용 가능.',
    features: ['고해상도 무료 사진', '상업적 사용 가능', '카테고리/검색', 'API'],
    level: '입문',
    language: '영어',
    free: true,
    emoji: '📸',
    color: '#000000',
  },
  {
    id: 'coolors',
    category: 'tools',
    title: 'Coolors',
    url: 'https://coolors.co/',
    description:
      '컬러 팔레트 생성기. 스페이스바로 무한 변형, 콘트라스트 체크, 그라데이션 추출까지. 새 샘플의 컬러 토큰을 정할 때 가장 빠른 도구입니다.',
    features: ['팔레트 생성', '콘트라스트 체크', '그라데이션', '이미지 → 팔레트'],
    level: '입문',
    language: '영어',
    free: true,
    emoji: '🎨',
    color: '#FF6B6B',
  },
  {
    id: 'caniuse',
    category: 'tools',
    title: 'Can I use',
    url: 'https://caniuse.com/',
    description:
      '브라우저 기능 지원 확인 사이트. `grid-template-columns`, `aspect-ratio`, `:has()` 같은 최신 CSS 기능이 어떤 브라우저에서 작동하는지 즉시 확인.',
    features: ['브라우저 호환표', 'CSS/JS 기능', '사용 점유율', '대안 추천'],
    level: '입문~고급',
    language: '영어',
    free: true,
    emoji: '🔍',
    color: '#1572B6',
  },
];

const CATEGORY_META: Record<Category, { label: string; emoji: string; color: string; desc: string }> = {
  'html-css':   { label: 'HTML / CSS',     emoji: '🧱', color: '#FF6B6B', desc: '시맨틱 마크업과 레이아웃·디자인의 기초' },
  'javascript': { label: 'JavaScript',     emoji: '⚡', color: '#F7DF1E', desc: '인터랙션·로직·API 호출을 다루는 언어' },
  'platform':   { label: '학습 플랫폼',     emoji: '🎓', color: '#0046C8', desc: '체계적 커리큘럼이 있는 학습 사이트' },
  'design':     { label: '디자인 영감',     emoji: '✨', color: '#EA4C89', desc: '디자이너 갤러리·우수 사이트로 안목 키우기' },
  'tools':      { label: '도구 / 리소스',    emoji: '🛠️', color: '#10b981', desc: '실제 만들 때 쓰는 무료 도구·이미지·팔레트' },
};

const CATEGORY_ORDER: Category[] = ['html-css', 'javascript', 'platform', 'design', 'tools'];

export default function Learning() {
  const [activeCat, setActiveCat] = useState<Category | 'all'>('all');
  const visible = activeCat === 'all' ? SITES : SITES.filter((s) => s.category === activeCat);

  return (
    <section className="container learning-page">
      <header className="learning-page__head">
        <span className="section-eyebrow">Learning Resources</span>
        <h1>샘플을 만들 수 있게 되는 학습 사이트</h1>
        <p>
          Sample Gallery 의 디자인 샘플과 실전 프로젝트를 직접 만들 수 있게 해 주는 외부 학습
          사이트들을 카테고리별로 모았습니다. HTML/CSS 기초부터 JavaScript, 학습 플랫폼,
          디자인 영감, 그리고 실제 개발에 쓰는 도구까지 한곳에서 찾을 수 있어요.
        </p>
        <div className="learning-page__cats">
          <button
            type="button"
            className={`learning-cat-chip ${activeCat === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveCat('all')}
          >
            전체 ({SITES.length})
          </button>
          {CATEGORY_ORDER.map((c) => {
            const count = SITES.filter((s) => s.category === c).length;
            return (
              <button
                type="button"
                key={c}
                className={`learning-cat-chip ${activeCat === c ? 'is-active' : ''}`}
                onClick={() => setActiveCat(c)}
                style={activeCat === c ? { borderColor: CATEGORY_META[c].color, color: CATEGORY_META[c].color } : undefined}
              >
                {CATEGORY_META[c].emoji} {CATEGORY_META[c].label} ({count})
              </button>
            );
          })}
        </div>
      </header>

      {activeCat !== 'all' && (
        <div className="learning-cat-info">
          <h2>
            <span style={{ color: CATEGORY_META[activeCat].color }}>{CATEGORY_META[activeCat].emoji}</span>{' '}
            {CATEGORY_META[activeCat].label}
          </h2>
          <p>{CATEGORY_META[activeCat].desc}</p>
        </div>
      )}

      <div className="learning-grid">
        {visible.map((s) => (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="learning-card"
            style={{ borderTopColor: s.color }}
          >
            <div className="learning-card__head">
              <span className="learning-card__icon" style={{ background: `${s.color}1a`, color: s.color }}>
                {s.emoji}
              </span>
              <span className="learning-card__cat" style={{ color: s.color }}>
                {CATEGORY_META[s.category].label}
              </span>
            </div>
            <h3 className="learning-card__title">{s.title}</h3>
            <p className="learning-card__desc">{s.description}</p>
            <ul className="learning-card__tags">
              {s.features.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <div className="learning-card__foot">
              <span className="learning-card__meta">
                <span className={`badge-pill badge-pill--${s.free ? 'free' : 'paid'}`}>
                  {s.free ? '무료' : '유료'}
                </span>
                <span className="badge-pill badge-pill--neutral">{s.level}</span>
                <span className="badge-pill badge-pill--neutral">{s.language}</span>
              </span>
              <span className="learning-card__cta" style={{ color: s.color }}>
                바로가기 ↗
              </span>
            </div>
          </a>
        ))}
      </div>

      <aside className="learning-cta">
        <h3>📝 학습 순서가 막막하다면?</h3>
        <p>
          <strong>1) MDN/W3Schools 로 HTML/CSS 기초</strong> →
          <strong> 2) javascript.info 로 JS 익히기</strong> →
          <strong> 3) Frontend Mentor 로 실전 챌린지</strong> →
          <strong> 4) Dribbble/Awwwards 로 디자인 안목</strong> 순서를 권장합니다. 그 다음부터는
          본 사이트의 샘플을 가져와 Claude 로 변형하며 자기 스타일을 만들 수 있습니다.
        </p>
      </aside>
    </section>
  );
}
