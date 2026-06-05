import { supabase } from './supabase'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function uploadImage(file: File, path: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const filePath = `${path}.${ext}`
  const base64 = await fileToBase64(file)

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64, path: filePath, mimeType: file.type }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? '업로드 실패')
  }

  const { url } = await res.json()
  return url
}

export async function getSiteSetting(key: string): Promise<string> {
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single()
  return data?.value ?? ''
}

export async function setSiteSetting(key: string, value: string) {
  await supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })
}
