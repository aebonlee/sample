const RESPONSES = {
  설명: [
    '이 컴포넌트는 React Hook 기반의 헤더입니다.',
    '<code>useState</code>로 메뉴 열림 상태(open)를 관리하고, 버튼 클릭으로 토글합니다.',
    '특이점: open 값에 따라 버튼 텍스트가 "메뉴" / "닫기"로 바뀌도록 삼항 연산자를 사용했어요.',
  ],
  접근성: [
    '몇 가지 접근성 개선을 제안드릴게요:',
    '1️⃣ 버튼에 <code>aria-expanded={open}</code>를 추가해 스크린리더가 상태를 알 수 있게 합니다.',
    '2️⃣ <code>aria-label="메뉴 열기"</code> 같은 라벨을 명시하면 좋습니다.',
    '3️⃣ <code>nav</code> 영역을 별도로 두고, <code>nav aria-label="주 메뉴"</code>로 표시해주세요.',
    '리팩토링한 코드를 보여드릴까요?',
  ],
  버그: [
    '코드를 분석해보니 명확한 버그는 없지만, 잠재적 이슈가 있어요:',
    '⚠️ 메뉴가 열린 상태에서 다른 곳을 클릭해도 닫히지 않습니다.',
    '⚠️ 키보드 ESC 입력으로 닫을 수 없습니다.',
    '⚠️ 모바일에서 메뉴 항목이 보이지 않는 것 같아요. 실제로 메뉴 항목을 렌더링하는 코드가 없네요.',
  ],
  테스트: [
    '<code>@testing-library/react</code> 기반 테스트입니다:',
    '<pre><code>test(\'토글 동작\', () => {\n  render(&lt;Header /&gt;);\n  const btn = screen.getByRole(\'button\');\n  expect(btn).toHaveTextContent(\'메뉴\');\n  fireEvent.click(btn);\n  expect(btn).toHaveTextContent(\'닫기\');\n});</code></pre>',
    '이 테스트는 초기 상태와 클릭 후 상태 변화를 모두 검증합니다.',
  ],
  default: [
    '좋은 질문이에요! 현재 코드를 기반으로 답변드리자면...',
    '주어진 컨텍스트에서 보면, 가장 합리적인 접근은 컴포넌트를 작은 단위로 분리하는 것입니다.',
    '구체적인 예시 코드가 필요하시면 알려주세요!',
  ],
};

function detect(text) {
  const t = text.toLowerCase();
  if (t.includes('설명') || t.includes('뭐') || t.includes('이해')) return '설명';
  if (t.includes('접근성') || t.includes('a11y') || t.includes('aria')) return '접근성';
  if (t.includes('버그') || t.includes('문제') || t.includes('에러')) return '버그';
  if (t.includes('테스트') || t.includes('test')) return '테스트';
  return 'default';
}

const log = document.getElementById('log');
const input = document.getElementById('input');

function appendUser(text) {
  const el = document.createElement('div');
  el.className = 'msg user';
  el.innerHTML = `<p>${escapeHtml(text)}</p>`;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
}

function appendAI(lines) {
  const el = document.createElement('div');
  el.className = 'msg ai';
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;

  let i = 0;
  function next() {
    if (i >= lines.length) return;
    const p = document.createElement('p');
    p.className = 'cursor';
    p.innerHTML = '';
    el.appendChild(p);

    const full = lines[i];
    let j = 0;
    const t = setInterval(() => {
      j++;
      p.innerHTML = full.slice(0, j);
      log.scrollTop = log.scrollHeight;
      if (j >= full.length) {
        clearInterval(t);
        p.classList.remove('cursor');
        i++;
        setTimeout(next, 300);
      }
    }, 12);
  }
  next();
}

function escapeHtml(s) { return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function ask(text) {
  appendUser(text);
  setTimeout(() => appendAI(RESPONSES[detect(text)]), 400);
}

document.getElementById('sendBtn').addEventListener('click', () => {
  const v = input.value.trim();
  if (!v) return;
  ask(v);
  input.value = '';
});
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.getElementById('sendBtn').click(); }
});

document.querySelectorAll('.s').forEach((b) => {
  b.addEventListener('click', () => ask(b.textContent.replace(/^[^\s]+\s/, '')));
});

document.getElementById('clearBtn').addEventListener('click', () => {
  log.innerHTML = `<div class="msg ai"><p>대화가 초기화되었어요. 새 질문을 해주세요.</p></div>`;
});
