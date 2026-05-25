#!/usr/bin/env node
/**
 * _shared/style.css 가 변경된 뒤 각 프로젝트의 self-contained style.css 를 다시 빌드.
 * - 기존 style.css 의 끝부분에 있는 "── <id> 데모 전용 추가 스타일 ──" 마커 이후를
 *   demo-specific append 로 인식해 유지하고, 앞부분(공통)만 새 _shared 로 교체한다.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseDir = join(root, 'public/projects-koreatech');
const sharedCss = readFileSync(join(baseDir, '_shared/style.css'), 'utf8');

const projectIds = readdirSync(baseDir)
  .filter((n) => !n.startsWith('_') && !n.startsWith('.'))
  .filter((n) => statSync(join(baseDir, n)).isDirectory());

const MARK = '/* ── ';

for (const id of projectIds) {
  const cssPath = join(baseDir, id, 'style.css');
  let existing = '';
  try { existing = readFileSync(cssPath, 'utf8'); } catch {}
  const idx = existing.indexOf(MARK);
  const appended = idx >= 0 ? existing.slice(idx) : '';
  const out = appended ? `${sharedCss.trimEnd()}\n\n${appended}` : sharedCss;
  writeFileSync(cssPath, out, 'utf8');
  console.log(`[ok] ${id} style.css (${out.length}c${appended ? `, demo +${appended.length}c` : ''})`);
}
