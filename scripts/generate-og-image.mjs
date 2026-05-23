// 1200x630 OG 이미지 생성기
// 실행: npm run og-image
// 사전: npm i -D sharp
//
// 출력: public/og/og-image.png
// 카탈로그 사이트용 기본 브랜드 이미지. CONFIG만 수정해 다른 사이트에서도 재사용 가능.

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '../public/og/og-image.png');

const CONFIG = {
  width: 1200,
  height: 630,
  // 다크 블루 5색 팔레트 (사용자 요청)
  palette: {
    deep:    '#0b1226', // 가장 진한 배경
    primary: '#1e3a8a', // 메인 다크 블루
    mid:     '#3b5bdb', // 강조용 미드 블루
    accent:  '#6366f1', // 인디고 액센트
    light:   '#a5b4fc', // 라이트 톤 (텍스트 보조)
  },
  brand: 'Sample Gallery',
  title: '웹사이트 디자인 샘플 모음',
  subtitle: '개인 · 회사 · 학습 · 블로그 — 그대로 가져다 쓰는 정적 사이트와 소스코드',
  url: 'sample.dreamitbiz.com',
};

function svgTemplate(c) {
  const { width: W, height: H, palette: p, brand, title, subtitle, url } = c;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="${p.deep}"/>
      <stop offset="100%" stop-color="${p.primary}"/>
    </linearGradient>
    <radialGradient id="glow1" cx="0.15" cy="0.2" r="0.6">
      <stop offset="0%"  stop-color="${p.accent}" stop-opacity="0.55"/>
      <stop offset="60%" stop-color="${p.accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.9" cy="1" r="0.7">
      <stop offset="0%"  stop-color="${p.mid}" stop-opacity="0.55"/>
      <stop offset="60%" stop-color="${p.mid}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="${p.accent}"/>
      <stop offset="100%" stop-color="${p.light}"/>
    </linearGradient>
  </defs>

  <!-- 배경 -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow1)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>

  <!-- 그리드 -->
  <g stroke="${p.light}" stroke-opacity="0.07" stroke-width="1">
    ${Array.from({ length: 12 }, (_, i) => `<line x1="${(i + 1) * (W / 13)}" y1="0" x2="${(i + 1) * (W / 13)}" y2="${H}"/>`).join('')}
    ${Array.from({ length: 6 }, (_, i) => `<line x1="0" y1="${(i + 1) * (H / 7)}" x2="${W}" y2="${(i + 1) * (H / 7)}"/>`).join('')}
  </g>

  <!-- 브랜드 마크 -->
  <g transform="translate(80, 80)">
    <rect width="48" height="48" rx="12" fill="url(#accent)"/>
    <text x="24" y="32" text-anchor="middle" fill="${p.deep}"
          font-family="Inter, -apple-system, system-ui, sans-serif"
          font-size="28" font-weight="800">S</text>
    <text x="64" y="33" fill="${p.light}"
          font-family="Inter, -apple-system, system-ui, sans-serif"
          font-size="20" font-weight="600">${brand}</text>
  </g>

  <!-- 메인 타이틀 -->
  <text x="80" y="320" fill="#ffffff"
        font-family="Inter, 'Pretendard', -apple-system, sans-serif"
        font-size="72" font-weight="800" letter-spacing="-2">${title}</text>

  <!-- 서브타이틀 -->
  <text x="80" y="386" fill="${p.light}"
        font-family="Inter, 'Pretendard', -apple-system, sans-serif"
        font-size="26" font-weight="500" opacity="0.92">${subtitle}</text>

  <!-- 액센트 바 -->
  <rect x="80" y="430" width="120" height="6" rx="3" fill="url(#accent)"/>

  <!-- URL -->
  <text x="80" y="560" fill="${p.light}"
        font-family="ui-monospace, SFMono-Regular, Menlo, monospace"
        font-size="22" font-weight="500" opacity="0.7">${url}</text>

  <!-- 우측 장식 도형 -->
  <g transform="translate(${W - 320}, 130)" opacity="0.85">
    <rect width="200" height="280" rx="20" fill="#ffffff" fill-opacity="0.04" stroke="${p.light}" stroke-opacity="0.18"/>
    <rect x="20" y="24" width="80" height="10" rx="5" fill="${p.accent}"/>
    <rect x="20" y="44" width="160" height="8" rx="4" fill="${p.light}" fill-opacity="0.25"/>
    <rect x="20" y="60" width="120" height="8" rx="4" fill="${p.light}" fill-opacity="0.18"/>
    <rect x="20" y="96" width="160" height="100" rx="10" fill="url(#accent)" fill-opacity="0.7"/>
    <rect x="20" y="216" width="160" height="10" rx="5" fill="${p.light}" fill-opacity="0.3"/>
    <rect x="20" y="234" width="100" height="10" rx="5" fill="${p.light}" fill-opacity="0.2"/>
  </g>
</svg>`;
}

async function main() {
  await mkdir(dirname(OUT_PATH), { recursive: true });
  const svg = svgTemplate(CONFIG);
  await sharp(Buffer.from(svg))
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(OUT_PATH);
  console.log(`✓ OG image written: ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
