// 통계 카운트업
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const final = parseFloat(el.dataset.v);
    const suf = el.dataset.s || '';
    let n = 0; const step = final / 60;
    const t = setInterval(() => {
      n += step;
      if (n >= final) { n = final; clearInterval(t); }
      el.textContent = Math.floor(n) + suf;
    }, 18);
    io.unobserve(el);
  });
}, { threshold: .5 });
document.querySelectorAll('.st b').forEach((el) => io.observe(el));

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

// 폼
document.getElementById('form').addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('ok').hidden = false;
  e.target.reset();
});
