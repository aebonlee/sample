-- ============================================================
-- 한국형 AI 동화책 제작 앱 — DB 스키마 (Supabase / PostgreSQL)
-- ============================================================

-- 사용자 (Supabase auth.users 연동)
create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null unique,
  display_name text,
  avatar_url   text,
  child_age    int,              -- 자녀 나이대 (5, 8, 11)
  created_at   timestamptz default now()
);

-- 동화 (Story)
create table public.stories (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.users(id) on delete cascade,
  title           text not null,
  age_range       text check (age_range in ('5-7', '8-10', '11-12')),
  origin          text check (origin in ('전래동화', '명절', '지역설화', '역사인물')),
  values_tags     text[],         -- ['우정', '용기', ...]
  custom_request  text,           -- 사용자 추가 요청
  status          text default 'generating' check (status in ('generating', 'done', 'error')),
  cover_emoji     text default '📖',
  cover_gradient  text,
  total_scenes    int default 0,
  reading_minutes int,
  is_favorite     boolean default false,
  created_at      timestamptz default now()
);

-- 동화 장면 (Scene) — 1:N
create table public.scenes (
  id           uuid primary key default gen_random_uuid(),
  story_id     uuid references public.stories(id) on delete cascade,
  scene_order  int not null,                    -- 1, 2, 3, ...
  title        text,                            -- "제1장 — 깊은 산속의 호랑이"
  body         text not null,                   -- 본문
  art_emoji    text,                            -- 대표 이모지
  art_prompt   text,                            -- DALL·E / Midjourney 프롬프트
  art_url      text,                            -- 생성된 이미지 URL (선택)
  bg_gradient  text,
  unique(story_id, scene_order)
);

-- 독후활동 (Activity) — 1:N
create table public.activities (
  id          uuid primary key default gen_random_uuid(),
  story_id    uuid references public.stories(id) on delete cascade,
  type        text check (type in ('question', 'drawing', 'craft', 'roleplay')),
  title       text not null,
  description text,
  content     jsonb,                            -- {questions:[], steps:[], roles:[]}
  created_at  timestamptz default now()
);

-- 읽기 기록 (선택)
create table public.reading_history (
  user_id       uuid references public.users(id) on delete cascade,
  story_id      uuid references public.stories(id) on delete cascade,
  last_scene    int default 1,
  completed     boolean default false,
  completed_at  timestamptz,
  primary key (user_id, story_id)
);

-- 인덱스
create index idx_stories_user on public.stories(user_id, created_at desc);
create index idx_scenes_story on public.scenes(story_id, scene_order);
create index idx_activities_story on public.activities(story_id);

-- RLS (행 단위 보안)
alter table public.stories enable row level security;
alter table public.scenes enable row level security;
alter table public.activities enable row level security;
alter table public.reading_history enable row level security;

create policy "stories: 본인만 조회/수정" on public.stories
  for all using (auth.uid() = user_id);

create policy "scenes: 본인 동화만 조회" on public.scenes
  for select using (
    exists (select 1 from public.stories where id = scenes.story_id and user_id = auth.uid())
  );

create policy "activities: 본인 동화만 조회" on public.activities
  for select using (
    exists (select 1 from public.stories where id = activities.story_id and user_id = auth.uid())
  );
