import { supabase } from './supabase'

const settingsCache = new Map<string, string>()
const pendingFetches = new Map<string, Promise<string>>()

export const ALL_SETTING_KEYS = [
  'main_banner', 'main_banner_pos',
  'dday_bottom_image', 'dday_bottom_image_pos',
  'character_cards',
  'retro_badges',
  'bookmarks',
  'left_panel_bottom',
  'notice_content', 'about_image', 'about_image_pos',
  'boards_json',
]

export function prefetchSettings() {
  ALL_SETTING_KEYS.forEach(key => { if (!settingsCache.has(key)) getSiteSetting(key) })
}

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const MAX = 1200
      const scale = Math.min(1, MAX / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      canvas.toBlob(blob => resolve(blob ?? file), 'image/jpeg', 0.82)
    }
    img.onerror = () => resolve(file)
    img.src = objectUrl
  })
}

export async function uploadImage(file: File, path: string): Promise<string> {
  const compressed = await compressImage(file)
  const filePath = `${path}.jpg`

  // 서버에서 서명 URL 발급받아 Supabase에 직접 업로드 (서버리스 바디 제한 우회)
  const urlRes = await fetch('/api/get-upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: filePath }),
  })

  if (!urlRes.ok) {
    const text = await urlRes.text().catch(() => '')
    let msg = '업로드 URL 생성 실패'
    try { msg = JSON.parse(text).error ?? msg } catch { msg = text || msg }
    throw new Error(msg)
  }

  const { signedUrl, publicUrl } = await urlRes.json()

  const uploadRes = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: compressed,
  })

  if (!uploadRes.ok) throw new Error(`스토리지 업로드 실패 (${uploadRes.status})`)

  return publicUrl
}

export async function getSiteSetting(key: string): Promise<string> {
  if (settingsCache.has(key)) return settingsCache.get(key)!

  // 동일 키 중복 요청 방지 — 첫 번째 fetch promise를 재사용
  if (pendingFetches.has(key)) return pendingFetches.get(key)!

  const fetching = (async () => {
    try {
      const res = await fetch(`/api/settings?key=${encodeURIComponent(key)}`)
      if (res.ok) {
        const { value } = await res.json()
        const result = value ?? ''
        settingsCache.set(key, result)
        pendingFetches.delete(key)
        return result
      }
    } catch {}
    // 폴백: supabase 직접 조회
    const { data } = await supabase.from('site_settings').select('value').eq('key', key).single()
    const result = data?.value ?? ''
    settingsCache.set(key, result)
    pendingFetches.delete(key)
    return result
  })()

  pendingFetches.set(key, fetching)
  return fetching
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
  settingsCache.set(key, value)
}
