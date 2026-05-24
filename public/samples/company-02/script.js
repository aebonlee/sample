// 메뉴 담기
document.querySelectorAll('.add').forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.textContent = '담음';
    btn.classList.add('added');
    setTimeout(() => { btn.textContent = '담기'; btn.classList.remove('added'); }, 1500);
  });
});

// 부드러운 스크롤
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// 예약 폼
document.getElementById('reserveForm').addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('ok').hidden = false;
  e.target.reset();
});
