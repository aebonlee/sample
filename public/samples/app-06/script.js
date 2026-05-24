const EXERCISES = [
  { name: '워밍업 스트레칭',   sets: '5분',         icon: '🧘' },
  { name: '스쿼트',           sets: '3세트 × 12회', icon: '🦵' },
  { name: '푸시업',           sets: '3세트 × 10회', icon: '💪' },
  { name: '플랭크',           sets: '3세트 × 45초', icon: '🤸' },
  { name: '쿨다운',           sets: '5분',         icon: '🌬' },
];

const KEY = 'app-06-done';
const done = new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
const listEl = document.getElementById('exList');
const ring = document.getElementById('ring');
const ringPct = document.getElementById('ringPct');
const startBtn = document.getElementById('startBtn');

function render() {
  listEl.innerHTML = '';
  EXERCISES.forEach((e, i) => {
    const li = document.createElement('li');
    li.className = 'ex' + (done.has(i) ? ' done' : '');
    li.innerHTML = `
      <div class="ex-check">${done.has(i) ? '✓' : ''}</div>
      <div class="ex-info">
        <div class="name">${e.icon} ${e.name}</div>
        <div class="sub"><b>${e.sets}</b></div>
      </div>
    `;
    li.addEventListener('click', () => toggle(i));
    listEl.appendChild(li);
  });
  updateRing();
}

function toggle(i) {
  done.has(i) ? done.delete(i) : done.add(i);
  localStorage.setItem(KEY, JSON.stringify([...done]));
  render();
}

function updateRing() {
  const pct = done.size / EXERCISES.length;
  ring.style.transition = 'stroke-dashoffset .6s ease-out';
  ring.style.strokeDashoffset = 276 * (1 - pct);
  ringPct.textContent = Math.round(pct * 100) + '%';
  if (pct === 1) {
    startBtn.textContent = '🎉 운동 완료!';
    startBtn.classList.add('running');
  } else {
    startBtn.textContent = '▶ 운동 시작';
    startBtn.classList.remove('running');
  }
}

startBtn.addEventListener('click', () => {
  const remaining = EXERCISES.findIndex((_, i) => !done.has(i));
  if (remaining === -1) {
    if (confirm('오늘 운동을 다시 시작할까요?')) {
      done.clear();
      localStorage.removeItem(KEY);
      render();
    }
  } else {
    // 첫 미완료 운동을 완료 처리
    toggle(remaining);
  }
});

document.querySelectorAll('.tabbar .tab').forEach((t) => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tabbar .tab').forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
  });
});

render();
