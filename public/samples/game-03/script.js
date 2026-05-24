const cvs = document.getElementById('board');
const ctx = cvs.getContext('2d');
const SIZE = 20;          // 20x20 칸
const CELL = cvs.width / SIZE;

const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const speedEl = document.getElementById('speed');
const overlay = document.getElementById('overlay');
const ovTitle = document.getElementById('ovTitle');
const ovText = document.getElementById('ovText');
const startBtn = document.getElementById('startBtn');

const BEST_KEY = 'snake-best';
let best = parseInt(localStorage.getItem(BEST_KEY) || '0', 10);
bestEl.textContent = best;

const SPEEDS = { easy: 160, normal: 110, hard: 70 };
let speedKey = 'easy';

let snake, dir, nextDir, apple, score, timer, running = false, paused = false;

function reset() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  dir = { x: 1, y: 0 };
  nextDir = dir;
  score = 0;
  spawnApple();
  scoreEl.textContent = '0';
}

function spawnApple() {
  while (true) {
    const x = Math.floor(Math.random() * SIZE);
    const y = Math.floor(Math.random() * SIZE);
    if (!snake.some((s) => s.x === x && s.y === y)) { apple = { x, y }; return; }
  }
}

function draw() {
  ctx.fillStyle = '#142420';
  ctx.fillRect(0, 0, cvs.width, cvs.height);

  // 그리드
  ctx.strokeStyle = '#1a2a24';
  ctx.lineWidth = 1;
  for (let i = 1; i < SIZE; i++) {
    ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, cvs.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(cvs.width, i * CELL); ctx.stroke();
  }

  // 사과
  ctx.fillStyle = '#ff5e5e';
  ctx.beginPath();
  ctx.arc(apple.x * CELL + CELL / 2, apple.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  // 뱀
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? '#b9ffd0' : '#6fff97';
    const r = 4;
    ctx.beginPath();
    ctx.roundRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2, r);
    ctx.fill();
  });
}

function tick() {
  if (paused) return;
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // 충돌
  if (head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE || snake.some((s) => s.x === head.x && s.y === head.y)) {
    gameOver();
    return;
  }
  snake.unshift(head);

  if (head.x === apple.x && head.y === apple.y) {
    score++;
    scoreEl.textContent = score;
    if (score > best) { best = score; localStorage.setItem(BEST_KEY, best); bestEl.textContent = best; }
    spawnApple();
  } else {
    snake.pop();
  }

  draw();
}

function start() {
  reset();
  draw();
  overlay.classList.add('hidden');
  running = true; paused = false;
  clearInterval(timer);
  timer = setInterval(tick, SPEEDS[speedKey]);
  speedEl.textContent = speedKey === 'easy' ? '1×' : speedKey === 'normal' ? '1.5×' : '2×';
}

function gameOver() {
  clearInterval(timer); running = false;
  ovTitle.textContent = '게임 오버';
  ovText.textContent = `최종 점수: ${score}점${score === best && score > 0 ? ' · 🏆 최고기록!' : ''}`;
  startBtn.textContent = '↻ 다시 시작';
  overlay.classList.remove('hidden');
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  if (paused) {
    ovTitle.textContent = '일시정지';
    ovText.textContent = '스페이스를 눌러 계속';
    startBtn.textContent = '▶ 계속';
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
  }
}

startBtn.addEventListener('click', () => {
  if (paused) { paused = false; overlay.classList.add('hidden'); return; }
  start();
});

document.addEventListener('keydown', (e) => {
  const k = e.key;
  if (k === ' ') { e.preventDefault(); togglePause(); return; }
  if (!running) return;
  if ((k === 'ArrowUp' || k === 'w') && dir.y !== 1) nextDir = { x: 0, y: -1 };
  else if ((k === 'ArrowDown' || k === 's') && dir.y !== -1) nextDir = { x: 0, y: 1 };
  else if ((k === 'ArrowLeft' || k === 'a') && dir.x !== 1) nextDir = { x: -1, y: 0 };
  else if ((k === 'ArrowRight' || k === 'd') && dir.x !== -1) nextDir = { x: 1, y: 0 };
});

document.querySelectorAll('.d').forEach((b) => {
  b.addEventListener('click', () => {
    if (!running) return;
    const d = b.dataset.dir;
    if (d === 'up'    && dir.y !== 1)  nextDir = { x: 0, y: -1 };
    if (d === 'down'  && dir.y !== -1) nextDir = { x: 0, y: 1 };
    if (d === 'left'  && dir.x !== 1)  nextDir = { x: -1, y: 0 };
    if (d === 'right' && dir.x !== -1) nextDir = { x: 1, y: 0 };
  });
});

document.querySelectorAll('.lv').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.lv').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    speedKey = b.dataset.lv;
    if (running) { clearInterval(timer); timer = setInterval(tick, SPEEDS[speedKey]); }
    speedEl.textContent = speedKey === 'easy' ? '1×' : speedKey === 'normal' ? '1.5×' : '2×';
  });
});

// 터치 스와이프
let touch = null;
cvs.addEventListener('touchstart', (e) => { touch = e.touches[0]; }, { passive: true });
cvs.addEventListener('touchend', (e) => {
  if (!touch || !running) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touch.clientX;
  const dy = t.clientY - touch.clientY;
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && dir.x !== -1) nextDir = { x: 1, y: 0 };
    else if (dx < 0 && dir.x !== 1) nextDir = { x: -1, y: 0 };
  } else {
    if (dy > 0 && dir.y !== -1) nextDir = { x: 0, y: 1 };
    else if (dy < 0 && dir.y !== 1) nextDir = { x: 0, y: -1 };
  }
});

// 초기 화면
reset();
draw();
