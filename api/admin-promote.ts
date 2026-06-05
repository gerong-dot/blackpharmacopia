import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email } = req.body as { email: string }
  if (!email) return res.status(400).json({ error: 'Missing email' })

  // auth.users에서 유저 찾기
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) return res.status(500).json({ error: listErr.message })

  const user = users.find(u => u.email === email)
  if (!user) return res.status(404).json({ error: `${email} 가입된 계정 없음` })

  // profiles 업서트 (없으면 생성, 있으면 업데이트)
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    username: user.user_metadata?.username ?? email.split('@')[0],
    is_admin: true,
  }, { onConflict: 'id' })

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ success: true, email, userId: user.id })
}
