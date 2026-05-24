// KPI 카운트업
document.querySelectorAll('.kpi h2').forEach((el) => {
  const v = parseFloat(el.dataset.v);
  const cur = el.dataset.cur === '1';
  const suf = el.dataset.suffix || '';
  let n = 0;
  const step = v / 60;
  const isFloat = !Number.isInteger(v) && !cur;
  const t = setInterval(() => {
    n += step;
    if (n >= v) { n = v; clearInterval(t); }
    if (cur) {
      el.textContent = '₩ ' + Math.floor(n).toLocaleString('ko-KR');
    } else {
      el.textContent = (isFloat ? n.toFixed(1) : Math.floor(n).toLocaleString('ko-KR')) + suf;
    }
  }, 18);
});

// 매출 추이 차트
const labels = ['1주', '2주', '3주', '4주'];
const data = [28, 42, 35, 19.8];

new Chart(document.getElementById('revenueChart'), {
  type: 'bar',
  data: {
    labels,
    datasets: [{
      label: '매출 (백만원)',
      data,
      backgroundColor: ['rgba(88,71,255,.7)', 'rgba(0,185,163,.7)', 'rgba(251,146,60,.7)', 'rgba(34,197,94,.7)'],
      borderRadius: 6,
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: '#eef0f7' }, ticks: { callback: (v) => v + 'M' } },
      x: { grid: { display: false } },
    },
  },
});
