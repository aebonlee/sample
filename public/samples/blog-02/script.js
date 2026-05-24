const POSTS = [
  { id: 1, tag: 'React',     cover: 'c1', t: 'useEffect 의 두 번째 인자, 그 미묘함', d: 'Strict Mode 두 번 호출, cleanup 누락, dep 배열 무한 루프까지 한 번에 정리.', date: '2025-05-20', read: 7 },
  { id: 2, tag: 'TypeScript', cover: 'c2', t: 'satisfies 연산자로 더 정확한 타입', d: '리터럴 타입 추론을 살리면서 형식만 검증하는 satisfies의 실제 사용 예 5가지.', date: '2025-05-12', read: 6 },
  { id: 3, tag: 'PostgreSQL', cover: 'c3', t: 'JSONB 인덱스, GIN과 BTREE 사이', d: '실제 200만 행 테이블에서 측정한 인덱스 선택 가이드.', date: '2025-05-04', read: 12 },
  { id: 4, tag: 'CSS',        cover: 'c4', t: 'subgrid가 드디어 쓸만해진 이유', d: '같은 행 정렬, 카드 그리드, 폼 라벨까지 — subgrid가 한 줄로 끝내주는 일.', date: '2025-04-28', read: 5 },
  { id: 5, tag: 'DevOps',     cover: 'c5', t: 'GitHub Actions 캐싱으로 빌드 60% 단축', d: 'pnpm + Turborepo 환경에서 actions/cache를 제대로 쓰는 법.', date: '2025-04-19', read: 9 },
  { id: 6, tag: 'React',      cover: 'c6', t: 'Suspense, 데이터 패칭의 진짜 모습', d: 'use() 훅과 함께 보는 동기적 비동기 데이터 흐름.', date: '2025-04-08', read: 11 },
  { id: 7, tag: 'CSS',        cover: 'c7', t: 'CSS 컨테이너 쿼리 실전 패턴', d: '카드 안의 카드, 사이드바 변화 — 컨테이너 쿼리로 풀어보기.', date: '2025-03-30', read: 8 },
  { id: 8, tag: 'TypeScript', cover: 'c8', t: '제네릭으로 안전한 폼 빌더 만들기', d: 'react-hook-form 없이 30줄로 끝내는 타입 안전 폼.', date: '2025-03-21', read: 14 },
];

const grid = document.getElementById('grid');
const tagsEl = document.getElementById('tags');
const empty = document.getElementById('empty');
let activeTag = null;
let query = '';

const TAGS = ['전체', ...new Set(POSTS.map((p) => p.tag))];

TAGS.forEach((t) => {
  const b = document.createElement('button');
  b.className = 'tag' + (t === '전체' ? ' active' : '');
  b.textContent = t;
  b.addEventListener('click', () => {
    activeTag = t === '전체' ? null : t;
    document.querySelectorAll('.tag').forEach((x) => x.classList.toggle('active', x === b));
    render();
  });
  tagsEl.appendChild(b);
});

function render() {
  grid.innerHTML = '';
  const list = POSTS.filter((p) =>
    (!activeTag || p.tag === activeTag) &&
    (!query || (p.t + p.d + p.tag).toLowerCase().includes(query.toLowerCase()))
  );
  empty.hidden = list.length !== 0;
  list.forEach((p) => {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <div class="cover ${p.cover}"></div>
      <span class="ctag">${p.tag}</span>
      <h2>${p.t}</h2>
      <p>${p.d}</p>
      <footer><span>${p.date}</span><span>·</span><span>${p.read}분 읽기</span></footer>
    `;
    el.addEventListener('click', () => alert(`"${p.t}"\n\n실제 사이트에서는 상세 페이지로 이동합니다.`));
    grid.appendChild(el);
  });
}
render();

window.app = { search: (q) => { query = q; render(); } };

// 테마 토글
const KEY = 'blog02-theme';
const root = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
function setTheme(t) { root.setAttribute('data-theme', t); themeBtn.textContent = t === 'dark' ? '☀' : '🌙'; localStorage.setItem(KEY, t); }
setTheme(localStorage.getItem(KEY) || 'light');
themeBtn.addEventListener('click', () => setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
