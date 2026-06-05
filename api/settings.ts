import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { key } = req.query
    if (!key) return res.status(400).json({ error: 'Missing key' })
    const { data } = await supabase.from('site_settings').select('value').eq('key', key).single()
    return res.status(200).json({ value: data?.value ?? '' })
  }

  if (req.method === 'POST') {
    const { key, value } = req.body as { key: string; value: string }
    if (!key) return res.status(400).json({ error: 'Missing key' })
    const { error } = await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).end()
}
