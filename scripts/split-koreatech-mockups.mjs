#!/usr/bin/env node
/**
 * 한기대 mockup 의 인라인 <style> / <script> 를 별도 파일로 분리한다.
 * - 분리 후: index.html + style.css + script.js + main.py + README.md
 * - style.css 는 공통 토큰(_shared/style.css) + 프로젝트 인라인 <style> 합본
 * - script.js 는 인라인 <script> 본문 그대로
 * - index.html 은 외부 link/script 로 교체 (D2Coding 웹폰트 link 는 유지)
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const baseDir = join(root, 'public/projects-koreatech');
const sharedCss = readFileSync(join(baseDir, '_shared/style.css'), 'utf8');

const projectIds = readdirSync(baseDir)
  .filter((n) => !n.startsWith('_') && !n.startsWith('.'))
  .filter((n) => statSync(join(baseDir, n)).isDirectory());

for (const id of projectIds) {
  const dir = join(baseDir, id);
  const htmlPath = join(dir, 'index.html');
  let html = readFileSync(htmlPath, 'utf8');

  // 1) 인라인 <style>...</style> 추출 (있는 경우만)
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  const inlineCss = styleMatch ? styleMatch[1].trim() : '';

  // 2) 인라인 <script>...</script> 추출
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  const inlineJs = scriptMatch ? scriptMatch[1].trim() : '';

  // 3) style.css 작성: 공통 토큰 + (있다면) 인라인 토큰
  const cssOut = inlineCss
    ? `${sharedCss}\n\n/* ── ${id} 데모 전용 추가 스타일 ── */\n${inlineCss}\n`
    : sharedCss;
  writeFileSync(join(dir, 'style.css'), cssOut, 'utf8');

  // 4) script.js 작성
  writeFileSync(join(dir, 'script.js'), inlineJs + '\n', 'utf8');

  // 5) index.html 정리
  //    - ../_shared/style.css link → style.css 로 변경 (자기-완결적)
  //    - 인라인 <style> 제거
  //    - 인라인 <script> → <script src="script.js"></script>
  html = html
    .replace(/\.\.\/_shared\/style\.css/g, 'style.css')
    .replace(/<style>[\s\S]*?<\/style>\s*/g, '')
    .replace(/<script>[\s\S]*?<\/script>/, '<script src="script.js"></script>');

  writeFileSync(htmlPath, html, 'utf8');
  console.log(`[ok] ${id} → style.css(${cssOut.length}c) + script.js(${inlineJs.length}c)`);
}
console.log(`\n총 ${projectIds.length}개 프로젝트의 mockup 을 분리했습니다.`);
