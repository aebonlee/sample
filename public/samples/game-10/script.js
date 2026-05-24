const cvs = document.getElementById('board');
const ctx = cvs.getContext('2d');
const W = cvs.width, H = cvs.height;

const turnEl = document.getElementById('turn');
const p1El = document.getElementById('p1');
const p2El = document.getElementById('p2');
const shotsEl = document.getElementById('shots');
const powerEl = document.getElementById('power');
const overlay = document.getElementById('overlay');
const ovT = document.getElementById('ovT');
const ovP = document.getElementById('ovP');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

const BALL_R = 12;
const FRICTION = 0.985;
const MIN_SPEED = 0.05;
const MAX_POWER = 18;
const POCKETS = [
  { x: 20, y: 20 }, { x: W / 2, y: 18 }, { x: W - 20, y: 20 },
  { x: 20, y: H - 20 }, { x: W / 2, y: H - 18 }, { x: W - 20, y: H - 20 },
];
const POCKET_R = 20;
const RAIL = 18;

// 색상 — 1~7 솔리드, 8 검정, 9~15 줄무늬
const COLORS = ['#ffd24a', '#3a6fd6', '#d63333', '#7a3aa6', '#ff7e3e', '#2a8a4a', '#8a2a2a', '#1a1a1a', '#ffd24a', '#3a6fd6', '#d63333', '#7a3aa6', '#ff7e3e', '#2a8a4a', '#8a2a2a'];

let balls = [];
let aiming = false;
let aimX = 0, aimY = 0;
let mouseX = 0, mouseY = 0;
let power = 0;
let isShooting = false;
let p1 = 0, p2 = 0, turn = 1, shots = 0;
let running = false, animId = null;

function makeBall(x, y, n, isCue = false) {
  return {
    x, y, vx: 0, vy: 0,
    n, isCue,
    color: isCue ? '#ffffff' : COLORS[n - 1],
    stripe: n > 8,
    pocketed: false,
  };
}

function setup() {
  balls = [];
  // 큐볼
  balls.push(makeBall(W * 0.25, H / 2, 0, true));
  // 1~15번 공을 삼각형 랙으로
  const startX = W * 0.7;
  const startY = H / 2;
  const order = [1, 9, 2, 10, 8, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15];
  let idx = 0;
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row <= col; row++) {
      const x = startX + col * (BALL_R * 2 + 0.5);
      const y = startY - col * BALL_R + row * (BALL_R * 2 + 0.5);
      balls.push(makeBall(x, y, order[idx++]));
    }
  }
}

function start() {
  p1 = 0; p2 = 0; turn = 1; shots = 0;
  updateHUD();
  setup();
  overlay.classList.add('hidden');
  running = true;
  cancelAnimationFrame(animId);
  loop();
}

function updateHUD() {
  turnEl.textContent = '플레이어 ' + turn;
  p1El.textContent = p1; p2El.textContent = p2; shotsEl.textContent = shots;
}

