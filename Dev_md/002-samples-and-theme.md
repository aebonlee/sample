# 002 — 샘플 6종 추가 + 라이트/다크 토글 + OG 이미지

**날짜**: 2026-05-24
**목적**: 카탈로그를 의미 있게 채울 만큼 샘플을 확보하고, 사용자 요청대로 카탈로그에 라이트 모드를 추가.

## 추가된 샘플

| ID | 카테고리 | 난이도 | 비고 |
|---|---|---|---|
| `company-01` | 회사 사이트 | beginner | 서비스/사례/팀/연락처 + sticky nav |
| `learning-01` | 학습 사이트 | intermediate | 사이드바 + 강좌 카드 그리드 + 진도 바 |
| `blog-01` | 블로그 | beginner | 세리프 잡지풍 + 사이드바 위젯 |
| `landing-01` | 랜딩 페이지 | intermediate | Hero → Social Proof → Features → Pricing → CTA |
| `portfolio-01` | 포트폴리오 | intermediate | 다크 톤 + 카테고리 필터(vanilla JS) |
| `supabase-auth-01` | 인증 / 운영 | advanced | 정적 HTML + supabase-js (ESM CDN) + Google/Kakao OAuth |

기존 `personal-01`과 합쳐 총 7개. 사용자가 요청한 모든 프로젝트 타입 커버.

## 카탈로그 라이트 / 다크 테마

- `global.css`를 라이트 기본 + `[data-theme="dark"]` 변형 구조로 재편
- 색만 토큰화 — 모든 의미적 색은 변수에 매핑 (chip, tag, header bg, shadow 등)
- `ThemeToggle.tsx` — localStorage 저장 + 시스템 선호도 감지
- `index.html`에 inline 부트스트랩 스크립트 추가 → FOUC 방지
- 코드 뷰어는 의도적으로 다크 유지 (가독성 + 색맥락 보존)

## OG 이미지

- `scripts/generate-og-image.mjs` — sharp 기반 1200×630 SVG → PNG 변환
- 다크 블루 5색 팔레트(사용자 요청)
- `public/og/og-image.png`로 출력, `index.html`에 OG/Twitter 메타 태그 추가
- 사이트별 재사용을 위해 `CONFIG` 객체만 수정하면 됨

## Supabase 인증 샘플 설계 노트

- **자격증명을 코드에 박지 않음** — 사용자가 "⚙ Supabase 설정 입력" 버튼으로 입력
- localStorage 저장 (브라우저 내에서만)
- supabase-js를 esm.sh에서 직접 import → 빌드 도구 불필요
- service_role 키 입력을 명시적으로 경고
- 시간 흐름: 미설정 → 자격증명 입력 → OAuth 리디렉트 → 세션 표시 → 로그아웃

## 보안 메모 (2026-05-24)

사용자가 이전 대화에서 다음을 평문으로 공유 — **반드시 로테이션 필요**:
- Supabase Personal Access Token (`sbp_...`)
- Resend API Key (`re_...`)

이 저장소의 어떤 파일에도 들어가지 않았음(grep으로 확인).

## 다음 단계

- [ ] 사용자가 시크릿 로테이션 완료 확인
- [ ] 샘플 추가: e-commerce, admin-dashboard, docs-site, app-promo 등
- [ ] 샘플마다 "Claude로 이 디자인 변형 요청하는 프롬프트 예시" 섹션 추가 고려
