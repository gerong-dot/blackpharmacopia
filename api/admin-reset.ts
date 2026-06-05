import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body as { email: string; password: string }
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' })

  // 유저 목록에서 이메일로 찾기
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) return res.status(500).json({ error: listErr.message })

  const user = users.find(u => u.email === email)
  if (!user) return res.status(404).json({ error: '유저를 찾을 수 없습니다' })

  const { error } = await supabase.auth.admin.updateUserById(user.id, { password })
  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({ success: true })
}
