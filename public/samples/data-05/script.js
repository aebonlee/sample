// 링 애니메이션
const ring = document.getElementById('ring');
const ringPct = document.getElementById('ringPct');
const target = 0.69;
let pct = 0;
const ringTimer = setInterval(() => {
  pct += 0.015;
  if (pct >= target) { pct = target; clearInterval(ringTimer); }
  ring.style.strokeDashoffset = 276 * (1 - pct);
  ringPct.textContent = Math.round(pct * 100) + '%';
}, 25);

// 카운트업
function count(el, final, opts = {}) {
  let n = 0;
  const step = final / 60;
  const t = setInterval(() => {
    n += step;
    if (n >= final) { n = final; clearInterval(t); }
    el.textContent = Math.floor(n).toLocaleString('ko-KR');
  }, 18);
}
count(document.getElementById('hr'), 72);
count(document.getElementById('steps'), 6860);
count(document.getElementById('cal'), 1148);

// 심박 라인 차트 (작은 spark)
const hrData = Array.from({ length: 30 }, () => 65 + Math.random() * 15);
new Chart(document.getElementById('hrChart'), {
  type: 'line',
  data: { labels: hrData.map((_, i) => i), datasets: [{ data: hrData, borderColor: '#ef4444', borderWidth: 1.5, tension: .4, pointRadius: 0, fill: true, backgroundColor: 'rgba(239,68,68,.08)' }] },
  options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } },
});

// 수면 차트
new Chart(document.getElementById('sleepChart'), {
  type: 'bar',
  data: {
    labels: ['월', '화', '수', '목', '금', '토', '일'],
    datasets: [
      { label: '깊은 수면', data: [2.1, 1.8, 2.4, 2.0, 2.6, 3.0, 2.8], backgroundColor: '#0f766e', stack: 's' },
      { label: '얕은 수면', data: [4.5, 4.0, 4.8, 5.2, 4.4, 5.5, 4.8], backgroundColor: '#5eead4', stack: 's' },
    ],
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
    scales: {
      y: { stacked: true, grid: { color: '#eef0f7' }, ticks: { callback: (v) => v + 'h' } },
      x: { stacked: true, grid: { display: false } },
    },
  },
});

// 혈압 차트
const days = Array.from({ length: 30 }, (_, i) => i + 1);
const sys = days.map(() => 115 + Math.random() * 12);
const dia = days.map(() => 72 + Math.random() * 10);

new Chart(document.getElementById('bpChart'), {
  type: 'line',
  data: {
    labels: days,
    datasets: [
      { label: '수축기', data: sys, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.06)', tension: .4, fill: true, pointRadius: 0 },
      { label: '이완기', data: dia, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.06)', tension: .4, fill: true, pointRadius: 0 },
    ],
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
    scales: {
      y: { min: 60, max: 140, grid: { color: '#eef0f7' } },
      x: { grid: { display: false }, ticks: { autoSkip: true, maxTicksLimit: 8 } },
    },
  },
});
