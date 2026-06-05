import { supabase } from './supabase'

export async function uploadImage(file: File, path: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const filePath = `${path}.${ext}`

  const { error } = await supabase.storage
    .from('images')
    .upload(filePath, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage.from('images').getPublicUrl(filePath)
  return data.publicUrl
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
