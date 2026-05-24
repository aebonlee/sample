// 카운트업
function count(el, final, isFloat) {
  let n = 0;
  const step = final / 60;
  const t = setInterval(() => {
    n += step;
    if (n >= final) { n = final; clearInterval(t); }
    el.textContent = isFloat ? n.toFixed(1) : Math.floor(n).toLocaleString('ko-KR');
  }, 18);
}
count(document.getElementById('temp'), 23.5, true);
count(document.getElementById('hum'), 48);
count(document.getElementById('power'), 286);
count(document.getElementById('active'), 14);

// 방별 기기
const ROOMS = [
  {
    name: '거실',
    devs: [
      { name: '거실 메인 조명', sub: '70% 디밍', icon: '💡', on: true },
      { name: '에어컨', sub: '냉방 23°C', icon: '❄', on: true },
      { name: 'TV', sub: '꺼짐', icon: '📺', on: false },
      { name: '커튼', sub: '열림 80%', icon: '🪟', on: true },
    ],
  },
  {
    name: '안방',
    devs: [
      { name: '천장 조명', sub: '꺼짐', icon: '💡', on: false },
      { name: '에어컨', sub: '꺼짐', icon: '❄', on: false },
      { name: '공기청정기', sub: '자동 모드', icon: '🌬', on: true },
    ],
  },
  {
    name: '주방',
    devs: [
      { name: '주방 조명', sub: '켜짐', icon: '💡', on: true },
      { name: '냉장고', sub: '3°C / -19°C', icon: '🧊', on: true },
      { name: '식기세척기', sub: '대기 중', icon: '🍽', on: true },
    ],
  },
  {
    name: '서재',
    devs: [
      { name: '스탠드', sub: '책상 모드', icon: '💡', on: true },
      { name: '데스크탑', sub: '사용 중', icon: '🖥', on: true },
      { name: '공기청정기', sub: '꺼짐', icon: '🌬', on: false },
    ],
  },
];

const roomsEl = document.getElementById('rooms');
ROOMS.forEach((r) => {
  const onCount = r.devs.filter((d) => d.on).length;
  const el = document.createElement('div');
  el.className = 'room';
  el.innerHTML = `
    <header><h4>${r.name}</h4><span>${onCount} / ${r.devs.length} 활성</span></header>
    <div class="devices">${r.devs.map((d) => `
      <div class="dev ${d.on ? 'on' : 'off'}">
        <div class="ic">${d.icon}</div>
        <div class="name">${d.name}<span>${d.sub}</span></div>
        <label class="sw"><input type="checkbox" ${d.on ? 'checked' : ''}><i></i></label>
      </div>
    `).join('')}</div>
  `;
  // 토글 시 dev on/off 클래스 변경
  el.querySelectorAll('.dev').forEach((d) => {
    const cb = d.querySelector('input');
    cb.addEventListener('change', () => {
      d.classList.toggle('on', cb.checked);
      d.classList.toggle('off', !cb.checked);
    });
  });
  roomsEl.appendChild(el);
});

// 온도/습도 차트
const hours = Array.from({ length: 24 }, (_, i) => `${i}시`);
const temp = hours.map((_, i) => 22 + Math.sin((i / 24) * Math.PI * 2) * 2 + Math.random() * 0.5);
const hum = hours.map((_, i) => 50 + Math.cos((i / 24) * Math.PI * 2) * 8 + Math.random() * 2);

new Chart(document.getElementById('envChart'), {
  type: 'line',
  data: {
    labels: hours,
    datasets: [
      { label: '온도(°C)',  data: temp, borderColor: '#4287ff', backgroundColor: 'rgba(66,135,255,.08)', tension: .4, fill: true, pointRadius: 0, yAxisID: 'y' },
      { label: '습도(%)',  data: hum,  borderColor: '#8169ff', backgroundColor: 'rgba(129,105,255,.06)', tension: .4, fill: true, pointRadius: 0, yAxisID: 'y1' },
    ],
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y:  { position: 'left',  grid: { color: '#eef0f7' }, ticks: { callback: (v) => v + '°C' } },
      y1: { position: 'right', grid: { display: false },    ticks: { callback: (v) => v + '%' } },
      x:  { grid: { display: false } },
    },
  },
});

// 전력 차트
new Chart(document.getElementById('powerChart'), {
  type: 'bar',
  data: {
    labels: hours,
    datasets: [{
      data: hours.map(() => 2 + Math.random() * 8),
      backgroundColor: 'rgba(255,184,0,.7)',
      borderRadius: 4,
    }],
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: '#eef0f7' }, ticks: { callback: (v) => v + 'kW' } },
      x: { grid: { display: false }, ticks: { autoSkip: true, maxTicksLimit: 8 } },
    },
  },
});
