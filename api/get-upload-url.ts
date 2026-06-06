import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { path } = req.body as { path: string }
  if (!path) return res.status(400).json({ error: 'Missing path' })

  const { data, error } = await supabase.storage
    .from('images')
    .createSignedUploadUrl(path)

  if (error || !data) return res.status(500).json({ error: error?.message ?? '서명 URL 생성 실패' })

  const { data: pub } = supabase.storage.from('images').getPublicUrl(path)
  return res.status(200).json({ signedUrl: data.signedUrl, publicUrl: pub.publicUrl })
}
