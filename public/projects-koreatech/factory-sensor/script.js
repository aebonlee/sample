let window_ = [];
let history = []; // {t, v, anomaly}
let streak = 0;
let timer = null;
let log = [];
let injectCount = 0;
const W_SIZE = 20;
const Z_THRESHOLD = 2.5;

function mean(arr) { return arr.reduce((s,v)=>s+v,0)/arr.length; }
function stdev(arr) { const m=mean(arr); return Math.sqrt(arr.reduce((s,v)=>s+(v-m)**2,0)/arr.length); }

function tick() {
  let v;
  if (injectCount > 0) {
    v = 88 + Math.random() * 7; // 이상치
    injectCount--;
  } else {
    v = 72 + Math.random() * 4 - 2; // 정상 ~72°C
  }
  let anomaly = false, z = 0;
  if (window_.length >= 5) {
    const mu = mean(window_);
    const sd = stdev(window_) || 1;
    z = Math.abs(v - mu) / sd;
    document.getElementById("mu").textContent = mu.toFixed(2);
    document.getElementById("sd").textContent = sd.toFixed(2);
    document.getElementById("zscore").textContent = z.toFixed(2);
    if (z > Z_THRESHOLD) {
      anomaly = true; streak++;
      let msg = `⚠ 이상치 Z=${z.toFixed(2)} | 측정값 ${v.toFixed(1)}°C | 연속 ${streak}회`;
      if (streak >= 3) msg += " → 🔧 예측 정비 필요!";
      log.unshift(msg);
    } else {
      streak = 0;
      window_.push(v);
      if (window_.length > W_SIZE) window_.shift();
    }
  } else {
    window_.push(v);
  }
  document.getElementById("streak").textContent = streak;
  history.push({ t: history.length, v, anomaly });
  if (history.length > 80) history.shift();
  render();
}

function render() {
  const svg = document.getElementById("chart");
  const W = 940, H = 220, PAD = 30;
  const minV = 65, maxV = 100;
  const xs = (i, n) => PAD + (W - PAD - 10) * i / Math.max(n - 1, 1);
  const ys = v => PAD + (H - PAD * 2) * (1 - (v - minV) / (maxV - minV));
  let g = `<g font-family="monospace" font-size="10" fill="#64748b">`;
  for (let i = 0; i <= 4; i++) {
    const v = minV + (maxV - minV) * i / 4;
    const y = ys(v);
    g += `<line x1="${PAD}" y1="${y}" x2="${W - 10}" y2="${y}" stroke="#1e293b"/>`;
    g += `<text x="${PAD - 4}" y="${y + 3}" text-anchor="end">${v.toFixed(0)}</text>`;
  }
  g += `</g>`;
  if (history.length > 1) {
    const pts = history.map((p, i) => `${xs(i, history.length)},${ys(p.v)}`).join(" ");
    g += `<polyline fill="none" stroke="#22d3ee" stroke-width="1.5" points="${pts}"/>`;
    history.forEach((p, i) => {
      if (p.anomaly) g += `<circle cx="${xs(i, history.length)}" cy="${ys(p.v)}" r="4" fill="#ef4444"/>`;
    });
  }
  svg.innerHTML = g;
  document.getElementById("log").textContent = log.slice(0, 14).join("\n") || "[정상] 수집 중...";
}

function toggle() {
  if (timer) { clearInterval(timer); timer = null; document.getElementById("startBtn").textContent = "▶ 시작"; }
  else { timer = setInterval(tick, 400); document.getElementById("startBtn").textContent = "■ 정지"; }
}
function injectFault() { injectCount = 4; log.unshift("[주입] 이상치 4회 발생 예약"); render(); }
function reset() { window_ = []; history = []; streak = 0; log = []; injectCount = 0;
  ["mu","sd","zscore"].forEach(id => document.getElementById(id).textContent = "—");
  document.getElementById("streak").textContent = 0;
  render();
}
// 초기 데이터
for (let i = 0; i < 12; i++) tick();
