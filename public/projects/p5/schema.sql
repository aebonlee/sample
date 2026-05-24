-- ============================================================
-- 청년지원정책 안내 챗봇 — DB 스키마 (RAG + 매칭)
-- ============================================================

create extension if not exists vector;

-- 정책 카탈로그 (마스터)
create table public.policies (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,             -- '청년 월세 한시 특별지원'
  organization    text,                       -- '국토교통부'
  category        text check (category in ('주거', '취업·창업', '금융·자산', '교육·역량', '건강')),
  region          text,                       -- 'national', '서울', '경기' ...
  amount_summary  text,                       -- '월 20만 원 × 12개월'
  amount_max      bigint,                     -- 정량 매칭용
  duration_months int,
  apply_url       text,
  apply_deadline  date,
  description     text,
  full_text       text,                       -- RAG용 원문
  embedding       vector(1536),
  created_at      timestamptz default now()
);

-- 자격 조건
create table public.eligibility (
  id            uuid primary key default gen_random_uuid(),
  policy_id     uuid references public.policies(id) on delete cascade,
  field         text,                         -- 'age', 'income', 'housing', 'employment'
  operator      text,                         -- 'between', '<=', 'in'
  value_json    jsonb                         -- {min:19, max:34}
);

-- 사용자 프로필
create table public.profiles (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  name          text,
  birth_year    int,
  region        text,
  employment    text,                         -- '직장인', '구직중', '학생'
  income_class  text,                         -- '50%', '100%', '150%'
  housing       text,                         -- '월세', '전세', '자가', '부모 동거'
  marital       text,
  custom_tags   text[],                       -- '청년', '중기 재직자' ...
  updated_at    timestamptz default now()
);

-- 대화 이력
create table public.conversations (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  title         text,
  created_at    timestamptz default now()
);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  role            text check (role in ('user', 'bot')),
  content         text not null,
  policy_refs     uuid[],                     -- 응답에서 참조한 policies.id[]
  created_at      timestamptz default now()
);

-- 즐겨찾기
create table public.bookmarks (
  user_id       uuid references auth.users(id) on delete cascade,
  policy_id     uuid references public.policies(id) on delete cascade,
  saved_at      timestamptz default now(),
  primary key (user_id, policy_id)
);

-- 신청 진행 (체크리스트)
create table public.applications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  policy_id     uuid references public.policies(id) on delete cascade,
  status        text check (status in ('preparing', 'submitted', 'reviewing', 'approved', 'rejected')) default 'preparing',
  checklist     jsonb,                        -- {step: bool}
  submitted_at  timestamptz,
  result_at     timestamptz,
  notes         text
);

-- 알림 설정
create table public.notification_prefs (
  user_id           uuid primary key references auth.users(id),
  deadline_days     int default 7,            -- 마감 N일 전 알림
  notify_result     boolean default true,
  notify_new        boolean default false,
  channel           text default 'push'       -- 'push', 'email', 'sms'
);

-- 정책 매칭 함수 (자격 조건 모두 충족 시 score 1.0)
create or replace function match_policies_for(p_user uuid)
returns table(policy_id uuid, score numeric) language plpgsql as $$
begin
  return query
  select p.id,
    (select count(*) filter (where check_eligibility(e.id, p_user)) * 1.0 / nullif(count(*), 0)
     from public.eligibility e where e.policy_id = p.id) as score
  from public.policies p
  where (apply_deadline is null or apply_deadline >= current_date);
end; $$;

create index idx_messages_conv on public.messages(conversation_id, created_at);
create index idx_apps_user on public.applications(user_id, status);
create index idx_policies_embedding on public.policies using ivfflat (embedding vector_cosine_ops);
