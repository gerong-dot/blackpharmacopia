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
  { to: '/main/board', label: 'DIARY' },
  { to: '/main/gallery', label: 'GALLERY' },
  { to: '/main/about', label: 'ABOUT' },
  { to: '/main/guestbook', label: 'GUEST' },
]

export default function MainLayout() {
  const { profile, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const avatarRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [bioInput, setBioInput] = useState(profile?.bio ?? '')

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* 상단 바 */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 border-b"
        style={{ background: 'var(--char-blue)', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <span className="text-white text-sm tracking-widest" style={{ fontFamily: 'var(--font-deco)', fontSize: '1.1rem' }}>
          EroGuroNonsense
        </span>
        <div className="flex items-center gap-3">
          {profile?.is_admin && (
            <NavLink to="/main/admin/images" className="text-white/50 hover:text-white transition-colors" title="이미지 관리">
              <ImagePlay size={16} />
            </NavLink>
          )}
          <button onClick={handleSignOut} className="text-white/50 hover:text-white transition-colors" title="로그아웃">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* 메인 2컬럼 */}
      <div className="flex-1 flex gap-3 p-3 max-w-6xl mx-auto w-full">

        {/* 왼쪽 패널 */}
        <div className="flex flex-col gap-3 w-64 shrink-0 hidden md:flex">

          {/* 프로필 카드 */}
          <WindowCard title="PROFILE">
            <div className="flex flex-col items-center gap-3">
              {/* 아바타 */}
              <div
                className="relative group cursor-pointer"
                onClick={() => avatarRef.current?.click()}
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden border-2" style={{ borderColor: 'rgba(0,17,60,0.15)' }}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(0,17,60,0.05)' }}>
                      <span className="text-2xl opacity-20">?</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingAvatar
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Camera size={16} className="text-white" />
                  }
                </div>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>

              {/* 닉네임 */}
              <p className="font-semibold text-sm text-center" style={{ fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}>
                {profile?.username}
              </p>

              {/* 바이오 */}
              {editingBio ? (
                <div className="w-full flex flex-col gap-1.5">
                  <textarea
                    className="w-full text-xs rounded border px-2 py-1 outline-none resize-none"
                    style={{ borderColor: 'rgba(0,17,60,0.2)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', minHeight: '60px' }}
                    value={bioInput}
                    onChange={e => setBioInput(e.target.value)}
                    maxLength={100}
                    autoFocus
                  />
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => { setEditingBio(false); setBioInput(profile?.bio ?? '') }} className="p-1 rounded hover:bg-black/5"><X size={12} /></button>
                    <button onClick={handleSaveBio} className="p-1 rounded hover:bg-black/5" style={{ color: 'var(--char-red)' }}><Check size={12} /></button>
                  </div>
                </div>
              ) : (
                <div
                  className="w-full text-center group relative cursor-pointer"
                  onClick={() => { setEditingBio(true); setBioInput(profile?.bio ?? '') }}
                >
                  <p className="text-xs opacity-50 leading-relaxed" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
                    {profile?.bio || '소개를 입력하세요...'}
                  </p>
                  <Pencil size={10} className="absolute top-0 right-0 opacity-0 group-hover:opacity-40 transition-opacity" />
                </div>
              )}
            </div>
          </WindowCard>

          {/* 미니 방명록 */}
          <MiniGuestbook />
        </div>

        {/* 오른쪽 패널 */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* 탭 네비 */}
          <WindowCard noPad>
            <div className="flex">
              {tabs.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex-1 py-2.5 text-center text-xs tracking-widest transition-colors border-b-2 ${
                      isActive
                        ? 'border-[var(--char-red)] font-semibold'
                        : 'border-transparent opacity-40 hover:opacity-70'
                    }`
                  }
                  style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </WindowCard>

          {/* 콘텐츠 */}
          <WindowCard noPad style={{ flex: 1 }}>
            <div className="p-4 h-full overflow-auto">
              <Outlet />
            </div>
          </WindowCard>
        </div>
      </div>

      {/* 모바일 하단 탭 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex border-t z-40" style={{ background: 'var(--char-blue)', borderColor: 'rgba(255,255,255,0.1)' }}>
        {tabs.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-xs tracking-widest transition-colors ${isActive ? 'text-white' : 'text-white/40'}`
            }
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
