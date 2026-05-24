const cvs = document.getElementById('board');
const ctx = cvs.getContext('2d');
const W = cvs.width, H = cvs.height;

const scoreL = document.getElementById('scoreL');
const scoreR = document.getElementById('scoreR');
const overlay = document.getElementById('overlay');
const ovT = document.getElementById('ovT');
const ovP = document.getElementById('ovP');
const startBtn = document.getElementById('startBtn');

const PADDLE_H = 80, PADDLE_W = 10;
const BALL_R = 8;
const WIN_SCORE = 5;

const DIFFS = {
  easy:   { speed: 4.5, ai: 0.045 },
  normal: { speed: 5.5, ai: 0.075 },
  hard:   { speed: 6.5, ai: 0.11  },
};

let leftY, rightY, bx, by, bvx, bvy, sL, sR, running = false, paused = false, animId;
let level = 'normal';
let mouseY = null;
let keys = { up: false, down: false };

function reset(serveDir) {
  leftY = H / 2 - PADDLE_H / 2;
  rightY = H / 2 - PADDLE_H / 2;
  bx = W / 2; by = H / 2;
  const speed = DIFFS[level].speed;
  bvx = serveDir * speed;
  bvy = (Math.random() - 0.5) * speed * 0.8;
}

function startMatch() {
  sL = 0; sR = 0;
  scoreL.textContent = 0; scoreR.textContent = 0;
  reset(Math.random() > .5 ? 1 : -1);
  overlay.classList.add('hidden');
  running = true; paused = false;
  cancelAnimationFrame(animId);
  loop();
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // 중앙 점선
  ctx.strokeStyle = '#1a3a2a';
  ctx.setLineDash([10, 12]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
  ctx.stroke();
  ctx.setLineDash([]);

  // 패들 + 공
  ctx.fillStyle = '#00ff84';
  ctx.fillRect(10, leftY, PADDLE_W, PADDLE_H);
  ctx.fillStyle = '#ff6e7a';
  ctx.fillRect(W - PADDLE_W - 10, rightY, PADDLE_W, PADDLE_H);
  ctx.fillStyle = '#fff';
  ctx.fillRect(bx - BALL_R, by - BALL_R, BALL_R * 2, BALL_R * 2);
}

function update() {
  if (paused) return;

  // 왼쪽 패들(플레이어)
  if (mouseY !== null) {
    leftY += (mouseY - PADDLE_H / 2 - leftY) * 0.35;
  } else {
    if (keys.up) leftY -= 8;
    if (keys.down) leftY += 8;
  }
  leftY = Math.max(0, Math.min(H - PADDLE_H, leftY));

  // 오른쪽 패들(AI) — 공 위치를 약간 늦게 추적
  const targetY = by - PADDLE_H / 2;
  rightY += (targetY - rightY) * DIFFS[level].ai;
  rightY = Math.max(0, Math.min(H - PADDLE_H, rightY));

  // 공 이동
  bx += bvx; by += bvy;

  // 위아래 벽
  if (by - BALL_R < 0 || by + BALL_R > H) bvy = -bvy;

  // 왼쪽 패들 충돌
  if (bx - BALL_R < 10 + PADDLE_W && by > leftY && by < leftY + PADDLE_H && bvx < 0) {
    bvx = -bvx * 1.04;
    const hit = (by - leftY - PADDLE_H / 2) / (PADDLE_H / 2);
    bvy = hit * Math.abs(bvx) * 0.8;
  }
  // 오른쪽 패들 충돌
  if (bx + BALL_R > W - 10 - PADDLE_W && by > rightY && by < rightY + PADDLE_H && bvx > 0) {
    bvx = -bvx * 1.04;
    const hit = (by - rightY - PADDLE_H / 2) / (PADDLE_H / 2);
    bvy = hit * Math.abs(bvx) * 0.8;
  }

  // 득점
  if (bx < -20) { sR++; scoreR.textContent = sR; check(1); }
  if (bx > W + 20) { sL++; scoreL.textContent = sL; check(-1); }
}

function check(serveDir) {
  if (sL >= WIN_SCORE) return end('YOU WIN!', '🎉 ' + sL + ' vs ' + sR);
  if (sR >= WIN_SCORE) return end('GAME OVER', sL + ' vs ' + sR);
  reset(serveDir);
}

function end(title, sub) {
  running = false;
  cancelAnimationFrame(animId);
  ovT.textContent = title;
  ovP.textContent = sub;
  startBtn.textContent = '↻ REPLAY';
  overlay.classList.remove('hidden');
}

function loop() {
  update();
  draw();
  if (running) animId = requestAnimationFrame(loop);
}

startBtn.addEventListener('click', startMatch);

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp')   keys.up = true;
  if (e.key === 'ArrowDown') keys.down = true;
  if (e.key === ' ') { e.preventDefault(); if (running) { paused = !paused; } else startMatch(); }
});
document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp')   keys.up = false;
  if (e.key === 'ArrowDown') keys.down = false;
});

cvs.addEventListener('mousemove', (e) => {
  const r = cvs.getBoundingClientRect();
  mouseY = ((e.clientY - r.top) / r.height) * H;
});
cvs.addEventListener('mouseleave', () => mouseY = null);
cvs.addEventListener('touchmove', (e) => {
  const r = cvs.getBoundingClientRect();
  mouseY = ((e.touches[0].clientY - r.top) / r.height) * H;
  e.preventDefault();
}, { passive: false });

document.querySelectorAll('.lv').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.lv').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    level = b.dataset.lv;
  });
});

reset(1);
draw();
