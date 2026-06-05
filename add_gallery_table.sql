-- 갤러리 테이블 추가
create table if not exists public.gallery (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  caption text default '',
  created_at timestamptz default now()
);

alter table public.gallery enable row level security;

-- 로그인 유저는 조회 가능
create policy "gallery_select" on public.gallery
  for select using (auth.role() = 'authenticated');

-- 관리자만 추가/삭제 가능
create policy "gallery_insert" on public.gallery
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "gallery_delete" on public.gallery
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
