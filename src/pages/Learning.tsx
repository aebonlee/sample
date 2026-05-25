/**
 * 학습 사이트 (Learning) — DreamIT Biz 패밀리 학습/교육 사이트 소개 페이지
 *
 * DreamIT Biz 가 운영하는 학습 관련 사이트를 한곳에서 안내합니다.
 * 외부 도메인은 새 탭으로 열고 rel="noreferrer" 로 안전하게 연결합니다.
 */

interface LearningSite {
  id: string;
  category: string;
  title: string;
  url: string;
  description: string;
  highlights: string[];
  color: string;
  emoji: string;
  audience: string;
}

const LEARNING_SITES: LearningSite[] = [
  {
    id: 'koreatech-ct',
    category: '대학 정규 교과',
    title: 'KOREATECH 컴퓨팅 사고',
    url: 'https://koreatech.dreamitbiz.com',
    description:
      '한국기술교육대학교 컴퓨팅 사고 정규 강좌 사이트. 15주 강의안, 주차별 파이썬 실습, AI 활용 가이드, 이론·실기·프로젝트 평가까지 모두 운영되는 본격 교육 플랫폼입니다.',
    highlights: ['파이썬 기초 11주', 'AI 활용 Tip', '실기·이론 평가', '커뮤니티/포트폴리오'],
    color: '#0046C8',
    emoji: '🎓',
    audience: '한기대 재학생 · 컴퓨팅 사고 학습자',
  },
  {
    id: 'books',
    category: '도서 · 학습 자료',
    title: 'DreamIT Books',
    url: 'https://books.dreamitbiz.com',
    description:
      'DreamIT Biz 가 펴낸 IT 학습 도서와 강의 자료 보관소. 출간 예정 도서, 강의 자료 다운로드, 정오표, 독자 후기까지 한곳에서 확인할 수 있습니다.',
    highlights: ['전공 도서', '강의 자료', '정오표 / Q&A', '독자 후기'],
    color: '#7C3AED',
    emoji: '📚',
    audience: '대학생 · 개발자 · 독자',
  },
  {
    id: 'sample-gallery',
    category: '디자인 학습',
    title: 'Sample Gallery (현재 사이트)',
    url: 'https://sample.dreamitbiz.com',
    description:
      '프로젝트 타입별 웹사이트 디자인 샘플 갤러리. HTML/CSS/JS 정적 사이트와 Solar LLM/CT 7단계 실전 프로젝트 가이드를 함께 제공합니다.',
    highlights: ['45+ 디자인 샘플', 'Solar LLM 7 프로젝트', '한기대 CT 9 프로젝트', 'ZIP 다운로드'],
    color: '#10b981',
    emoji: '🎨',
    audience: 'Claude 사용자 · 디자이너 · 신입 개발자',
  },
  {
    id: 'portfolio',
    category: '취업 · 포트폴리오',
    title: 'Wonjun 포트폴리오',
    url: 'https://wonjunjang.dreamitbiz.com',
    description:
      '공공기관·일반 기업 지원을 준비하는 대학생·신입 지원자를 위한 종합 포트폴리오 템플릿. Sample Gallery 의 personal-04 가 이 사이트의 구조를 그대로 따랐습니다.',
    highlights: ['1페이지 자기 PR', '경력 타임라인', '핵심 강점 그리드', '다크모드'],
    color: '#0891B2',
    emoji: '💼',
    audience: '취업 준비 4학년 · 신입 지원자',
  },
  {
    id: 'dreamitbiz',
    category: '운영사',
    title: 'DreamIT Biz 본 사이트',
    url: 'https://site.dreamitbiz.com',
    description:
      '드림아이티비즈가 만드는 IT 서비스 · 학습 콘텐츠 · 산학협력 프로젝트를 한눈에 볼 수 있는 본 사이트입니다. 모든 패밀리 사이트는 이곳을 중심으로 운영됩니다.',
    highlights: ['회사 소개', '서비스 포트폴리오', '제휴/문의', '채용 정보'],
    color: '#F59E0B',
    emoji: '🏢',
    audience: '제휴사 · 협력 학교 · 채용 지원자',
  },
];

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: '대학 정규 교과', label: '대학 정규' },
  { key: '도서 · 학습 자료', label: '도서' },
  { key: '디자인 학습', label: '디자인' },
  { key: '취업 · 포트폴리오', label: '취업' },
  { key: '운영사', label: '운영사' },
];

export default function Learning() {
  return (
    <section className="container learning-page">
      <header className="learning-page__head">
        <span className="section-eyebrow">DreamIT Biz Family</span>
        <h1>학습 사이트</h1>
        <p>
          드림아이티비즈가 운영하는 학습·교육 관련 사이트들을 한곳에서 안내합니다. 각 사이트의
          대상·콘텐츠를 비교해 보고 필요한 곳으로 바로 이동하세요.
        </p>
        <div className="learning-page__cats">
          {CATEGORIES.map((c) => (
            <span key={c.key} className="learning-cat-chip">
              {c.label}
            </span>
          ))}
        </div>
      </header>

      <div className="learning-grid">
        {LEARNING_SITES.map((s) => (
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
                {s.category}
              </span>
            </div>
            <h3 className="learning-card__title">{s.title}</h3>
            <p className="learning-card__desc">{s.description}</p>
            <ul className="learning-card__tags">
              {s.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <div className="learning-card__foot">
              <span className="learning-card__audience">👥 {s.audience}</span>
              <span className="learning-card__cta" style={{ color: s.color }}>
                바로가기 ↗
              </span>
            </div>
          </a>
        ))}
      </div>

      <aside className="learning-cta">
        <h3>📬 새로운 학습 사이트 제안</h3>
        <p>
          드림아이티비즈가 만들면 좋을 학습 사이트가 떠오르신다면 알려주세요. 산학협력 또는
          제휴 운영도 환영합니다.
        </p>
        <a
          href="mailto:aebon@kyonggi.ac.kr?subject=%5BDreamIT%20Biz%5D%20학습%20사이트%20제안"
          className="btn btn--primary btn--sm"
        >
          제안하기 →
        </a>
      </aside>
    </section>
  );
}
