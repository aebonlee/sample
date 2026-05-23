// 부드러운 앵커 스크롤, KPI 카운트업, FAQ 섹션 동적 추가, 가격 토글
document.getElementById('year').textContent = new Date().getFullYear();

// 부드러운 스크롤(앵커)
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// 기능 카드 스크롤 리빌
const reveal = (els) => {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  els.forEach((el) => {
    el.classList.add('reveal');
    io.observe(el);
  });
};
reveal(document.querySelectorAll('.grid article, .plan'));

// 가격 토글 (월간 / 연간 20% 할인)
const pricingSection = document.querySelector('#pricing .container');
if (pricingSection) {
  const toggle = document.createElement('div');
  toggle.className = 'price-toggle';
  toggle.innerHTML = `
    <button type="button" data-period="month" class="is-active">월간</button>
    <button type="button" data-period="year">연간 <em>-20%</em></button>
  `;
  pricingSection.querySelector('.section-lead')?.insertAdjacentElement('afterend', toggle);
  const monthly = '₩9,900';
  const yearly = '₩7,920';
  toggle.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-period]');
    if (!btn) return;
    toggle.querySelectorAll('button').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const period = btn.dataset.period;
    const featured = document.querySelector('.plan--featured .price');
    if (featured) {
      featured.innerHTML = `${period === 'year' ? yearly : monthly}<small>/사용자/월</small>`;
    }
  });
}

// FAQ 섹션을 cta-band 위에 동적 추가
const ctaBand = document.querySelector('.cta-band');
if (ctaBand) {
  const faqHtml = `
    <section id="faq" class="faq">
      <div class="container">
        <h2>자주 묻는 질문</h2>
        <p class="section-lead">계약 전에 가장 많이 묻는 질문들입니다.</p>
        <div class="faq-list">
          <details><summary>무료 체험이 끝나면 자동 결제되나요?</summary><p>아니요. 명시적으로 유료 전환을 클릭하지 않으면 자동 결제되지 않습니다.</p></details>
          <details><summary>사용자 수에 제한이 있나요?</summary><p>Starter는 5명까지 무료, Team과 Enterprise는 무제한입니다.</p></details>
          <details><summary>데이터 보안은 어떻게 관리되나요?</summary><p>모든 데이터는 AES-256으로 암호화 저장되며 SOC 2 Type II 인증을 받았습니다.</p></details>
          <details><summary>해지하면 데이터는 어떻게 되나요?</summary><p>해지 후 30일까지 데이터를 복구할 수 있으며, 그 이후 영구 삭제됩니다.</p></details>
        </div>
      </div>
    </section>
  `;
  ctaBand.insertAdjacentHTML('beforebegin', faqHtml);
}
