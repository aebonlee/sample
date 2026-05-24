# 003 — 각 카테고리별 샘플 1차 보강 (10종)

**날짜**: 2026-05-24
**목적**: 사용자 요청("각가구샘플 사이트를 더 만들어서 추가해줘")에 따라, 5개 platform(web · app · ai · data · game) 각각에 새 샘플을 1개씩 추가해 카탈로그 밀도를 높임.

## 추가된 샘플 (10개)

| ID | platform | category | 난이도 | 핵심 패턴 |
|---|---|---|---|---|
| `personal-02` | web | personal | beginner | 카드형 이력서 + `@media print` |
| `company-02` | web | company | beginner | 카페 브랜드 + 예약 폼 |
| `learning-02` | web | learning | intermediate | 가짜 비디오 플레이어 + 커리큘럼 + 노트(localStorage) |
| `blog-02` | web | blog | beginner | 그라데이션 커버 + 태그 필터 + 다크모드 |
| `landing-02` | web | landing | intermediate | 폰 목업 2대 + 그라데이션 텍스트 + `<details>` FAQ |
| `shop-02` | web | shop | intermediate | 사이드 필터(카테고리 · 가격 · 색상) + 정렬 + 찜 |
| `app-03` | app | utility | intermediate | 핀테크 지갑 (그라데이션 카드 + 카운트업 + 지출 분석 바차트) |
| `ai-03` | ai | media | intermediate | 회의록 음성 변환 (가짜 파형 + 화자 분리 + 타이핑 + AI 요약) |
| `data-03` | data | learning | intermediate | 웹 트래픽 분석 (Chart.js 라인 + 도넛 + 국가별 막대) |
| `game-03` | game | game | intermediate | 클래식 스네이크 (Canvas + 키보드 + 터치 스와이프) |

## 설계 원칙 (이번 배치)

### 1. 한 화면에 끝나는 단일 페이지
- 카탈로그에서 iframe 미리보기로 보기 좋도록, 모든 샘플은 한 화면(혹은 1-2 스크롤) 안에서 핵심 가치를 전달
- 진짜 라우팅이 필요한 곳(쇼핑몰 등)은 가짜 데이터 + 클라이언트 필터로 한 페이지에 압축

### 2. 의존성 최소화
- HTML/CSS/JS만으로 구현
- 차트가 필요한 `data-03`만 Chart.js CDN 사용 (기존 `data-01` 패턴 그대로 유지)

### 3. localStorage로 상태 영속화
- `learning-02`: 강의 진도 + 노트
- `game-03`: 최고 기록
- `blog-02`: 테마(다크/라이트)

### 4. 한국 사용자 컨텍스트 반영
- 가격 표시: `₩6,500` / `8,200원` 등 한국 포맷
- 한글 텍스트 우선 (Pretendard, Noto Serif KR 등을 가정)
- 데이터 예시도 한국 콘텐츠(서울·부산·하노이 등)로 작성

## 구현 노트

### `learning-02` — 가짜 비디오 플레이어
- `<video>` 태그 없이 그라데이션 배경 위에 재생 컨트롤만 표시
- 8분 24초 영상을 시뮬레이션(0.5초마다 0.5초씩 진행 → 약 8.5분 동안 실재처럼 흐름)
- 끝까지 시청 시 자동으로 강의 완료 처리 → 진도 갱신
- 진도 / 노트는 `localStorage`에 저장, 새로고침 후에도 유지

### `app-03` — 폰 프레임 카드 그라데이션
- 단일 폰 프레임 안에 모든 UI를 압축
- 총 자산은 `setInterval` 60단계 카운트업
- 카테고리별 지출 가로 바는 `setTimeout`으로 초기 width 0% → 실제 값으로 트랜지션

### `ai-03` — 가짜 음성 + 점진 타이핑
- 녹음 버튼 클릭 시 파형 div 15개가 `@keyframes` 애니메이션으로 들썩임
- "데모 재생" 클릭 시 미리 정의된 회의 스크립트 8문장을 화자별로 35ms/글자 타이핑
- 요약 버튼은 1.2초 딜레이 후 가짜 요약 + 불릿 포인트 4개 출력
- 실제 환경에서는 MediaRecorder + Whisper API + Claude/GPT 요약으로 치환

### `data-03` — Chart.js 패턴 재사용
- `data-01`(분석 대시보드), `data-02`(실시간 모니터링)와 색 토큰 통일
- 라인 차트(방문자/페이지뷰) + 도넛(채널) + 가로 막대(국가별)
- 라이브 시각은 1초마다 갱신, KPI는 60단계 카운트업

### `game-03` — Canvas 게임 루프
- 20×20 격자(셀 크기 20px), 4×4 그리드 대신 Canvas로 직접 그림
- `setInterval(난이도별 70~160ms)` 게임 루프
- 뱀은 좌표 객체 배열, 머리부터 `unshift`, 사과 미섭취 시 꼬리 `pop`
- 터치 스와이프(20px 이상 이동 시 방향 결정) + 화살표 + WASD + 화면 D-Pad 모두 지원

## 미리보기 이미지

- `scripts/generate-previews.mjs`로 1440×900 데스크탑 스크린샷 자동 생성
- 현재 컨테이너 환경(root 사용자)에서는 Chromium 샌드박스 제약으로 `--no-sandbox` 플래그가 필요해 launch 옵션에 추가
- 다음 PR에서는 동일하게 자동으로 동작

## 다음 단계

- [x] `npm run typecheck` / `npm run build` 통과 확인
- [x] 모든 신규 샘플의 `preview.png` 생성
- [ ] 각 platform 메뉴에 2번째 추가 샘플 (004 일지)
