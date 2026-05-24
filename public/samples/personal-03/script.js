const KEY = 'personal03';

let clicks = parseInt(localStorage.getItem(KEY + ':clicks') || '0', 10);
const clicksEl = document.getElementById('clicks');
clicksEl.textContent = clicks.toLocaleString('ko-KR');

document.querySelectorAll('.lk').forEach((lk) => {
  lk.addEventListener('click', (e) => {
    e.preventDefault();
    clicks++;
    localStorage.setItem(KEY + ':clicks', clicks);
    clicksEl.textContent = clicks.toLocaleString('ko-KR');
    // 클릭 피드백
    lk.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(.96)' }, { transform: 'scale(1)' }],
      { duration: 220 }
    );
  });
});

// 테마 토글
const themeBtn = document.getElementById('themeBtn');
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
  localStorage.setItem(KEY + ':theme', t);
}
setTheme(localStorage.getItem(KEY + ':theme') || 'light');
themeBtn.addEventListener('click', () => {
  setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});
