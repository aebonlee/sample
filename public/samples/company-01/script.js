document.getElementById('year').textContent = new Date().getFullYear();

// 헤더에 스크롤 그림자 효과
const nav = document.querySelector('.nav');
let lastScrolled = false;
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 4;
  if (scrolled !== lastScrolled) {
    nav.style.boxShadow = scrolled ? '0 4px 16px rgba(15,23,42,.06)' : 'none';
    lastScrolled = scrolled;
  }
}, { passive: true });
