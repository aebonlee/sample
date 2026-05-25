import type { ProjectData } from './projectDetails';

/**
 * 한국기술교육대학교(KOREATECH) 재학생을 위한 7가지 Solar LLM 프로젝트
 * - 공학·전공 심화 시나리오 (캡스톤, 논문, 코드 리뷰, 실험 보고서, 면접 등)
 * - 기존 프로젝트 샘플과 동일한 구조 (아키텍처/파이프라인/Solar API/프롬프트/구현/배포/확장)
 */
export const PROJECT_DATA_KOREATECH: ProjectData[] = [
  {
    id: 1,
    title: 'AI 캡스톤 디자인 코치',
    subtitle: '전공·관심사·기술 스택을 입력하면 Solar LLM이 캡스톤 프로젝트 아이디어 발굴부터 타당성 검증, 8주 로드맵까지 제시하는 지도교수형 에이전트',
    color: '#0046C8',
    icon: '🎓',
    overview: '한기대 캡스톤 디자인 수업에서 학생들이 가장 어려워하는 "주제 선정"과 "범위 설정"을 Solar Chat이 1:1 멘토처럼 도와줍니다. 학생의 전공/관심 분야/보유 기술을 기반으로 산업 트렌드를 반영한 주제 후보를 제안하고, SMART 기준으로 타당성을 검증하며, 8주 차 단위로 단계별 마일스톤과 산출물 체크리스트를 자동 생성합니다.',
    targetUsers: ['한기대 4학년 캡스톤 수강생', '졸업 프로젝트 담당 교수/조교', '대학 캡스톤 디자인 운영팀', '소규모 PBL 팀(2~5명)', '산학협력 멘토'],
    objectives: [
      'Solar Chat API의 멀티턴 대화로 아이디어 발산-수렴 프로세스 구축',
      'SMART(Specific·Measurable·Achievable·Relevant·Time-bound) 기반 타당성 평가 자동화',
      '학과·전공별 차별화된 주제 제안 프롬프트 설계 (CSE/EE/ME/ID 등)',
      '8주 캡스톤 마일스톤 자동 생성 + Notion/Markdown 내보내기',
      '팀별 진척도 트래킹 대시보드 + 위험 신호 감지',
    ],
    architecture: {
      description: '입력 수집 → Solar Chat 아이디어 발산 → 평가 모듈 → 로드맵 생성 → 팀 대시보드로 이어지는 5-stage 멘토링 파이프라인',
      components: [
        { name: '학생 프로필 폼', description: '전공, 기술 스택, 관심 산업, 사용 가능 시간 입력', tech: 'React + Zod' },
        { name: '아이디어 발산기', description: 'Solar Chat에 학생 컨텍스트를 system 프롬프트로 주입, 5개 후보 생성', tech: 'Solar Chat API' },
        { name: '타당성 평가 모듈', description: 'SMART 5축 점수화 + 시장성/구현 난이도 코멘트', tech: 'Solar Chat API + Rubric Prompt' },
        { name: '로드맵 생성기', description: '선택된 주제를 8주 마일스톤·산출물·리스크로 분해', tech: 'Solar Chat API' },
        { name: '팀 대시보드', description: '주간 체크인, 리스크 알림, 멘토 코멘트 누적', tech: 'React + Supabase Realtime' },
      ],
      diagram: `┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│  학생 프로필   │────▶│  Solar Chat   │────▶│   타당성       │
│ (전공/기술)   │     │ (아이디어 5개) │     │   평가 (SMART) │
└──────────────┘     └───────────────┘     └──────┬───────┘
                                                   │
                    ┌───────────────┐     ┌────────▼───────┐
                    │  팀 대시보드   │◀────│  8주 로드맵     │
                    │ (주간 트래킹) │     │  생성기        │
                    └───────────────┘     └────────────────┘`,
    },
    pipeline: {
      steps: [
        { step: 1, title: '프로필 수집', description: '전공, 관심 산업(자율주행/스마트팩토리/AI 등), 보유 기술, 팀 구성 입력', tools: 'React Form + Zod' },
        { step: 2, title: '아이디어 발산', description: 'Solar Chat이 학생 컨텍스트 + 산업 트렌드 기반으로 5개 캡스톤 후보 + 한 줄 임팩트 설명 생성', tools: 'Solar Chat API (temperature 0.9)' },
        { step: 3, title: 'SMART 평가', description: '각 후보를 5축(구체성/측정가능성/실현가능성/관련성/기한)으로 0-5점 채점 + 개선 코멘트', tools: 'Solar Chat (Rubric Prompt)' },
        { step: 4, title: '주제 확정 & 로드맵', description: '학생이 1개 선택 → Solar가 8주 마일스톤, 주차별 산출물, 예상 리스크 자동 생성', tools: 'Solar Chat API' },
        { step: 5, title: '주간 트래킹', description: '주차마다 진척도 입력 → Solar가 리스크 평가 + 다음 주 액션 추천', tools: 'Supabase + Solar Chat' },
        { step: 6, title: 'Notion/Markdown 내보내기', description: '최종 로드맵·계획서를 한 번에 export하여 발표 자료로 활용', tools: 'react-markdown + jsPDF' },
      ],
    },
    solarApi: {
      description: 'Solar Chat을 멘토 페르소나로 활용. 학생 프로필을 system 메시지로 고정하고 대화 흐름에 따라 다른 task 프롬프트를 주입합니다.',
      endpoints: [
        {
          name: 'Solar Chat (아이디어 발산)',
          purpose: '학생 컨텍스트 기반 캡스톤 주제 5개 생성',
          example: `POST https://api.upstage.ai/v1/solar/chat/completions
{
  "model": "solar-pro",
  "messages": [
    {"role": "system", "content": "당신은 한기대 캡스톤 지도교수입니다. 학생의 전공={major}, 기술={skills}, 관심 산업={industry}에 맞는 졸업 프로젝트를 추천합니다."},
    {"role": "user", "content": "JSON 형식으로 5개 후보를 출력: [{title, oneLineImpact, requiredSkills, estimatedWeeks}]"}
  ],
  "temperature": 0.9
}`,
        },
        {
          name: 'Solar Chat (SMART 평가)',
          purpose: '선정된 후보를 5축으로 채점',
          example: `{"role": "user", "content": "다음 주제를 SMART 기준으로 채점하고 개선안을 제시하세요.\\n주제: {title}\\n출력: {specific:0-5, measurable:0-5, achievable:0-5, relevant:0-5, timeBound:0-5, improvements:[...]}"}`,
        },
      ],
    },
    prompts: {
      description: '학과별 차별화된 시스템 프롬프트와 SMART 평가 루브릭을 결합',
      examples: [
        {
          title: '전공별 아이디어 발산 프롬프트',
          prompt: `[시스템] 당신은 한국기술교육대학교 {major} 학과의 캡스톤 지도교수입니다.
- CSE: AI/웹/모바일/시스템 SW 위주, 산업 데이터 활용 강조
- EE:  임베디드/PCB/IoT 위주, 하드웨어-소프트웨어 통합 강조
- ME:  CAD/3D 프린팅/메카트로닉스 위주, 실물 제작 강조
- ID:  사용자 경험/시제품 디자인 위주, 사용자 검증 강조

[규칙]
- 8주 안에 완성 가능한 범위
- 보유 기술 {skills}만으로 시작 가능해야 함
- 산업 트렌드({industry}) 반영
- 한 주제당 한 줄로 임팩트 표현`,
          note: '학과별 페르소나를 system 프롬프트로 고정하여 결과의 일관성 확보',
        },
        {
          title: '주간 트래킹 프롬프트',
          prompt: `이번 주 진척:
- 목표: {planned}
- 실제 완료: {done}
- 막힌 부분: {blocker}

위 내용을 보고 다음 주 추천 액션 3가지와 리스크 레벨(low/mid/high)을 JSON으로 출력하세요.`,
          note: '단순한 보고가 아닌, 다음 주 액션 가이드까지 추출하는 능동형 멘토 프롬프트',
        },
      ],
    },
    implementation: {
      frontend: {
        description: '대화형 멘토링 UI. 학생 프로필 폼, 아이디어 카드 그리드, SMART 레이더 차트, 주차별 칸반 보드',
        pages: ['홈 (시작/이전 프로젝트 이어가기)', '프로필 입력', '아이디어 발산 결과 (5장 카드)', 'SMART 평가 상세', '8주 로드맵', '주간 체크인', '팀 대시보드'],
        stack: 'React 19 + TypeScript + Recharts (레이더 차트) + react-markdown',
      },
      backend: {
        description: 'Supabase Edge Functions로 Solar API 호출 중개 + 멘토링 세션 영구 저장',
        apis: ['POST /capstone/ideate — 5개 후보 생성', 'POST /capstone/evaluate — SMART 평가', 'POST /capstone/roadmap — 8주 로드맵', 'POST /capstone/checkin — 주간 진척 + 다음 주 액션', 'GET /capstone/team/:id — 팀 대시보드'],
        stack: 'Supabase Edge Functions (Deno) + Solar API',
      },
      database: {
        tables: [
          { name: 'capstone_sessions', fields: 'id, student_id, major, skills(jsonb), industry, selected_idea(jsonb), created_at' },
          { name: 'capstone_milestones', fields: 'id, session_id, week, title, deliverables(jsonb), risk_level, done' },
          { name: 'capstone_checkins', fields: 'id, session_id, week, planned, done, blocker, ai_advice(jsonb), created_at' },
        ],
      },
    },
    deployment: {
      steps: ['Vite build → GitHub Pages 배포', 'Supabase 프로젝트 생성 + RLS 정책 설정 (학생/팀별 격리)', 'Edge Functions 배포 (supabase functions deploy)', 'Solar API Key를 Supabase Secrets로 안전 저장', '학과별 커스텀 도메인 (capstone.koreatech.ac.kr 등) 연결'],
      infra: 'GitHub Pages (프론트) + Supabase (인증/DB/Edge Functions) + Solar API',
    },
    expansion: ['학과별 캡스톤 우수작 자동 큐레이션', '산학협력 기업과 매칭 (관심 산업 기반)', '졸업 후 포트폴리오 자동 생성', '캡스톤 보고서 영문 자동 번역', '교수 평가용 채점 보조 모듈'],
  },

  {
    id: 2,
    title: '공학 논문 요약·인용 도우미',
    subtitle: '영문 IEEE/Elsevier 논문 PDF를 업로드하면 Solar LLM이 핵심 기여·실험 결과·한계점을 한국어로 요약하고, 관련 인용 논문까지 자동 추천',
    color: '#7C3AED',
    icon: '📚',
    overview: '학부 4학년·대학원생이 매주 수십 편의 영문 공학 논문을 읽어야 하는 부담을 줄입니다. PDF에서 본문을 추출해 Solar LLM이 IMRaD(Intro/Method/Result/Discussion) 구조로 한국어 요약을 생성하고, 인용된 핵심 논문 5개를 자동 식별해 관련성 점수와 함께 표시합니다. 본인의 연구 주제와 매칭도까지 산출.',
    targetUsers: ['공학 학부 졸업연구생', '대학원생 (석/박사)', '연구실 신입생 (지도 자료용)', '논문 세미나 운영자', '리뷰어 (학회 심사용)'],
    objectives: [
      'PDF 텍스트 추출 + IMRaD 구조 파싱',
      'Solar Chat의 long-context로 논문 전체를 한 번에 요약',
      '인용 그래프 분석 (참고문헌 자동 추출 및 분류)',
      '연구 주제 매칭도 산출 (코사인 유사도)',
      '한국어 학술 용어 사전 연동',
    ],
    architecture: {
      description: 'PDF 입력 → 텍스트 추출 → IMRaD 분할 → Solar 요약 → 인용 그래프 → 매칭도 출력 6-단계 파이프라인',
      components: [
        { name: 'PDF 업로더', description: '드래그앤드롭, 최대 50MB, 페이지 미리보기', tech: 'react-dropzone + pdf.js' },
        { name: '텍스트 추출 엔진', description: 'pdf.js로 페이지별 텍스트 추출 + 수식/도표 영역 마킹', tech: 'pdf.js' },
        { name: 'IMRaD 파서', description: 'Solar Chat으로 본문을 Intro/Method/Result/Discussion으로 분할', tech: 'Solar Chat API' },
        { name: '요약 엔진', description: '섹션별 한국어 요약 + 핵심 기여 3줄', tech: 'Solar Chat API' },
        { name: '인용 그래프', description: '참고문헌에서 핵심 인용 5개 추출 + 관련성 점수', tech: 'Solar Chat + Embedding API' },
      ],
      diagram: `┌──────────┐    ┌──────────────┐    ┌────────────────┐
│  PDF 업로드│──▶│ pdf.js 추출   │──▶│ IMRaD 분할     │
└──────────┘    └──────────────┘    │ (Solar Chat)   │
                                     └────────┬───────┘
                ┌──────────────┐              │
                │ 한국어 요약    │◀─────────────┤
                │ (Solar Chat)  │              │
                └──────┬───────┘    ┌────────▼───────┐
                       │            │ 인용 그래프 분석│
                ┌──────▼───────┐    │ (참고문헌 5개)  │
                │ 매칭도 산출   │◀───┤                │
                │ (Embedding)   │    └────────────────┘
                └──────────────┘`,
    },
    pipeline: {
      steps: [
        { step: 1, title: 'PDF 업로드', description: '학생이 PDF 드래그앤드롭. 페이지 썸네일 + 메타데이터(저자/제목/연도) 미리보기', tools: 'react-dropzone + pdf.js' },
        { step: 2, title: '텍스트 추출', description: 'pdf.js로 본문 추출. 수식·도표 영역은 별도 마킹하여 요약 노이즈 제거', tools: 'pdf.js' },
        { step: 3, title: 'IMRaD 분할', description: 'Solar Chat이 전체 텍스트를 Introduction / Method / Result / Discussion으로 분할', tools: 'Solar Chat API (long context)' },
        { step: 4, title: '섹션별 요약', description: '각 섹션을 3~5문장 한국어로 요약 + 전체 핵심 기여 3줄', tools: 'Solar Chat API' },
        { step: 5, title: '인용 분석', description: '참고문헌 리스트에서 인용 빈도가 높거나 핵심 주장에 인용된 5개를 자동 식별', tools: 'Solar Chat + Embedding' },
        { step: 6, title: '연구 매칭', description: '학생의 본인 연구 주제 키워드와 Embedding 코사인 유사도 산출 (0~1)', tools: 'Solar Embedding API' },
      ],
    },
    solarApi: {
      description: 'Solar Chat(long context)으로 전체 논문을 한 번에 처리하고, Solar Embedding으로 유사도 계산',
      endpoints: [
        {
          name: 'Solar Chat Completion (long-context)',
          purpose: '논문 전체 요약 및 IMRaD 분할',
          example: `POST https://api.upstage.ai/v1/solar/chat/completions
{
  "model": "solar-pro",
  "messages": [
    {"role": "system", "content": "당신은 공학 논문을 한국어로 요약하는 연구 보조자입니다. 출력은 JSON: {intro, method, result, discussion, contributions[3]}"},
    {"role": "user", "content": "{paper_text}"}
  ],
  "max_tokens": 4000
}`,
        },
        {
          name: 'Solar Embedding API',
          purpose: '본인 연구 주제와의 매칭도 계산',
          example: `POST https://api.upstage.ai/v1/solar/embeddings
{"model": "solar-embedding-1-large", "input": ["{paper_abstract}", "{my_research_topic}"]}
// 코사인 유사도 계산 후 0~1로 정규화`,
        },
      ],
    },
    prompts: {
      description: 'IMRaD 구조 추출과 한국어 학술 요약을 위한 프롬프트 설계',
      examples: [
        {
          title: 'IMRaD 분할 프롬프트',
          prompt: `다음 영문 논문 본문을 IMRaD 구조로 분할하여 JSON으로 출력하세요.
각 섹션은 한국어로 3~5문장 요약 + 원문 핵심 인용 1줄.

[규칙]
- "method"는 사용 데이터셋, 모델, 평가 지표를 반드시 포함
- "result"는 정량 수치(정확도, F1, MSE 등)를 빠뜨리지 말 것
- "contributions"는 정확히 3개

[본문]
{paper_text}`,
          note: 'JSON 강제로 후속 렌더링 안정성 확보. 수치는 누락되지 않도록 명시',
        },
        {
          title: '인용 분석 프롬프트',
          prompt: `다음 논문 본문에서 가장 핵심적으로 인용된 5개 참고문헌을 식별하세요.
인용 빈도 + 핵심 주장 뒷받침 정도로 가중치 부여.

출력: [{ref_id, title, why_important, weight: 0-1}]`,
          note: 'why_important로 학생에게 "왜 이 논문도 읽어야 하는지" 컨텍스트 제공',
        },
      ],
    },
    implementation: {
      frontend: {
        description: '논문 뷰어와 요약 패널이 좌우 분할된 워크스페이스 UI',
        pages: ['홈 (업로드)', 'PDF 뷰어 (좌) + 요약 패널 (우)', 'IMRaD 섹션 카드', '인용 그래프 시각화', '내 라이브러리 (업로드 기록)', '본인 연구 키워드 설정'],
        stack: 'React 19 + pdf.js + Recharts (그래프) + react-pdf-viewer',
      },
      backend: {
        description: 'Supabase Edge Functions로 Solar API 호출 + PDF Storage',
        apis: ['POST /paper/upload — PDF 저장 + 추출', 'POST /paper/summarize — IMRaD 요약', 'POST /paper/citations — 인용 분석', 'POST /paper/similarity — 매칭도', 'GET /paper/library — 내 논문'],
        stack: 'Supabase Edge Functions + Storage + Solar API',
      },
      database: {
        tables: [
          { name: 'papers', fields: 'id, user_id, title, authors(jsonb), year, pdf_url, full_text, created_at' },
          { name: 'paper_summaries', fields: 'id, paper_id, intro, method, result, discussion, contributions(jsonb)' },
          { name: 'paper_citations', fields: 'id, paper_id, ref_id, title, why_important, weight' },
        ],
      },
    },
    deployment: {
      steps: ['Vite build + GitHub Pages 배포', 'Supabase Storage 버킷 생성 (PDF 저장용, RLS로 사용자별 격리)', 'pdf.js worker를 별도 chunk로 분리하여 초기 로딩 최적화', 'Solar API 사용량 모니터링 + 학생당 월 50회 제한', 'CDN 캐싱 (요약 결과는 영구 저장 후 재사용)'],
      infra: 'GitHub Pages + Supabase (Storage/Edge/DB) + Solar API',
    },
    expansion: ['연구실 단위 공동 라이브러리', '학회 발표 슬라이드 자동 생성', '한국어→영어 논문 번역 보조', 'BibTeX 자동 변환', '연구 주제 트렌드 분석 대시보드'],
  },

  {
    id: 3,
    title: 'AI 코드 리뷰 멘토',
    subtitle: '학생이 GitHub PR 또는 코드 스니펫을 제출하면 Solar LLM이 스타일·버그·성능·보안 4축으로 시니어 리뷰어처럼 코멘트를 자동 생성',
    color: '#059669',
    icon: '🧑‍💻',
    overview: '한기대 프로그래밍 수업과 동아리에서 학생들은 코드 피드백을 받기 어렵습니다. 이 도구는 학생이 코드를 제출하면 Solar Chat이 시니어 개발자 페르소나로 4가지 축(스타일/버그 위험/성능/보안)을 분석하고, 줄 단위 코멘트를 생성합니다. 개선 패치까지 diff 형태로 제시해 즉시 적용 가능합니다.',
    targetUsers: ['프로그래밍 수업 수강생', '소프트웨어공학 캡스톤 팀', '코딩 동아리 신입생', '조교 (피드백 부담 경감)', '비대면 학습자'],
    objectives: [
      'Solar Chat으로 시니어 리뷰어 페르소나 구현',
      '4축 리뷰 루브릭(스타일/버그/성능/보안) 자동 채점',
      '줄 단위 코멘트 + diff 패치 생성',
      'Python·JavaScript·C++ 등 다중 언어 지원',
      'GitHub PR 웹훅 연동 (자동 리뷰)',
    ],
    architecture: {
      description: '코드 제출 → AST 추출 → 4축 평가 → 줄 코멘트 + 패치 생성 → 점수 보고서 출력',
      components: [
        { name: '코드 에디터', description: 'Monaco Editor 기반 다중 언어 입력', tech: 'Monaco + react-monaco-editor' },
        { name: '언어 감지기', description: '확장자/내용 기반 언어 식별', tech: 'guess-language.js' },
        { name: '리뷰 엔진', description: 'Solar Chat에 코드 + 루브릭 주입', tech: 'Solar Chat API' },
        { name: '패치 생성기', description: '개선안을 unified diff 형식으로 생성', tech: 'Solar Chat + diff-match-patch' },
        { name: 'GitHub 웹훅', description: 'PR 생성 이벤트 수신 → 자동 리뷰 코멘트 작성', tech: 'GitHub Webhook + Edge Function' },
      ],
      diagram: `┌──────────┐    ┌──────────────┐    ┌────────────────┐
│ 코드 입력  │──▶│ 언어 감지     │──▶│ 4축 리뷰        │
└──────────┘    │ (Py/JS/C++)  │    │ (Solar Chat)   │
                └──────────────┘    └────────┬───────┘
┌──────────────┐                              │
│ GitHub 웹훅   │──┐               ┌──────────▼─────┐
└──────────────┘  │               │ 줄 단위 코멘트 + │
                  └──────────────▶│ diff 패치 생성  │
                                  └────────────────┘`,
    },
    pipeline: {
      steps: [
        { step: 1, title: '코드 수집', description: '에디터 입력 또는 GitHub PR URL. 다중 파일 지원', tools: 'Monaco / Octokit' },
        { step: 2, title: '언어 감지', description: '확장자 우선, 내용 분석 fallback', tools: 'guess-language.js' },
        { step: 3, title: '루브릭 적용', description: '4축(스타일/버그/성능/보안)을 system 프롬프트로 고정', tools: 'Solar Chat API' },
        { step: 4, title: '리뷰 생성', description: '줄 단위 코멘트 + 종합 점수 + 우선순위', tools: 'Solar Chat API' },
        { step: 5, title: '패치 제안', description: '주요 이슈를 unified diff 형식으로 출력', tools: 'Solar Chat + diff-match-patch' },
        { step: 6, title: 'GitHub 코멘트', description: '웹훅 모드에서는 PR에 자동으로 review comment 작성', tools: 'Octokit (createReviewComment)' },
      ],
    },
    solarApi: {
      description: 'Solar Chat을 시니어 리뷰어로 구동. 언어별 시스템 프롬프트를 분기',
      endpoints: [
        {
          name: 'Solar Chat (코드 리뷰)',
          purpose: '4축 코드 리뷰 자동 생성',
          example: `POST https://api.upstage.ai/v1/solar/chat/completions
{
  "model": "solar-pro",
  "messages": [
    {"role": "system", "content": "당신은 {language} 시니어 개발자입니다. 4축(스타일/버그/성능/보안)으로 줄 단위 코드 리뷰를 작성하세요. 출력은 JSON: {scores: {...}, comments: [{line, severity, message, suggestion}], overall}"},
    {"role": "user", "content": "{code}"}
  ],
  "temperature": 0.3
}`,
        },
        {
          name: 'Solar Chat (패치 생성)',
          purpose: '핵심 이슈에 대한 unified diff 패치 생성',
          example: `{"role": "user", "content": "다음 이슈를 해결하는 패치를 unified diff로 출력하세요.\\n이슈: {issue}\\n원본 코드: {code}"}`,
        },
      ],
    },
    prompts: {
      description: '시니어 리뷰어 페르소나 + 언어별 베스트 프랙티스 주입',
      examples: [
        {
          title: '코드 리뷰 시스템 프롬프트',
          prompt: `[페르소나] 당신은 10년 차 {language} 시니어 개발자입니다.

[루브릭]
1. 스타일 (0-25): 명명 규칙, PEP8/ESLint 준수, 가독성
2. 버그 위험 (0-25): 엣지 케이스, null 처리, 예외 처리
3. 성능 (0-25): 시간/공간 복잡도, 불필요한 연산
4. 보안 (0-25): 입력 검증, SQL/XSS, 비밀 정보 노출

[규칙]
- severity는 critical / warning / info 중 하나
- suggestion은 구체적인 개선 코드 (없으면 null)
- 칭찬할 부분도 1개 이상 포함
- 100점 만점 + 합산`,
          note: '루브릭을 시스템 프롬프트에 고정하여 채점의 일관성 확보. 칭찬 항목으로 학습 동기 보존',
        },
        {
          title: '패치 생성 프롬프트',
          prompt: `다음 이슈를 해결하는 최소 변경 패치를 unified diff 형식으로 출력하세요.
- 기존 코드 스타일 유지
- 변경 라인은 5줄 이내
- 변경 이유 1줄 주석 포함

이슈: {issue_message}
원본 코드:
\`\`\`
{code}
\`\`\``,
          note: '최소 변경 원칙으로 학생이 적용/이해하기 쉬운 패치 생성',
        },
      ],
    },
    implementation: {
      frontend: {
        description: '좌측 Monaco 에디터, 우측 리뷰 패널의 분할 레이아웃',
        pages: ['홈 (시작/이전 리뷰)', '에디터 + 리뷰 분할 뷰', 'PR URL 임포트', '리뷰 히스토리', '점수 추이 대시보드', '설정 (언어/루브릭 가중치)'],
        stack: 'React 19 + Monaco Editor + Octokit + Recharts',
      },
      backend: {
        description: 'Edge Functions로 Solar 호출 + GitHub 웹훅 수신',
        apis: ['POST /review/run — 코드 리뷰 실행', 'POST /review/patch — 패치 생성', 'POST /webhook/github — PR 이벤트 수신', 'GET /review/history — 내 리뷰', 'GET /review/scores — 점수 추이'],
        stack: 'Supabase Edge Functions + GitHub API + Solar API',
      },
      database: {
        tables: [
          { name: 'reviews', fields: 'id, user_id, language, code_snippet, scores(jsonb), comments(jsonb), created_at' },
          { name: 'review_patches', fields: 'id, review_id, issue_id, diff_text, applied' },
          { name: 'gh_webhooks', fields: 'id, repo, pr_number, sha, review_id, created_at' },
        ],
      },
    },
    deployment: {
      steps: ['Vite build → GitHub Pages 배포', 'Supabase Edge Functions 배포', 'GitHub App 등록 (PR 코멘트 권한)', 'Solar API Key + GitHub App Secret을 Supabase Secrets에 저장', '학생당 일 30회 리뷰 제한'],
      infra: 'GitHub Pages + Supabase + GitHub App + Solar API',
    },
    expansion: ['교수/조교 채점 보조 (자동 점수 + 수동 보정)', '팀 코드 컨벤션 룰 학습', '취업 코딩 테스트 모의 리뷰', '오픈소스 기여 가이드', '리뷰 점수 누적으로 학생 성장 트래킹'],
  },

  {
    id: 4,
    title: '공학 영어 작문 코치',
    subtitle: '한국어 기술 문서·논문 초안을 입력하면 Solar LLM이 학술 영어로 교정·번역하고, 표현 대안과 문법 근거까지 제시하는 작문 튜터',
    color: '#DC2626',
    icon: '✍️',
    overview: '한기대 학생들이 졸업논문 영문 abstract, IEEE conference 투고, 특허 명세서, 영문 이력서 작성에서 자주 막히는 부분을 해결합니다. Solar LLM이 학술 영어 스타일로 교정하고, 변경 사항 각각에 대해 문법 근거와 더 나은 표현 2~3개를 제시합니다.',
    targetUsers: ['졸업논문 영문 abstract 작성자', '학술 학회 투고자 (IEEE/Elsevier)', '대학원 진학 준비생 (SOP)', '특허 명세서 작성자', '영문 이력서/포트폴리오 작성자'],
    objectives: [
      '학술 영어 스타일 가이드 자동 적용',
      '교정 사항별 문법 근거 제공 (학습 효과)',
      '동의어/유사 표현 대안 2~3개 제시',
      '문서 유형별(논문/특허/이력서) 톤 자동 분기',
      '한→영 번역과 영→영 교정 모두 지원',
    ],
    architecture: {
      description: '입력 분석 → 문서 유형 분류 → 교정 + 근거 → 대안 표현 → diff 출력',
      components: [
        { name: '입력 에디터', description: '한국어/영어 혼합 입력, 마크다운 지원', tech: 'Tiptap + React' },
        { name: '문서 유형 분류기', description: '논문/특허/이력서/일반 중 자동 분류', tech: 'Solar Chat API' },
        { name: '교정 엔진', description: '학술 영어 스타일로 변환 + 변경 이유', tech: 'Solar Chat API' },
        { name: '대안 표현 모듈', description: '핵심 표현에 대해 2~3개 동의어 제공', tech: 'Solar Chat API' },
        { name: 'Diff 뷰어', description: '변경사항을 빨강/초록 색상으로 표시', tech: 'diff-match-patch' },
      ],
      diagram: `┌──────────┐    ┌──────────────┐    ┌────────────────┐
│ 텍스트 입력 │──▶│ 문서 유형 분류 │──▶│ 학술 영어 교정  │
└──────────┘    │ (논문/특허)   │    │ (Solar Chat)   │
                └──────────────┘    └────────┬───────┘
                                              │
                ┌──────────────┐    ┌────────▼───────┐
                │  Diff 뷰어    │◀───┤ 대안 표현 + 근거│
                │ (색상 표시)   │    │                │
                └──────────────┘    └────────────────┘`,
    },
    pipeline: {
      steps: [
        { step: 1, title: '입력 수집', description: '한/영 혼합 텍스트 + (선택) 문서 유형 지정', tools: 'Tiptap Editor' },
        { step: 2, title: '유형 분류', description: '본문 패턴으로 논문/특허/이력서/일반 자동 분류', tools: 'Solar Chat API' },
        { step: 3, title: '교정 실행', description: '유형별 스타일 가이드를 system 프롬프트에 주입', tools: 'Solar Chat API' },
        { step: 4, title: '근거 추출', description: '각 교정 사항에 대해 문법/관용 근거 1줄', tools: 'Solar Chat API' },
        { step: 5, title: '대안 제시', description: '핵심 표현에 대해 동의어 2~3개', tools: 'Solar Chat API' },
        { step: 6, title: 'Diff 출력', description: '변경 전/후 비교 + 클릭 시 근거 팝업', tools: 'diff-match-patch + React' },
      ],
    },
    solarApi: {
      description: 'Solar Chat을 학술 영어 교정자로 활용. 문서 유형별 시스템 프롬프트 분기',
      endpoints: [
        {
          name: 'Solar Chat (학술 영어 교정)',
          purpose: '한국어/영어 입력을 학술 영어로 변환',
          example: `POST https://api.upstage.ai/v1/solar/chat/completions
{
  "model": "solar-pro",
  "messages": [
    {"role": "system", "content": "당신은 IEEE 학회 영문 에디터입니다. 입력을 {docType} 스타일의 학술 영어로 교정하고, 각 변경에 대해 문법 근거를 영어 1줄로 제시하세요. JSON 출력: {revised, changes: [{from, to, reason, alternatives}]}"},
    {"role": "user", "content": "{text}"}
  ],
  "temperature": 0.2
}`,
        },
        {
          name: 'Solar Chat (대안 표현)',
          purpose: '핵심 어구에 대한 동의어 제시',
          example: `{"role": "user", "content": "다음 학술 표현의 동의어 3개를 형식성 순으로 출력: {phrase}"}`,
        },
      ],
    },
    prompts: {
      description: '문서 유형별 스타일 가이드 + 학습 효과를 위한 근거 의무화',
      examples: [
        {
          title: '문서 유형별 시스템 프롬프트',
          prompt: `[유형별 스타일]
- 논문: 수동태 70% / 정량적 표현 / 인용 형식 (Author, Year)
- 특허: "comprising" "wherein" 같은 법적 어휘 / 청구항 번호 매김
- 이력서: 동사 강조 (Developed/Designed/Improved) / 정량 임팩트
- 일반: 명확성 우선

[필수 출력]
1. revised: 교정된 전체 텍스트
2. changes: 각 변경에 {from, to, reason(영어 1줄), alternatives[2]}
3. tone_score: 학술성 0~100`,
          note: '문서 유형이 결과 톤을 크게 좌우하므로 명시적 분기',
        },
        {
          title: '학습용 근거 프롬프트',
          prompt: `다음 교정 변경에 대해 영문법 또는 관용 표현 근거를 1줄로 제시하세요.
변경: "{from}" → "{to}"
근거 형식 예: "Use passive voice for objectivity in IMRaD methodology sections."`,
          note: '학생이 다음 번에 스스로 교정할 수 있도록 학습 효과 강화',
        },
      ],
    },
    implementation: {
      frontend: {
        description: '좌측 입력, 우측 교정 결과 + 변경 하이라이트',
        pages: ['홈 (작성 시작/이전 글)', '에디터 + 교정 결과', '변경 사항 상세 (근거 + 대안)', '내 글 라이브러리', '문서 유형 가이드', '용어집 (자주 쓰는 표현 저장)'],
        stack: 'React 19 + Tiptap + diff-match-patch + Tailwind',
      },
      backend: {
        description: 'Edge Functions로 Solar API 호출, 글 영구 저장',
        apis: ['POST /writing/refine — 교정 실행', 'POST /writing/alternatives — 대안 표현', 'POST /writing/classify — 유형 분류', 'GET /writing/history — 내 글', 'POST /writing/glossary — 용어집'],
        stack: 'Supabase Edge Functions + Solar API',
      },
      database: {
        tables: [
          { name: 'writings', fields: 'id, user_id, doc_type, original, revised, changes(jsonb), tone_score, created_at' },
          { name: 'writing_glossary', fields: 'id, user_id, term_ko, term_en, alternatives(jsonb)' },
        ],
      },
    },
    deployment: {
      steps: ['Vite build + GitHub Pages 배포', 'Supabase Edge Functions 배포', '학과별 자주 쓰는 용어집 시드 데이터 적재', 'Solar API 사용량 모니터링', 'PDF/DOCX 내보내기 기능 (선택)'],
      infra: 'GitHub Pages + Supabase + Solar API',
    },
    expansion: ['Overleaf (LaTeX) 플러그인', '교수 첨삭 흔적 학습으로 개인화', '학과별 용어집 공유', '논문 표절 검사 연동', '대학원 SOP 작성 가이드'],
  },

  {
    id: 5,
    title: 'PBL 실험 보고서 자동 분석기',
    subtitle: '실험 측정 데이터(CSV) + 자연어 메모를 입력하면 Solar LLM이 표·그래프·고찰까지 포함한 실험 보고서 초안을 자동 생성',
    color: '#EA580C',
    icon: '🧪',
    overview: '한기대 전공 실험(전자회로/유체역학/기계공작 등) 보고서는 측정 데이터 분석 + 한국어 고찰 작성에 시간이 많이 들어갑니다. 학생이 CSV 데이터와 짧은 한국어 메모를 입력하면 Solar LLM이 이론값과의 오차 분석, 그래프 캡션, 오차 원인 가설, 결론까지 보고서 형식으로 자동 생성합니다.',
    targetUsers: ['전공 실험 과목 수강생', '캡스톤 실험팀', '실험 조교 (피드백 효율화)', '연구실 학부생 인턴', '실험 동아리'],
    objectives: [
      'CSV 데이터를 자동 파싱하고 이론값과 비교',
      '오차율·표준편차·결정계수(R²) 자동 계산',
      'matplotlib/Recharts 그래프 자동 생성 + 캡션',
      '오차 원인 가설 자동 제안 (Solar Chat)',
      '한국어 학술 톤 고찰 단락 자동 작성',
    ],
    architecture: {
      description: 'CSV 업로드 → 통계 계산 → 그래프 생성 → Solar 고찰 작성 → 보고서 export',
      components: [
        { name: 'CSV 업로더 + 매핑 UI', description: '컬럼 → 변수명 매핑 (X/Y/이론값)', tech: 'react-dropzone + Papa Parse' },
        { name: '통계 계산 엔진', description: '오차율, σ, R² 자동 계산', tech: 'simple-statistics' },
        { name: '그래프 생성기', description: 'Recharts로 산점도/오차막대 자동', tech: 'Recharts' },
        { name: '고찰 작성 엔진', description: '통계 + 메모 → 한국어 고찰 단락', tech: 'Solar Chat API' },
        { name: '보고서 export', description: 'PDF/DOCX/Markdown 형식 출력', tech: 'jsPDF + docx.js' },
      ],
      diagram: `┌──────────┐    ┌──────────────┐    ┌────────────────┐
│ CSV 업로드 │──▶│ 통계 계산     │──▶│ 그래프 생성     │
└──────────┘    │ (오차/R²/σ)  │    │ (Recharts)     │
                └──────┬───────┘    └────────┬───────┘
┌──────────┐          │                       │
│ 메모 입력  │──────────▼───────────┐  ┌──────▼───────┐
└──────────┘    ┌──────────────┐  │  │ 보고서 export│
                │ 고찰 작성     │◀─┘  │ (PDF/DOCX)   │
                │ (Solar Chat)  │     └──────────────┘
                └──────────────┘`,
    },
    pipeline: {
      steps: [
        { step: 1, title: 'CSV 업로드', description: '측정 데이터 파일 업로드. 학생이 컬럼 → 변수 역할(X/Y/이론값) 매핑', tools: 'Papa Parse' },
        { step: 2, title: '통계 계산', description: '평균/표준편차/오차율/R²를 자동 계산. 이상치 자동 검출', tools: 'simple-statistics' },
        { step: 3, title: '그래프 생성', description: '산점도 + 회귀선 + 오차 막대', tools: 'Recharts' },
        { step: 4, title: '메모 분석', description: '학생의 한국어 메모(실험 환경/특이사항)를 키워드 추출', tools: 'Solar Chat API' },
        { step: 5, title: '고찰 작성', description: '통계 + 메모 + 그래프 정보를 종합해 한국어 학술 톤 단락 생성', tools: 'Solar Chat API' },
        { step: 6, title: '보고서 출력', description: '제목/요약/표/그래프/고찰/결론을 PDF/DOCX/Markdown 한 번에', tools: 'jsPDF + docx.js' },
      ],
    },
    solarApi: {
      description: '통계 계산은 클라이언트에서, 고찰 작성은 Solar Chat이 담당',
      endpoints: [
        {
          name: 'Solar Chat (고찰 작성)',
          purpose: '통계 + 메모 → 한국어 학술 단락',
          example: `POST https://api.upstage.ai/v1/solar/chat/completions
{
  "model": "solar-pro",
  "messages": [
    {"role": "system", "content": "당신은 공학 실험 보고서 작성 보조자입니다. 통계 + 학생 메모를 종합해 한국어 학술 톤의 고찰 단락을 작성하세요. 출력은 JSON: {summary, discussion, error_causes[3], conclusion}"},
    {"role": "user", "content": "통계: {stats_json}\\n메모: {memo}"}
  ],
  "temperature": 0.4
}`,
        },
        {
          name: 'Solar Chat (그래프 캡션)',
          purpose: '그래프별 학술 캡션 자동 생성',
          example: `{"role": "user", "content": "다음 그래프 메타데이터에 대해 한국어 학술 캡션을 1줄로 작성: {graph_meta}"}`,
        },
      ],
    },
    prompts: {
      description: '통계 결과를 정확히 인용하면서 가설 추론도 균형 있게',
      examples: [
        {
          title: '고찰 작성 프롬프트',
          prompt: `[규칙]
- summary: 실험 목적 + 측정 결과 2~3문장
- discussion: 통계 결과를 인용하며 이론값과의 차이 분석
- error_causes: 오차 가능 원인 정확히 3가지 (장비/환경/측정 절차/이론 가정 등)
- conclusion: 1~2문장, "추가 실험 제안" 포함
- 모든 수치는 통계 객체에서 인용 (지어내지 말 것)

통계: {stats}
학생 메모: {memo}`,
          note: '수치 환각(hallucination) 방지를 위해 "지어내지 말 것" 명시 + JSON 강제',
        },
        {
          title: '오차 원인 추론 프롬프트',
          prompt: `R² = {r_squared}, 오차율 = {error_rate}%, 표준편차 = {std}.
이 결과로부터 추정 가능한 오차 원인 3개를 가능성 순으로 작성:
[{cause, evidence_in_stats, mitigation}]`,
          note: '원인-증거-개선 3원칙을 강제하여 교수가 보기에도 설득력 있는 고찰',
        },
      ],
    },
    implementation: {
      frontend: {
        description: 'CSV 업로드 → 매핑 → 결과 → 보고서 export의 단계형 워크플로',
        pages: ['홈 (시작)', 'CSV 업로드 + 매핑', '통계·그래프 결과', '고찰 편집기 (Solar 결과 + 학생 수정)', '보고서 미리보기', '내 실험 라이브러리'],
        stack: 'React 19 + Recharts + Papa Parse + simple-statistics + jsPDF',
      },
      backend: {
        description: 'Edge Functions로 Solar 호출 + 실험 데이터 저장',
        apis: ['POST /lab/upload — CSV 저장', 'POST /lab/stats — 통계 계산', 'POST /lab/discussion — 고찰 생성', 'POST /lab/export — PDF/DOCX export', 'GET /lab/library — 내 실험'],
        stack: 'Supabase Edge Functions + Storage + Solar API',
      },
      database: {
        tables: [
          { name: 'lab_experiments', fields: 'id, user_id, title, csv_url, mapping(jsonb), stats(jsonb), created_at' },
          { name: 'lab_reports', fields: 'id, experiment_id, summary, discussion, error_causes(jsonb), conclusion' },
        ],
      },
    },
    deployment: {
      steps: ['Vite build + GitHub Pages 배포', 'Supabase Storage (CSV 저장)', 'Edge Functions 배포', '학과별 실험 템플릿 시드 적재', 'PDF 폰트(한글) 임베딩 처리'],
      infra: 'GitHub Pages + Supabase + Solar API',
    },
    expansion: ['실험 장비 IoT 연동 (실시간 데이터 수집)', '조교 채점 보조 (자동 항목 체크)', '실험 안전 점검 모듈 통합', '실험 동영상 자동 요약', '과목별 보고서 양식 자동화'],
  },

  {
    id: 6,
    title: '전공별 취업 면접 시뮬레이터',
    subtitle: '학과·희망 직무·기업을 선택하면 Solar LLM이 실제 한국 기업 면접관 페르소나로 모의 면접을 진행하고, 답변별 피드백·점수까지 제공',
    color: '#0891B2',
    icon: '💼',
    overview: '한기대 졸업반 학생이 삼성/현대/LG 같은 한국 대기업 + 강소기업 면접을 대비할 수 있도록 Solar LLM이 면접관 역할을 합니다. 학과(CSE/EE/ME/ID)와 희망 직무, 기업명을 입력하면 회사 인재상에 맞춰진 질문을 생성하고, 학생 답변에 대해 STAR 기법 기반으로 채점·피드백합니다.',
    targetUsers: ['취업 준비 4학년·졸업생', '대학원 졸업 예정자', '취업 동아리·면접 스터디', '취업지원센터 (학생 코칭)', '비대면 학습 학생'],
    objectives: [
      'Solar Chat을 면접관 페르소나로 구현 (회사별 분기)',
      'STAR 기법(Situation/Task/Action/Result) 자동 채점',
      '꼬리 질문 자동 생성 (실제 면접과 유사한 흐름)',
      '음성 입력 지원 (Web Speech API → 텍스트 변환)',
      '약점 패턴 누적 분석 → 개인 맞춤 개선 가이드',
    ],
    architecture: {
      description: '학과/기업 선택 → 면접관 페르소나 생성 → 멀티턴 대화 → STAR 채점 → 약점 누적 분석',
      components: [
        { name: '설정 패널', description: '학과 / 직무 / 기업 / 면접 유형 선택', tech: 'React + 선택형 UI' },
        { name: '음성 입력 모듈', description: '답변을 음성으로 입력 (한국어)', tech: 'Web Speech API' },
        { name: '면접관 엔진', description: 'Solar Chat에 회사별 인재상 주입', tech: 'Solar Chat API' },
        { name: 'STAR 평가 모듈', description: '답변을 4요소로 채점 + 부족한 요소 지적', tech: 'Solar Chat API' },
        { name: '약점 분석 대시보드', description: '회차별 약점 패턴을 누적 시각화', tech: 'Recharts' },
      ],
      diagram: `┌──────────────┐    ┌──────────────┐    ┌────────────────┐
│ 학과/기업 선택 │──▶│ 면접관 페르소나│──▶│ 멀티턴 면접     │
└──────────────┘    │ 생성          │    │ (Solar Chat)   │
                    └──────────────┘    └────────┬───────┘
┌──────────────┐                                  │
│ 음성 입력      │──────────────────────┐  ┌──────▼───────┐
│ (Web Speech)  │                      └─▶│ STAR 채점     │
└──────────────┘                          │ 약점 분석     │
                                          └──────────────┘`,
    },
    pipeline: {
      steps: [
        { step: 1, title: '설정 입력', description: '학과(CSE/EE/ME/ID) + 직무(SW 개발/임베디드/기구설계 등) + 기업', tools: 'React Select' },
        { step: 2, title: '면접관 페르소나 생성', description: '회사 인재상을 system 프롬프트로 고정 (삼성-도전/협업, 현대-도전/창의 등)', tools: 'Solar Chat API' },
        { step: 3, title: '질문 생성', description: '인성/직무/상황면접 등 유형별 질문 5~8개', tools: 'Solar Chat API' },
        { step: 4, title: '답변 수집', description: '텍스트 또는 음성 입력 (Web Speech API)', tools: 'Web Speech API' },
        { step: 5, title: 'STAR 채점', description: '답변을 Situation/Task/Action/Result 요소로 점수화', tools: 'Solar Chat API' },
        { step: 6, title: '약점 분석', description: '회차별 약점 패턴을 누적해 개인 개선 가이드', tools: 'Recharts + Solar Chat' },
      ],
    },
    solarApi: {
      description: 'Solar Chat을 면접관/채점관 두 페르소나로 분리 사용',
      endpoints: [
        {
          name: 'Solar Chat (면접관 페르소나)',
          purpose: '회사별 인재상 기반 면접 질문 + 꼬리 질문 생성',
          example: `POST https://api.upstage.ai/v1/solar/chat/completions
{
  "model": "solar-pro",
  "messages": [
    {"role": "system", "content": "당신은 {company} 인사팀 면접관입니다. {company}의 인재상은 {values}입니다. {job} 직무에 지원한 한기대 {major} 학생을 면접하세요. 직무 관련 + 인성 질문을 섞어 진행하고, 답변에 따라 꼬리 질문을 던지세요."},
    {"role": "user", "content": "{candidate_answer}"}
  ],
  "temperature": 0.7
}`,
        },
        {
          name: 'Solar Chat (STAR 채점)',
          purpose: '답변을 4요소로 채점 + 개선 코멘트',
          example: `{"role": "user", "content": "다음 답변을 STAR로 채점: {answer}\\n출력: {situation:0-25, task:0-25, action:0-25, result:0-25, missing_element, improvement}"}`,
        },
      ],
    },
    prompts: {
      description: '회사별 인재상 데이터를 시스템 프롬프트로 주입하여 면접 톤 차별화',
      examples: [
        {
          title: '회사 인재상 데이터',
          prompt: `[회사별 인재상]
- 삼성: 창의/도전/협업/열정 (직무 면접 비중 60%)
- 현대차: 도전/창의/협력/글로벌 (PT면접 비중 높음)
- LG: 도전/혁신/주인의식/창의 (인성 면접 깊이 있음)
- SK하이닉스: 패기/지적호기심/협업/실행력 (직무 PT 중심)
- 강소기업: 실무 경험/문제 해결 능력 중심

이 정보를 면접관 system 프롬프트에 주입하여 회사별로 다른 톤과 질문 유형을 유도`,
          note: '회사별 차이를 데이터 객체로 분리하면 새 기업 추가가 쉬움',
        },
        {
          title: 'STAR 채점 프롬프트',
          prompt: `[STAR 평가 기준]
- Situation (0-25): 상황 맥락이 구체적으로 묘사되었는가
- Task (0-25): 본인이 맡은 역할이 명확한가
- Action (0-25): 구체적인 행동·기술 적용이 드러나는가
- Result (0-25): 정량적 결과 또는 학습이 명시되었는가

[필수]
- missing_element: 가장 부족한 요소 1개 (situation/task/action/result)
- improvement: 1~2문장으로 어떻게 보강할지`,
          note: 'STAR 4요소를 명확히 분리해 학생이 어디를 보강해야 할지 명확하게',
        },
      ],
    },
    implementation: {
      frontend: {
        description: '면접 채팅 UI + 우측 실시간 STAR 점수 패널',
        pages: ['홈 (시작/이전 면접)', '설정 (학과/직무/기업)', '면접 진행 (채팅 + STAR 패널)', '면접 종료 리포트', '약점 분석 대시보드', '면접 히스토리'],
        stack: 'React 19 + Web Speech API + Recharts + Tailwind',
      },
      backend: {
        description: 'Edge Functions로 멀티턴 대화 상태 관리 + STAR 채점',
        apis: ['POST /interview/start — 면접 세션 생성', 'POST /interview/answer — 답변 제출 + 채점', 'GET /interview/report — 종료 리포트', 'GET /interview/weakness — 약점 누적', 'GET /interview/history — 내 면접'],
        stack: 'Supabase Edge Functions + Solar API',
      },
      database: {
        tables: [
          { name: 'interviews', fields: 'id, user_id, company, job, major, started_at, ended_at, total_score' },
          { name: 'interview_turns', fields: 'id, interview_id, question, answer, star_scores(jsonb), missing_element, improvement' },
        ],
      },
    },
    deployment: {
      steps: ['Vite build + GitHub Pages 배포', 'Supabase Edge Functions 배포', '회사별 인재상 시드 데이터 적재 (관리자 페이지)', 'Web Speech API 권한 처리 (브라우저별)', '월간 인기 질문 트렌드 분석 모듈'],
      infra: 'GitHub Pages + Supabase + Web Speech API + Solar API',
    },
    expansion: ['영어 면접 시뮬레이션', '취업지원센터 학생별 코칭 노트 연동', '면접 답변 음성 피드백 (말 속도/억양)', '기업별 합격자 답변 패턴 학습', 'AI 모의 PT면접 (슬라이드 평가)'],
  },

  {
    id: 7,
    title: '산학협력 매칭 AI',
    subtitle: '학생 프로필과 기업 산학협력 공고를 양방향 매칭해 적합도 점수와 함께 자기소개서 초안까지 자동 생성',
    color: '#F59E0B',
    icon: '🤝',
    overview: '한기대의 강점인 산학협력 프로그램에서 학생-기업 매칭의 비효율을 해결합니다. 학생이 자기 전공/기술/관심사를 입력하면 Solar LLM이 기업 공고와 양방향 매칭 점수를 산출하고, 적합도 상위 기업에 대해 학생 강점을 반영한 자기소개서 초안과 면접 예상 질문까지 자동 생성합니다.',
    targetUsers: ['산학협력 인턴십 지원자', '졸업 후 취업 준비생', '한기대 산학협력단 직원', '협력 중소기업·강소기업', '진로상담 교수'],
    objectives: [
      '학생-기업 양방향 매칭 알고리즘 (가중합 + Embedding)',
      '적합도 0~100점 + 강약점 분해',
      '자기소개서 초안 자동 생성 (회사별 톤)',
      '예상 면접 질문 5개 자동 생성',
      '매칭 통계 대시보드 (산학협력단용)',
    ],
    architecture: {
      description: '프로필 입력 → 매칭 점수 산출 → 자소서 초안 → 예상 질문 생성 → 통계 대시보드',
      components: [
        { name: '학생/기업 프로필 폼', description: '전공/기술/관심사 입력 (학생) + 공고 입력 (기업)', tech: 'React + Zod' },
        { name: '매칭 엔진', description: '가중합(스킬/전공/관심) + Embedding 코사인 유사도', tech: 'Solar Embedding API' },
        { name: '자소서 생성기', description: '학생 프로필 + 기업 인재상 → 자소서 초안', tech: 'Solar Chat API' },
        { name: '면접 예상 질문 생성기', description: '직무·자소서 기반으로 예상 질문 5개', tech: 'Solar Chat API' },
        { name: '통계 대시보드', description: '매칭 현황·산업별 트렌드 (산학협력단용)', tech: 'Recharts + Supabase' },
      ],
      diagram: `┌──────────────┐    ┌──────────────┐    ┌────────────────┐
│ 학생 프로필    │──▶│ 매칭 점수     │──▶│  자소서 초안     │
└──────────────┘    │ (가중합 +     │    │  생성           │
┌──────────────┐    │  Embedding)  │    │  (Solar Chat)   │
│ 기업 공고      │──▶└──────┬───────┘    └────────┬───────┘
└──────────────┘            │                     │
                    ┌───────▼──────┐    ┌────────▼───────┐
                    │ 산학협력 대시 │    │ 예상 질문 생성  │
                    │ 보드          │    │ (Solar Chat)   │
                    └──────────────┘    └────────────────┘`,
    },
    pipeline: {
      steps: [
        { step: 1, title: '프로필 입력', description: '학생: 전공/기술/GPA/관심산업, 기업: 공고/요구기술/우대전공', tools: 'React Form + Zod' },
        { step: 2, title: '매칭 점수 산출', description: '가중합(0.6 스킬 + 0.25 전공 + 0.15 관심) + Embedding 보정', tools: 'Solar Embedding API' },
        { step: 3, title: '상위 N개 추천', description: '학생→기업 Top5, 기업→학생 Top5 양방향', tools: 'Custom Ranking' },
        { step: 4, title: '자소서 초안', description: '학생 강점을 회사 인재상에 맞춰 자소서 4문항 초안', tools: 'Solar Chat API' },
        { step: 5, title: '예상 질문 생성', description: '자소서·직무 기반으로 직무·인성 질문 5개', tools: 'Solar Chat API' },
        { step: 6, title: '대시보드', description: '산학협력단용 매칭 통계 + 산업별 트렌드', tools: 'Recharts + Supabase' },
      ],
    },
    solarApi: {
      description: 'Embedding으로 의미 유사도 보정 + Chat으로 자소서/질문 생성',
      endpoints: [
        {
          name: 'Solar Embedding (유사도)',
          purpose: '프로필과 공고의 의미적 유사도 계산',
          example: `POST https://api.upstage.ai/v1/solar/embeddings
{"model": "solar-embedding-1-large", "input": ["{student_profile_text}", "{job_posting_text}"]}
// 코사인 유사도 → 매칭 점수 가중 보정`,
        },
        {
          name: 'Solar Chat (자소서 초안)',
          purpose: '학생 강점 × 회사 인재상 → 자소서 4문항',
          example: `POST https://api.upstage.ai/v1/solar/chat/completions
{
  "model": "solar-pro",
  "messages": [
    {"role": "system", "content": "당신은 {company} 자기소개서 작성 코치입니다. 학생 프로필을 회사 인재상({values})에 맞춰 자소서 4문항을 작성하세요. 출력 JSON: {motivation, strength, experience, plan}"},
    {"role": "user", "content": "프로필: {student}\\n공고: {job}"}
  ],
  "temperature": 0.6
}`,
        },
      ],
    },
    prompts: {
      description: '매칭 가중치는 데이터로, 자소서는 회사별 톤으로 분기',
      examples: [
        {
          title: '매칭 점수 계산식',
          prompt: `[가중합 점수]
- skill_overlap = |학생 스킬 ∩ 기업 요구| / |기업 요구|
- major_match = (학생 전공 == 우대 전공) ? 1 : 0
- interest_match = (학생 관심 == 산업) ? 1 : 0
- semantic_sim = Solar Embedding 코사인 유사도

[최종]
score = 0.4 * skill_overlap + 0.2 * major_match + 0.1 * interest_match + 0.3 * semantic_sim
→ 0~100점으로 정규화`,
          note: 'Embedding 30% 가중으로 키워드 매칭의 한계 보완',
        },
        {
          title: '자소서 톤 가이드',
          prompt: `[회사별 자소서 톤]
- 대기업: 정량 임팩트 강조, 협업 사례 필수
- 강소기업: 실무 경험·문제 해결 능력 강조
- 스타트업: 학습 속도·주도성·실험 마인드 강조

[필수]
- motivation: 회사 + 직무 선택 이유 (300~400자)
- strength: 핵심 강점 1개 + 사례 (300~400자)
- experience: 관련 경험 + 결과 (400~500자)
- plan: 입사 후 계획 (200~300자)`,
          note: '회사 규모별 톤을 명시하여 천편일률적 결과 방지',
        },
      ],
    },
    implementation: {
      frontend: {
        description: '학생/기업/관리자 3종 페이지 구성',
        pages: ['홈 (학생/기업/관리자 선택)', '학생: 프로필 입력 + 추천 목록', '학생: 자소서 + 예상 질문', '기업: 공고 등록 + 학생 추천', '관리자: 매칭 통계 대시보드'],
        stack: 'React 19 + Recharts + Tailwind + react-hook-form',
      },
      backend: {
        description: 'Edge Functions로 매칭/자소서 생성 + 권한별 분리',
        apis: ['POST /match/score — 매칭 점수', 'POST /match/cover-letter — 자소서 초안', 'POST /match/questions — 예상 질문', 'POST /match/post-job — 기업 공고 등록', 'GET /match/dashboard — 산학협력단 통계'],
        stack: 'Supabase Edge Functions + Solar API + RLS (학생/기업/관리자 권한 분리)',
      },
      database: {
        tables: [
          { name: 'student_profiles', fields: 'id, user_id, major, skills(jsonb), gpa, interests(jsonb)' },
          { name: 'job_postings', fields: 'id, company, title, required_skills(jsonb), preferred_major, industry, values(jsonb)' },
          { name: 'match_results', fields: 'id, student_id, job_id, score, breakdown(jsonb), cover_letter(jsonb), questions(jsonb)' },
        ],
      },
    },
    deployment: {
      steps: ['Vite build + GitHub Pages 배포', 'Supabase RLS 정책 (학생/기업/관리자 격리)', 'Solar Embedding 사용량 모니터링 (가장 비용 많이 듦)', '기업 공고 배치 동기화 (산학협력단 시스템 연계)', '월간 매칭 결과 보고서 자동 메일링'],
      infra: 'GitHub Pages + Supabase + Solar API + (선택) 산학협력단 LMS 연동',
    },
    expansion: ['학과별 특화 매칭 (CSE→IT기업, ME→제조업 등)', '졸업생 멘토 매칭 추가', '인턴십 → 정규직 전환율 분석', '글로벌 산학협력 확장 (해외 인턴)', '교수 추천서 자동 초안 생성'],
  },
];
