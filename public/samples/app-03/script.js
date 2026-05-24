const CATS = [
  { name: '식비',     ic: '🍔', color: '#ff8a5c', pct: 78, amt: 320000 },
  { name: '교통',     ic: '🚌', color: '#5a4fff', pct: 42, amt: 86000 },
  { name: '쇼핑',     ic: '🛍️', color: '#ff5c7a', pct: 65, amt: 190000 },
  { name: '카페',     ic: '☕', color: '#a07a4f', pct: 38, amt: 64000 },
  { name: '주거',     ic: '🏠', color: '#2ec98f', pct: 90, amt: 480000 },
];

const TX = [
  { name: '스타벅스 강남R점',  meta: '카페 · 14:08',  amt: -6500,    ic: '☕' },
  { name: '엄마',              meta: '송금 · 12:30',  amt: 200000,   ic: '🙋‍♀️' },
  { name: 'GS25 망원',         meta: '편의점 · 11:02', amt: -8200,    ic: '🏪' },
  { name: '쿠팡',             meta: '쇼핑 · 어제',    amt: -42900,   ic: '📦' },
  { name: '월급',              meta: '입금 · 어제',    amt: 3200000,  ic: '💰' },
  { name: 'CGV 용산',          meta: '문화 · 5/22',    amt: -28000,   ic: '🎬' },
];

const catsEl = document.getElementById('cats');
const txEl = document.getElementById('tx');

CATS.forEach((c) => {
  const el = document.createElement('div');
  el.className = 'cat';
  el.innerHTML = `
    <div class="cat-ic" style="background:${c.color}22;color:${c.color}">${c.ic}</div>
    <div class="cat-info">
      <div class="cat-name">${c.name}</div>
      <div class="cat-bar"><i style="background:${c.color};width:0%"></i></div>
    </div>
    <div class="cat-amount">${c.amt.toLocaleString('ko-KR')}원</div>
  `;
  catsEl.appendChild(el);
  setTimeout(() => { el.querySelector('i').style.width = c.pct + '%'; }, 100);
});

TX.forEach((t) => {
  const li = document.createElement('li');
  const cls = t.amt < 0 ? 'out' : 'in';
  const sign = t.amt < 0 ? '-' : '+';
  li.innerHTML = `
    <div class="ic">${t.ic}</div>
    <div class="who">
      <div class="name">${t.name}</div>
      <div class="meta">${t.meta}</div>
    </div>
    <div class="amt ${cls}">${sign}${Math.abs(t.amt).toLocaleString('ko-KR')}원</div>
  `;
  txEl.appendChild(li);
});

// 총자산 카운트업
const total = document.getElementById('total');
const final = 4283500;
let n = 0;
const step = final / 60;
const t = setInterval(() => {
  n += step;
  if (n >= final) { n = final; clearInterval(t); }
  total.textContent = '₩ ' + Math.floor(n).toLocaleString('ko-KR');
}, 18);

// 탭 전환
document.querySelectorAll('.tabbar .tab').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.tabbar .tab').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
  });
});
