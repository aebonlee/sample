// 실시간 모니터링 — 1초마다 업데이트되는 가짜 데이터
Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = '#232838';
Chart.defaults.font.family = "ui-monospace, system-ui, sans-serif";

let paused = false;
document.getElementById('pauseBtn').addEventListener('click', (e) => {
  paused = !paused;
  e.currentTarget.textContent = paused ? '▶ 재개' : '⏸ 일시정지';
});

// 메인 라인 차트 (RPS)
const lineCtx = document.getElementById('lineChart').getContext('2d');
const lineData = Array.from({ length: 60 }, () => Math.round(280 + Math.random() * 80));
const labels = Array.from({ length: 60 }, (_, i) => `${59 - i}s`);

const lineChart = new Chart(lineCtx, {
  type: 'line',
  data: {
    labels,
    datasets: [{
      label: 'RPS',
      data: lineData,
      borderColor: '#60a5fa',
      backgroundColor: 'rgba(96,165,250,.14)',
      tension: 0.32, fill: true, pointRadius: 0, borderWidth: 2,
    }],
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    animation: { duration: 0 },
    scales: {
      y: { beginAtZero: false, grid: { color: '#1a1d2a' } },
      x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } },
    },
  },
});

// 스파크 차트 4개
function makeSpark(id, color) {
  const data = Array.from({ length: 30 }, () => Math.random() * 100);
  const ctx = document.getElementById(id).getContext('2d');
  const c = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(() => ''),
      datasets: [{
        data, borderColor: color, backgroundColor: color + '20',
        tension: 0.4, fill: true, pointRadius: 0, borderWidth: 1.5,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      animation: { duration: 0 },
      scales: { x: { display: false }, y: { display: false } },
    },
  });
  return { chart: c, data };
}
const sparks = {
  cpu: makeSpark('sparkCpu', '#22c55e'),
  mem: makeSpark('sparkMem', '#22c55e'),
  net: makeSpark('sparkNet', '#f59e0b'),
  res: makeSpark('sparkRes', '#22c55e'),
};

// 서버 목록
const SERVERS = [
  { name: 'api-1', region: '서울', load: 32 },
  { name: 'api-2', region: '서울', load: 28 },
  { name: 'api-3', region: '도쿄', load: 41 },
  { name: 'api-4', region: '도쿄', load: 35 },
  { name: 'web-1', region: '서울', load: 18 },
  { name: 'web-2', region: '싱가폴', load: 24 },
  { name: 'db-1', region: '서울', load: 56 },
  { name: 'cache-1', region: '서울', load: 12 },
];
function renderServers() {
  document.getElementById('servers').innerHTML = SERVERS.map((s) => {
    const c = s.load > 80 ? 'var(--danger)' : s.load > 60 ? 'var(--warn)' : 'var(--ok)';
    return `<li>
      <span class="dot dot--live" style="background: ${c}"></span>
      <strong>${s.name}</strong><em>${s.region}</em>
      <strong style="color: ${c}">${s.load}%</strong>
    </li>`;
  }).join('');
}
renderServers();

// 로그
const LOG_TEMPLATES = [
  ['ok', 'GET /api/users 200 (42ms)'],
  ['ok', 'POST /api/orders 201 (128ms)'],
  ['info', '캐시 적중률 92.4%'],
  ['ok', 'GET /api/products 200 (38ms)'],
  ['warn', '느린 쿼리 감지: SELECT * FROM logs (1.2s)'],
  ['info', '백그라운드 작업 큐 처리: 124건'],
  ['ok', 'DELETE /api/cart/2841 204 (24ms)'],
  ['err', '연결 시간 초과: payment-gateway'],
  ['ok', 'PUT /api/users/2841 200 (88ms)'],
  ['info', '신규 세션 생성: u_98212'],
];
const $logs = document.getElementById('logs');
const $logCount = document.getElementById('logCount');
let logCount = 0;
function addLog() {
  const [lv, msg] = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
  const time = new Date().toLocaleTimeString('ko-KR', { hour12: false });
  const li = document.createElement('li');
  li.innerHTML = `<time>${time}</time><span class="lv lv-${lv}">${lv.toUpperCase()}</span>${msg}`;
  $logs.prepend(li);
  if ($logs.children.length > 20) $logs.lastChild.remove();
  logCount++;
  $logCount.textContent = logCount + ' 줄';
}
// 초기 5건
for (let i = 0; i < 5; i++) addLog();

// 시계 + 1초 틱
function tick() {
  document.getElementById('now').textContent = new Date().toLocaleTimeString('ko-KR', { hour12: false });
  if (paused) return;

  // 메인 차트 시프트
  lineData.shift();
  lineData.push(Math.round(280 + Math.random() * 80 + Math.sin(Date.now() / 4000) * 40));
  lineChart.data.datasets[0].data = lineData;
  lineChart.update();

  // KPI
  const cpu = Math.round(28 + Math.random() * 18);
  const mem = Math.round(54 + Math.random() * 14);
  const net = (1.4 + Math.random() * 1.6).toFixed(1);
  const res = Math.round(28 + Math.random() * 32);
  document.getElementById('kpiCpu').textContent = cpu;
  document.getElementById('kpiMem').textContent = mem;
  document.getElementById('kpiNet').textContent = net;
  document.getElementById('kpiRes').textContent = res;

  // 스파크 시프트
  for (const [k, v] of Object.entries({ cpu, mem, net: Number(net) * 30, res })) {
    sparks[k].data.shift();
    sparks[k].data.push(v);
    sparks[k].chart.data.datasets[0].data = sparks[k].data;
    sparks[k].chart.update();
  }

  // 30% 확률로 로그 추가
  if (Math.random() < 0.45) addLog();
}
setInterval(tick, 1000);
tick();
