const cvs = document.getElementById('board');
const ctx = cvs.getContext('2d');
const W = cvs.width, H = cvs.height;

const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const levelEl = document.getElementById('level');
const livesEl = document.getElementById('lives');
const overlay = document.getElementById('overlay');
const ovT = document.getElementById('ovT');
const ovP = document.getElementById('ovP');
const startBtn = document.getElementById('startBtn');

const BEST_KEY = 'breakout-best';
let best = parseInt(localStorage.getItem(BEST_KEY) || '0', 10);
bestEl.textContent = best;

const PADDLE_W = 90, PADDLE_H = 12;
const BALL_R = 7;
const BRICK_ROWS = 5, BRICK_COLS = 8;
const BRICK_W = 56, BRICK_H = 20, BRICK_GAP = 4, BRICK_TOP = 60, BRICK_LEFT = 18;
const COLORS = ['#ff6b6b', '#ffd93d', '#6efff1', '#a78bfa', '#5eead4'];

let paddleX, ballX, ballY, bvx, bvy;
let bricks = [];
let score, lives, level;
let running = false, paused = false, animId = null;
let mouseX = null;
let keys = { left: false, right: false };

function init() {
  paddleX = W / 2 - PADDLE_W / 2;
  ballX = W / 2;
  ballY = H - 50;
  bvx = (Math.random() > .5 ? 3 : -3);
  bvy = -4;
  buildBricks();
}

function buildBricks() {
  bricks = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: BRICK_LEFT + c * (BRICK_W + BRICK_GAP),
        y: BRICK_TOP + r * (BRICK_H + BRICK_GAP),
        color: COLORS[r % COLORS.length],
        alive: true,
        points: (BRICK_ROWS - r) * 10,
      });
    }
  }
}

function draw() {
  ctx.fillStyle = '#131830';
  ctx.fillRect(0, 0, W, H);

  bricks.forEach((b) => {
    if (!b.alive) return;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 4);
    ctx.fill();
  });

  ctx.fillStyle = '#6efff1';
  ctx.beginPath();
  ctx.roundRect(paddleX, H - 30, PADDLE_W, PADDLE_H, 6);
  ctx.fill();

  ctx.fillStyle = '#eef0fa';
  ctx.beginPath();
  ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
  ctx.fill();
}

function update() {
  if (keys.left) paddleX -= 7;
  if (keys.right) paddleX += 7;
  if (mouseX !== null) paddleX = mouseX - PADDLE_W / 2;
  paddleX = Math.max(0, Math.min(W - PADDLE_W, paddleX));

  ballX += bvx;
  ballY += bvy;

  if (ballX < BALL_R || ballX > W - BALL_R) bvx = -bvx;
  if (ballY < BALL_R) bvy = -bvy;

  // 패들
  if (ballY > H - 30 - BALL_R && ballY < H - 30 + PADDLE_H && ballX > paddleX && ballX < paddleX + PADDLE_W) {
    bvy = -Math.abs(bvy);
    const hit = (ballX - paddleX) / PADDLE_W - .5;
    bvx = hit * 8;
  }

  // 바닥
  if (ballY > H + 20) {
    lives--;
    livesEl.textContent = '♥'.repeat(Math.max(lives, 0)) || '–';
    if (lives <= 0) return gameOver();
    ballX = W / 2; ballY = H - 50; bvx = 3; bvy = -4;
  }

  // 벽돌 충돌
  for (const b of bricks) {
    if (!b.alive) continue;
    if (ballX + BALL_R > b.x && ballX - BALL_R < b.x + BRICK_W && ballY + BALL_R > b.y && ballY - BALL_R < b.y + BRICK_H) {
      b.alive = false;
      score += b.points;
      scoreEl.textContent = score;
      bvy = -bvy;
      if (score > best) { best = score; localStorage.setItem(BEST_KEY, best); bestEl.textContent = best; }
      break;
    }
  }

  if (bricks.every((b) => !b.alive)) levelUp();
}

function loop() {
  if (!paused) { update(); draw(); }
  animId = requestAnimationFrame(loop);
}

function start() {
  score = 0; lives = 3; level = 1;
  scoreEl.textContent = 0; livesEl.textContent = '♥♥♥'; levelEl.textContent = 1;
  init();
  overlay.classList.add('hidden');
  running = true; paused = false;
  cancelAnimationFrame(animId);
  loop();
}

function levelUp() {
  level++;
  levelEl.textContent = level;
  init();
  bvx *= 1.1; bvy *= 1.1;
}

function gameOver() {
  running = false;
  cancelAnimationFrame(animId);
  ovT.textContent = '게임 오버';
  ovP.textContent = `최종 점수: ${score} · 레벨 ${level}${score === best && score > 0 ? ' 🏆 최고기록!' : ''}`;
  startBtn.textContent = '↻ 다시 시작';
  overlay.classList.remove('hidden');
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  if (paused) { ovT.textContent = '일시정지'; ovP.textContent = '스페이스로 재개'; overlay.classList.remove('hidden'); }
  else overlay.classList.add('hidden');
}

startBtn.addEventListener('click', () => { if (paused) togglePause(); else start(); });

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'ArrowRight') keys.right = true;
  if (e.key === ' ') { e.preventDefault(); if (!running) start(); else togglePause(); }
});
document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'ArrowRight') keys.right = false;
});
cvs.addEventListener('mousemove', (e) => {
  const r = cvs.getBoundingClientRect();
  mouseX = ((e.clientX - r.left) / r.width) * W;
});
cvs.addEventListener('mouseleave', () => mouseX = null);
cvs.addEventListener('touchmove', (e) => {
  const r = cvs.getBoundingClientRect();
  mouseX = ((e.touches[0].clientX - r.left) / r.width) * W;
  e.preventDefault();
}, { passive: false });

init();
draw();
