-- 사이트 설정 테이블 (배경 이미지 URL 등 저장)
create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;

create policy "settings_select" on public.site_settings
  for select using (auth.role() = 'authenticated');

create policy "settings_upsert" on public.site_settings
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- 기본값 삽입
insert into public.site_settings (key, value) values
  ('enter_bg', ''),
  ('main_banner', ''),
  ('about_image', '')
on conflict (key) do nothing;

-- Storage 버킷 정책 (버킷은 대시보드에서 생성)
-- Supabase Dashboard > Storage > New Bucket
-- 버킷 이름: "images", Public 체크 ON

insert into storage.buckets (id, name, public) values ('images', 'images', true)
on conflict (id) do nothing;

create policy "images_select" on storage.objects
  for select using (bucket_id = 'images');

create policy "images_insert" on storage.objects
  for insert with check (
    bucket_id = 'images' and
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "images_delete" on storage.objects
  for delete using (
    bucket_id = 'images' and
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
