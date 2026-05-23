// AI 챗 UI — 가짜 응답 시뮬레이션
const $chat = document.getElementById('chat');
const $input = document.getElementById('input');
const $send = document.getElementById('sendBtn');
const $form = document.getElementById('composer');
const $threads = document.getElementById('threads');
const $title = document.getElementById('threadTitle');

const threads = [
  { id: 't1', title: 'React 컴포넌트 설계 원칙', preview: '책임의 경계가...' },
  { id: 't2', title: '주말 여행 추천', preview: '근교 당일치기로...' },
  { id: 't3', title: '이메일 카피 다듬기', preview: '친근한 말투로...' },
  { id: 't4', title: 'TypeScript 제네릭', preview: '제네릭의 핵심은...' },
];

function renderThreads(activeId) {
  $threads.innerHTML = threads
    .map((t) => `<button type="button" class="thread ${t.id === activeId ? 'is-active' : ''}" data-id="${t.id}">${t.title}</button>`)
    .join('');
}
renderThreads();

// 가짜 응답 풀
const responses = {
  default: '흥미로운 질문이네요. 좀 더 구체적으로 어떤 맥락인지 알려주시면 더 도움이 될 것 같아요.',
  react: '컴포넌트 설계의 3가지 핵심 원칙:\n\n1) 단일 책임 — 하나의 컴포넌트는 하나의 일만 잘 하기\n2) 명확한 경계 — props 인터페이스로 외부와의 계약 분명히\n3) 합성 가능성 — children과 슬롯으로 유연하게 조합\n\n이 셋만 지키면 대부분의 복잡도는 자연스럽게 풀려요.',
  copy: '몇 가지 친근하게 다듬은 버전이에요:\n\n원본보다 능동적인 표현 + 사용자가 얻을 가치를 앞에 두는 구조로 바꿔봤습니다. 길이를 짧게 유지하면서도 따뜻함을 잃지 않게요.',
  travel: '서울 근교 당일치기 코스 3가지:\n\n🌿 양평 두물머리 — 자전거 + 카페 투어\n🏔 파주 헤이리 — 갤러리 + 출판단지\n🌊 강화도 — 평화전망대 + 신선한 횟집\n\n어떤 분위기를 원하세요? 자연 / 문화 / 미식 중에서 추천을 더 좁혀드릴 수 있어요.',
  ui: '대시보드 정보 위계의 4단계:\n\n1) 가장 큰 KPI — 한 눈에 들어와야 하는 핵심 숫자\n2) 추세 차트 — 그 숫자가 어디로 가고 있는지\n3) 분해 차트 — 무엇이 그 변화를 만들고 있는지\n4) 상세 테이블 — 깊게 파고 싶을 때만 보는 raw data\n\n시선 흐름을 F자로 설계하면 자연스러워요.',
};

function pickResponse(text) {
  const t = text.toLowerCase();
  if (t.includes('react') || t.includes('컴포넌트')) return responses.react;
  if (t.includes('카피') || t.includes('마케팅')) return responses.copy;
  if (t.includes('여행') || t.includes('주말')) return responses.travel;
  if (t.includes('대시보드') || t.includes('ui') || t.includes('디자인')) return responses.ui;
  return responses.default;
}

function clearWelcome() {
  document.querySelector('.welcome')?.remove();
}

function appendMsg(role, text, animated = false) {
  clearWelcome();
  const msg = document.createElement('div');
  msg.className = `msg msg--${role}`;
  msg.innerHTML = `
    <div class="msg__avatar">${role === 'user' ? 'JL' : '✦'}</div>
    <div class="msg__bubble"></div>
  `;
  $chat.appendChild(msg);
  const bubble = msg.querySelector('.msg__bubble');
  if (animated) typeOut(bubble, text);
  else bubble.textContent = text;
  $chat.scrollTop = $chat.scrollHeight;
  return msg;
}

function typeOut(el, text, speed = 14) {
  let i = 0;
  const tick = () => {
    el.textContent = text.slice(0, i++);
    $chat.scrollTop = $chat.scrollHeight;
    if (i <= text.length) setTimeout(tick, speed);
  };
  tick();
}

function showTyping() {
  const wrap = document.createElement('div');
  wrap.className = 'msg msg--bot typing-row';
  wrap.innerHTML = `<div class="msg__avatar">✦</div><div class="msg__bubble"><div class="typing"><span></span><span></span><span></span></div></div>`;
  $chat.appendChild(wrap);
  $chat.scrollTop = $chat.scrollHeight;
  return wrap;
}

async function ask(text) {
  appendMsg('user', text);
  $title.textContent = text.length > 30 ? text.slice(0, 30) + '…' : text;
  const t = showTyping();
  await new Promise((r) => setTimeout(r, 700 + Math.random() * 700));
  t.remove();
  appendMsg('bot', pickResponse(text), true);
}

// 폼 전송
$form.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $input.value.trim();
  if (!v) return;
  $input.value = '';
  $input.style.height = 'auto';
  ask(v);
});

// Enter = 전송, Shift+Enter = 줄바꿈
$input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    $form.dispatchEvent(new Event('submit', { cancelable: true }));
  }
});

// 자동 높이
$input.addEventListener('input', () => {
  $input.style.height = 'auto';
  $input.style.height = Math.min($input.scrollHeight, 200) + 'px';
});

// 프롬프트 버튼
document.addEventListener('click', (e) => {
  const p = e.target.closest('[data-prompt]');
  if (p) ask(p.dataset.prompt);
});

// 새 대화
document.getElementById('newChat').addEventListener('click', () => {
  $chat.innerHTML = `<div class="welcome">
    <div class="welcome__logo">✦</div>
    <h2>오늘은 무엇을 도와드릴까요?</h2>
    <div class="prompts">
      <button type="button" data-prompt="React 컴포넌트 설계의 핵심 원칙 3가지를 알려줘.">React 컴포넌트 설계 원칙</button>
      <button type="button" data-prompt="이메일 마케팅 카피를 친근하게 다듬어줘.">마케팅 카피 다듬기</button>
      <button type="button" data-prompt="이번 주말 서울 근교 당일치기 코스 추천해줘.">주말 여행 추천</button>
      <button type="button" data-prompt="대시보드 디자인에서 정보 위계 잡는 방법은?">UI 디자인 조언</button>
    </div>
  </div>`;
  $title.textContent = '새 대화';
});
