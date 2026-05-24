-- ============================================================
-- 자격증 취약점 분석 학습 앱 — DB 스키마
-- ============================================================

-- 자격증 카탈로그
create table public.certifications (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,             -- '정보처리기사'
  category      text,                       -- 'IT/SW', '어학', '금융' ...
  organization  text,                       -- '한국산업인력공단'
  avg_months    int,                        -- 평균 학습 기간
  pass_rate     numeric(5, 2),
  description   text
);

-- 과목 (자격증의 세부 과목)
create table public.subjects (
  id            uuid primary key default gen_random_uuid(),
  cert_id       uuid references public.certifications(id) on delete cascade,
  ord           int,
  name          text not null,             -- '데이터베이스 구축'
  weight        numeric(5, 2) default 1.0  -- 출제 비중
);

-- 단원 (과목의 세부 단원)
create table public.topics (
  id            uuid primary key default gen_random_uuid(),
  subject_id    uuid references public.subjects(id) on delete cascade,
  name          text not null,             -- '정규화'
  difficulty    int check (difficulty between 1 and 5)
);

-- 문제
create table public.questions (
  id            uuid primary key default gen_random_uuid(),
  topic_id      uuid references public.topics(id) on delete cascade,
  type          text check (type in ('mc', 'code', 'short')) default 'mc',
  question      text not null,
  code_snippet  text,                       -- C/자바/SQL 코드
  options       jsonb,
  answer_index  int,
  answer_text   text,
  explanation   text,
  tags          text[]
);

-- 진단/연습 시도
create table public.attempts (
  id            bigserial primary key,
  user_id       uuid references auth.users(id) on delete cascade,
  question_id   uuid references public.questions(id) on delete cascade,
  cert_id       uuid references public.certifications(id),
  picked_index  int,
  is_correct    boolean,
  spent_sec     int,
  source        text default 'practice',   -- 'diagnose', 'practice', 'mock', 'review'
  attempted_at  timestamptz default now()
);

-- 진단 평가 세션
create table public.diagnoses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id),
  cert_id       uuid references public.certifications(id),
  total_q       int not null,
  correct       int not null,
  score         int,
  grade         text,                       -- 'A', 'B', 'C', 'D'
  subject_scores jsonb,                    -- {sd: 80, dev: 60, db: 40, lang: 80, sys: 40}
  taken_at      timestamptz default now()
);

-- 학습 계획
create table public.study_plans (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id),
  cert_id       uuid references public.certifications(id),
  exam_date     date not null,
  weekly_hours  int default 10,
  generated_by  text default 'solar',
  schedule      jsonb,                       -- [{date, topics:[], hours, type}]
  created_at    timestamptz default now()
);

-- 취약점 분석 (집계 뷰)
create or replace view public.weakness_by_topic as
select
  a.user_id, a.cert_id, t.id as topic_id, t.name as topic_name, s.name as subject_name,
  count(*) as attempts,
  count(*) filter (where a.is_correct) as correct,
  round(count(*) filter (where a.is_correct) * 100.0 / count(*), 1) as accuracy,
  avg(a.spent_sec)::int as avg_sec
from public.attempts a
join public.questions q on q.id = a.question_id
join public.topics t    on t.id = q.topic_id
join public.subjects s  on s.id = t.subject_id
group by a.user_id, a.cert_id, t.id, t.name, s.name
having count(*) >= 3;

create index idx_attempts_user_cert on public.attempts(user_id, cert_id, attempted_at desc);
create index idx_questions_topic on public.questions(topic_id);
