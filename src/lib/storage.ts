import { supabase } from './supabase'

export async function uploadImage(file: File, path: string): Promise<string> {
  const filePath = `${path}.jpg`

  // 1단계: 서명 업로드 URL 받기 (body가 거의 없어서 Vercel 제한 없음)
  const urlRes = await fetch('/api/get-upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: filePath }),
  })
  if (!urlRes.ok) {
    const err = await urlRes.json()
    throw new Error(err.error ?? 'URL 생성 실패')
  }
  const { signedUrl, publicUrl } = await urlRes.json()

  // 2단계: Supabase Storage에 직접 PUT (Vercel 경유 안 함)
  const putRes = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: file,
  })
  if (!putRes.ok) throw new Error('스토리지 업로드 실패')

  return publicUrl
}

export async function getSiteSetting(key: string): Promise<string> {
  try {
    const res = await fetch(`/api/settings?key=${encodeURIComponent(key)}`)
    if (res.ok) {
      const { value } = await res.json()
      return value ?? ''
    }
  } catch {}
  // 폴백: supabase 직접 조회
  const { data } = await supabase.from('site_settings').select('value').eq('key', key).single()
  return data?.value ?? ''
}

export async function setSiteSetting(key: string, value: string) {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? '저장 실패')
  }
}
