import { useRef, useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, ImagePlay, Camera, Pencil, Check, X } from 'lucide-react'
import MusicPlayer from './MusicPlayer'
import WindowCard from './WindowCard'
import { uploadImage } from '../lib/storage'
import { supabase } from '../lib/supabase'
import MiniGuestbook from './MiniGuestbook'

const tabs = [
  { to: '/main', label: 'HOME', end: true },
  { to: '/main/about', label: 'NOTICE' },
  { to: '/main/board', label: 'DIARY' },
  { to: '/main/gallery', label: 'GALLERY' },
  { to: '/main/guestbook', label: 'GUEST' },
]

export default function MainLayout() {
  const { profile, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const avatarRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [bioInput, setBioInput] = useState(profile?.bio ?? '')

  async function handleSignOut() { await signOut(); navigate('/') }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploadingAvatar(true)
    try {
      const url = await uploadImage(file, `avatars/${profile.id}`)
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id)
      await refreshProfile()
    } catch {}
    setUploadingAvatar(false)
    e.target.value = ''
  }

  async function handleSaveBio() {
    if (!profile) return
    await supabase.from('profiles').update({ bio: bioInput }).eq('id', profile.id)
    await refreshProfile()
    setEditingBio(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--dark)' }}>
      {/* 상단 고딕 헤더 */}
      <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: 'rgba(195,195,195,0.1)', background: 'rgba(8,13,26,0.98)' }}>
        <div className="flex items-center gap-3">
          <span className="text-white/20 text-xs">✦</span>
          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--bg)', fontSize: '1.1rem', letterSpacing: '0.08em', fontStyle: 'italic' }}>
            EroGuroNonsense
          </span>
          <span className="text-white/20 text-xs">✦</span>
        </div>
        <div className="flex items-center gap-4">
          {profile?.is_admin && (
            <NavLink to="/main/admin/images" className="text-white/30 hover:text-white/70 transition-colors text-xs tracking-widest" style={{ fontFamily: 'var(--font-title)' }} title="이미지 관리">
              <ImagePlay size={14} />
            </NavLink>
          )}
          <button onClick={handleSignOut} className="text-white/30 hover:text-white/70 transition-colors" title="로그아웃">
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* 메인 레이아웃 */}
      <div className="flex-1 flex gap-2 p-3 overflow-hidden" style={{ maxHeight: 'calc(100vh - 49px)' }}>

        {/* 왼쪽 — 프로필 + 채팅 */}
        <div className="hidden md:flex flex-col gap-2" style={{ width: '220px', minWidth: '220px' }}>

          {/* 프로필 */}
          <WindowCard title="PROFILE" dark style={{ flexShrink: 0 }}>
            <div className="flex flex-col items-center gap-3 py-1">
              {/* 아바타 */}
              <div className="relative group cursor-pointer" onClick={() => avatarRef.current?.click()}>
                <div className="w-16 h-16 rounded-sm overflow-hidden border" style={{ borderColor: 'rgba(195,195,195,0.15)' }}>
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(195,195,195,0.05)' }}>
                        <span style={{ color: 'rgba(195,195,195,0.2)', fontSize: '1.5rem' }}>✦</span>
                      </div>
                  }
                </div>
                <div className="absolute inset-0 rounded-sm bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingAvatar
                    ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    : <Camera size={14} className="text-white" />
                  }
                </div>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>

              {/* 닉네임 */}
              <div className="text-center">
                <p className="text-xs tracking-widest" style={{ fontFamily: 'var(--font-title)', color: 'rgba(195,195,195,0.9)' }}>
                  {profile?.username}
                </p>
                <div className="ornament-divider text-white/10 my-1.5" style={{ fontSize: '0.4rem' }}>✦</div>
              </div>

              {/* 바이오 */}
              {editingBio ? (
                <div className="w-full flex flex-col gap-1">
                  <textarea
                    className="w-full text-xs rounded-sm border px-2 py-1 outline-none resize-none"
                    style={{ borderColor: 'rgba(195,195,195,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', background: 'var(--paper)', minHeight: '50px' }}
                    value={bioInput}
                    onChange={e => setBioInput(e.target.value)}
                    maxLength={80}
                    autoFocus
                  />
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => { setEditingBio(false); setBioInput(profile?.bio ?? '') }} className="p-1 text-white/40 hover:text-white/70"><X size={11} /></button>
                    <button onClick={handleSaveBio} className="p-1 hover:opacity-80" style={{ color: 'var(--char-red)' }}><Check size={11} /></button>
                  </div>
                </div>
              ) : (
                <div className="w-full text-center group relative cursor-pointer" onClick={() => { setEditingBio(true); setBioInput(profile?.bio ?? '') }}>
                  <p className="text-xs leading-relaxed" style={{ fontFamily: 'var(--font-sans)', color: 'rgba(195,195,195,0.45)' }}>
                    {profile?.bio || '...'}
                  </p>
                  <Pencil size={9} className="absolute top-0 right-0 opacity-0 group-hover:opacity-40 transition-opacity text-white" />
                </div>
              )}
            </div>
          </WindowCard>

          {/* 미니 채팅 */}
          <MiniGuestbook />
        </div>

        {/* 오른쪽 — 탭 + 콘텐츠 */}
        <div className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">

          {/* 탭 */}
          <div className="shrink-0 flex items-center border-b" style={{ borderColor: 'rgba(195,195,195,0.1)' }}>
            {tabs.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-4 py-2 text-xs tracking-[0.15em] transition-all border-b-2 ${
                    isActive
                      ? 'border-[var(--char-red)] text-white'
                      : 'border-transparent text-white/30 hover:text-white/60'
                  }`
                }
                style={{ fontFamily: 'var(--font-title)' }}
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* 콘텐츠 영역 */}
          <div className="flex-1 overflow-auto paper-panel rounded-sm" style={{ background: 'var(--paper)' }}>
            <div className="relative z-10 p-5 h-full">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 하단 탭 */}
      <nav className="md:hidden flex border-t shrink-0" style={{ background: 'rgba(8,13,26,0.98)', borderColor: 'rgba(195,195,195,0.1)' }}>
        {tabs.map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `flex-1 py-3 text-center text-xs tracking-widest ${isActive ? 'text-white' : 'text-white/30'}`}
            style={{ fontFamily: 'var(--font-title)' }}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <MusicPlayer />
    </div>
  )
}
