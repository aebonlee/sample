const resume = document.getElementById('resume');
const cc = document.getElementById('cc');
const analyzeBtn = document.getElementById('analyzeBtn');
const empty = document.getElementById('empty');
const loading = document.getElementById('loading');
const loadText = document.getElementById('loadText');
const result = document.getElementById('result');

function updateCC() { cc.textContent = resume.value.length; }
resume.addEventListener('input', updateCC);
updateCC();

const ANALYSIS = {
  overall: '전체적으로 직무에 관련된 경력은 갖추고 있으나, **구체적 성과와 임팩트가 빠져있어** 채용 담당자가 강점을 빠르게 파악하기 어렵습니다. 정량적 데이터(수치)와 사용 기술의 깊이를 보완하면 합격률이 크게 올라갈 거예요.',
  scores: [
    { name: '직무 적합성',     v: 82 },
    { name: '경력 구체성',     v: 45 },
    { name: '성과 정량화',     v: 32 },
    { name: '기술 스택 깊이', v: 58 },
    { name: '가독성',          v: 70 },
  ],
  strong: [
    '5년차 적정 경력 보유 — 시니어 진입 단계로 평가',
    'React + TypeScript 메인 스택이 시장 수요와 일치',
    '한 회사에서 2년 이상 근무한 경력이 있어 안정성 어필 가능',
    '두 개 회사 경력으로 다양한 환경 적응 가능성 보임',
  ],
  weak: [
    '**"다양한 기능을 만들었습니다"** 같은 모호한 표현이 많음',
    '담당한 프로젝트의 규모(사용자 수, 트래픽) 정보 부재',
    '성과를 수치로 표현한 부분이 전혀 없음 (예: 성능 30% 개선)',
    '문제 해결 사례, 기술적 도전 경험이 빠짐',
    '개인 프로젝트, 오픈소스 기여, 블로그 등 자기학습 흔적 없음',
  ],
  suggest: [
    {
      before: '회사 메인 서비스 개발 담당\nReact, TypeScript 사용\n다양한 기능을 만들었습니다',
      after: '월 활성 사용자(MAU) 50만 명 대상 SaaS 대시보드 개발\n• React 18 + TypeScript + Recoil로 SPA 구축\n• 초기 로딩 4.2s → 1.8s 단축 (코드 스플리팅 + 이미지 lazy)\n• 디자인 시스템 v2 구축 리드, 컴포넌트 80여 개 표준화',
    },
    {
      before: '웹 페이지 만들기\n디자이너와 협업',
      after: '신규 랜딩 페이지 12종 제작 (LCP 1.5s 이하 유지)\n• Figma → 코드 컨버전 자동화 스크립트 도입으로 작업 시간 40% 단축\n• A/B 테스트 인프라 구축, 전환율 12% 개선',
    },
  ],
};

const LOAD_STEPS = [
  '이력서를 읽는 중...',
  '직무에 맞는 키워드 매칭 중...',
  '경력 구체성 분석 중...',
  '성과 정량화 평가 중...',
  '개선점 정리 중...',
];

function analyze() {
  if (resume.value.length < 50) return alert('이력서 내용이 너무 짧습니다 (50자 이상 입력해주세요)');
  empty.hidden = true;
  result.hidden = true;
  loading.hidden = false;
  analyzeBtn.disabled = true;

  let i = 0;
  const step = setInterval(() => {
    loadText.textContent = LOAD_STEPS[i++];
    if (i >= LOAD_STEPS.length) { clearInterval(step); }
  }, 600);

  setTimeout(() => {
    clearInterval(step);
    loading.hidden = true;
    showResult();
    analyzeBtn.disabled = false;
  }, 3500);
}

function showResult() {
  document.getElementById('scoreLabel').hidden = false;

  const avg = Math.round(ANALYSIS.scores.reduce((a, b) => a + b.v, 0) / ANALYSIS.scores.length);
  const scoreNum = document.getElementById('scoreNum');
  let n = 0;
  const t = setInterval(() => {
    n += 2;
    if (n >= avg) { n = avg; clearInterval(t); }
    scoreNum.textContent = n;
  }, 20);

  document.getElementById('overall').innerHTML = ANALYSIS.overall.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  const scoresEl = document.getElementById('scores');
  scoresEl.innerHTML = '';
  ANALYSIS.scores.forEach((s) => {
    const row = document.createElement('div');
    row.className = 'score-row';
    row.innerHTML = `<span>${s.name}</span><div class="bar"><i style="width:0%"></i></div><em>${s.v}</em>`;
    scoresEl.appendChild(row);
    setTimeout(() => row.querySelector('i').style.width = s.v + '%', 100);
  });

  document.getElementById('strong').innerHTML = ANALYSIS.strong.map((s) => `<li>${s}</li>`).join('');
  document.getElementById('weak').innerHTML = ANALYSIS.weak.map((s) => `<li>${s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</li>`).join('');
  document.getElementById('suggest').innerHTML = ANALYSIS.suggest.map((s) =>
    `<div class="diff-before"><div class="diff-label">BEFORE</div>${s.before.replace(/\n/g, '<br/>')}</div>
     <div class="diff-after"><div class="diff-label">AFTER 추천</div>${s.after.replace(/\n/g, '<br/>')}</div>`
  ).join('');

  result.hidden = false;
}

analyzeBtn.addEventListener('click', analyze);
