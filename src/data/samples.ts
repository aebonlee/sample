export type Platform = 'web' | 'app' | 'ai' | 'data' | 'game';

export type SampleCategory =
  | 'personal'
  | 'company'
  | 'learning'
  | 'blog'
  | 'landing'
  | 'portfolio'
  | 'auth'
  | 'shop'
  | 'media'
  | 'utility'
  | 'game';

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
  shop: '쇼핑몰',
  media: '미디어 / 이미지',
  utility: '유틸리티',
  game: '게임',
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
    id: 'shop-01',
    title: '이커머스 제품 상세 페이지',
    description:
      '제품 갤러리 + 옵션 칩 + 수량 + 장바구니 + 리뷰. 토스트 알림과 localStorage 장바구니 카운트 포함.',
    platform: 'web',
    category: 'shop',
    tags: ['커머스', '갤러리', '옵션', '장바구니'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '제품 상세 페이지의 표준 구조(브레드크럼 → 갤러리/디테일 → 리뷰)를 따릅니다. 옵션 칩은 단일 선택 그룹으로 동작하고, 장바구니 카운트는 localStorage에 저장됩니다. 가격 표시(₩, 할인 %)를 한국 커머스에 맞춰 정렬했습니다.',
  },
  {
    id: 'app-02',
    title: '날씨 앱 (Climate)',
    description:
      '폰 프레임 안의 날씨 앱. 5개 도시 전환, 시간별/주간 예보, 상세 지표 + 날씨에 따라 배경 그라데이션 변경.',
    platform: 'app',
    category: 'utility',
    tags: ['날씨', '폰프레임', '그라데이션', '드롭다운'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '5개 도시(서울·부산·제주·도쿄·하노이)의 가짜 날씨 데이터를 JS 객체로 관리합니다. 날씨 상태(맑음/구름/비/눈)에 따라 phone 클래스가 바뀌며 배경 그라데이션이 부드럽게 전환됩니다. 실제 API 연동은 fetch로 OpenWeatherMap 호출 한 줄이면 됩니다.',
  },
  {
    id: 'ai-02',
    title: 'AI 이미지 생성 갤러리 (Mirage)',
    description:
      '프롬프트 입력 → 4장 이미지 생성(가짜) → 마사니식 갤러리. 진행률 모달과 상세 모달 포함.',
    platform: 'ai',
    category: 'media',
    tags: ['이미지생성', '마사니', '모달', '프롬프트'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      'Midjourney/DALL·E 류 이미지 생성 UI의 표준 흐름입니다. 실제 이미지는 그라데이션으로 대체하고 가짜 진행률(0→100%)을 보여줍니다. CSS column-count로 마사니식 그리드를 단순하게 구현했고, 비율(1:1, 16:9, 9:16, 3:4)에 따라 타일 높이가 달라집니다.',
  },
  {
    id: 'data-02',
    title: '실시간 모니터링 (Sentry)',
    description:
      'CPU/메모리/네트워크 KPI + 스파크 차트 + RPS 라인 차트 + 서버 상태 + 실시간 로그. 1초마다 업데이트.',
    platform: 'data',
    category: 'learning',
    tags: ['실시간', 'Chart.js', '스파크', '로그'],
    stack: ['HTML', 'CSS', 'JavaScript', 'Chart.js'],
    difficulty: 'advanced',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '서버/인프라 모니터링 대시보드의 전형적인 레이아웃입니다. setInterval로 1초마다 데이터 시프트 + KPI 갱신을 처리하고, 로그는 prepend로 최신순 누적합니다. 일시정지 버튼은 폴링을 멈춥니다. 실제 환경에서는 WebSocket이나 Server-Sent Events로 교체하세요.',
  },
  {
    id: 'game-02',
    title: '2048 슬라이드 퍼즐',
    description:
      '같은 숫자를 합쳐 2048을 만드는 클래식 퍼즐. 방향키 + 터치 스와이프, 점수/최고기록, 되돌리기 8회.',
    platform: 'game',
    category: 'game',
    tags: ['퍼즐', '키보드', '스와이프', 'undo'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'advanced',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '2048 퍼즐의 핵심 로직을 ~150줄로 구현했습니다. 4×4 그리드는 ID 기반 매핑으로 타일 애니메이션(이동/병합/생성)을 자연스럽게 처리합니다. 되돌리기는 최근 8개 스냅샷을 JSON으로 저장합니다.',
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
    id: 'personal-02',
    title: '카드형 이력서 (Resume)',
    description:
      '한 페이지에 정리된 디자이너 이력서. 사이드바에 프로필·스킬·언어, 본문에 경력·프로젝트·학력이 타임라인으로 정리.',
    platform: 'web',
    category: 'personal',
    tags: ['이력서', '인쇄', '타임라인', '프린트'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'beginner',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '취업·이직용 한 장 이력서 템플릿입니다. 사이드바는 어두운 톤으로 시각적 무게 중심을 잡고, 본문은 밝은 종이 배경에 타임라인으로 경력을 표현합니다. `@media print` 규칙 덕분에 "PDF로 저장" 버튼이나 Ctrl+P로 그대로 인쇄 가능합니다.',
  },
  {
    id: 'company-02',
    title: '로스터리 카페 브랜드 사이트',
    description:
      '카페·F&B 브랜드를 위한 따뜻한 톤의 회사 사이트. 메뉴 카드, 스토리, 매장 안내, 테이블 예약 폼 포함.',
    platform: 'web',
    category: 'company',
    tags: ['브랜드', '카페', 'F&B', '예약폼'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'beginner',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '카페·로스터리·베이커리 등 오프라인 매장이 있는 브랜드를 위한 템플릿입니다. 색감은 베이지/브라운 톤으로 통일했고, 메뉴 카드의 이미지는 그라데이션으로 대체했습니다. 실제 사용 시에는 매장 사진으로 교체하고 예약 폼은 백엔드(Resend/Notion API 등)와 연결하세요.',
  },
  {
    id: 'learning-02',
    title: '비디오 강의 플레이어',
    description:
      '온라인 강의 사이트의 강의 페이지. 가짜 비디오 플레이어 + 커리큘럼 사이드바 + 학습 노트 + Q&A 탭.',
    platform: 'web',
    category: 'learning',
    tags: ['LMS', '비디오', '진도', '노트'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      'Udemy/인프런 류 학습 플랫폼의 강의 상세 페이지입니다. 비디오는 가짜로 8분 24초를 시뮬레이션하며, 끝까지 보면 자동으로 해당 강의를 완료 처리합니다. 진도와 노트는 localStorage에 저장되어 새로고침에도 유지됩니다. 실제로는 video.js, hls.js, 또는 YouTube/Vimeo 임베드로 교체하세요.',
  },
  {
    id: 'blog-02',
    title: '개발자 기술 블로그',
    description:
      '그라데이션 커버 + 태그 필터 + 검색이 있는 모던 테크 블로그. 다크모드 토글 포함.',
    platform: 'web',
    category: 'blog',
    tags: ['테크블로그', '태그', '다크모드', '검색'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'beginner',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '개인 기술 블로그의 카드형 홈입니다. 글 데이터는 JS 배열에 정의되어 있고, 태그 필터와 검색이 클라이언트 단에서 동작합니다. 실제 운영 시에는 마크다운 파일 → 정적 사이트 생성(예: Astro, Eleventy)으로 옮기거나, 헤드리스 CMS(Notion, Contentful)와 연결하면 좋습니다.',
  },
  {
    id: 'landing-02',
    title: '모바일 앱 랜딩 (Habit)',
    description:
      '습관 트래커 앱의 다크 톤 랜딩. 두 대의 폰 목업, 기능 그리드, 사용법 3단계, 후기, FAQ.',
    platform: 'web',
    category: 'landing',
    tags: ['앱랜딩', '폰목업', '다크', '리뷰'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      'iOS/Android 앱 출시용 랜딩 페이지 템플릿입니다. 폰 목업 두 대를 겹쳐 배치해 입체감을 만들고, 그라데이션 텍스트로 핵심 메시지를 강조합니다. 다운로드 버튼은 실제 앱스토어/플레이스토어 URL로 교체하세요. FAQ는 `<details>` 태그라 JS 없이도 동작합니다.',
  },
  {
    id: 'shop-02',
    title: '패션 쇼핑몰 (제품 리스트)',
    description:
      '사이드 필터(카테고리·가격·색상) + 정렬 + 그리드 + 찜·장바구니. 패션 커머스의 표준 리스트 페이지.',
    platform: 'web',
    category: 'shop',
    tags: ['커머스', '필터', '정렬', '찜'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '29CM/W컨셉 류 패션 쇼핑몰의 제품 리스트 페이지입니다. 사이드 필터(카테고리·가격대·색상)와 정렬을 모두 클라이언트 단에서 처리합니다. 실제로는 서버 사이드 필터링(쿼리 파라미터 + 페이지네이션)으로 전환하는 것이 일반적이며, 색상 칩을 토큰화해 디자인 시스템과 연결할 수 있습니다.',
  },
  {
    id: 'app-03',
    title: '금융 지갑 앱 (Wallet)',
    description:
      '폰 프레임 안의 핀테크 앱. 그라데이션 카드 + 빠른 액션 + 지출 분석 바차트 + 거래 내역 + 바텀탭.',
    platform: 'app',
    category: 'utility',
    tags: ['핀테크', '폰프레임', '카드', '바텀탭'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '토스/카카오뱅크 류 금융 앱 홈 화면을 단일 폰 프레임 안에 구현했습니다. 총 자산은 카운트업, 지출 분석은 가로 바 애니메이션으로 등장합니다. 거래 내역의 이모지는 실제 앱에서 카드사·가맹점 로고로 대체하면 됩니다. 데이터는 JS 객체에 하드코딩되어 있어 백엔드 연동이 쉽습니다.',
  },
  {
    id: 'ai-03',
    title: 'AI 음성 받아쓰기 (Echo)',
    description:
      '녹음 → 실시간 받아쓰기 → AI 요약. 가짜 음성 파형 + 화자 분리 + 타이핑 애니메이션 + 요약 카드.',
    platform: 'ai',
    category: 'media',
    tags: ['음성', '받아쓰기', '요약', '파형'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      'Otter/Krisp 류 회의록 자동 작성 서비스의 UI입니다. 녹음 버튼을 누르면 가짜 파형이 움직이고, "데모 재생"을 누르면 미리 정의된 회의 스크립트가 화자별로 타이핑되며 등장합니다. "요약" 버튼은 1.2초 딜레이 후 가짜 요약을 보여줍니다. 실제 연동 시 Whisper API 또는 Google Speech-to-Text → Claude/GPT 요약 파이프라인을 사용하세요.',
  },
  {
    id: 'data-03',
    title: '웹 트래픽 분석 (Beacon)',
    description:
      'GA/Plausible 류 트래픽 분석 대시보드. KPI + 추이 그래프 + 채널 도넛 + 디바이스/브라우저 + 인기 페이지 + 국가별 방문자.',
    platform: 'data',
    category: 'learning',
    tags: ['분석', 'GA', 'Chart.js', 'KPI'],
    stack: ['HTML', 'CSS', 'JavaScript', 'Chart.js'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      'Google Analytics/Plausible 류 웹 트래픽 분석 도구의 대시보드 페이지입니다. KPI 카운트업, 추이 라인 차트, 채널 도넛 차트(Chart.js)와 함께 디바이스·브라우저·국가별 정보를 한 화면에 정리했습니다. 실제 데이터는 GA4 API, Plausible API, 또는 자체 추적 스크립트(beacon.js)에서 가져오면 됩니다.',
  },
  {
    id: 'game-03',
    title: '클래식 스네이크 게임',
    description:
      '20×20 격자 위의 뱀이 사과를 먹는 클래식 게임. 방향키/스와이프 조작, 난이도 3단계, 최고기록 저장.',
    platform: 'game',
    category: 'game',
    tags: ['스네이크', '캔버스', '스와이프', '최고기록'],
    stack: ['HTML', 'CSS', 'JavaScript', 'Canvas'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '노키아폰의 그 스네이크 게임을 HTML5 Canvas로 구현했습니다. 게임 루프는 setInterval(난이도별 70~160ms), 뱀은 좌표 배열로 관리하며 머리부터 unshift, 사과를 안 먹은 경우 꼬리를 pop 합니다. 모바일에서는 터치 스와이프와 D-Pad 둘 다 지원합니다. 최고기록은 localStorage에 저장됩니다.',
  },
  {
    id: 'portfolio-02',
    title: '사진작가 포트폴리오',
    description:
      '큰 그림이 주인공인 사진작가용 포트폴리오. 마사니식 컬럼 갤러리 + 카테고리 필터 + 라이트박스.',
    platform: 'web',
    category: 'portfolio',
    tags: ['갤러리', '필터', '라이트박스', '사진'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '사진/일러스트/그래픽 작가용 포트폴리오 템플릿입니다. CSS columns로 마사니식 그리드를 만들고, 이미지 자리는 그라데이션으로 대체했습니다. 실제로는 `aspect-ratio`를 유지한 채 `<img>` 태그로 교체하고, Next.js의 next/image 또는 Cloudinary 같은 이미지 CDN을 사용해 성능을 챙기세요.',
  },
  {
    id: 'company-03',
    title: 'IT 컨설팅 회사 (NEXUS)',
    description:
      '다크 톤 B2B 컨설팅 회사 사이트. 서비스 그리드 + 통계 카운트업 + 사례 + 팀 소개 + 상담 폼.',
    platform: 'web',
    category: 'company',
    tags: ['B2B', '다크', '컨설팅', '폼'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      'SI·IT 컨설팅·솔루션 회사용 B2B 사이트입니다. 다크 톤 + 그라데이션 텍스트로 기술 회사 분위기를 강조하고, IntersectionObserver로 통계 카운트업 애니메이션을 처리합니다. 상담 폼은 데모용으로 alert만 띄우므로, 실제로는 Resend/Slack Webhook/Notion API 등으로 연동하세요.',
  },
  {
    id: 'app-04',
    title: '음악 플레이어 앱 (WAVE)',
    description:
      '폰 프레임 안의 음악 앱. LP 회전 애니메이션 + 다음 재생 큐 + 트랙별 동적 테마 + 재생/일시정지/시크.',
    platform: 'app',
    category: 'media',
    tags: ['음악', '폰프레임', 'LP', '테마전환'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '스포티파이/애플뮤직 류 음악 앱 UI입니다. 재생 중에는 LP(레코드판)가 천천히 회전하고, 트랙이 바뀌면 앨범 아트 그라데이션과 폰 배경이 부드럽게 전환됩니다. 다음 재생 큐는 클릭으로 바로 전환 가능합니다. 실제 환경에서는 `<audio>` 태그나 Howler.js로 교체하세요.',
  },
  {
    id: 'app-05',
    title: '메신저 채팅 앱 (Talk)',
    description:
      '카카오톡 스타일 1:1 채팅 화면. 말풍선, 읽음 표시, 타이핑 인디케이터, 자동 응답 시뮬레이션.',
    platform: 'app',
    category: 'utility',
    tags: ['메신저', '채팅', '타이핑', '말풍선'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'beginner',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '카카오톡/라인 류 1:1 채팅 UI입니다. 말풍선은 in/out 클래스로 좌우 배치되고, 메시지를 보내면 0.5~2초 후 자동으로 가짜 응답이 도착합니다. 타이핑 인디케이터는 점 3개 애니메이션으로 표현했습니다. 실제 메신저는 WebSocket(Socket.IO 등) 또는 Supabase Realtime, Firebase Realtime DB로 구현합니다.',
  },
  {
    id: 'ai-04',
    title: 'AI 코드 어시스턴트 (Codex)',
    description:
      'VS Code 스타일 에디터 + 우측 AI 챗 패널. 가짜 코드 하이라이팅 + 키워드 기반 응답 + 타이핑 애니메이션.',
    platform: 'ai',
    category: 'utility',
    tags: ['코딩', 'IDE', '하이라이팅', '챗'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      'GitHub Copilot Chat / Cursor 류 코드 어시스턴트의 UI 데모입니다. 키워드 기반(설명/접근성/버그/테스트)으로 미리 준비된 응답을 점진 타이핑합니다. 코드 하이라이팅은 수동 `<span>` 클래스로 처리했지만 실제로는 Shiki/Prism/highlight.js로 자동화하세요. AI 응답은 Claude API의 streaming 응답과 연결하면 자연스럽습니다.',
  },
  {
    id: 'ai-05',
    title: 'AI 번역기 (Polyglot)',
    description:
      'DeepL/구글 번역 스타일 인터페이스. 7개 언어 지원, 대체 표현 추천, 단어 분석, 음성 합성(TTS).',
    platform: 'ai',
    category: 'utility',
    tags: ['번역', 'TTS', '다국어', '디바운스'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      'DeepL/구글 번역 스타일 UI입니다. 4개 예시 문장은 미리 번역된 결과를 정확히 보여주고, 그 외는 placeholder 번역으로 동작합니다. 입력은 400ms 디바운스로 처리하고, 음성 듣기는 브라우저 내장 SpeechSynthesis API를 사용합니다. 실제 번역은 DeepL API, Google Translate API, Claude/GPT의 번역 프롬프트로 교체하세요.',
  },
  {
    id: 'data-04',
    title: '영업 CRM 대시보드 (Lead)',
    description:
      'B2B 영업 CRM 대시보드. 매출 KPI + 파이프라인 스테이지 + 리더보드 + 일정 + 영업기회 테이블.',
    platform: 'data',
    category: 'utility',
    tags: ['CRM', '영업', '파이프라인', 'Chart.js'],
    stack: ['HTML', 'CSS', 'JavaScript', 'Chart.js'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      'HubSpot/Salesforce 류 B2B 영업 CRM의 대시보드 페이지입니다. 파이프라인 스테이지(리드→접촉→제안→협상→성사)를 가로로 시각화하고, 영업 리더보드와 오늘의 일정을 함께 보여줍니다. 실제 CRM은 거래(Deal) 데이터를 백엔드에서 가져와 단계 이동을 드래그앤드롭으로 처리합니다.',
  },
  {
    id: 'data-05',
    title: '건강 모니터링 (Vital)',
    description:
      '심박수·걸음·칼로리·수분 + 수면 누적 차트 + 혈압 추이 + 운동/복약 알람. 헬스케어 대시보드.',
    platform: 'data',
    category: 'utility',
    tags: ['헬스', '심박', '수면', 'SVG링'],
    stack: ['HTML', 'CSS', 'JavaScript', 'Chart.js'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '애플 건강/삼성 헬스 류의 종합 건강 대시보드입니다. SVG 원형 진행 링은 stroke-dashoffset으로 애니메이션을 구현했고, 수면 차트는 깊은 수면/얕은 수면을 stacked bar로 표현합니다. 실제로는 Apple HealthKit, Google Fit, 또는 Fitbit/Garmin API에서 데이터를 가져와 표시합니다.',
  },
  {
    id: 'game-04',
    title: '틱택토 (vs AI)',
    description:
      '3목 게임. AI 난이도 3단계(랜덤 / 휴리스틱 / 미니맥스). 승리 라인 강조 + 점수 누적.',
    platform: 'game',
    category: 'game',
    tags: ['보드게임', 'AI', '미니맥스', '난이도'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '클래식 3목 게임에 3단계 AI를 붙였습니다. 쉬움은 랜덤, 보통은 휴리스틱(이기는 수 → 막는 수 → 가운데/모서리 우선), 미니맥스는 가지치기 없이 완전 탐색이라 무조건 무승부 이상입니다. 미니맥스 알고리즘은 ~30줄로 짧게 구현되어 알고리즘 학습용으로도 좋습니다.',
  },
  {
    id: 'game-05',
    title: '벽돌 깨기 (Breakout)',
    description:
      'Atari Breakout 클론. ←→ / 마우스 / 터치 조작. 5단 벽돌, 레벨업, 생명 3개, 최고기록 저장.',
    platform: 'game',
    category: 'game',
    tags: ['아케이드', '캔버스', '물리', '레벨'],
    stack: ['HTML', 'CSS', 'JavaScript', 'Canvas'],
    difficulty: 'advanced',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '1976년 아타리의 Breakout을 HTML5 Canvas로 구현했습니다. 패들에 맞은 위치에 따라 반사각이 달라지도록 하여 공 컨트롤이 가능합니다. 모든 벽돌을 깨면 레벨이 오르고 공이 10% 빨라집니다. 마우스·키보드·터치 입력을 모두 지원합니다.',
  },
  {
    id: 'personal-03',
    title: '링크 인 바이오 (Link in Bio)',
    description:
      'Linktree 스타일 한 페이지 링크 모음. 인플루언서·크리에이터의 SNS·블로그·샵을 한 곳에 정리. 다크모드 + 클릭 카운터.',
    platform: 'web',
    category: 'personal',
    tags: ['Linktree', '크리에이터', 'SNS', '다크모드'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'beginner',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      'Linktree/Beacons 류 인플루언서 링크 페이지 템플릿입니다. CSS 그라데이션 배경 + backdrop-filter로 글래스모피즘을 구현했고, 클릭 횟수와 테마 설정은 localStorage에 저장됩니다. 실제로는 각 링크에 실제 URL을 넣고 NEW 뱃지를 동적으로 관리하면 됩니다.',
  },
  {
    id: 'landing-03',
    title: '음악 페스티벌 랜딩 (PULSE)',
    description:
      '인디 뮤직 페스티벌 랜딩. 네온 핑크/시안 그라데이션 + 실시간 카운트다운 + 라인업 + 스테이지 + 티켓 3종.',
    platform: 'web',
    category: 'landing',
    tags: ['페스티벌', '카운트다운', '네온', '티켓'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '음악 페스티벌/콘서트/이벤트용 랜딩 페이지입니다. 네온 컬러와 큰 타이포로 페스티벌 분위기를 극대화했습니다. 카운트다운은 `setInterval`로 1초마다 갱신되고, target 날짜만 바꾸면 다른 이벤트에 재사용 가능합니다. 라인업은 폰트 사이즈에 따라 헤드라이너→서브로 위계를 만듭니다.',
  },
  {
    id: 'app-06',
    title: '운동 트래커 앱 (FORM)',
    description:
      '폰 프레임 안의 운동 트래커. SVG 진행 링 + 5가지 운동 체크리스트 + 연속 기록 + localStorage.',
    platform: 'app',
    category: 'utility',
    tags: ['운동', '폰프레임', 'SVG링', '체크리스트'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      'Nike Training Club / Strong 류 운동 트래커 앱의 홈 화면입니다. 운동 완료 시 SVG `stroke-dashoffset`이 부드럽게 줄어들며 링이 채워집니다. 항목 체크 상태는 localStorage에 저장됩니다. 실제 앱은 운동별 상세 화면, 타이머, 호흡 가이드, 비디오 등을 추가합니다.',
  },
  {
    id: 'app-07',
    title: '캘린더 앱 (Cal)',
    description:
      '폰 프레임 안의 풀 캘린더. 월간 그리드 + 일정 점 표시 + 일정 추가/삭제 모달 + 카테고리별 색상.',
    platform: 'app',
    category: 'utility',
    tags: ['캘린더', '폰프레임', '모달', '카테고리'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '구글 캘린더/카카오 캘린더 류의 모바일 캘린더 앱입니다. 월 단위 그리드 렌더링은 첫 요일 + 전월/다음월 채우기 패턴으로 처리합니다. 일정은 카테고리별 색 점으로 표시되고, 클릭으로 선택 → 하단에 상세 표시 → ＋ 버튼으로 추가 모달이 열립니다. 모든 일정은 localStorage에 영속화됩니다.',
  },
  {
    id: 'ai-06',
    title: 'AI 이미지 편집 (Lens)',
    description:
      'AI 이미지 편집 툴 UI. 6가지 AI 도구(배경 제거·업스케일·복원 등) + 필터 + 조정 슬라이더 + 가짜 진행률.',
    platform: 'ai',
    category: 'media',
    tags: ['이미지편집', 'AI필터', '진행률', '히스토리'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      'Photoshop AI / Photoroom 류 AI 이미지 편집 도구의 UI입니다. AI 도구 클릭 시 다단계 진행률 시뮬레이션(인코딩→추론→디코딩)이 단계별 메시지와 함께 표시됩니다. 필터/조정은 CSS `filter` 속성으로 실시간 적용됩니다. 실제로는 Replicate, Hugging Face, 또는 자체 모델 추론 엔드포인트로 연결합니다.',
  },
  {
    id: 'ai-07',
    title: 'AI 이력서 첨삭 (Resu)',
    description:
      '이력서 입력 → AI 분석 → 종합 점수 + 항목별 점수 + 강점/약점 + before/after 첨삭 예시.',
    platform: 'ai',
    category: 'utility',
    tags: ['이력서', '첨삭', '점수', 'before-after'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '잡플래닛 AI 첨삭 / Resume.io 류 이력서 분석 도구입니다. 좌측에 이력서를 입력하고 "AI 분석"을 누르면 5단계 로딩 후 우측에 종합 점수, 항목별 막대 그래프, 강점·약점 리스트, before/after 첨삭 예시가 표시됩니다. 직무 선택에 따라 다른 평가 기준을 적용할 수 있도록 설계되었습니다. 실제로는 Claude/GPT의 구조화된 출력으로 교체하면 됩니다.',
  },
  {
    id: 'data-06',
    title: '암호화폐 대시보드 (Coin)',
    description:
      '실시간 코인 시세 대시보드. 포트폴리오 가치 + 6개 코인 + 가격 차트 + 마켓 뉴스 + 보유 자산 테이블.',
    platform: 'data',
    category: 'utility',
    tags: ['암호화폐', '실시간', 'Chart.js', '포트폴리오'],
    stack: ['HTML', 'CSS', 'JavaScript', 'Chart.js'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '업비트/빗썸 류 암호화폐 거래소의 대시보드 페이지입니다. 6개 가짜 코인 데이터를 사용하며, 3초마다 ±0.3% 가격 흔들기로 실시간 시세 변화를 시뮬레이션합니다. 코인 선택 시 가격 차트가 동적으로 갱신됩니다. 실제 데이터는 Upbit Open API, CoinGecko API, Binance WebSocket으로 연결합니다.',
  },
  {
    id: 'data-07',
    title: '스마트홈 IoT (Hive)',
    description:
      'IoT 디바이스 모니터링 대시보드. 실내 환경 + 방별 기기 + 자동화 시나리오 + 24시간 차트.',
    platform: 'data',
    category: 'utility',
    tags: ['IoT', '스마트홈', '자동화', 'Chart.js'],
    stack: ['HTML', 'CSS', 'JavaScript', 'Chart.js'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '삼성 SmartThings / Apple HomeKit 류의 스마트홈 컨트롤 패널입니다. 방별 기기 전원 토글, 자동화 시나리오 on/off, 환경 차트(온도·습도 + 전력 사용량)를 한 화면에 정리했습니다. 실제 IoT 연동은 MQTT 브로커 또는 Matter/Thread 표준 프로토콜로 처리합니다.',
  },
  {
    id: 'game-06',
    title: 'PONG — 클래식 핑퐁',
    description:
      '1972년 아타리 PONG의 충실한 클론. 마우스/터치/키보드 조작 + 3단계 AI + 5점 선득점 + 레트로 룩.',
    platform: 'game',
    category: 'game',
    tags: ['아케이드', 'AI', '레트로', '캔버스'],
    stack: ['HTML', 'CSS', 'JavaScript', 'Canvas'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '1972년 아타리의 첫 비디오 게임 PONG을 ~120줄로 구현했습니다. AI는 공의 Y좌표를 lerp(난이도별 0.045~0.11)로 추적해 자연스럽게 약점이 있는 상대를 만듭니다. 패들 충돌 시 맞은 위치에 따라 공 각도가 달라지므로 컨트롤이 가능합니다. 모노톤 + Courier 폰트로 80년대 게임센터 분위기를 재현했습니다.',
  },
  {
    id: 'game-07',
    title: '두더지 잡기',
    description:
      '30초 안에 최대한 많이 잡기. 9개 구멍 + 콤보 시스템 + 폭탄(피하기) + 최고 기록.',
    platform: 'game',
    category: 'game',
    tags: ['아케이드', '반응속도', '콤보', 'localStorage'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'beginner',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '두더지 잡기 게임을 순수 DOM으로 구현했습니다 (Canvas 없음). 두더지/폭탄 등장은 CSS transition + `bottom` 값으로 부드러운 등장 애니메이션을 만듭니다. 콤보 3회마다 점수 가산 +1, 폭탄을 누르면 -5점 + 콤보 리셋. 모바일 터치도 자연스럽게 동작합니다.',
  },
  {
    id: 'game-08',
    title: '테트리스 (TETRIS)',
    description:
      '클래식 테트리스 완벽 구현. 7가지 블록, 홀드, 다음 블록 3개 미리보기, 고스트, 하드드롭, 레벨업.',
    platform: 'game',
    category: 'game',
    tags: ['테트리스', '캔버스', '홀드', '고스트'],
    stack: ['HTML', 'CSS', 'JavaScript', 'Canvas'],
    difficulty: 'advanced',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '1984년 알렉세이 파지트노프의 테트리스를 충실히 구현했습니다. 7-bag 랜덤(블록 7종이 한 번씩 나온 후 새 가방), wall-kick(회전 시 벽에 닿으면 1-2칸 이동 시도), 고스트(현재 블록이 떨어질 위치 미리보기), 홀드(블록 보관 후 다른 블록과 교체), 하드드롭(즉시 바닥) 같은 모던 테트리스의 핵심 기능을 모두 포함합니다. 점수는 1/2/3/4줄 동시 제거 시 100/300/500/800점 × 레벨, 레벨은 10줄마다 상승하며 낙하 속도가 60ms씩 빨라집니다.',
  },
  {
    id: 'game-09',
    title: '블랙잭 (Blackjack)',
    description:
      '카지노 21 카드 게임. 4가지 단위 칩 베팅 + 히트 / 스탠드 / 더블다운 + 블랙잭 1.5배 배당 + 칩 영속화.',
    platform: 'game',
    category: 'game',
    tags: ['카드게임', '블랙잭', '베팅', '카지노'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    difficulty: 'intermediate',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '카지노 표준 블랙잭(21)을 구현했습니다. 카드는 SVG 없이 CSS만으로 4개 슈트(♠♥♦♣) 디자인. 핵심 규칙: A는 1 또는 11(버스트 시 자동으로 1), J·Q·K는 10, 21 초과 시 버스트. 딜러는 17 이상에서 stand. 블랙잭(첫 2장 21)은 1.5배 배당, 일반 승리는 2배, 무승부는 베팅금 반환. 더블다운은 첫 2장에서만 가능(베팅 2배 + 카드 1장 추가). 칩은 localStorage에 저장되어 새로고침 후에도 유지되고, 0원이 되면 1,000원 보너스 옵션이 제공됩니다.',
  },
  {
    id: 'game-10',
    title: '당구 (8-Ball Pool)',
    description:
      'Canvas 2D 물리 시뮬레이션. 큐볼 + 15개 색공 + 6개 포켓 + 2인 교대 + 마우스/터치 조준.',
    platform: 'game',
    category: 'game',
    tags: ['당구', '물리', '캔버스', '2인'],
    stack: ['HTML', 'CSS', 'JavaScript', 'Canvas'],
    difficulty: 'advanced',
    files: ['index.html', 'style.css', 'script.js'],
    guide:
      '포켓볼(8-Ball) 게임을 Canvas 2D + 직접 작성한 물리 엔진으로 구현했습니다. 핵심 알고리즘: (1) 공-공 탄성 충돌은 동일 질량 가정으로 충돌축 방향 속도 성분만 교환 + 겹침 해소, (2) 마찰 계수 0.985로 매 프레임 속도 감쇠, (3) 벽 충돌은 반사 + 90% 감쇠. 큐볼을 잡고 드래그한 거리만큼 파워가 정해지고, 놓으면 반대 방향으로 발사됩니다. 가이드 라인과 큐 스틱이 마우스 위치에 따라 실시간으로 회전합니다. 모바일 터치도 지원.',
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
