# CLAUDE.md — Sample Gallery

가이드라인 for AI assistants (Claude Code) working on this repository.
프로젝트 인사이드/네비게이션을 빠르게 잡기 위한 요약 — 사람이 보는 README와 별도.

**Live**: https://sample.dreamitbiz.com
**Repo**: `aebonlee/sample`

---

## 1. What this repo is

웹사이트 디자인 샘플 갤러리 + 프로젝트 가이드 카탈로그.

두 종류의 콘텐츠를 묶어서 보여준다:

1. **샘플(samples)** — 한 폴더에 `index.html / style.css / script.js`로 완결된 정적 사이트들. `public/samples/<id>/` 아래 50개(2026-05-25 기준). 카탈로그에서 카드로 보여주고, iframe 미리보기·새 탭·소스 뷰어·ZIP 다운로드를 제공한다.
2. **프로젝트(projects)** — Solar LLM 기반 풀스택 앱 7개의 기획·아키텍처·구현 가이드. 데이터만 있고 동작 앱은 아님 (`src/data/projectDetails.ts`).

핵심 아키텍처 결정은 **카탈로그 React 앱 ↔ 독립 정적 샘플** 분리.
카탈로그는 메타데이터만 들고 있고, 실제 샘플 코드는 `public/samples/<id>/`의 정적 파일로만 존재해서 빌드 시 그대로 복사된다. 소스 뷰어는 런타임 `fetch('/samples/<id>/<file>')`로 읽는다 — **단일 진실 공급원이라 샘플 파일이 중복되지 않는다**.

---

## 2. Tech stack

| Layer | What |
|---|---|
| UI | React 18.3 |
| Build | Vite 6 |
| Lang | TypeScript 5 (`strict: true`, 단 `noImplicitAny`/`strictNullChecks`/`noUnused*` off — `tsconfig.app.json`) |
| Router | `react-router-dom` v6 **HashRouter** (`createHashRouter` in `src/main.tsx`) |
| Auth | `@supabase/supabase-js` (선택, Google + Kakao OAuth) |
| Code 표시 | `prism-react-renderer` |
| ZIP 다운로드 | `jszip` |
| Screenshot | `puppeteer` (devDep, `scripts/generate-previews.mjs`) |
| OG 이미지 | `sharp` (devDep, `scripts/generate-og-image.mjs`) |
| 배포 | GitHub Actions → GitHub Pages (`.github/workflows/deploy.yml`) |

**HashRouter를 쓰는 이유**: GitHub Pages는 SPA 직접 링크가 404로 떨어지므로 해시 라우팅으로 우회. 빌드 시 `dist/index.html`을 `dist/404.html`로 복사하는 것도 같은 이유의 fallback.

---

## 3. Directory layout

```
sample/
├── public/
│   ├── og/og-image.png             # OG 이미지 (sharp로 생성)
│   ├── samples/<id>/               # 독립 정적 샘플 50개 (iframe + 다운로드 소스)
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── script.js
│   │   └── preview.png             # 1440x900 자동 스크린샷
│   └── favicon.svg
├── src/
│   ├── App.tsx                     # 헤더/푸터/Outlet 셸. 플랫폼 메뉴 5종 + 로그인 모달
│   ├── main.tsx                    # createHashRouter + 라우트 정의
│   ├── components/
│   │   ├── SampleCard.tsx          # 카드 (썸네일 + 메타)
│   │   ├── SourceViewer.tsx        # prism으로 소스 표시 + ZIP 다운로드
│   │   ├── FlowDiagram.tsx         # 프로젝트 페이지의 SVG 파이프라인
│   │   ├── ThemeToggle.tsx
│   │   ├── LoginModal.tsx          # Supabase OAuth (Google + Kakao)
│   │   └── UserMenu.tsx
│   ├── contexts/AuthContext.tsx    # Supabase 세션 추상화
│   ├── lib/supabase.ts             # Supabase 클라이언트 (env 없으면 null)
│   ├── data/
│   │   ├── samples.ts              # 샘플 50개 메타데이터 (단일 진실)
│   │   ├── projectDetails.ts       # 프로젝트 7개 상세 데이터
│   │   └── projectMockups.ts       # 프로젝트별 페이지/공유 파일 목록
│   ├── pages/                      # Home / About / PlatformPage / SampleDetail / Projects / ProjectGuide / ProjectBuild / Community / Preview
│   └── styles/global.css           # 단일 글로벌 스타일시트
├── scripts/
│   ├── generate-previews.mjs       # 임시 HTTP 서버 + puppeteer로 모든 샘플 PNG 생성
│   └── generate-og-image.mjs       # sharp로 OG 이미지 합성
├── .github/workflows/deploy.yml    # main 푸시 → GitHub Pages
├── CNAME                           # sample.dreamitbiz.com
├── Dev_md/                         # 개발 메모 (001-, 002-, ... 시간순)
└── vite.config.ts                  # base: '/', port: 5173
```

