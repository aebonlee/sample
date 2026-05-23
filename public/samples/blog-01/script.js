// 글 검색 + 좋아요(localStorage) + 부드러운 페이드인
document.getElementById('year').textContent = new Date().getFullYear();

// 검색 박스 동적 추가
const tagline = document.querySelector('.site__tagline');
if (tagline) {
  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = '글 검색…';
  search.className = 'site__search';
  tagline.insertAdjacentElement('afterend', search);
  search.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll('.featured, .post').forEach((art) => {
      const ok = !q || art.textContent.toLowerCase().includes(q);
      art.style.display = ok ? '' : 'none';
    });
  });
}

// 좋아요 버튼 동적 추가
const liked = new Set(JSON.parse(localStorage.getItem('blog-likes') || '[]'));
document.querySelectorAll('.featured, .post').forEach((art, i) => {
  const title = art.querySelector('h2, h3')?.textContent ?? `post-${i}`;
  const byline = art.querySelector('.byline');
  if (!byline) return;
  const like = document.createElement('button');
  like.type = 'button';
  like.className = 'like-btn';
  const update = () => {
    like.innerHTML = liked.has(title) ? '♥' : '♡';
    like.classList.toggle('is-on', liked.has(title));
  };
  update();
  like.addEventListener('click', (e) => {
    e.preventDefault();
    if (liked.has(title)) liked.delete(title);
    else liked.add(title);
    localStorage.setItem('blog-likes', JSON.stringify([...liked]));
    update();
  });
  byline.appendChild(like);
});

// 스크롤 페이드인
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 },
);
document.querySelectorAll('.post').forEach((el) => {
  el.classList.add('reveal');
  io.observe(el);
});
