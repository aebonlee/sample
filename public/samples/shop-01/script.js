// 갤러리 썸네일 → 메인 이미지 교체
const mainImg = document.getElementById('mainImg');
document.querySelectorAll('.gallery__thumbs button').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.gallery__thumbs button').forEach((x) => x.classList.remove('is-on'));
    b.classList.add('is-on');
    mainImg.style.background = b.dataset.bg;
  });
});

// 옵션 칩 단일 선택
document.querySelectorAll('.chips').forEach((g) => {
  g.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    g.querySelectorAll('button').forEach((b) => b.classList.remove('is-on'));
    btn.classList.add('is-on');
  });
});

// 수량
const qty = document.getElementById('qty');
document.getElementById('minus').addEventListener('click', () => {
  const v = Math.max(1, Number(qty.value) - 1);
  qty.value = v;
});
document.getElementById('plus').addEventListener('click', () => {
  qty.value = Number(qty.value) + 1;
});

// 찜
document.getElementById('wishBtn').addEventListener('click', (e) => {
  const b = e.currentTarget;
  b.classList.toggle('is-on');
  b.textContent = b.classList.contains('is-on') ? '♥ 찜됨' : '♡ 찜';
});

// 장바구니
let cart = Number(localStorage.getItem('shop01-cart') || '0');
const $count = document.getElementById('cartCount');
const $toast = document.getElementById('toast');
function updateCart() {
  $count.textContent = cart;
  localStorage.setItem('shop01-cart', String(cart));
}
updateCart();

document.getElementById('addCart').addEventListener('click', () => {
  cart += Number(qty.value);
  updateCart();
  $toast.hidden = false;
  $toast.style.animation = 'none';
  requestAnimationFrame(() => { $toast.style.animation = ''; });
  clearTimeout(window.__t);
  window.__t = setTimeout(() => { $toast.hidden = true; }, 2200);
});
