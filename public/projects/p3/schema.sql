-- ============================================================
-- 나이대별 한국사 학습·시험 앱 — DB 스키마
-- ============================================================

-- 시대 (10개 마스터)
create table public.eras (
  id          uuid primary key default gen_random_uuid(),
  ord         int unique not null,         -- 1~10
  name        text not null,               -- '고조선·부여·삼한'
  start_year  int,                          -- BC -2333 (음수 = BC)
  end_year    int,
  summary     text,
  cover_color text
);

-- 학습 콘텐츠 (수준별)
create table public.lessons (
  id          uuid primary key default gen_random_uuid(),
  era_id      uuid references public.eras(id) on delete cascade,
  level       text check (level in ('basic', 'advanced', 'expert')),
  title       text not null,
  body_md     text,                         -- 마크다운 본문
  figures     jsonb,                        -- [{name, role, emoji}]
  timeline    jsonb,                        -- [{year, event}]
  exam_points text[]
);

-- 문제 풀
create table public.questions (
  id            uuid primary key default gen_random_uuid(),
  era_id        uuid references public.eras(id),
  type          text check (type in ('mc', 'source', 'map', 'image')),  -- 객관식/사료/지도/이미지
  difficulty    int check (difficulty between 1 and 5),
  question      text not null,
  source_text   text,                       -- 사료 분석용 제시문
  source_meta   text,
  image_url     text,
  options       jsonb not null,             -- 5지선다
  answer_index  int not null,
  explanation   text,
  tags          text[]
);

-- 사용자 풀이 기록
create table public.attempts (
  id            bigserial primary key,
  user_id       uuid references auth.users(id) on delete cascade,
  question_id   uuid references public.questions(id) on delete cascade,
  picked_index  int,
  is_correct    boolean,
  spent_sec     int,
  attempted_at  timestamptz default now()
);

-- 오답 노트 (정답률 80% 도달 시 자동 제거)
create view public.wrong_notes as
select
  user_id, question_id,
  count(*) as wrong_count,
  max(attempted_at) as last_wrong_at
from public.attempts
where is_correct = false
group by user_id, question_id
having (
  select count(*) filter (where is_correct) * 1.0 / nullif(count(*), 0)
  from public.attempts a2 where a2.user_id = attempts.user_id and a2.question_id = attempts.question_id
) < 0.8;

-- 모의고사 세션
create table public.mock_exams (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id),
  grade         text,                       -- '기본', '심화'
  total_q       int default 50,
  duration_min  int default 70,
  started_at    timestamptz default now(),
  submitted_at  timestamptz,
  score         int,
  answer_sheet  jsonb                       -- {1: 2, 2: 4, ...}
);

-- 학습 분석 (집계 뷰)
create materialized view public.analytics_by_era as
select
  a.user_id,
  q.era_id,
  count(*) as total,
  count(*) filter (where a.is_correct) as correct,
  round(count(*) filter (where a.is_correct) * 100.0 / count(*), 1) as rate
from public.attempts a join public.questions q on q.id = a.question_id
group by a.user_id, q.era_id;

create index idx_attempts_user on public.attempts(user_id, attempted_at desc);
create index idx_questions_era on public.questions(era_id, type);
