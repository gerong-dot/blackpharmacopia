# blackpharmacopia

포니오(@PNO564) 님 크레페 커미션 사이트입니다.

**라이브:** https://commision-1.vercel.app

## 기술 스택

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- Supabase (DB + Auth)
- React Router v7
- DOMPurify

## 로컬 실행

```bash
# 패키지 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 Supabase URL과 anon key 입력

# 개발 서버 시작
npm run dev
```

## Supabase 초기 설정

1. [supabase.com](https://supabase.com) 에서 새 프로젝트 생성
2. **SQL Editor**에서 아래 파일들을 순서대로 실행:
   1. `supabase_schema.sql` — 기본 테이블 및 RLS 설정
   2. `add_board_slug_is_private.sql` — posts 테이블 컬럼 추가
   3. `add_gallery_table.sql` — 갤러리 테이블 추가
   4. `add_storage_settings.sql` — 스토리지 설정
3. 관리자 계정 설정: `supabase_schema.sql` 하단 주석 참고

## 환경변수

| 변수 | 설명 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |
