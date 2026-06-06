import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { title, content, board_slug, secret } = req.body as {
    title: string; content: string; board_slug: string; secret: string
  }

  if (secret !== 'egnUpload2026') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  // 관리자 계정 찾기
  const { data: admin } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_admin', true)
    .single()

  if (!admin) return res.status(404).json({ error: 'Admin not found' })

  const { data, error } = await supabase
    .from('posts')
    .insert({ title, content, category: 'general', board_slug, author_id: admin.id })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ id: data.id })
}
