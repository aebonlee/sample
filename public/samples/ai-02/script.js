// AI 이미지 갤러리 — 그라데이션으로 가짜 이미지, 클릭 시 상세 모달
const SEED = [
  { prompt: '노을 지는 한강, 인상주의 유화', style: '유화', ratio: '16:9', h: 240, bg: 'linear-gradient(135deg,#fb923c,#f97316,#7c2d12)' },
  { prompt: '한복을 입은 소녀의 수채화 초상', style: '일러스트', ratio: '3:4', h: 360, bg: 'linear-gradient(135deg,#fce7f3,#f9a8d4,#831843)' },
  { prompt: '눈 덮인 산맥 위 별이 가득한 밤하늘', style: '사실적', ratio: '16:9', h: 220, bg: 'linear-gradient(135deg,#1e293b,#3b82f6,#0c4a6e)' },
  { prompt: '미니어처 가구가 가득한 도서관', style: '3D 렌더', ratio: '1:1', h: 320, bg: 'linear-gradient(135deg,#92400e,#fbbf24,#451a03)' },
  { prompt: '네온 빛 사이버펑크 도쿄 골목', style: '사실적', ratio: '9:16', h: 480, bg: 'linear-gradient(135deg,#7c3aed,#ec4899,#0c0a18)' },
  { prompt: '바다 위를 나는 종이 비행기', style: '일러스트', ratio: '1:1', h: 320, bg: 'linear-gradient(135deg,#0ea5e9,#a5f3fc,#1e3a8a)' },
  { prompt: '안개 낀 숲 속 작은 오두막', style: '유화', ratio: '4:3', h: 280, bg: 'linear-gradient(135deg,#166534,#4ade80,#052e16)' },
  { prompt: '카페에서 책을 읽는 고양이', style: '일러스트', ratio: '1:1', h: 320, bg: 'linear-gradient(135deg,#d97706,#fef3c7,#78350f)' },
  { prompt: '우주 정거장에서 본 지구', style: '사실적', ratio: '16:9', h: 220, bg: 'linear-gradient(135deg,#1e3a8a,#a5b4fc,#0c0a18)' },
  { prompt: '벚꽃이 흩날리는 교토 거리', style: '유화', ratio: '3:4', h: 360, bg: 'linear-gradient(135deg,#fbcfe8,#f9a8d4,#831843)' },
  { prompt: '픽셀 아트 RPG 마을 전경', style: '픽셀아트', ratio: '16:9', h: 240, bg: 'linear-gradient(135deg,#84cc16,#22c55e,#14532d)' },
  { prompt: '달 표면에서 차를 마시는 우주비행사', style: '3D 렌더', ratio: '1:1', h: 320, bg: 'linear-gradient(135deg,#475569,#e2e8f0,#020617)' },
];

const $gallery = document.getElementById('gallery');
let tiles = [...SEED];

function render() {
  $gallery.innerHTML = tiles.map((t, i) => `
    <div class="tile" data-i="${i}">
      <div class="tile__img" style="background: ${t.bg}; height: ${t.h}px;"></div>
      <div class="tile__overlay"><p>${escape(t.prompt)}</p></div>
    </div>
  `).join('');
}

function escape(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

// 클릭 → 상세 모달
$gallery.addEventListener('click', (e) => {
  const tile = e.target.closest('.tile');
  if (!tile) return;
  const t = tiles[Number(tile.dataset.i)];
  document.getElementById('detailImg').style.background = t.bg;
  document.getElementById('detailPrompt').textContent = t.prompt;
  document.getElementById('detailStyle').textContent = t.style;
  document.getElementById('detailRatio').textContent = t.ratio;
  document.getElementById('detailDate').textContent = '방금 전';
  document.getElementById('detailModal').hidden = false;
});
document.getElementById('closeDetail').addEventListener('click', () => {
  document.getElementById('detailModal').hidden = true;
});
document.querySelector('#detailModal .modal__bg').addEventListener('click', () => {
  document.getElementById('detailModal').hidden = true;
});

// 추천 프롬프트 클릭
document.querySelectorAll('.suggests button').forEach((b) => {
  b.addEventListener('click', () => {
    document.getElementById('prompt').value = b.dataset.p;
    document.getElementById('prompt').focus();
  });
});

// 생성 (가짜 진행 + 4장 추가)
const $modal = document.getElementById('genModal');
const $progress = document.getElementById('genProgress');
document.getElementById('genForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const prompt = document.getElementById('prompt').value.trim();
  if (!prompt) return;
  const style = document.getElementById('style').value;
  const ratio = document.getElementById('ratio').value;
  $modal.hidden = false;
  for (let p = 0; p <= 100; p += 5) {
    $progress.textContent = p + '%';
    await new Promise((r) => setTimeout(r, 80 + Math.random() * 80));
  }
  // 4장 추가
  const palettes = [
    'linear-gradient(135deg,#6366f1,#ec4899,#0c0a18)',
    'linear-gradient(135deg,#22d3ee,#a78bfa,#1e1b4b)',
    'linear-gradient(135deg,#f59e0b,#ef4444,#7f1d1d)',
    'linear-gradient(135deg,#10b981,#06b6d4,#064e3b)',
  ];
  const ratioH = { '1:1': 280, '16:9': 200, '9:16': 460, '3:4': 360, '4:3': 240 };
  const newTiles = palettes.map((bg) => ({
    prompt, style, ratio, h: ratioH[ratio] ?? 300, bg,
  }));
  tiles = [...newTiles, ...tiles];
  render();
  $modal.hidden = true;
  document.getElementById('prompt').value = '';
});

// 탭(시각만)
document.querySelectorAll('.tab').forEach((t) => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.remove('is-on'));
    t.classList.add('is-on');
  });
});

render();
