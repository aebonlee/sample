const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RED_SUITS = new Set(['♥', '♦']);

const KEY = 'blackjack-best';
const CHIPS_KEY = 'blackjack-chips';

let chips = parseInt(localStorage.getItem(CHIPS_KEY) || '1000', 10);
let best = parseInt(localStorage.getItem(KEY) || '1000', 10);
let bet = 0;
let deck = [];
let dealer = [];
let player = [];
let phase = 'bet'; // bet | play | dealer | end

const chipsEl = document.getElementById('chips');
const bestEl = document.getElementById('best');
const betAmount = document.getElementById('betAmount');
const dealerCards = document.getElementById('dealerCards');
const playerCards = document.getElementById('playerCards');
const dealerScore = document.getElementById('dealerScore');
const playerScore = document.getElementById('playerScore');
const result = document.getElementById('result');
const resultText = document.getElementById('resultText');
const resultSub = document.getElementById('resultSub');
const betArea = document.getElementById('betArea');
const gameArea = document.getElementById('gameArea');
const hitBtn = document.getElementById('hitBtn');
const standBtn = document.getElementById('standBtn');
const doubleBtn = document.getElementById('doubleBtn');
const newBtn = document.getElementById('newBtn');
const dealBtn = document.getElementById('dealBtn');

function updateChips() {
  chipsEl.textContent = chips.toLocaleString('ko-KR');
  bestEl.textContent = best.toLocaleString('ko-KR');
  if (chips > best) {
    best = chips;
    localStorage.setItem(KEY, best);
    bestEl.textContent = best.toLocaleString('ko-KR');
  }
  localStorage.setItem(CHIPS_KEY, chips);
}

function newDeck() {
  const d = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ suit: s, rank: r });
  // 셔플
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function valueOfHand(cards) {
  let v = 0, aces = 0;
  for (const c of cards) {
    if (c.rank === 'A') { v += 11; aces++; }
    else if (['J', 'Q', 'K'].includes(c.rank)) v += 10;
    else v += parseInt(c.rank, 10);
  }
  while (v > 21 && aces > 0) { v -= 10; aces--; }
  return v;
}

function drawCardEl(card, hidden = false) {
  const el = document.createElement('div');
  el.className = 'card' + (hidden ? ' back' : '') + (RED_SUITS.has(card.suit) ? ' red' : '');
  if (!hidden) {
    el.innerHTML = `
      <div><div class="rank">${card.rank}</div><div class="suit">${card.suit}</div></div>
      <div class="big-suit">${card.suit}</div>
      <div class="corner-br"><div class="rank">${card.rank}</div><div class="suit">${card.suit}</div></div>
    `;
  }
  return el;
}

function renderHands(hideDealer = false) {
  dealerCards.innerHTML = '';
  dealer.forEach((c, i) => dealerCards.appendChild(drawCardEl(c, hideDealer && i === 1)));
  playerCards.innerHTML = '';
  player.forEach((c) => playerCards.appendChild(drawCardEl(c)));

  playerScore.textContent = valueOfHand(player) || '—';
  if (hideDealer) {
    dealerScore.textContent = dealer[0] ? valueOfHand([dealer[0]]) + '+?' : '—';
  } else {
    dealerScore.textContent = valueOfHand(dealer) || '—';
  }
}

// 베팅 칩 클릭
document.querySelectorAll('.bc').forEach((b) => {
  b.addEventListener('click', () => {
    const amt = parseInt(b.dataset.amt, 10);
    if (bet + amt > chips) return;
    bet += amt;
    betAmount.textContent = bet.toLocaleString('ko-KR');
  });
});

document.getElementById('clearBetBtn').addEventListener('click', () => {
  bet = 0;
  betAmount.textContent = '0';
});

dealBtn.addEventListener('click', () => {
  if (bet === 0) bet = 100; // 기본 100
  if (bet > chips) { alert('칩이 부족해요!'); return; }
  start();
});