function drawTable() {
  ctx.fillStyle = '#2d6f3f';
  ctx.fillRect(0, 0, W, H);
  // 펠트 그라데이션
  const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
  g.addColorStop(0, '#3a8a52');
  g.addColorStop(1, '#1e5230');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // 헤드 라인
  ctx.strokeStyle = 'rgba(255,255,255,.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W * 0.25, RAIL); ctx.lineTo(W * 0.25, H - RAIL);
  ctx.stroke();
  // 포켓
  ctx.fillStyle = '#000';
  POCKETS.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, POCKET_R, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBall(b) {
  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath();
  ctx.arc(b.x + 1, b.y + 2, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  // 본체
  ctx.fillStyle = b.color;
  ctx.beginPath();
  ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  // 줄무늬
  if (b.stripe) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(b.x, b.y, BALL_R, -0.6, 0.6);
    ctx.arc(b.x, b.y, BALL_R, Math.PI - 0.6, Math.PI + 0.6);
    ctx.fill();
  }
  // 번호 동그라미
  if (b.n > 0) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(b.x, b.y, BALL_R * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.n, b.x, b.y);
  }
  // 하이라이트
  ctx.fillStyle = 'rgba(255,255,255,.4)';
  ctx.beginPath();
  ctx.arc(b.x - 3, b.y - 4, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawAim() {
  const cue = balls[0];
  if (!cue || cue.pocketed) return;
  if (allStopped() && !isShooting) {
    const dx = mouseX - cue.x, dy = mouseY - cue.y;
    const len = Math.hypot(dx, dy);
    if (len < 1) return;
    const nx = dx / len, ny = dy / len;
    // 가이드 라인
    ctx.strokeStyle = 'rgba(255,255,255,.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(cue.x + nx * BALL_R, cue.y + ny * BALL_R);
    ctx.lineTo(cue.x + nx * 220, cue.y + ny * 220);
    ctx.stroke();
    ctx.setLineDash([]);

    // 큐 스틱
    const back = aiming ? power * 4 + 18 : 18;
    const tipX = cue.x - nx * (BALL_R + back);
    const tipY = cue.y - ny * (BALL_R + back);
    const endX = tipX - nx * 160;
    const endY = tipY - ny * 160;
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#d4a070';
    ctx.beginPath();
    ctx.moveTo(tipX, tipY); ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#5a3a1a';
    ctx.beginPath();
    ctx.moveTo(tipX + nx * 40, tipY + ny * 40); ctx.lineTo(endX, endY);
    ctx.stroke();
  }
}

function draw() {
  drawTable();
  balls.filter((b) => !b.pocketed).forEach(drawBall);
  drawAim();
}

function allStopped() {
  return balls.every((b) => b.pocketed || (Math.abs(b.vx) < MIN_SPEED && Math.abs(b.vy) < MIN_SPEED));
}

function step() {
  for (const b of balls) {
    if (b.pocketed) continue;
    b.x += b.vx; b.y += b.vy;
    b.vx *= FRICTION; b.vy *= FRICTION;
    if (Math.abs(b.vx) < MIN_SPEED) b.vx = 0;
    if (Math.abs(b.vy) < MIN_SPEED) b.vy = 0;

    // 벽 충돌
    if (b.x - BALL_R < RAIL) { b.x = RAIL + BALL_R; b.vx = -b.vx * 0.9; }
    if (b.x + BALL_R > W - RAIL) { b.x = W - RAIL - BALL_R; b.vx = -b.vx * 0.9; }
    if (b.y - BALL_R < RAIL) { b.y = RAIL + BALL_R; b.vy = -b.vy * 0.9; }
    if (b.y + BALL_R > H - RAIL) { b.y = H - RAIL - BALL_R; b.vy = -b.vy * 0.9; }

    // 포켓 빠짐
    for (const p of POCKETS) {
      if (Math.hypot(b.x - p.x, b.y - p.y) < POCKET_R - 4) {
        b.pocketed = true;
        b.vx = 0; b.vy = 0;
        handlePocket(b);
        break;
      }
    }
  }

  // 공 간 충돌
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i], b = balls[j];
      if (a.pocketed || b.pocketed) continue;
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      if (dist < BALL_R * 2 && dist > 0) {
        // 겹침 해소
        const overlap = (BALL_R * 2 - dist) / 2;
        const nx = dx / dist, ny = dy / dist;
        a.x -= nx * overlap; a.y -= ny * overlap;
        b.x += nx * overlap; b.y += ny * overlap;
        // 탄성 충돌 (같은 질량)
        const dvx = b.vx - a.vx, dvy = b.vy - a.vy;
        const dot = dvx * nx + dvy * ny;
        if (dot < 0) {
          a.vx += dot * nx; a.vy += dot * ny;
          b.vx -= dot * nx; b.vy -= dot * ny;
        }
      }
    }
  }
}

let scratched = false;
function handlePocket(b) {
  if (b.isCue) {
    scratched = true;
    return;
  }
  if (turn === 1) p1++;
  else p2++;
  updateHUD();
}

function loop() {
  if (!running) return;
  step();
  draw();
  if (allStopped() && isShooting) {
    isShooting = false;
    finishShot();
  }
  animId = requestAnimationFrame(loop);
}

