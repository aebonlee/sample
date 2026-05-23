// 각 샘플의 1440x900 데스크탑 스크린샷을 생성합니다.
// 출력: public/samples/<id>/preview.png
//
// 실행: npm run previews
// 사전: puppeteer (devDep). 최초 설치 시 Chromium 자동 다운로드.
//
// 동작:
// 1) public/samples/ 아래 정적 파일을 임시 HTTP 서버(127.0.0.1:5959)로 제공
// 2) 각 샘플 폴더의 index.html을 헤드리스 Chrome 1440x900 뷰포트로 로드
// 3) 1440x900 영역 PNG 저장

import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve, dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAMPLES_DIR = resolve(__dirname, '../public/samples');
const PORT = 5959;
const VIEWPORT = { width: 1440, height: 900 };

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
};

function startServer() {
  return new Promise((resolveFn, reject) => {
    const server = createServer(async (req, res) => {
      try {
        let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
        if (urlPath.endsWith('/')) urlPath += 'index.html';
        const filePath = join(SAMPLES_DIR, urlPath);
        if (!filePath.startsWith(SAMPLES_DIR)) {
          res.writeHead(403); res.end('Forbidden'); return;
        }
        const data = await readFile(filePath);
        const type = MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': type });
        res.end(data);
      } catch {
        res.writeHead(404); res.end('Not found');
      }
    });
    server.listen(PORT, '127.0.0.1', () => resolveFn(server));
    server.on('error', reject);
  });
}

async function listSampleIds() {
  const entries = await readdir(SAMPLES_DIR, { withFileTypes: true });
  const ids = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const index = join(SAMPLES_DIR, e.name, 'index.html');
    if (existsSync(index)) ids.push(e.name);
  }
  return ids.sort();
}

async function main() {
  const ids = await listSampleIds();
  if (!ids.length) {
    console.log('No samples found under public/samples/');
    return;
  }
  console.log(`Samples: ${ids.join(', ')}`);

  const server = await startServer();
  console.log(`Static server: http://127.0.0.1:${PORT}`);

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: VIEWPORT,
  });

  try {
    for (const id of ids) {
      const page = await browser.newPage();
      await page.setViewport({ ...VIEWPORT, deviceScaleFactor: 2 });
      const url = `http://127.0.0.1:${PORT}/${id}/index.html`;
      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
      } catch {
        // 외부 리소스(supabase-auth-01의 esm.sh 등) 때문에 networkidle이 안 올 수 있음
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await new Promise((r) => setTimeout(r, 1500));
      }
      // 폰트/이미지 안정화를 위해 살짝 더 기다림
      await new Promise((r) => setTimeout(r, 600));
      const outPath = join(SAMPLES_DIR, id, 'preview.png');
      await page.screenshot({
        path: outPath,
        clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
        type: 'png',
      });
      const s = await stat(outPath);
      console.log(`✓ ${id} → preview.png (${(s.size / 1024).toFixed(1)} KB)`);
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
