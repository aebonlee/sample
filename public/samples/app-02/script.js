// 도시별 가짜 날씨 데이터
const DATA = {
  seoul: {
    cond: '맑음', icon: '☀️', mood: '',
    temp: 24, hi: 28, lo: 17, feels: 26, rain: 10, humid: 55, wind: '2.4 m/s', uv: '보통 5', dust: '좋음',
    hours: [['지금', 24, '☀️'], ['16시', 26, '☀️'], ['17시', 27, '🌤'], ['18시', 25, '🌤'], ['19시', 22, '⛅'], ['20시', 20, '⛅'], ['21시', 18, '☁️'], ['22시', 17, '☁️']],
    week: [['오늘', '☀️', 17, 28], ['월', '🌤', 16, 26], ['화', '🌧', 14, 21], ['수', '⛅', 15, 23], ['목', '☀️', 17, 27], ['금', '☀️', 18, 29], ['토', '⛅', 17, 26]],
  },
  busan: {
    cond: '구름 조금', icon: '🌤', mood: 'cloudy',
    temp: 22, hi: 25, lo: 18, feels: 23, rain: 30, humid: 70, wind: '3.8 m/s', uv: '보통 4', dust: '보통',
    hours: [['지금', 22, '🌤'], ['16시', 23, '⛅'], ['17시', 22, '⛅'], ['18시', 21, '☁️'], ['19시', 20, '🌧'], ['20시', 19, '🌧'], ['21시', 19, '☁️'], ['22시', 18, '☁️']],
    week: [['오늘', '🌤', 18, 25], ['월', '🌧', 17, 22], ['화', '🌧', 17, 21], ['수', '⛅', 18, 24], ['목', '☀️', 19, 26], ['금', '🌤', 19, 26], ['토', '⛅', 18, 24]],
  },
  jeju: {
    cond: '비', icon: '🌧', mood: 'rainy',
    temp: 19, hi: 21, lo: 16, feels: 18, rain: 90, humid: 88, wind: '5.2 m/s', uv: '낮음 2', dust: '좋음',
    hours: [['지금', 19, '🌧'], ['16시', 19, '🌧'], ['17시', 18, '🌧'], ['18시', 18, '☁️'], ['19시', 17, '☁️'], ['20시', 17, '⛅'], ['21시', 17, '⛅'], ['22시', 16, '☁️']],
    week: [['오늘', '🌧', 16, 21], ['월', '🌧', 17, 22], ['화', '⛅', 18, 24], ['수', '🌤', 19, 26], ['목', '☀️', 20, 27], ['금', '🌤', 19, 25], ['토', '🌧', 17, 22]],
  },
  tokyo: {
    cond: '흐림', icon: '☁️', mood: 'cloudy',
    temp: 18, hi: 21, lo: 14, feels: 17, rain: 40, humid: 65, wind: '3.0 m/s', uv: '낮음 3', dust: '나쁨',
    hours: [['지금', 18, '☁️'], ['16시', 19, '☁️'], ['17시', 18, '☁️'], ['18시', 17, '🌧'], ['19시', 16, '🌧'], ['20시', 15, '☁️'], ['21시', 15, '☁️'], ['22시', 14, '☁️']],
    week: [['오늘', '☁️', 14, 21], ['월', '🌧', 13, 19], ['화', '⛅', 14, 22], ['수', '🌤', 15, 24], ['목', '☀️', 16, 25], ['금', '🌤', 15, 23], ['토', '⛅', 14, 22]],
  },
  hanoi: {
    cond: '맑음', icon: '☀️', mood: '',
    temp: 31, hi: 34, lo: 25, feels: 35, rain: 5, humid: 60, wind: '1.8 m/s', uv: '매우 강함 9', dust: '보통',
    hours: [['지금', 31, '☀️'], ['16시', 33, '☀️'], ['17시', 32, '☀️'], ['18시', 30, '🌤'], ['19시', 28, '⛅'], ['20시', 27, '⛅'], ['21시', 26, '☁️'], ['22시', 25, '☁️']],
    week: [['오늘', '☀️', 25, 34], ['월', '☀️', 25, 35], ['화', '🌤', 26, 33], ['수', '⛅', 26, 32], ['목', '🌧', 25, 30], ['금', '☀️', 26, 34], ['토', '☀️', 27, 35]],
  },
};

const $phone = document.querySelector('.phone');
const $city = document.getElementById('city');

function render(d) {
  $phone.className = 'phone ' + d.mood;
  document.getElementById('nowIcon').textContent = d.icon;
  document.getElementById('nowTemp').textContent = d.temp;
  document.getElementById('nowCond').textContent = d.cond;
  document.getElementById('nowHi').textContent = d.hi + '°';
  document.getElementById('nowLo').textContent = d.lo + '°';
  document.getElementById('feels').textContent = d.feels + '°';
  document.getElementById('rain').textContent = d.rain + '%';
  document.getElementById('humid').textContent = d.humid + '%';
  document.getElementById('wind').textContent = d.wind;
  document.getElementById('uv').textContent = d.uv;
  document.getElementById('dust').textContent = d.dust;

  document.getElementById('hours').innerHTML = d.hours
    .map(([h, t, i], idx) => `<div class="hour ${idx === 0 ? 'is-now' : ''}">
      <span>${h}</span><em>${i}</em><strong>${t}°</strong>
    </div>`).join('');

  const min = Math.min(...d.week.flatMap(([,, l, h]) => [l, h]));
  const max = Math.max(...d.week.flatMap(([,, l, h]) => [l, h]));
  const span = max - min || 1;
  document.getElementById('week').innerHTML = d.week
    .map(([day, icon, l, h]) => {
      const from = ((l - min) / span * 100).toFixed(0);
      const to = ((h - min) / span * 100).toFixed(0);
      return `<div class="week__row">
        <span>${day}</span>
        <em>${icon}</em>
        <div class="week__bar" style="--from:${from}%; --to:${to}%"></div>
        <strong>${h}°</strong>
        <strong>${l}°</strong>
      </div>`;
    }).join('');

  document.getElementById('updatedAt').textContent =
    new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) + ' 업데이트';
}

$city.addEventListener('change', () => render(DATA[$city.value]));
render(DATA.seoul);
