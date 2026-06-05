import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password, username } = req.body as { email: string; password: string; username: string }

  // 기존 유저 삭제 후 재생성
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const existing = users.find(u => u.email === email)
  if (existing) await supabase.auth.admin.deleteUser(existing.id)

  // 새 유저 생성 (이메일 인증 없이)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username: username ?? email.split('@')[0] },
  })
  if (error) return res.status(500).json({ error: error.message })

  // 관리자로 설정
  await supabase.from('profiles').upsert({
    id: data.user.id,
    username: username ?? email.split('@')[0],
    is_admin: true,
  }, { onConflict: 'id' })

  return res.status(200).json({ success: true, userId: data.user.id })
}
