// 카운트다운 (7월 19일 17:00)
const target = new Date('2025-07-19T17:00:00+09:00').getTime();

function update() {
  const now = Date.now();
  let diff = target - now;
  if (diff < 0) diff = 0;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  document.getElementById('dd').textContent = String(d).padStart(2, '0');
  document.getElementById('hh').textContent = String(h).padStart(2, '0');
  document.getElementById('mm').textContent = String(m).padStart(2, '0');
  document.getElementById('ss').textContent = String(s).padStart(2, '0');
}
update();
setInterval(update, 1000);

// 부드러운 스크롤
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// 티켓 선택
document.querySelectorAll('.t button').forEach((b) => {
  b.addEventListener('click', (e) => {
    const name = e.target.closest('.t').querySelector('h3').textContent;
    alert(`"${name}" 선택됨\n실제 환경에서는 결제 페이지로 이동합니다.`);
  });
});
