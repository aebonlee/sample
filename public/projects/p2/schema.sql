-- ============================================================
-- 문화재 AI 해설 앱 — DB 스키마 (Supabase + pgvector RAG)
-- ============================================================

create extension if not exists vector;  -- pgvector for RAG

-- 문화재 카탈로그 (마스터 데이터)
create table public.heritages (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  designation   text,                       -- '국보 제223호'
  era           text,                       -- '조선', '통일신라' ...
  region        text,                       -- '서울', '경상' ...
  category      text,                       -- '궁궐', '불상', '탑' ...
  location_address text,
  location_lat  numeric(9, 6),
  location_lng  numeric(9, 6),
  emoji         text,
  gradient      text,
  summary       text,                       -- 한 줄 소개
  full_text     text,                       -- RAG용 원문
  embedding     vector(1536),               -- Solar / OpenAI embedding
  created_at    timestamptz default now()
);

-- 수준별 해설 (4단계 캐시)
create table public.explanations (
  id            uuid primary key default gen_random_uuid(),
  heritage_id   uuid references public.heritages(id) on delete cascade,
  level         text check (level in ('elem', 'mid', 'high', 'adult')),
  body          text not null,
  generated_by  text default 'solar-mini',
  cached_at     timestamptz default now(),
  unique(heritage_id, level)
);

-- 퀴즈
create table public.quizzes (
  id            uuid primary key default gen_random_uuid(),
  heritage_id   uuid references public.heritages(id) on delete cascade,
  category      text,                       -- '뜻풀이', '건축', '시대' ...
  emoji         text,
  question      text not null,
  options       jsonb not null,             -- ["...", "...", "...", "...", "..."]
  answer_index  int not null,
  explanation   text
);

-- 퀴즈 결과
create table public.quiz_attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  heritage_id   uuid references public.heritages(id),
  total         int not null,
  correct       int not null,
  duration_sec  int,
  details       jsonb,                      -- [{quiz_id, picked, correct}]
  attempted_at  timestamptz default now()
);

-- 탐방 미션
create table public.missions (
  id            uuid primary key default gen_random_uuid(),
  group_name    text,                       -- '서울 궁궐 5대 탐방'
  heritage_id   uuid references public.heritages(id),
  points        int default 100,
  unlock_after  int default 0               -- 이전 N개 완료해야 잠금 해제
);

-- 미션 진행
create table public.mission_progress (
  user_id       uuid references auth.users(id) on delete cascade,
  mission_id    uuid references public.missions(id) on delete cascade,
  visited_at    timestamptz,
  proof_url     text,                       -- 인증 사진
  primary key (user_id, mission_id)
);

-- 즐겨찾기
create table public.favorites (
  user_id       uuid references auth.users(id) on delete cascade,
  heritage_id   uuid references public.heritages(id) on delete cascade,
  saved_at      timestamptz default now(),
  primary key (user_id, heritage_id)
);

-- 학습 기록 (활동 캘린더용)
create table public.activity_log (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  heritage_id   uuid references public.heritages(id),
  action        text check (action in ('view', 'quiz', 'mission', 'favorite')),
  occurred_at   timestamptz default now()
);

-- 벡터 유사도 검색 (RAG)
create or replace function search_heritages(query_embedding vector(1536), match_count int default 5)
returns table(id uuid, name text, similarity float) language sql as $$
  select id, name, 1 - (embedding <=> query_embedding) as similarity
  from public.heritages
  where embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;

create index idx_heritages_embedding on public.heritages
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);