---

## 4. Routes

`src/main.tsx`에 정의. HashRouter라 URL은 `/#/...` 형태.

| Path | Page | 비고 |
|---|---|---|
| `/` | Home | 플랫폼/카테고리/검색 |
| `/about` | About | |
| `/platform/:platform` | PlatformPage | platform = `web` \| `app` \| `ai` \| `data` \| `game` |
| `/samples/:id` | SampleDetail | iframe + 소스 뷰어 + 다운로드 |
| `/projects` | Projects | Solar LLM 프로젝트 7개 목록 |
| `/projects/:id` | ProjectGuide | 아키텍처·파이프라인·프롬프트 |
| `/projects/:id/build` | ProjectBuild | 단계별 빌드 가이드 |
| `/community` | Community | |
| `/preview/:id` | **Preview** | 셸(App.tsx) 바깥에 별도 라우트로 등록. 헤더·푸터 없이 전체 화면 미리보기 |

---

## 5. Samples 데이터 모델

`src/data/samples.ts`의 `Sample` 인터페이스가 정답.

```ts
type Platform = 'web' | 'app' | 'ai' | 'data' | 'game';
type SampleCategory =
  | 'personal' | 'company' | 'learning' | 'blog' | 'landing'
  | 'portfolio' | 'auth' | 'shop' | 'media' | 'utility' | 'game';

interface Sample {
  id: string;                              // 폴더명과 1:1 매칭. 예: 'personal-04'
  title: string;
  description: string;
  platform: Platform;
  category: SampleCategory;
  tags: string[];
  stack: string[];                         // 'HTML' | 'CSS' | 'JavaScript' | 'Canvas' | 'Supabase' ...
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  files: string[];                         // 'index.html' 포함 필수
  guide?: string;                          // 상세 페이지 하단 가이드 텍스트
}
```

`platformLabels`, `platformDescriptions`, `categoryLabels`는 같은 파일에 한국어 레이블로 정의되어 있다.

---

## 6. Workflows

### 6.1 새 샘플 추가

1. `public/samples/<id>/`에 `index.html`을 포함한 정적 파일을 둔다. **외부 빌드 도구 없이 브라우저에서 그대로 동작해야 한다** (npm/번들러 X).
2. `src/data/samples.ts`의 `samples` 배열 끝에 메타데이터 entry 추가. `id`는 폴더명과 정확히 일치.
3. `npm run previews` — puppeteer로 1440x900 PNG 생성. 임시 서버를 127.0.0.1:5959에 올려서 모든 샘플을 순회.
4. `npm run dev`로 카드/상세 확인.
5. 커밋·푸시 → GitHub Actions가 자동 배포.

샘플은 **자기 자신만으로 완결**되어야 한다. Supabase 등 외부 의존이 있다면(`supabase-auth-01`) localStorage에 사용자가 직접 키를 넣는 방식으로 만든다. 시크릿을 샘플 코드에 박지 않는다.

### 6.2 새 프로젝트 가이드 추가

1. `src/data/projectDetails.ts`의 `PROJECT_DATA` 배열에 `ProjectData` 한 entry 추가. 인터페이스가 길어서 기존 entry 복사 후 채우는 게 편하다.
2. 페이지 컴포넌트 목업이 있다면 `src/data/projectMockups.ts`의 `PAGE_COMPONENTS`에 추가하고 `public/projects/p<n>/`에 정적 파일 배치.

### 6.3 OG 이미지 / 프리뷰 재생성

```bash
npm run og-image    # sharp로 합성 → public/og/og-image.png
npm run previews    # puppeteer로 모든 샘플 스크린샷 재생성
```

CI에서는 `PUPPETEER_SKIP_DOWNLOAD=true`로 Chromium 다운로드를 막아 시간/대역을 절약 (이미지 재생성은 로컬에서만).

---

## 7. Commands

