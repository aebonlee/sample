# Sample Gallery

웹사이트 디자인 샘플 갤러리. 개인 포트폴리오, 회사 사이트, 학습 사이트, 블로그 등 프로젝트 타입별 정적 사이트 샘플과 소스코드를 카탈로그 형태로 제공합니다.

**Live**: https://sample.dreamitbiz.com

## 구조

```
sample/
├── public/samples/<id>/      # 독립된 정적 사이트 (iframe + 다운로드 대상)
│   └── personal-01/
│       ├── index.html
│       ├── style.css
│       └── script.js
├── src/                      # 카탈로그 React 앱 (Vite + TS)
│   ├── components/           # SampleCard, SourceViewer
│   ├── data/samples.ts       # 샘플 메타데이터
│   ├── pages/                # Home, SampleDetail, About
│   ├── styles/global.css
│   ├── App.tsx
│   └── main.tsx
├── .github/workflows/deploy.yml  # GitHub Pages 자동 배포
├── CNAME                     # 커스텀 도메인 (sample.dreamitbiz.com)
└── Dev_md/                   # 개발 문서
```

## 개발

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # dist/
npm run preview      # 빌드 결과 미리보기
npm run typecheck    # 타입 체크만 실행
```

## 새 샘플 추가하기

1. `public/samples/<id>/` 폴더를 만들고 `index.html`을 포함한 정적 파일을 넣습니다.
2. `src/data/samples.ts`의 `samples` 배열에 메타데이터를 추가합니다.
   ```ts
   {
     id: 'company-01',
     title: '미니멀 회사 소개',
     description: '...',
     category: 'company',
     tags: ['반응형'],
     stack: ['HTML', 'CSS'],
     difficulty: 'beginner',
     files: ['index.html', 'style.css'],
     guide: '제작 방법 설명...',
   }
   ```
3. `npm run dev`로 확인 후 커밋·푸시하면 GitHub Actions가 자동 배포합니다.

## 배포

`main` 브랜치 푸시 시 `.github/workflows/deploy.yml`이 실행되어 GitHub Pages로 배포됩니다.
GitHub 저장소 설정에서 **Settings → Pages → Build and deployment → Source**가 "GitHub Actions"로 설정되어 있어야 합니다.

## 기술 스택

- React 18 + TypeScript
- Vite 6
- React Router (Hash 라우터로 GitHub Pages 직접 링크 지원)
- prism-react-renderer (소스 코드 하이라이팅)