function finishShot() {
  shots++;
  if (scratched) {
    // 큐볼 복귀
    const cue = balls[0];
    cue.pocketed = false;
    cue.x = W * 0.25;
    cue.y = H / 2;
    cue.vx = 0; cue.vy = 0;
    scratched = false;
    turn = turn === 1 ? 2 : 1;
  } else {
    // 점수를 안 냈으면 차례 넘김 (간단 룰)
    // shotScored 변수 사용해도 되지만, 단순화: 매 샷마다 차례 넘김
    turn = turn === 1 ? 2 : 1;
  }
  updateHUD();
  checkWin();
}

function checkWin() {
  if (p1 >= 5) end(1);
  else if (p2 >= 5) end(2);
}

function end(winner) {
  running = false;
  cancelAnimationFrame(animId);
  ovT.textContent = `플레이어 ${winner} 승리!`;
  ovP.textContent = `최종 점수: P1 ${p1} : ${p2} P2 · 샷 수 ${shots}`;
  startBtn.textContent = '↻ 다시 시작';
  overlay.classList.remove('hidden');
}

cvs.addEventListener('mousemove', (e) => {
  const r = cvs.getBoundingClientRect();
  mouseX = ((e.clientX - r.left) / r.width) * W;
  mouseY = ((e.clientY - r.top) / r.height) * H;
  if (aiming) {
    const cue = balls[0];
    const dx = aimX - mouseX, dy = aimY - mouseY;
    power = Math.min(MAX_POWER, Math.hypot(dx, dy) / 12);
    powerEl.style.width = (power / MAX_POWER * 100) + '%';
  }
});

cvs.addEventListener('mousedown', (e) => {
  if (!running || !allStopped() || isShooting) return;
  const r = cvs.getBoundingClientRect();
  aimX = ((e.clientX - r.left) / r.width) * W;
  aimY = ((e.clientY - r.top) / r.height) * H;
  aiming = true;
});

cvs.addEventListener('mouseup', () => {
  if (!aiming) return;
  aiming = false;
  const cue = balls[0];
  const dx = mouseX - cue.x, dy = mouseY - cue.y;
  const len = Math.hypot(dx, dy);
  if (len < 1 || power < 0.5) {
    power = 0;
    powerEl.style.width = '0%';
    return;
  }
  const nx = dx / len, ny = dy / len;
  cue.vx = nx * power;
  cue.vy = ny * power;
  isShooting = true;
  power = 0;
  powerEl.style.width = '0%';
});

cvs.addEventListener('mouseleave', () => {
  if (aiming) { aiming = false; power = 0; powerEl.style.width = '0%'; }
});

// 터치
cvs.addEventListener('touchstart', (e) => {
  if (!running || !allStopped() || isShooting) return;
  const r = cvs.getBoundingClientRect();
  const t = e.touches[0];
  aimX = ((t.clientX - r.left) / r.width) * W;
  aimY = ((t.clientY - r.top) / r.height) * H;
  mouseX = aimX; mouseY = aimY;
  aiming = true;
  e.preventDefault();
}, { passive: false });

cvs.addEventListener('touchmove', (e) => {
  const r = cvs.getBoundingClientRect();
  const t = e.touches[0];
  mouseX = ((t.clientX - r.left) / r.width) * W;
  mouseY = ((t.clientY - r.top) / r.height) * H;
  if (aiming) {
    const dx = aimX - mouseX, dy = aimY - mouseY;
    power = Math.min(MAX_POWER, Math.hypot(dx, dy) / 12);
    powerEl.style.width = (power / MAX_POWER * 100) + '%';
  }
  e.preventDefault();
}, { passive: false });

cvs.addEventListener('touchend', () => {
  if (!aiming) return;
  aiming = false;
  const cue = balls[0];
  const dx = mouseX - cue.x, dy = mouseY - cue.y;
  const len = Math.hypot(dx, dy);
  if (len < 1 || power < 0.5) {
    power = 0; powerEl.style.width = '0%'; return;
  }
  const nx = dx / len, ny = dy / len;
  cue.vx = nx * power;
  cue.vy = ny * power;
  isShooting = true;
  power = 0;
  powerEl.style.width = '0%';
});

startBtn.addEventListener('click', start);
resetBtn.addEventListener('click', start);

setup();
draw();
