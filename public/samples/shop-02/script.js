const PRODS = [
  { id: 1,  cat: '아우터',     brand: 'BLOOM', name: '오버사이즈 트렌치 코트',  price: 189000, sale: 0,  like: 248, c: ['#ccaa88'], grad: 'linear-gradient(135deg,#d6c0a5,#7a5e44)', new: true },
  { id: 2,  cat: '상의',       brand: 'BLOOM', name: '코튼 라운드 니트',      price:  59000, sale: 20, like: 412, c: ['#fff','#111'], grad: 'linear-gradient(135deg,#f4f4f4,#dadada)' },
  { id: 3,  cat: '하의',       brand: 'AIR',   name: '와이드 데님 팬츠',      price:  79000, sale: 0,  like: 188, c: ['#506a8e'], grad: 'linear-gradient(135deg,#7891b3,#3b4f6b)' },
  { id: 4,  cat: '원피스',     brand: 'BLOOM', name: '플로럴 미디 원피스',    price: 129000, sale: 15, like: 312, c: ['#a05050'], grad: 'linear-gradient(135deg,#d8a4a4,#7a3434)', new: true },
  { id: 5,  cat: '액세서리',   brand: 'AIR',   name: '레더 크로스백',          price:  98000, sale: 0,  like: 502, c: ['#111'],   grad: 'linear-gradient(135deg,#2a2a2a,#000)' },
  { id: 6,  cat: '상의',       brand: 'BLOOM', name: '오버핏 셔츠',           price:  49000, sale: 30, like: 156, c: ['#fff'],   grad: 'linear-gradient(135deg,#f7f5f0,#d6d0c4)' },
  { id: 7,  cat: '아우터',     brand: 'BLOOM', name: '미니멀 블레이저',       price: 159000, sale: 0,  like: 89,  c: ['#111'],   grad: 'linear-gradient(135deg,#3a3a3a,#000)' },
  { id: 8,  cat: '하의',       brand: 'AIR',   name: '플리츠 스커트',         price:  65000, sale: 10, like: 220, c: ['#6b8e6b'], grad: 'linear-gradient(135deg,#94b294,#4a6f4a)' },
  { id: 9,  cat: '액세서리',   brand: 'BLOOM', name: '울 베레모',             price:  29000, sale: 0,  like: 134, c: ['#a05050'], grad: 'linear-gradient(135deg,#b56666,#5e2a2a)' },
  { id: 10, cat: '원피스',     brand: 'AIR',   name: '슬립 롱 원피스',        price: 109000, sale: 0,  like: 298, c: ['#111'],   grad: 'linear-gradient(135deg,#2a2a3a,#0a0a14)', new: true },
  { id: 11, cat: '상의',       brand: 'BLOOM', name: '크롭 후디',             price:  69000, sale: 25, like: 367, c: ['#ccaa88'], grad: 'linear-gradient(135deg,#d6c0a5,#a08560)' },
  { id: 12, cat: '하의',       brand: 'BLOOM', name: '슬랙스 와이드',         price:  79000, sale: 0,  like: 78,  c: ['#111'],   grad: 'linear-gradient(135deg,#1a1a1a,#000)' },
];

const state = { cats: new Set(), colors: new Set(), price: 'all', sort: 'new' };
const grid = document.getElementById('grid');
const empty = document.getElementById('empty');
const count = document.getElementById('count');
const cartEl = document.getElementById('cart');
const toast = document.getElementById('toast');
let cart = 0;
const liked = new Set();

function priceFmt(p) { return p.toLocaleString('ko-KR'); }
function inPrice(p) {
  if (state.price === 'all') return true;
  if (state.price === '0-50') return p < 50000;
  if (state.price === '50-100') return p >= 50000 && p < 100000;
  if (state.price === '100-') return p >= 100000;
}
function sorter(a, b) {
  if (state.sort === 'low') return a.price - b.price;
  if (state.sort === 'high') return b.price - a.price;
  if (state.sort === 'like') return b.like - a.like;
  return b.id - a.id;
}

function render() {
  const list = PRODS
    .filter((p) => !state.cats.size || state.cats.has(p.cat))
    .filter((p) => !state.colors.size || p.c.some((c) => state.colors.has(c)))
    .filter((p) => inPrice(p.price))
    .sort(sorter);

  count.textContent = list.length;
  empty.hidden = list.length !== 0;
  grid.innerHTML = '';
  list.forEach((p) => {
    const final = p.sale ? Math.round(p.price * (1 - p.sale / 100)) : p.price;
    const card = document.createElement('article');
    card.className = 'card' + (liked.has(p.id) ? ' liked' : '');
    card.innerHTML = `
      <div class="thumb" style="background:${p.grad}">
        ${p.new ? '<span class="badge">NEW</span>' : ''}
        ${p.sale ? `<span class="badge sale">${p.sale}%</span>` : ''}
        <button class="like" aria-label="찜">♥</button>
      </div>
      <p class="brand-row">${p.brand}</p>
      <h3>${p.name}</h3>
      <div class="price">
        ${p.sale ? `<span class="off">${p.sale}%</span><del>${priceFmt(p.price)}</del><b>${priceFmt(final)}원</b>` : `<b>${priceFmt(p.price)}원</b>`}
      </div>
    `;
    card.querySelector('.like').addEventListener('click', (e) => {
      e.stopPropagation();
      liked.has(p.id) ? liked.delete(p.id) : liked.add(p.id);
      card.classList.toggle('liked');
    });
    card.addEventListener('click', () => {
      cart++; cartEl.textContent = cart;
      toast.classList.add('show');
      clearTimeout(window._t); window._t = setTimeout(() => toast.classList.remove('show'), 1500);
    });
    grid.appendChild(card);
  });
}

document.querySelectorAll('[data-f="cat"]').forEach((cb) => {
  cb.addEventListener('change', () => {
    cb.checked ? state.cats.add(cb.value) : state.cats.delete(cb.value);
    render();
  });
});
document.querySelectorAll('input[name="price"]').forEach((r) => {
  r.addEventListener('change', () => { state.price = r.value; render(); });
});
document.querySelectorAll('.color').forEach((b) => {
  b.addEventListener('click', () => {
    const c = b.dataset.c;
    if (state.colors.has(c)) { state.colors.delete(c); b.classList.remove('active'); }
    else { state.colors.add(c); b.classList.add('active'); }
    render();
  });
});
document.getElementById('sort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
document.getElementById('resetBtn').addEventListener('click', () => {
  state.cats.clear(); state.colors.clear(); state.price = 'all'; state.sort = 'new';
  document.querySelectorAll('input[type="checkbox"]').forEach((cb) => cb.checked = false);
  document.querySelector('input[name="price"][value="all"]').checked = true;
  document.querySelectorAll('.color').forEach((b) => b.classList.remove('active'));
  document.getElementById('sort').value = 'new';
  render();
});

render();
