// 강좌 검색, 카테고리 필터, 북마크 토글
const search = document.querySelector('.search');
const courses = document.querySelectorAll('.course');
const cats = document.querySelectorAll('.cat');

// 검색
search?.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  courses.forEach((c) => {
    const text = c.textContent.toLowerCase();
    c.style.display = !q || text.includes(q) ? '' : 'none';
  });
});

// 카테고리 클릭 시 활성 표시 + 필터(데모용 - 모두 표시)
cats.forEach((c) => {
  c.addEventListener('click', (e) => {
    e.preventDefault();
    cats.forEach((x) => x.classList.remove('is-active-cat'));
    c.classList.add('is-active-cat');
  });
});

// 강좌 카드에 북마크 버튼 동적 추가
const saved = new Set(JSON.parse(localStorage.getItem('learning-bookmarks') || '[]'));
courses.forEach((card, i) => {
  const id = card.querySelector('h3')?.textContent ?? `course-${i}`;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'bookmark';
  btn.setAttribute('aria-label', '북마크');
  const update = () => {
    btn.textContent = saved.has(id) ? '★' : '☆';
    btn.classList.toggle('is-on', saved.has(id));
  };
  update();
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved.has(id)) saved.delete(id);
    else saved.add(id);
    localStorage.setItem('learning-bookmarks', JSON.stringify([...saved]));
    update();
  });
  card.querySelector('.course__thumb')?.appendChild(btn);
});

// 진도 바 카운트업 애니메이션
document.querySelectorAll('.bar__fill').forEach((bar) => {
  const target = bar.style.width;
  bar.style.width = '0';
  requestAnimationFrame(() => {
    bar.style.transition = 'width 1.2s cubic-bezier(.22,1,.36,1)';
    bar.style.width = target;
  });
});
