# 001 — 프로젝트 초기 셋업

**날짜**: 2026-05-24
**목적**: 빈 저장소에서 Sample Gallery 사이트의 초기 구조를 잡고 첫 샘플과 배포 파이프라인까지 동작하게 만들기.

## 결정 사항

### 기술 스택
- **React 18 + Vite 6 + TypeScript** — Claude Master, DevLab과 동일한 스택으로 통일
- **React Router v6 (HashRouter)** — GitHub Pages에서 SPA 직접 링크가 깨지지 않도록 해시 라우팅 사용
- **prism-react-renderer** — 가벼운 React 친화적 코드 하이라이터

### 아키텍처
- **카탈로그 앱(`src/`) + 독립 정적 샘플(`public/samples/<id>/`) 분리** 구조
  - 샘플은 그 자체로 완전한 정적 사이트 → iframe 미리보기, 새 탭 열기, 파일 다운로드 모두 자연스럽게 동작
  - 카탈로그는 `src/data/samples.ts`의 메타데이터로 카드/카테고리/검색 제공
  - 소스 뷰어는 런타임 `fetch('/samples/<id>/<file>')`로 파일을 읽어 하이라이팅 → 단일 진실 공급원 유지(샘플 파일 중복 없음)

### 도메인/배포
- CNAME = `sample.dreamitbiz.com` (이미 저장소에 존재)
- `.github/workflows/deploy.yml`로 `main` 푸시 시 GitHub Pages 자동 배포
- 빌드 후 `dist/index.html`을 `dist/404.html`로 복사 — GitHub Pages의 404가 SPA fallback 역할을 하도록
- `cp CNAME dist/CNAME` — 빌드 출력에 CNAME을 포함시켜 커스텀 도메인 유지

## 첫 샘플
- `personal-01` — 미니멀 개인 포트폴리오 (HTML/CSS/JS, 다크모드, 스크롤 페이드인)

## 다음 단계
- [ ] `npm install` 후 로컬 동작 확인
- [ ] 첫 커밋 + 푸시
- [ ] GitHub 저장소 Settings → Pages → Source를 "GitHub Actions"로 전환 (메모리상 새 Pages는 legacy로 시작될 수 있어 수동 전환 필요)
- [ ] 추가 샘플: `company-01` (회사 소개), `learning-01` (학습 사이트), `blog-01` (블로그)

## 새 샘플 추가 가이드
README의 "새 샘플 추가하기" 섹션 참고. 핵심: `public/samples/<id>/`에 정적 파일 + `src/data/samples.ts`에 메타데이터 한 항목.
