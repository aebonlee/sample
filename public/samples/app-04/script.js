const TRACKS = [
  { title: 'Stay With Me',    artist: 'Sam Smith · In the Lonely Hour', dur: 228, art: 'linear-gradient(135deg, #ff4a5e 0%, #b5328e 50%, #6a2099 100%)', theme: '' },
  { title: 'Blinding Lights', artist: 'The Weeknd · After Hours',       dur: 200, art: 'linear-gradient(135deg, #ff7e3e 0%, #ff3e6e 50%, #6e1a5a 100%)', theme: 'theme-orange' },
  { title: 'Yesterday',       artist: 'Beatles · Help!',                dur: 125, art: 'linear-gradient(135deg, #4a8aff 0%, #2a4a9a 50%, #1a1a4a 100%)', theme: 'theme-blue' },
  { title: 'Shape of You',    artist: 'Ed Sheeran · ÷',                 dur: 233, art: 'linear-gradient(135deg, #5fdc9a 0%, #2a8a5a 50%, #1a4a2a 100%)', theme: 'theme-green' },
  { title: '봄날',             artist: 'BTS · You Never Walk Alone',     dur: 274, art: 'linear-gradient(135deg, #ffb4d2 0%, #d28aff 50%, #5a3aa0 100%)', theme: '' },
  { title: 'Yellow',          artist: 'Coldplay · Parachutes',          dur: 269, art: 'linear-gradient(135deg, #ffe24a 0%, #ff8b3e 50%, #a04a1a 100%)', theme: 'theme-orange' },
];

const phone = document.getElementById('phone');
const cover = document.getElementById('cover');
const art = document.getElementById('art');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const seek = document.getElementById('seek');
const cur = document.getElementById('cur');
const dur = document.getElementById('dur');
const playBtn = document.getElementById('playBtn');
const queueEl = document.getElementById('queue');

let idx = 0, t = 0, playing = false, timer = null;
const liked = new Set();

function fmt(s) { return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`; }

function load(i) {
  idx = i;
  const tr = TRACKS[i];
  title.textContent = tr.title;
  artist.textContent = tr.artist;
  art.style.background = tr.art;
  phone.className = 'phone ' + tr.theme;
  if (playing) cover.classList.add('playing');
  t = 0;
  seek.max = tr.dur;
  seek.value = 0;
  cur.textContent = '0:00';
  dur.textContent = fmt(tr.dur);
  renderQueue();
  updateLike();
}

function renderQueue() {
  queueEl.innerHTML = '';
  TRACKS.forEach((tr, i) => {
    if (i === idx) return;
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="qa" style="background:${tr.art}"></div>
      <div class="qi">
        <div class="qt">${tr.title}</div>
        <div class="qsub">${tr.artist}</div>
      </div>
      <div class="qd">${fmt(tr.dur)}</div>
    `;
    li.addEventListener('click', () => { load(i); play(); });
    queueEl.appendChild(li);
  });
}

function tick() {
  t += .5;
  if (t >= TRACKS[idx].dur) { next(); return; }
  seek.value = t;
  cur.textContent = fmt(t);
}

function play() {
  playing = true;
  playBtn.textContent = '⏸';
  cover.classList.add('playing');
  timer = setInterval(tick, 500);
}
function pause() {
  playing = false;
  playBtn.textContent = '▶';
  cover.classList.remove('playing');
  clearInterval(timer);
}
function next() { load((idx + 1) % TRACKS.length); play(); }
function prev() { load((idx - 1 + TRACKS.length) % TRACKS.length); play(); }

playBtn.addEventListener('click', () => playing ? pause() : play());
document.getElementById('next').addEventListener('click', next);
document.getElementById('prev').addEventListener('click', prev);
seek.addEventListener('input', () => { t = parseFloat(seek.value); cur.textContent = fmt(t); });

document.querySelector('.shuffle').addEventListener('click', (e) => e.currentTarget.classList.toggle('active'));
document.querySelector('.repeat').addEventListener('click', (e) => e.currentTarget.classList.toggle('active'));

function updateLike() {
  const btn = document.getElementById('likeBtn');
  if (liked.has(idx)) { btn.classList.add('liked'); btn.textContent = '♥'; }
  else { btn.classList.remove('liked'); btn.textContent = '♡'; }
}
document.getElementById('likeBtn').addEventListener('click', () => {
  liked.has(idx) ? liked.delete(idx) : liked.add(idx);
  updateLike();
});

load(0);
