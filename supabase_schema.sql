-- =============================================
-- Supabase 프로젝트에서 SQL Editor에 붙여넣고 실행하세요
-- =============================================

-- 프로필 테이블 (auth.users 확장)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- 게시글 테이블
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  category text default 'general',
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 방명록 테이블
create table public.guestbook (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  content text not null,
  created_at timestamptz default now()
);

-- =============================================
-- RLS (Row Level Security) 활성화
-- =============================================
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.guestbook enable row level security;

-- profiles: 본인만 자신의 프로필 수정 가능, 로그인 유저는 조회 가능
create policy "profiles_select" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles_insert" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update" on public.profiles
  for update using (auth.uid() = id);

-- posts: 로그인 유저만 조회, 관리자만 작성/수정/삭제
create policy "posts_select" on public.posts
  for select using (auth.role() = 'authenticated');

create policy "posts_insert" on public.posts
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "posts_update" on public.posts
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "posts_delete" on public.posts
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- guestbook: 누구나 조회 가능, 로그인 유저만 작성, 본인 글만 삭제
create policy "guestbook_select" on public.guestbook
  for select using (true);

create policy "guestbook_insert" on public.guestbook
  for insert with check (auth.uid() = author_id);

create policy "guestbook_delete" on public.guestbook
  for delete using (auth.uid() = author_id);

-- =============================================
-- 회원가입 시 자동으로 profiles 생성하는 트리거
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- 관리자 계정 설정 방법 (가입 후 실행)
-- [your-email] 을 실제 이메일로 교체하세요
-- =============================================
-- update public.profiles
-- set is_admin = true
-- where id = (select id from auth.users where email = '[your-email]');
