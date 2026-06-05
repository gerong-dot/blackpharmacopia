import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { base64, path, mimeType } = req.body as { base64: string; path: string; mimeType: string }
    if (!base64 || !path) return res.status(400).json({ error: 'Missing fields' })

    const buffer = Buffer.from(base64.replace(/^data:.+;base64,/, ''), 'base64')
    const { error } = await supabase.storage
      .from('images')
      .upload(path, buffer, { contentType: mimeType ?? 'image/jpeg', upsert: true })

    if (error) return res.status(500).json({ error: error.message })

    const { data } = supabase.storage.from('images').getPublicUrl(path)
    return res.status(200).json({ url: data.publicUrl })
  } catch (e) {
    return res.status(500).json({ error: String(e) })
  }
}
