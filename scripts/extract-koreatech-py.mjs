#!/usr/bin/env node
// 한기대 프로젝트 데이터에서 구현 단계 파이썬 코드를 추출해 .py 파일로 저장
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const dataFile = join(repoRoot, 'src/data/koreatechProjects.ts');
const outBase  = join(repoRoot, 'public/projects-koreatech');

const full = readFileSync(dataFile, 'utf8');

// KOREATECH_PROJECTS 배열 안쪽만 잘라서 사용 (CT_STEPS 의 id 와 혼동 방지)
const startMarker = 'export const KOREATECH_PROJECTS';
const startIdx = full.indexOf(startMarker);
if (startIdx === -1) throw new Error('KOREATECH_PROJECTS 를 찾을 수 없습니다');
const src = full.slice(startIdx);

// 각 프로젝트의 id 와 implementation.ko 의 코드블록을 추출
const regex = /id:\s*'([^']+)'[\s\S]*?implementation:\s*\{\s*ko:\s*'```python\\n([\s\S]*?)\\n```'/g;

let match;
let count = 0;
while ((match = regex.exec(src)) !== null) {
  const id = match[1];
  // JS 문자열 내부의 escape 시퀀스를 실제 문자로 환원
  const code = match[2]
    .replace(/\\n/g, '\n')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
    .replace(/\\"/g, '"');

  const dir = join(outBase, id);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const pyPath = join(dir, 'main.py');
  writeFileSync(pyPath, code + '\n', 'utf8');
  console.log(`[ok] ${id}/main.py (${code.length} chars)`);
  count++;
}
console.log(`\n총 ${count}개 파이썬 파일을 생성했습니다.`);
