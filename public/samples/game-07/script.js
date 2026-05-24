const board = document.getElementById('board');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const bestEl = document.getElementById('best');
const comboEl = document.getElementById('combo');
const startBtn = document.getElementById('startBtn');
const result = document.getElementById('result');
const rTitle = document.getElementById('rTitle');
const rSub = document.getElementById('rSub');

const SIZE = 9;
const DIFFS = {
  easy:   { up: 1100, gap: 700, bombRate: .1 },
  normal: { up: 850,  gap: 500, bombRate: .18 },
  hard:   { up: 600,  gap: 350, bombRate: .25 },
};

const BEST_KEY = 'game-07-best';
let best = parseInt(localStorage.getItem(BEST_KEY) || '0', 10);
bestEl.textContent = best;

let score = 0, time = 30, combo = 0, level = 'normal';
let running = false, timer = null, popper = null;

// 9개 구멍 생성
for (let i = 0; i < SIZE; i++) {
  const hole = document.createElement('div');
  hole.className = 'hole';
  hole.innerHTML = '<div class="mole"></div>';
  hole.addEventListener('click', () => onHit(hole));
  board.appendChild(hole);
}

const holes = [...board.querySelectorAll('.hole')];

function pop() {
  if (!running) return;
  const empty = holes.filter((h) => !h.querySelector('.mole').classList.contains('up'));
  if (!empty.length) return;
  const h = empty[Math.floor(Math.random() * empty.length)];
  const mole = h.querySelector('.mole');
  mole.classList.remove('hit', 'bomb');
  if (Math.random() < DIFFS[level].bombRate) mole.classList.add('bomb');
  mole.classList.add('up');
  setTimeout(() => mole.classList.remove('up'), DIFFS[level].up);
}

function onHit(hole) {
  if (!running) return;
  const mole = hole.querySelector('.mole');
  if (!mole.classList.contains('up')) return;
  if (mole.classList.contains('bomb')) {
    score = Math.max(0, score - 5);
    combo = 0;
    mole.classList.add('hit');
  } else {
    combo++;
    const pts = 1 + Math.floor(combo / 3);
    score += pts;
    mole.classList.add('hit');
  }
  scoreEl.textContent = score;
  comboEl.textContent = combo;
  setTimeout(() => mole.classList.remove('up', 'hit'), 200);
}

function start() {
  score = 0; combo = 0; time = 30;
  scoreEl.textContent = 0; comboEl.textContent = 0; timeEl.textContent = 30;
  running = true;
  startBtn.disabled = true;
  result.hidden = true;

  timer = setInterval(() => {
    time--;
    timeEl.textContent = time;
    if (time <= 0) end();
  }, 1000);

  popper = setInterval(pop, DIFFS[level].gap);
}

function end() {
  running = false;
  clearInterval(timer); clearInterval(popper);
  holes.forEach((h) => h.querySelector('.mole').classList.remove('up'));

  if (score > best) {
    best = score;
    localStorage.setItem(BEST_KEY, best);
    bestEl.textContent = best;
    rTitle.textContent = '🏆 신기록 달성!';
  } else {
    rTitle.textContent = '게임 종료';
  }
  rSub.textContent = `최종 점수: ${score}점 · 최고 콤보 ${combo}×`;
  result.hidden = false;
  startBtn.disabled = false;
  startBtn.textContent = '↻ 다시 시작';
}

startBtn.addEventListener('click', start);
result.addEventListener('click', () => result.hidden = true);

document.querySelectorAll('.lv').forEach((b) => {
  b.addEventListener('click', () => {
    if (running) return;
    document.querySelectorAll('.lv').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    level = b.dataset.lv;
  });
});
