import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'

type Props = { onClose: () => void }
type Mode = 'login' | 'register'

export default function LoginModal({ onClose }: Props) {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    else onClose()
    setLoading(false)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    if (username.length < 2) { setError('닉네임은 2자 이상이어야 합니다.'); setLoading(false); return }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); setLoading(false); return }
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { username } } })
    if (error) setError(error.message.includes('already registered') ? '이미 가입된 이메일입니다.' : error.message)
    else { alert('가입 완료! 로그인해주세요.'); setMode('login'); setEmail(''); setPassword('') }
    setLoading(false)
  }

  const inputClass = `w-full px-3 py-2 rounded-sm border text-sm outline-none transition-colors bg-white focus:border-black/30`
  const inputStyle = { borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()} style={{ background: 'var(--paper)' }}>
        {/* 헤더 */}
        <div className="gothic-header flex items-center justify-between">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--char-red)' }} />
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
          </div>
          <span className="text-white/70 text-xs tracking-[0.2em]" style={{ fontFamily: 'var(--font-title)' }}>
            — {mode === 'login' ? 'LOGIN' : 'REGISTER'} —
          </span>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={14} /></button>
        </div>

        {/* 폼 */}
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="flex flex-col gap-3 p-6">
          {mode === 'register' && (
            <input className={inputClass} style={inputStyle} type="text" placeholder="닉네임 (2자 이상)" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
          )}
          <input className={inputClass} style={inputStyle} type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} required autoFocus={mode === 'login'} />
          <input className={inputClass} style={inputStyle} type="password" placeholder="비밀번호 (6자 이상)" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-sm text-sm text-white tracking-widest disabled:opacity-50" style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>
            {loading ? '...' : mode === 'login' ? 'LOGIN' : 'REGISTER'}
          </button>
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }} className="text-xs text-center opacity-40 hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
            {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
