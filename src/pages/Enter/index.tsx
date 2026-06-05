import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useSiteImage } from '../../hooks/useSiteImage'

type Mode = 'landing' | 'login' | 'register'

export default function EnterPage() {
  const [mode, setMode] = useState<Mode>('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const enterBg = useSiteImage('enter_bg')

  useEffect(() => {
    if (user) navigate('/main', { replace: true })
  }, [user, navigate])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    setLoading(false)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (username.length < 2) { setError('닉네임은 2자 이상이어야 합니다.'); setLoading(false); return }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); setLoading(false); return }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) {
      setError(error.message.includes('already registered') ? '이미 가입된 이메일입니다.' : error.message)
    } else {
      setMode('login')
      setEmail('')
      setPassword('')
      alert('가입 완료! 로그인해주세요.')
    }
    setLoading(false)
  }

  const inputClass = `
    w-full px-4 py-2.5 rounded border text-sm outline-none transition-colors
    bg-white/10 border-white/20 text-white placeholder-white/40
    focus:border-white/60 focus:bg-white/15
  `

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'var(--char-blue)' }}
    >
      {/* 배경 이미지 */}
      {enterBg && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${enterBg})` }}
        />
      )}
      {/* 배경 그라디언트 오버레이 */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,17,60,0.4) 0%, rgba(0,17,60,0.85) 100%)' }} />

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* 로고 */}
        <div className="mb-10 text-center">
          <h1
            className="text-white"
            style={{ fontFamily: 'var(--font-deco)', fontSize: 'clamp(2.5rem, 8vw, 5rem)', letterSpacing: '0.02em' }}
          >
            blackpharmacopia
          </h1>
          {mode === 'landing' && (
            <p className="mt-3 text-white/40 text-sm tracking-widest" style={{ fontFamily: 'var(--font-title)' }}>
              members only
            </p>
          )}
        </div>

        {/* 랜딩 */}
        {mode === 'landing' && (
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => setMode('login')}
              className="w-full py-3 rounded text-sm tracking-widest font-medium text-white transition-all"
              style={{ fontFamily: 'var(--font-title)', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              LOGIN
            </button>
            <button
              onClick={() => setMode('register')}
              className="w-full py-3 rounded text-sm tracking-widest font-medium text-white transition-all"
              style={{ fontFamily: 'var(--font-title)', background: 'rgba(128,0,1,0.7)', border: '1px solid rgba(128,0,1,0.9)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,0,1,0.9)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(128,0,1,0.7)')}
            >
              REGISTER
            </button>
          </div>
        )}

        {/* 로그인 */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="w-full max-w-xs flex flex-col gap-3">
            <input className={inputClass} type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            <input className={inputClass} type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 rounded text-sm tracking-widest font-medium text-white disabled:opacity-50" style={{ fontFamily: 'var(--font-title)', background: 'var(--char-red)' }}>
              {loading ? '...' : 'LOGIN'}
            </button>
            <button type="button" onClick={() => { setMode('landing'); setError('') }} className="text-white/40 hover:text-white/70 text-xs text-center transition-colors mt-1">돌아가기</button>
            <button type="button" onClick={() => { setMode('register'); setError('') }} className="text-white/40 hover:text-white/70 text-xs text-center transition-colors">계정이 없으신가요? 회원가입</button>
          </form>
        )}

        {/* 회원가입 */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="w-full max-w-xs flex flex-col gap-3">
            <input className={inputClass} type="text" placeholder="닉네임 (2자 이상)" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
            <input className={inputClass} type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className={inputClass} type="password" placeholder="비밀번호 (6자 이상)" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 rounded text-sm tracking-widest font-medium text-white disabled:opacity-50" style={{ fontFamily: 'var(--font-title)', background: 'var(--char-red)' }}>
              {loading ? '...' : 'REGISTER'}
            </button>
            <button type="button" onClick={() => { setMode('landing'); setError('') }} className="text-white/40 hover:text-white/70 text-xs text-center transition-colors mt-1">돌아가기</button>
            <button type="button" onClick={() => { setMode('login'); setError('') }} className="text-white/40 hover:text-white/70 text-xs text-center transition-colors">이미 계정이 있으신가요? 로그인</button>
          </form>
        )}
      </div>
    </div>
  )
}
