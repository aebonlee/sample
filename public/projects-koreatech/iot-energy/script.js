const baselines = {
  "공학관": { 0:80, 3:60, 6:120, 9:320, 12:280, 15:340, 18:200, 21:130, 22:90 },
  "기숙사": { 0:250, 3:160, 6:140, 9:80, 12:110, 15:100, 18:220, 21:260, 22:280 },
  "정보관": { 0:70, 3:50, 6:100, 9:410, 12:360, 15:420, 18:240, 21:120, 22:80 },
};
const colors = { "공학관": "#22d3ee", "기숙사": "#fbbf24", "정보관": "#a78bfa" };
const THRESHOLD = 0.30;
let log = [];
let readings = { "공학관": [], "기숙사": [], "정보관": [] };

function check() {
  const b = document.getElementById("b").value;
  const h = parseInt(document.getElementById("h").value, 10);
  const v = parseFloat(document.getElementById("v").value);
  const baseH = Object.keys(baselines[b]).map(Number).reduce((a,c) => Math.abs(c-h) < Math.abs(a-h) ? c : a);
  const base = baselines[b][baseH];
  const diff = (v - base) / base;
  let msg;
  if (diff > THRESHOLD) msg = `⚠ [${b}] ${h}시 ${v}kW (베이스 ${base}, +${(diff*100).toFixed(0)}%) 이상치 감지`;
  else if (diff < -THRESHOLD) msg = `💡 [${b}] ${h}시 ${v}kW (베이스 ${base}, ${(diff*100).toFixed(0)}%) 절감 우수`;
  else msg = `✓ [${b}] ${h}시 ${v}kW (베이스 ${base}, ${(diff*100).toFixed(0)}%) 정상`;
  log.unshift(msg);
  readings[b].push({ h, v });
  render();
}
function resetChart() { log = []; readings = { "공학관": [], "기숙사": [], "정보관": [] }; render(); }

function render() {
  const svg = document.getElementById("chart");
  const W = 940, H = 280, PAD = 36;
  const maxKW = 500;
  let g = `<g font-family="monospace" font-size="10" fill="#64748b">`;
  // 격자
  for (let i = 0; i <= 5; i++) {
    const y = PAD + (H - PAD * 2) * i / 5;
    const v = maxKW * (5 - i) / 5;
    g += `<line x1="${PAD}" y1="${y}" x2="${W - 10}" y2="${y}" stroke="#1e293b"/>`;
    g += `<text x="${PAD - 6}" y="${y + 3}" text-anchor="end">${v}</text>`;
  }
  for (let h = 0; h <= 24; h += 3) {
    const x = PAD + (W - PAD - 10) * h / 24;
    g += `<text x="${x}" y="${H - 8}" text-anchor="middle">${h}h</text>`;
  }
  g += "</g>";

  // 베이스라인 라인 + 측정 포인트
  Object.entries(baselines).forEach(([b, base]) => {
    const c = colors[b];
    const hours = Object.keys(base).map(Number).sort((a,b)=>a-b);
    const pts = hours.map(h => {
      const x = PAD + (W - PAD - 10) * h / 24;
      const y = PAD + (H - PAD * 2) * (1 - base[h] / maxKW);
      return [x, y];
    });
    g += `<polyline fill="none" stroke="${c}" stroke-width="2" opacity="0.55" stroke-dasharray="4 3"
            points="${pts.map(p => p.join(",")).join(" ")}"/>`;
    // 측정 포인트
    readings[b].forEach(r => {
      const x = PAD + (W - PAD - 10) * r.h / 24;
      const y = PAD + (H - PAD * 2) * (1 - r.v / maxKW);
      g += `<circle cx="${x}" cy="${y}" r="4" fill="${c}"/>`;
    });
  });
  svg.innerHTML = g;

  document.getElementById("log").textContent = log.slice(0, 12).join("\n");
}

// 초기 시드
[["공학관",22,180],["기숙사",22,290],["정보관",9,410]].forEach(([b,h,v]) => {
  document.getElementById("b").value = b;
  document.getElementById("h").value = h;
  document.getElementById("v").value = v;
  check();
});
