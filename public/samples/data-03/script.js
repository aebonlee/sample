// 라이브 시간 표시
function updateLive() {
  const d = new Date();
  document.getElementById('live').textContent = d.toLocaleTimeString('ko-KR') + ' 기준';
}
updateLive();
setInterval(updateLive, 1000);

// KPI 카운트업
document.querySelectorAll('.kpi h2').forEach((el) => {
  const v = el.dataset.v;
  const text = el.dataset.text === '1';
  const suffix = el.dataset.suffix || '';
  if (text) { el.textContent = v; return; }
  const final = parseFloat(v);
  let n = 0; const step = final / 60;
  const isFloat = !Number.isInteger(final);
  const t = setInterval(() => {
    n += step;
    if (n >= final) { n = final; clearInterval(t); }
    el.textContent = (isFloat ? n.toFixed(1) : Math.floor(n).toLocaleString('ko-KR')) + suffix;
  }, 18);
});

// 트래픽 추이 (라인)
const labels = ['월', '화', '수', '목', '금', '토', '일'];
const visitors = [1320, 1480, 1690, 1820, 2050, 2280, 1842];
const views = [3850, 4120, 4830, 5420, 6020, 6840, 7835];

new Chart(document.getElementById('trafficChart'), {
  type: 'line',
  data: {
    labels,
    datasets: [
      { label: '방문자', data: visitors, borderColor: '#4c6fff', backgroundColor: 'rgba(76,111,255,.1)', tension: .4, fill: true, pointRadius: 4, pointHoverRadius: 6 },
      { label: '페이지뷰', data: views, borderColor: '#00b9a3', backgroundColor: 'rgba(0,185,163,.08)', tension: .4, fill: true, pointRadius: 4 },
    ],
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { grid: { color: '#eef0f7' } }, x: { grid: { display: false } } },
  },
});

// 채널 (도넛)
new Chart(document.getElementById('channelChart'), {
  type: 'doughnut',
  data: {
    labels: ['검색', '직접', '소셜', '리퍼럴', '광고'],
    datasets: [{
      data: [42, 28, 15, 9, 6],
      backgroundColor: ['#4c6fff', '#00b9a3', '#ff8b59', '#ff5599', '#a78bfa'],
      borderWidth: 0,
    }],
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    cutout: '60%',
    plugins: { legend: { position: 'bottom', labels: { padding: 14, font: { size: 12 } } } },
  },
});
