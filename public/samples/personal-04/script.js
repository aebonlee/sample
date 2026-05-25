// ============ Theme Toggle ============
const THEME_KEY = 'personal-04-theme';
const themeToggle = document.getElementById('themeToggle');
const saved = localStorage.getItem(THEME_KEY);
const initial = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', initial);
themeToggle?.addEventListener('click', () => {
  const now = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', now);
  localStorage.setItem(THEME_KEY, now);
});

// ============ Navbar scroll style ============
const navbar = document.getElementById('navbar');
function onScroll() {
  navbar?.classList.toggle('scrolled', window.scrollY > 12);
  const top = document.getElementById('backToTop');
  top?.classList.toggle('visible', window.scrollY > 600);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ============ Back to top ============
document.getElementById('backToTop')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============ IntersectionObserver — fade-up reveal ============
const reveal = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      reveal.unobserve(entry.target);
    }
  });
}, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-up').forEach((el) => reveal.observe(el));

// ============ Stat counter animation ============
const counter = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.target || 0);
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counter.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-number').forEach((el) => counter.observe(el));

// ============ Smooth anchor scroll w/ offset ============
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = 68;
    const y = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

// ============ Section spy — active nav link ============
const sections = ['about', 'career', 'strengths', 'skills', 'activities', 'contact']
  .map((id) => document.getElementById(id))
  .filter(Boolean);
const links = Array.from(document.querySelectorAll('.nav-links > a'));
const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach((s) => spy.observe(s));
