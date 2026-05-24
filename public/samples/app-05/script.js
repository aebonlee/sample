const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const typing = document.getElementById('typing');

const REPLIES = [
  '오 좋은 생각이네 😊',
  '나도 그렇게 생각해!',
  '그럼 그렇게 하자 👍',
  '잠깐, 회의 끝나고 다시 연락할게',
  '아 그래?? 신기하다',
  'ㅋㅋㅋ',
  '그러게 ㅠㅠ',
  '오케이 도착하면 톡 줘!',
];

function nowTime() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function addMessage(text, side) {
  if (typing.hidden === false) chat.insertBefore(makeMsg(text, side), typing);
  else chat.appendChild(makeMsg(text, side));
  chat.scrollTop = chat.scrollHeight;
}

function makeMsg(text, side) {
  const el = document.createElement('div');
  el.className = 'msg ' + side;
  if (side === 'in') {
    el.innerHTML = `<div class="ava-s">민</div><div class="bub">${text}</div><span class="t">${nowTime()}</span>`;
  } else {
    el.innerHTML = `<span class="t">전송 · ${nowTime()}</span><div class="bub">${text}</div>`;
  }
  return el;
}

function send() {
  const v = input.value.trim();
  if (!v) return;
  addMessage(v, 'out');
  input.value = '';

  setTimeout(() => {
    typing.hidden = false;
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;
  }, 500);

  setTimeout(() => {
    typing.hidden = true;
    addMessage(REPLIES[Math.floor(Math.random() * REPLIES.length)], 'in');
  }, 2000 + Math.random() * 1500);
}

sendBtn.addEventListener('click', send);
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

chat.scrollTop = chat.scrollHeight;