```bash
npm install              # 최초/의존성 변경 시
npm run dev              # http://localhost:5173 (vite.config.ts에서 open: true)
npm run build            # tsc -b && vite build → dist/
npm run preview          # 빌드 결과 미리보기
npm run typecheck        # tsc -b --noEmit
npm run og-image         # OG 이미지 재생성 (sharp)
npm run previews         # 샘플 스크린샷 재생성 (puppeteer, 로컬 전용)
```

---

## 8. Auth (Supabase) — optional

`.env.example` 참고. 미설정 시 로그인 버튼은 비활성화되고 모달에 안내가 표시된다 (`isAuthConfigured` 체크).

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

배포 환경(GitHub Pages)에서 로그인을 살리려면 **저장소 Settings → Secrets and variables → Actions**에 위 두 키를 등록하고 워크플로우 `env`에 노출해야 한다 (현재 `deploy.yml`에는 노출 안 되어 있음 — 필요해지면 추가).

**절대 service_role 키를 넣지 말 것**. anon key만 노출 가능.

---

## 9. Conventions for AI assistants

이 저장소에서 작업할 때:

- **샘플 파일은 절대 `src/`로 옮기지 않는다.** `public/samples/<id>/`가 단일 진실 공급원. 카탈로그가 의도적으로 메타데이터만 들고 있다.
- 샘플은 **빌드 없이 브라우저에서 더블클릭으로도 열려야 한다**. 외부 ESM CDN은 OK, 번들러는 NO.
- **HashRouter 가정**. 페이지 간 링크는 `<Link to="/...">`/`<NavLink>`를 쓰고, 직접 `window.location.href`를 만들 때는 `/#/...` prefix를 고려한다.
- 라우트 추가 시 **두 곳에 등록**: (a) `src/main.tsx`의 router, (b) 필요하면 `App.tsx`의 nav. `Preview`처럼 셸 밖 라우트가 필요하면 children 바깥에 둔다.
- TS는 `strict` 켜져 있지만 `noUnusedLocals/Parameters`, `noImplicitAny`, `strictNullChecks`가 꺼져 있다. 굳이 `?.`/`!` 도배하지 말고 기존 스타일 따른다.
- 스타일은 **`src/styles/global.css` 단일 파일**. CSS-in-JS / Tailwind / 모듈 CSS 도입하지 않는다.
- 한국어 UI 텍스트가 기본. README/주석/커밋도 한국어가 자연스러움.
- 커밋 메시지 스타일은 `git log`로 확인 — `feat:`, `fix:` 접두사 + 한국어 본문.

### 작업하면 안 되는 것

- 샘플 코드에 빌드 단계 추가하지 않기 (정적 사이트로 유지)
- `dist/`는 커밋하지 않음 (GitHub Actions가 빌드)
- `node_modules/`, `.env*`(`.env.example` 제외) 커밋 금지 — `.gitignore`에 이미 포함

---

## 10. Deployment

`main` 브랜치 push만 트리거. `.github/workflows/deploy.yml`:

1. `npm ci` (with `PUPPETEER_SKIP_DOWNLOAD=true`)
2. `npm run build`
3. `cp CNAME dist/CNAME` + `cp dist/index.html dist/404.html`
4. `actions/upload-pages-artifact` → `actions/deploy-pages`

GitHub 저장소 **Settings → Pages → Source = "GitHub Actions"** 설정 전제.

---

## 11. Where to look first

| 질문 | 보면 되는 파일 |
|---|---|
| 라우트 어디서 등록? | `src/main.tsx` |
| 헤더/푸터/네비 | `src/App.tsx` |
| 새 샘플 메타 어디 추가? | `src/data/samples.ts` 끝 |
| 샘플 실제 코드 어디? | `public/samples/<id>/` |
| 프리뷰 카드는? | `src/components/SampleCard.tsx` + `src/pages/Home.tsx` / `PlatformPage.tsx` |
| 소스 다운로드/하이라이팅 | `src/components/SourceViewer.tsx` |
| 프로젝트 7종 상세 | `src/data/projectDetails.ts` |
| 배포 파이프라인 | `.github/workflows/deploy.yml` |
| Supabase 세팅 의도 | `src/lib/supabase.ts`, `src/contexts/AuthContext.tsx` |
| 시간순 개발 메모 | `Dev_md/001-...` ~ `008-...` |

문의: aebon@kyonggi.ac.kr
