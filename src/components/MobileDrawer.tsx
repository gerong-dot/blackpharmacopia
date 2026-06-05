import { useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Camera, Check, Pencil, X, LogOut } from 'lucide-react'
import { uploadImage } from '../lib/storage'
import { supabase } from '../lib/supabase'
import MiniGuestbook from './MiniGuestbook'
import LoginModal from './LoginModal'

type Props = { onClose: () => void }

export default function MobileDrawer({ onClose }: Props) {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const avatarRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [bioInput, setBioInput] = useState(profile?.bio ?? '')
  const [showLogin, setShowLogin] = useState(false)

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

  async function handleSignOut() {
    await signOut()
    onClose()
  }

  return (
    <>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* 오버레이 */}
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />

      {/* 드로어 */}
      <div className="fixed left-0 top-0 bottom-0 z-50 flex flex-col w-72 overflow-hidden" style={{ background: 'var(--dark)' }}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(195,195,195,0.1)' }}>
          <span className="text-white/60 text-xs tracking-widest" style={{ fontFamily: 'var(--font-title)' }}>MENU</span>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-3">
          {/* 프로필 */}
          <div className="rounded-sm p-4 border flex flex-col items-center gap-3" style={{ borderColor: 'rgba(195,195,195,0.1)', background: 'rgba(195,195,195,0.04)' }}>
            {user && profile ? (
              <>
                <div className="relative group cursor-pointer" onClick={() => avatarRef.current?.click()}>
                  <div className="w-20 h-20 rounded-sm overflow-hidden border" style={{ borderColor: 'rgba(195,195,195,0.15)' }}>
                    {profile.avatar_url
                      ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(195,195,195,0.05)' }}>
                          <span style={{ color: 'rgba(195,195,195,0.2)', fontSize: '2rem' }}>✦</span>
                        </div>
                    }
                  </div>
                  <div className="absolute inset-0 rounded-sm bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploadingAvatar ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={16} className="text-white" />}
                  </div>
                  <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>

                <p className="text-sm tracking-widest" style={{ fontFamily: 'var(--font-title)', color: 'rgba(195,195,195,0.9)' }}>{profile.username}</p>

                {editingBio ? (
                  <div className="w-full flex flex-col gap-1.5">
                    <textarea className="w-full text-xs rounded-sm border px-2 py-1 outline-none resize-none"
                      style={{ borderColor: 'rgba(195,195,195,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', background: 'var(--paper)', minHeight: '60px' }}
                      value={bioInput} onChange={e => setBioInput(e.target.value)} maxLength={80} autoFocus />
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => { setEditingBio(false); setBioInput(profile.bio ?? '') }} className="p-1 text-white/40"><X size={12} /></button>
                      <button onClick={handleSaveBio} style={{ color: 'var(--char-red)' }} className="p-1"><Check size={12} /></button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full text-center cursor-pointer group relative" onClick={() => { setEditingBio(true); setBioInput(profile.bio ?? '') }}>
                    <p className="text-xs leading-relaxed" style={{ fontFamily: 'var(--font-sans)', color: 'rgba(195,195,195,0.4)' }}>{profile.bio || '...'}</p>
                    <Pencil size={10} className="absolute top-0 right-0 opacity-0 group-hover:opacity-40 text-white" />
                  </div>
                )}

                <button onClick={handleSignOut} className="flex items-center gap-1.5 text-xs opacity-30 hover:opacity-60 transition-opacity mt-1" style={{ fontFamily: 'var(--font-title)', color: 'rgba(195,195,195,0.8)' }}>
                  <LogOut size={12} /> 로그아웃
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-sm flex items-center justify-center border" style={{ borderColor: 'rgba(195,195,195,0.1)', background: 'rgba(195,195,195,0.04)' }}>
                  <span style={{ color: 'rgba(195,195,195,0.15)', fontSize: '2rem' }}>✦</span>
                </div>
                <button onClick={() => setShowLogin(true)} className="w-full py-2 rounded-sm text-xs tracking-widest hover:opacity-80 transition-opacity"
                  style={{ border: '1px solid rgba(195,195,195,0.2)', color: 'rgba(195,195,195,0.6)', fontFamily: 'var(--font-title)' }}>
                  LOGIN
                </button>
              </>
            )}
          </div>

          {/* 채팅 */}
          <div className="flex-1">
            <MiniGuestbook />
          </div>
        </div>
      </div>
    </>
  )
}
