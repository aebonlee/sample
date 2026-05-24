-- ============================================================
-- 회복탄력성 루틴 코치 — DB 스키마
-- ============================================================

-- 사용자 프로필
create table public.profiles (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  display_name   text,
  email          text,
  morning_time   time default '07:00',
  evening_time   time default '22:30',
  created_at     timestamptz default now()
);

-- 감정 체크인 (1일 1~N회)
create table public.checkins (
  id            bigserial primary key,
  user_id       uuid references auth.users(id) on delete cascade,
  mood_emoji    text,                       -- '😢', '😟', '😊', '😄', '🤩'
  mood_score    int check (mood_score between 1 and 10),
  note          text,
  checked_at    timestamptz default now()
);

-- 루틴 마스터 (시스템 제공 + 사용자 정의)
create table public.routines (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,              -- '호흡 명상 3분'
  description   text,
  category      text check (category in ('mind', 'body', 'sleep', 'journal', 'relation')),
  emoji         text,
  duration_min  int,
  is_system     boolean default false,
  created_by    uuid references auth.users(id)
);

-- 사용자의 오늘 루틴 (구독)
create table public.user_routines (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  routine_id    uuid references public.routines(id) on delete cascade,
  scheduled_time time,
  is_active     boolean default true,
  added_at      timestamptz default now(),
  unique(user_id, routine_id)
);

-- 루틴 완료 기록
create table public.completions (
  id            bigserial primary key,
  user_id       uuid references auth.users(id) on delete cascade,
  routine_id    uuid references public.routines(id) on delete cascade,
  completed_at  timestamptz default now(),
  duration_sec  int
);

-- 저널 (성찰 일기)
create table public.journals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  prompt        text,                       -- AI 제안 질문
  body          text not null,
  mood_emoji    text,
  tags          text[],
  written_at    timestamptz default now()
);

-- AI 격려 메시지 (캐시)
create table public.encouragements (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  message       text not null,
  context_emoji text,
  shown_at      timestamptz,
  is_saved      boolean default false,
  created_at    timestamptz default now()
);

-- 알림 설정
create table public.notification_settings (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  all_notifications boolean default true,
  morning_checkin   boolean default true,
  evening_reflect   boolean default true,
  routine_reminder  boolean default true,
  weekly_report     boolean default false
);

-- 통계 뷰: 일별 회복 점수 (감정 평균 + 루틴 완수율 가중)
create or replace view public.daily_resilience as
with mood_avg as (
  select user_id, date(checked_at) as d, avg(mood_score) as mood from public.checkins
  group by user_id, date(checked_at)
),
routine_done as (
  select c.user_id, date(c.completed_at) as d,
    count(distinct c.routine_id) as done,
    (select count(*) from public.user_routines ur where ur.user_id = c.user_id and ur.is_active) as total
  from public.completions c group by c.user_id, date(c.completed_at)
)
select
  coalesce(m.user_id, r.user_id) as user_id,
  coalesce(m.d, r.d) as day,
  m.mood,
  r.done, r.total,
  round((coalesce(m.mood, 5) * 10 * 0.6 + coalesce(r.done * 100.0 / nullif(r.total, 0), 0) * 0.4)) as resilience_score
from mood_avg m full outer join routine_done r on m.user_id = r.user_id and m.d = r.d;

create index idx_checkins_user_date on public.checkins(user_id, checked_at desc);
create index idx_completions_user_date on public.completions(user_id, completed_at desc);
