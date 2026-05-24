const IMAGES = [
  { id: 1,  cat: 'city',     title: '청계천, 5월의 저녁',         grad: 'linear-gradient(180deg, #4a5a7a 0%, #1a1f30 100%)', ar: '3/4' },
  { id: 2,  cat: 'portrait', title: '윤하, 스튜디오',             grad: 'linear-gradient(135deg, #d2b495 0%, #5a4030 100%)', ar: '4/5' },
  { id: 3,  cat: 'nature',   title: '제주, 비양도',               grad: 'linear-gradient(180deg, #b8d5dd 0%, #4a7889 100%)', ar: '4/3' },
  { id: 4,  cat: 'travel',   title: '교토, 료안지의 오후',         grad: 'linear-gradient(140deg, #c8a878 0%, #5a4525 100%)', ar: '3/4' },
  { id: 5,  cat: 'city',     title: '서울로7017',                 grad: 'linear-gradient(180deg, #d5cabb 0%, #6f5e4a 100%)', ar: '4/5' },
  { id: 6,  cat: 'portrait', title: '지훈, 광교호수',             grad: 'linear-gradient(135deg, #aaa098 0%, #2a2823 100%)', ar: '3/4' },
  { id: 7,  cat: 'nature',   title: '오대산, 새벽',                grad: 'linear-gradient(180deg, #4a5d49 0%, #1a2519 100%)', ar: '4/3' },
  { id: 8,  cat: 'travel',   title: '리스본, 알파마 골목',         grad: 'linear-gradient(170deg, #f0d8a8 0%, #8a5a3a 100%)', ar: '4/5' },
  { id: 9,  cat: 'city',     title: '망원동, 골목',               grad: 'linear-gradient(180deg, #c5b8a8 0%, #4f4538 100%)', ar: '3/4' },
  { id: 10, cat: 'portrait', title: '엄마, 부엌',                 grad: 'linear-gradient(150deg, #e8c8a0 0%, #6f4a30 100%)', ar: '4/5' },
  { id: 11, cat: 'nature',   title: '한강, 일출',                  grad: 'linear-gradient(180deg, #f7c9a0 0%, #6f4a78 100%)', ar: '4/3' },
  { id: 12, cat: 'travel',   title: '하노이, 호안끼엠 호수',       grad: 'linear-gradient(170deg, #98c0a8 0%, #2a4530 100%)', ar: '3/4' },
];

const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lbInner = document.getElementById('lbInner');
let filter = 'all';

function render() {
  gallery.innerHTML = '';
  IMAGES.filter((i) => filter === 'all' || i.cat === filter).forEach((i) => {
    const el = document.createElement('figure');
    el.className = 'tile';
    el.innerHTML = `
      <div class="img" style="background:${i.grad};aspect-ratio:${i.ar}"></div>
      <figcaption class="cap">${i.title}</figcaption>
    `;
    el.addEventListener('click', () => openLb(i));
    gallery.appendChild(el);
  });
}

function openLb(i) {
  lbInner.style.background = i.grad;
  lightbox.hidden = false;
}

document.querySelector('.close').addEventListener('click', () => lightbox.hidden = true);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.hidden = true; });

document.querySelectorAll('.f').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.f').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    filter = b.dataset.f;
    render();
  });
});

render();
