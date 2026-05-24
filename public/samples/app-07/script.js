const KEY = 'app-07-events';
const KO_DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const events = JSON.parse(localStorage.getItem(KEY) || '{}');
// 기본 샘플 데이터 (오늘 날짜로)
const today = new Date();
const todayKey = ymd(today);
if (!events[todayKey]) {
  events[todayKey] = [
    { title: '디자인 리뷰', time: '10:00', cat: 'work' },
    { title: '점심 약속 (수진)', time: '12:30', cat: 'personal' },
    { title: '영어 수업', time: '19:00', cat: 'study' },
  ];
  save();
}
// 며칠 더 샘플
const t2 = new Date(today); t2.setDate(t2.getDate() + 2);
if (!events[ymd(t2)]) { events[ymd(t2)] = [{ title: '병원 예약', time: '15:00', cat: 'health' }]; save(); }
const t3 = new Date(today); t3.setDate(t3.getDate() + 5);
if (!events[ymd(t3)]) { events[ymd(t3)] = [{ title: '주간 회의', time: '11:00', cat: 'work' }, { title: '운동', time: '18:30', cat: 'health' }]; save(); }

let view = new Date(today);
let selected = new Date(today);

function ymd(d) { return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
function save() { localStorage.setItem(KEY, JSON.stringify(events)); }

function render() {
  const y = view.getFullYear(), m = view.getMonth();
  document.getElementById('monthLabel').textContent = `${y}년 ${m + 1}월`;
  document.getElementById('dayLabel').textContent = `${selected.getMonth() + 1}월 ${selected.getDate()}일 ${KO_DAYS[selected.getDay()]}`;

  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();

  // 이전 달 채우기
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevDays - i;
    grid.appendChild(makeCell(d, true, new Date(y, m - 1, d)));
  }
  // 이번 달
  for (let d = 1; d <= daysInMonth; d++) {
    grid.appendChild(makeCell(d, false, new Date(y, m, d)));
  }
  // 다음 달 채우기
  const total = grid.children.length;
  const need = total <= 35 ? 35 - total : 42 - total;
  for (let d = 1; d <= need; d++) {
    grid.appendChild(makeCell(d, true, new Date(y, m + 1, d)));
  }

  renderEvents();
}

function makeCell(d, other, date) {
  const c = document.createElement('div');
  c.className = 'cell' + (other ? ' other' : '');
  if (ymd(date) === ymd(today)) c.classList.add('today');
  if (ymd(date) === ymd(selected) && !other) c.classList.add('selected');
  c.innerHTML = `${d}`;
  const ev = events[ymd(date)] || [];
  if (ev.length) {
    const dots = document.createElement('div');
    dots.className = 'dots';
    [...new Set(ev.map((e) => e.cat))].slice(0, 3).forEach((cat) => {
      const dot = document.createElement('i');
      dot.style.background = `var(--c-${cat})`;
      dots.appendChild(dot);
    });
    c.appendChild(dots);
  }
  c.addEventListener('click', () => {
    selected = date;
    if (other) view = date;
    render();
  });
  return c;
}

function renderEvents() {
  const list = document.getElementById('evList');
  list.innerHTML = '';
  const items = events[ymd(selected)] || [];
  if (!items.length) {
    list.innerHTML = '<li class="empty">일정이 없어요. + 버튼으로 추가하세요.</li>';
    return;
  }
  items.sort((a, b) => a.time.localeCompare(b.time));
  items.forEach((e, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="bar bar-${e.cat}"></div>
      <div class="info">
        <div class="title">${e.title}</div>
        <div class="time">${e.time}</div>
      </div>
      <button class="del" aria-label="삭제">×</button>
    `;
    li.querySelector('.del').addEventListener('click', () => {
      items.splice(i, 1);
      if (!items.length) delete events[ymd(selected)];
      save();
      render();
    });
    list.appendChild(li);
  });
}

document.getElementById('prevBtn').addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render(); });
document.getElementById('nextBtn').addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); });
document.getElementById('todayBtn').addEventListener('click', () => { view = new Date(today); selected = new Date(today); render(); });

const modal = document.getElementById('modal');
const titleInput = document.getElementById('title');
const timeInput = document.getElementById('time');
const catInput = document.getElementById('cat');
document.getElementById('addBtn').addEventListener('click', () => {
  titleInput.value = ''; timeInput.value = '14:00'; catInput.value = 'work';
  modal.hidden = false;
});
document.getElementById('cancelBtn').addEventListener('click', () => modal.hidden = true);
document.getElementById('saveBtn').addEventListener('click', () => {
  if (!titleInput.value.trim()) return;
  const k = ymd(selected);
  if (!events[k]) events[k] = [];
  events[k].push({ title: titleInput.value.trim(), time: timeInput.value || '00:00', cat: catInput.value });
  save();
  modal.hidden = true;
  render();
});
modal.addEventListener('click', (e) => { if (e.target === modal) modal.hidden = true; });

document.querySelectorAll('.tabbar .tab').forEach((t) => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tabbar .tab').forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
  });
});

render();
