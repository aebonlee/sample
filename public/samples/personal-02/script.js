// 스킬 바 등장 애니메이션
window.addEventListener('load', () => {
  document.querySelectorAll('.bar i').forEach((el) => {
    const w = el.style.width;
    el.style.width = '0';
    requestAnimationFrame(() => { el.style.width = w; });
  });
});

// PDF 저장(브라우저 인쇄 다이얼로그)
document.getElementById('printBtn').addEventListener('click', () => window.print());