function start() {
  result.hidden = true;
  betArea.hidden = true;
  gameArea.hidden = false;
  hitBtn.disabled = false;
  standBtn.disabled = false;
  doubleBtn.disabled = false;
  newBtn.hidden = true;

  chips -= bet;
  updateChips();

  deck = newDeck();
  dealer = [deck.pop(), deck.pop()];
  player = [deck.pop(), deck.pop()];
  phase = 'play';

  playerCards.classList.add('dealing');
  dealerCards.classList.add('dealing');
  renderHands(true);
  setTimeout(() => {
    playerCards.classList.remove('dealing');
    dealerCards.classList.remove('dealing');
  }, 400);

  // 시작 시 블랙잭 체크
  if (valueOfHand(player) === 21) {
    setTimeout(dealerTurn, 600);
  }
}

hitBtn.addEventListener('click', () => {
  if (phase !== 'play') return;
  player.push(deck.pop());
  doubleBtn.disabled = true; // 한 번 hit 하면 더블다운 불가
  renderHands(true);
  const v = valueOfHand(player);
  if (v > 21) endRound('lose', '버스트!');
  else if (v === 21) dealerTurn();
});

standBtn.addEventListener('click', () => {
  if (phase !== 'play') return;
  dealerTurn();
});

doubleBtn.addEventListener('click', () => {
  if (phase !== 'play' || player.length !== 2) return;
  if (chips < bet) { alert('칩이 부족해요!'); return; }
  chips -= bet;
  bet *= 2;
  updateChips();
  betAmount.textContent = bet.toLocaleString('ko-KR');
  player.push(deck.pop());
  renderHands(true);
  const v = valueOfHand(player);
  if (v > 21) endRound('lose', '버스트!');
  else dealerTurn();
});

function dealerTurn() {
  phase = 'dealer';
  renderHands(false);
  hitBtn.disabled = true;
  standBtn.disabled = true;
  doubleBtn.disabled = true;

  function next() {
    if (valueOfHand(dealer) < 17) {
      dealer.push(deck.pop());
      renderHands(false);
      setTimeout(next, 500);
    } else {
      decide();
    }
  }
  setTimeout(next, 600);
}

function decide() {
  const p = valueOfHand(player), d = valueOfHand(dealer);
  if (p > 21) endRound('lose', '버스트');
  else if (d > 21) endRound('win', '딜러 버스트!');
  else if (p === 21 && player.length === 2 && !(d === 21 && dealer.length === 2)) endRound('blackjack', '블랙잭! 🎉');
  else if (p > d) endRound('win', `${p} vs ${d}`);
  else if (p < d) endRound('lose', `${p} vs ${d}`);
  else endRound('push', `${p} vs ${d} 무승부`);
}

function endRound(outcome, msg) {
  phase = 'end';
  result.hidden = false;
  result.className = 'result ' + (outcome === 'lose' ? 'lose' : outcome === 'push' ? 'push' : 'win');

  let payout = 0;
  if (outcome === 'win') {
    payout = bet * 2;
    resultText.textContent = '플레이어 승리!';
  } else if (outcome === 'blackjack') {
    payout = Math.floor(bet * 2.5);
    resultText.textContent = '블랙잭!';
  } else if (outcome === 'push') {
    payout = bet;
    resultText.textContent = '무승부';
  } else {
    resultText.textContent = '패배';
  }
  chips += payout;
  const net = payout - bet;
  resultSub.innerHTML = `${msg}<br/>${net >= 0 ? '+' : ''}₩${net.toLocaleString('ko-KR')}`;
  updateChips();

  hitBtn.disabled = true;
  standBtn.disabled = true;
  doubleBtn.disabled = true;
  newBtn.hidden = false;
}

newBtn.addEventListener('click', () => {
  if (chips <= 0) {
    if (confirm('칩이 모두 떨어졌어요. 1,000원을 다시 받을까요?')) {
      chips = 1000;
      updateChips();
    } else return;
  }
  bet = 0;
  betAmount.textContent = '0';
  result.hidden = true;
  betArea.hidden = false;
  gameArea.hidden = true;
  dealerCards.innerHTML = '';
  playerCards.innerHTML = '';
  dealerScore.textContent = '—';
  playerScore.textContent = '—';
  phase = 'bet';
});

updateChips();
