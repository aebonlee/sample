-- ============================================================
-- AI 자기소개서·면접 코치 — DB 스키마
-- ============================================================

-- 사용자 경험 (Experience)
create table public.experiences (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  title         text not null,             -- '캡스톤 디자인 팀장 경험'
  raw_text      text not null,             -- 자유 기술 원문
  target_role   text,                       -- '카카오 백엔드'
  emphasis      text[],                     -- ['리더십', '문제해결']
  created_at    timestamptz default now()
);

-- STAR 구조화 결과
create table public.star_breakdowns (
  id            uuid primary key default gen_random_uuid(),
  experience_id uuid references public.experiences(id) on delete cascade unique,
  situation     text,
  task          text,
  action        text,
  result        text,
  competencies  jsonb,                     -- {leadership:94, problem:88, ...}
  generated_at  timestamptz default now()
);

-- 지원처 (회사·직무)
create table public.targets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  company       text not null,             -- '카카오'
  role          text not null,             -- '백엔드 개발자'
  logo_color    text,
  apply_deadline date,
  created_at    timestamptz default now()
);

-- 자소서 (한 회사당 1)
create table public.resumes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  target_id     uuid references public.targets(id) on delete cascade,
  title         text,
  status        text check (status in ('draft', 'reviewing', 'submitted', 'passed', 'rejected')) default 'draft',
  overall_score int,
  is_favorite   boolean default false,
  submitted_at  timestamptz,
  updated_at    timestamptz default now()
);

-- 자소서 문항 (resumes 1:N)
create table public.resume_questions (
  id            uuid primary key default gen_random_uuid(),
  resume_id     uuid references public.resumes(id) on delete cascade,
  ord           int,
  question_text text not null,             -- "본인의 가장 큰 강점은 무엇이며..."
  max_chars     int default 1000,
  answer_text   text,
  experience_id uuid references public.experiences(id),
  status        text check (status in ('empty', 'draft', 'reviewed', 'done')) default 'empty'
);

-- AI 피드백 (문항별)
create table public.feedback (
  id              uuid primary key default gen_random_uuid(),
  question_id     uuid references public.resume_questions(id) on delete cascade,
  scores          jsonb,                     -- {specificity:92, star:88, ...}
  overall_score   int,
  highlights      jsonb,                     -- [{type:'good'|'bad', range:[s,e], message}]
  suggestions     jsonb,                     -- [{old, new, reason}]
  generated_at    timestamptz default now()
);

-- 면접 예상 질문
create table public.interview_questions (
  id            uuid primary key default gen_random_uuid(),
  resume_id     uuid references public.resumes(id) on delete cascade,
  category      text,                       -- '자기소개', '경험 깊이' ...
  difficulty    text check (difficulty in ('easy', 'mid', 'hard', 'xhard')),
  question      text not null,
  source_qid    uuid references public.resume_questions(id),  -- 어느 자소서 문항 기반?
  model_answer  text,
  checklist     text[]
);

-- 면접 연습 녹음
create table public.interview_recordings (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  iq_id         uuid references public.interview_questions(id),
  audio_url     text,
  duration_sec  int,
  transcribed   text,
  ai_feedback   text,
  created_at    timestamptz default now()
);

-- 인덱스
create index idx_resumes_user on public.resumes(user_id, updated_at desc);
create index idx_rq_resume on public.resume_questions(resume_id, ord);
create index idx_iq_resume on public.interview_questions(resume_id);

-- RLS
alter table public.resumes enable row level security;
alter table public.experiences enable row level security;
create policy "resumes own" on public.resumes for all using (auth.uid() = user_id);
create policy "experiences own" on public.experiences for all using (auth.uid() = user_id);
