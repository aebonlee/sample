const LESSONS = [
  { t: '1. 강좌 소개와 환경 설정', d: '8:24' },
  { t: '2. JSX와 컴포넌트의 본질', d: '14:02' },
  { t: '3. props 패턴 정리', d: '19:48' },
  { t: '4. state와 리렌더링', d: '16:51' },
  { t: '5. useEffect 깊게 보기', d: '24:09' },
  { t: '6. 이벤트와 폼 처리', d: '12:18' },
  { t: '7. 리스트와 key', d: '11:30' },
  { t: '8. Context API 실무 패턴', d: '17:55' },
  { t: '9. useReducer로 상태 정리', d: '15:42' },
  { t: '10. 커스텀 훅 만들기', d: '21:13' },
  { t: '11. 성능 최적화: memo, useMemo', d: '23:30' },
  { t: '12. 에러 바운더리', d: '13:48' },
  { t: '13. React Router 빠른 시작', d: '19:00' },
  { t: '14. 디자인 시스템 적용', d: '22:42' },
];

const KEY = 'learn-02';
const done = new Set(JSON.parse(localStorage.getItem(KEY + ':done') || '[]'));
let current = parseInt(localStorage.getItem(KEY + ':cur') || '0', 10);

const listEl = document.getElementById('list');
const barEl = document.getElementById('bar');
const progEl = document.getElementById('progress');
const titleEl = document.getElementById('curTitle');
const bigTitle = document.getElementById('bigTitle');

function render() {
  listEl.innerHTML = '';
  LESSONS.forEach((l, i) => {
    const li = document.createElement('li');
    if (done.has(i)) li.classList.add('done');
    if (i === current) li.classList.add('active');
    li.innerHTML = `<span class="check"></span><div class="t">${l.t}</div><div class="d">${l.d}</div>`;
    li.addEventListener('click', () => select(i));
    listEl.appendChild(li);
  });
  const pct = Math.round((done.size / LESSONS.length) * 100);
  barEl.style.width = pct + '%';
  progEl.textContent = pct;
  titleEl.textContent = LESSONS[current].t;
  bigTitle.textContent = LESSONS[current].t;
}
function select(i) {
  current = i;
  localStorage.setItem(KEY + ':cur', i);
  render();
  resetVideo();
}
render();

// 가짜 비디오 재생
const poster = document.getElementById('poster');
const playBtn = document.getElementById('playBtn');
const playToggle = document.getElementById('playToggle');
const seek = document.getElementById('seek');
const time = document.getElementById('time');
let playing = false, t = 0, timer = null;
function fmt(s) { const m = Math.floor(s / 60); const sec = Math.floor(s % 60); return `${m}:${sec.toString().padStart(2, '0')}`; }
function tick() {
  t += 0.5;
  const total = 60 * 8 + 24;
  if (t >= total) {
    t = 0; stop();
    if (!done.has(current)) { done.add(current); localStorage.setItem(KEY + ':done', JSON.stringify([...done])); render(); }
    return;
  }
  seek.value = (t / total) * 100;
  time.textContent = `${fmt(t)} / 8:24`;
}
function play() { playing = true; poster.classList.add('playing'); playBtn.style.display='none'; playToggle.textContent = '⏸'; timer = setInterval(tick, 500); }
function stop() { playing = false; clearInterval(timer); poster.classList.remove('playing'); playBtn.style.display=''; playToggle.textContent = '▶'; }
function resetVideo() { stop(); t = 0; seek.value = 0; time.textContent = '0:00 / 8:24'; }
playBtn.addEventListener('click', play);
playToggle.addEventListener('click', () => playing ? stop() : play());
seek.addEventListener('input', () => { t = (seek.value / 100) * (60 * 8 + 24); time.textContent = `${fmt(t)} / 8:24`; });
document.getElementById('fs').addEventListener('click', () => document.getElementById('video').requestFullscreen?.());

// 탭
document.querySelectorAll('.tab').forEach((t) => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
    document.querySelectorAll('.panel').forEach((p) => p.hidden = true);
    document.getElementById('tab-' + t.dataset.tab).hidden = false;
  });
});

// 노트
const note = document.getElementById('note');
const hint = document.getElementById('saveHint');
note.value = localStorage.getItem(KEY + ':note') || '';
note.addEventListener('input', () => {
  localStorage.setItem(KEY + ':note', note.value);
  hint.textContent = '저장됨 · ' + new Date().toLocaleTimeString();
});
