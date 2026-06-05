import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, username } = req.body as { email: string; username: string }
  if (!email || !username) return res.status(400).json({ error: 'Missing fields' })

  const { data: { users } } = await supabase.auth.admin.listUsers()
  const user = users.find(u => u.email === email)
  if (!user) return res.status(404).json({ error: '유저 없음' })

  const { error } = await supabase.from('profiles').update({ username }).eq('id', user.id)
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ success: true })
}
