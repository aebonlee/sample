// 할 일 앱 — localStorage 저장
const KEY = 'app01-todos';

const seed = [
  { id: 1, title: '아침 운동 30분', prio: 'high', done: true },
  { id: 2, title: '디자인 시안 리뷰', prio: 'mid', done: false },
  { id: 3, title: '주간 회고 작성', prio: 'mid', done: false },
  { id: 4, title: '책 한 챕터 읽기', prio: 'low', done: false },
];

let todos = JSON.parse(localStorage.getItem(KEY) || 'null') ?? seed;

const $list = document.getElementById('list');
const $bar = document.getElementById('bar');
const $pct = document.getElementById('pct');
const $done = document.getElementById('done');
const $total = document.getElementById('total');
const $today = document.getElementById('today');

const prioEmoji = { high: '🔴', mid: '🟡', low: '🟢' };

function save() { localStorage.setItem(KEY, JSON.stringify(todos)); }

function render() {
  if (todos.length === 0) {
    $list.innerHTML = '<div class="empty"><span class="emoji">🎉</span>오늘은 할 일이 없어요!</div>';
  } else {
    $list.innerHTML = todos.map((t) => `
      <div class="todo ${t.done ? 'is-done' : ''}" data-id="${t.id}">
        <button type="button" class="todo__check" aria-label="완료">${t.done ? '✓' : ''}</button>
        <span class="todo__title">${escape(t.title)}</span>
        <span class="todo__prio">${prioEmoji[t.prio] ?? ''}</span>
        <button type="button" class="todo__del" aria-label="삭제">✕</button>
      </div>
    `).join('');
  }
  const done = todos.filter((t) => t.done).length;
  const total = todos.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  $bar.style.width = pct + '%';
  $pct.textContent = pct;
  $done.textContent = done;
  $total.textContent = total;
}

function escape(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

$list.addEventListener('click', (e) => {
  const row = e.target.closest('.todo');
  if (!row) return;
  const id = Number(row.dataset.id);
  if (e.target.closest('.todo__check')) {
    const t = todos.find((x) => x.id === id);
    if (t) { t.done = !t.done; save(); render(); }
  } else if (e.target.closest('.todo__del')) {
    todos = todos.filter((x) => x.id !== id);
    save(); render();
  }
});

// 오늘 날짜 (요일)
$today.textContent = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });

// 추가 모달
const $modal = document.getElementById('modal');
const $title = document.getElementById('newTitle');
document.getElementById('addBtn').addEventListener('click', () => {
  $modal.hidden = false;
  $title.value = '';
  $title.focus();
});
document.getElementById('cancelBtn').addEventListener('click', () => { $modal.hidden = true; });
$modal.querySelector('.modal__bg').addEventListener('click', () => { $modal.hidden = true; });
document.getElementById('saveBtn').addEventListener('click', () => {
  const v = $title.value.trim();
  if (!v) return;
  const prio = $modal.querySelector('input[name="prio"]:checked')?.value ?? 'mid';
  todos.unshift({ id: Date.now(), title: v, prio, done: false });
  save(); render();
  $modal.hidden = true;
});
$title.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('saveBtn').click();
});

// 탭 UI (데모 — 실제 전환 없음)
document.querySelectorAll('.tab').forEach((t) => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.remove('is-active'));
    t.classList.add('is-active');
  });
});

render();
