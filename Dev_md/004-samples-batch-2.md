# 004 — 각 카테고리별 샘플 2차 보강 (10종)

**날짜**: 2026-05-24
**목적**: 003에 이어 사용자 요청("각각 2개씩 더 추가하자")에 따라, 모든 platform에 2번째 새 샘플을 추가. 003의 10종 + 본 배치 10종 = 카탈로그에 총 20개 신규 샘플.

## 추가된 샘플 (10개)

| ID | platform | category | 난이도 | 핵심 패턴 |
|---|---|---|---|---|
| `portfolio-02` | web | portfolio | intermediate | CSS columns 마사니식 + 카테고리 필터 + 라이트박스 |
| `company-03` | web | company | intermediate | B2B 다크 컨설팅 사이트 + 통계 카운트업 + 상담 폼 |
| `app-04` | app | media | intermediate | 음악 플레이어 (LP 회전 + 트랙별 동적 그라데이션) |
| `app-05` | app | utility | beginner | 1:1 메신저 (말풍선 + 타이핑 인디케이터 + 자동 응답) |
| `ai-04` | ai | utility | intermediate | 코드 어시스턴트 (VS Code 스타일 + 점진 응답) |
| `ai-05` | ai | utility | intermediate | 다국어 번역기 (7개 언어 + Web Speech TTS + 디바운스) |
| `data-04` | data | utility | intermediate | 영업 CRM (파이프라인 스테이지 + 리더보드 + Chart.js) |
| `data-05` | data | utility | intermediate | 건강 모니터링 (SVG 진행 링 + stacked bar 수면) |
| `game-04` | game | game | intermediate | 틱택토 vs AI (랜덤 / 휴리스틱 / **미니맥스**) |
| `game-05` | game | game | advanced | 벽돌 깨기 (Atari Breakout 클론 + 레벨업) |

## 카테고리 다양화

### `portfolio-02`로 채운 빈자리
003 배치까지 `portfolio` 카테고리는 `portfolio-01`(다크 그리드) 1종뿐이었다. 사진작가 마사니식 갤러리를 추가해 "시각 작업물 중심" 케이스를 두 가지 톤으로 확보.

### `company-02` ↔ `company-03` 대비
- `company-02`: 따뜻한 톤 + 카페·F&B 중심
- `company-03`: 어두운 톤 + B2B IT 컨설팅
→ 같은 카테고리 안에서 색감 · 톤 · 업종이 정반대인 두 케이스를 짝지어 비교가 쉽도록 의도

## 구현 노트

### `app-04` — LP 회전 + 동적 테마
- 재생 중에는 `.vinyl` 요소가 `@keyframes spin 8s linear infinite` 회전
- 트랙 변경 시 `.art` 그라데이션 + `.phone` 전체 배경이 1초 transition으로 부드럽게 전환
- 6곡의 아트 그라데이션 + 4가지 테마 클래스로 시각적 풍부함 확보 (이미지 의존 없음)

### `app-05` — 자동 응답 메신저
- 메시지 전송 시 0.5초 후 타이핑 인디케이터 표시 → 2~3.5초 후 가짜 응답 도착
- 응답 풀(8개)에서 랜덤 선택 → 사용자가 매번 다른 경험
- 카카오톡 스타일 노란 말풍선 + 읽음 표시 + 시간

### `ai-04` — 키워드 기반 응답 시뮬레이션
- 사용자 입력에서 키워드("설명", "접근성", "버그", "테스트") 감지해 미리 준비된 응답 분기
- 응답은 12ms/글자 점진 타이핑(blinking cursor 동반)으로 LLM 스트리밍처럼 표현
- 실제 통합 시 `RESPONSES` 객체 → Claude API streaming 응답으로 교체만 하면 됨

### `ai-05` — DeepL 스타일 + 진짜 TTS
- 4개 예시 문장은 미리 정확히 번역된 결과 보유, 그 외는 placeholder
- 입력은 400ms 디바운스로 처리(타이핑 중 매번 호출 방지)
- "듣기" 버튼은 브라우저 내장 `SpeechSynthesisUtterance`로 **실제로** 음성 출력
- 가짜 컴포넌트와 실제 웹 API가 한 페이지에 공존하는 예시

### `data-04` — 영업 파이프라인 시각화
- 5단계(리드→접촉→제안→협상→성사) 가로 카드 + 단계별 색 + 폭 비율
- KPI는 카운트업, 매출 추이는 Chart.js 막대(주별)
- 거래 테이블은 단계 뱃지(`b-con`/`b-pro`/`b-neg`/`b-won`) 색으로 한눈에 진척 파악

### `data-05` — SVG 진행 링
- `<circle stroke-dasharray="276" stroke-dashoffset>` 패턴으로 원형 진행률 구현
- `r=44`, `2πr ≈ 276`이라 dasharray = 276 고정
- 25ms마다 dashoffset을 줄이며 0% → 69% 애니메이션
- 수면 차트는 깊은/얕은 수면을 stacked bar로 (Chart.js stack 옵션)

### `game-04` — 미니맥스 알고리즘 학습용
- 3단계 AI: 랜덤 / 휴리스틱(이기는 수 → 막는 수 → 가운데/모서리) / 미니맥스
- 미니맥스는 가지치기 없이 ~30줄로 완전 구현 (틱택토는 상태 공간이 작아 충분)
- 미니맥스 난이도에서 사람은 무조건 무승부 이상(이길 수 없음) — 알고리즘 학습용으로 활용

### `game-05` — Canvas + 입력 디바이스 3종
- 패들에 맞은 위치(중앙 = 0, 좌우 끝 = ±0.5)에 따라 반사각 변화 → 공 컨트롤 가능
- 모든 벽돌 파괴 → 레벨업(공 속도 ×1.1)
- 키보드(`←→`) + 마우스(`mousemove`) + 터치(`touchmove`) 입력 모두 지원
- `requestAnimationFrame` 루프 + `paused` 플래그로 일시정지

## 누적 결과

| platform | 기존 | 003 추가 | 004 추가 | 합계 |
|---|---|---|---|---|
| web | 7 | 6 | 2 | 15 |
| app | 2 | 1 | 2 | 5 |
| ai | 2 | 1 | 2 | 5 |
| data | 2 | 1 | 2 | 5 |
| game | 2 | 1 | 2 | 5 |
| **계** | **15** | **10** | **10** | **35** |

## 다음 단계

- [ ] 실제 모바일 기기에서 각 샘플 터치/스크롤 동작 점검
- [ ] 사용자 피드백 받아 카테고리 라벨 정비 (현재 `utility`가 너무 광범위)
- [ ] `learning-01`/`learning-02`와 `data-01`/`data-04`처럼 같은 도메인의 비교 케이스 더 확보
- [ ] 003·004에서 잡은 디자인 토큰을 `samples/_tokens.css` 같은 공유 파일로 추출 검토(현재는 각 샘플 self-contained)
