const SCRIPT = [
  { sp: '진행자', t: '00:01', s: '안녕하세요, 오늘 회의를 시작하겠습니다.' },
  { sp: '진행자', t: '00:04', s: '먼저 지난 주 진행 상황부터 공유해 주세요.' },
  { sp: '디자이너', t: '00:09', s: '디자인 시스템 v2 작업은 80% 완료 상태입니다.' },
  { sp: '디자이너', t: '00:14', s: '컴포넌트 라이브러리는 다음 주 월요일까지 마무리 가능합니다.' },
  { sp: '개발자', t: '00:21', s: '백엔드 API는 어제 스테이징에 배포했고, 부하 테스트 결과 P95 응답 시간이 180ms로 측정됐습니다.' },
  { sp: '개발자', t: '00:32', s: '프론트엔드는 인증 흐름 리팩토링이 남아 있어요.' },
  { sp: '진행자', t: '00:38', s: '좋습니다. 출시 일정은 6월 15일로 유지할 수 있을까요?' },
  { sp: '개발자', t: '00:44', s: '네, 현재 진행 속도라면 무리 없이 가능합니다.' },
];

const wave = document.getElementById('wave');
const stateEl = document.getElementById('state');
const timeEl = document.getElementById('time');
const recBtn = document.getElementById('recBtn');
const stopBtn = document.getElementById('stopBtn');
const demoBtn = document.getElementById('demoBtn');
const textArea = document.getElementById('text');

let recording = false;
let demoTimer = null, typeTimer = null;
let sec = 0, secTimer = null;
let idx = 0, charIdx = 0;

function fmt(s) { return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }

function setRecording(on) {
  recording = on;
  document.body.classList.toggle('recording', on);
  stateEl.textContent = on ? '녹음 중…' : '녹음 대기 중';
  stopBtn.disabled = !on;
}

recBtn.addEventListener('click', () => {
  if (recording) return;
  reset();
  setRecording(true);
  textArea.innerHTML = '<p class="placeholder">실제 환경에서는 마이크 권한이 필요합니다. 데모 재생을 사용해 보세요.</p>';
  secTimer = setInterval(() => { sec++; timeEl.textContent = fmt(sec); }, 1000);
});

stopBtn.addEventListener('click', () => {
  setRecording(false);
  clearInterval(secTimer); clearInterval(demoTimer); clearInterval(typeTimer);
});

demoBtn.addEventListener('click', () => {
  reset();
  setRecording(true);
  textArea.innerHTML = '';
  secTimer = setInterval(() => { sec++; timeEl.textContent = fmt(sec); }, 1000);
  nextLine();
});

function reset() {
  sec = 0; idx = 0; charIdx = 0;
  timeEl.textContent = '00:00';
  clearInterval(secTimer); clearInterval(demoTimer); clearInterval(typeTimer);
  document.getElementById('summary').hidden = true;
}

function nextLine() {
  if (idx >= SCRIPT.length) {
    setRecording(false);
    clearInterval(secTimer);
    return;
  }
  const line = SCRIPT[idx];
  const p = document.createElement('p');
  p.innerHTML = `<span class="speaker">${line.sp}</span><span class="ts">${line.t}</span><span class="body cursor"></span>`;
  textArea.appendChild(p);
  textArea.scrollTop = textArea.scrollHeight;
  charIdx = 0;
  typeTimer = setInterval(() => {
    const body = p.querySelector('.body');
    body.textContent = line.s.slice(0, ++charIdx);
    if (charIdx >= line.s.length) {
      clearInterval(typeTimer);
      body.classList.remove('cursor');
      idx++;
      demoTimer = setTimeout(nextLine, 600);
    }
  }, 35);
}

document.getElementById('copyBtn').addEventListener('click', async () => {
  const t = textArea.innerText.trim();
  if (!t) return;
  try { await navigator.clipboard.writeText(t); alert('복사되었어요'); } catch { alert('복사 실패'); }
});

document.getElementById('dlBtn').addEventListener('click', () => {
  const t = textArea.innerText.trim();
  if (!t) return alert('내용이 없어요');
  const blob = new Blob([t], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `echo-${Date.now()}.txt`;
  a.click();
});

document.getElementById('sumBtn').addEventListener('click', () => {
  const sumEl = document.getElementById('summary');
  const body = document.getElementById('sumBody');
  const bullets = document.getElementById('bullets');
  sumEl.hidden = false;
  body.textContent = '잠시만요, 회의 내용을 분석 중입니다...';
  bullets.innerHTML = '';
  setTimeout(() => {
    body.textContent = '주간 회의에서 디자인 시스템 v2 작업이 80% 완료되었으며, 백엔드 API의 P95 응답 시간이 180ms로 측정됐다는 보고가 있었습니다. 6월 15일 출시 일정은 현재 속도로 유지 가능합니다.';
    ['디자인 시스템 v2 → 다음 주 월요일 완료 예정', '백엔드 API: 스테이징 배포 완료 · P95 = 180ms', '프론트엔드: 인증 흐름 리팩토링 남음', '출시 일정: 6월 15일 유지'].forEach((s) => {
      const li = document.createElement('li'); li.textContent = s; bullets.appendChild(li);
    });
  }, 1200);
});
