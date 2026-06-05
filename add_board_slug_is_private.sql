-- posts 테이블에 누락된 컬럼 추가
-- Supabase 대시보드 → SQL Editor 에서 실행하세요

alter table public.posts
  add column if not exists board_slug text default 'general',
  add column if not exists is_private boolean default false;
