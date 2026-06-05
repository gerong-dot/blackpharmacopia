import { useEffect, useState } from 'react'
import { getSiteSetting, setSiteSetting } from '../lib/storage'
import { useAuth } from '../contexts/AuthContext'
import { Plus, X } from 'lucide-react'

type Badge = { id: string; url: string; href?: string; alt?: string }

export default function RetroBadges() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [adding, setAdding] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newHref, setNewHref] = useState('')
  const [newAlt, setNewAlt] = useState('')
  const { profile } = useAuth()

  useEffect(() => {
    getSiteSetting('retro_badges').then(raw => {
      if (raw) try { setBadges(JSON.parse(raw)) } catch {}
    })
  }, [])

  async function save(next: Badge[]) {
    setBadges(next)
    await setSiteSetting('retro_badges', JSON.stringify(next))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newUrl.trim()) return
    const next = [...badges, { id: `b-${Date.now()}`, url: newUrl.trim(), href: newHref.trim() || undefined, alt: newAlt.trim() || undefined }]
    await save(next)
    setNewUrl(''); setNewHref(''); setNewAlt('')
    setAdding(false)
  }

  async function handleDelete(id: string) {
    await save(badges.filter(b => b.id !== id))
  }

  if (!profile?.is_admin && badges.length === 0) return null

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(0,17,60,0.15))' }} />
        <span className="text-xs tracking-[0.3em] opacity-40" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>BADGES</span>
        <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(0,17,60,0.15))' }} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {badges.map(badge => (
          <div key={badge.id} className="relative group">
            {badge.href ? (
              <a href={badge.href} target="_blank" rel="noopener noreferrer">
                <img src={badge.url} alt={badge.alt ?? ''} className="h-8 border border-black/10 hover:border-black/30 transition-all" style={{ imageRendering: 'pixelated' }} />
              </a>
            ) : (
              <img src={badge.url} alt={badge.alt ?? ''} className="h-8 border border-black/10" style={{ imageRendering: 'pixelated' }} />
            )}
            {profile?.is_admin && (
              <button onClick={() => handleDelete(badge.id)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <X size={9} />
              </button>
            )}
          </div>
        ))}

        {/* 추가 버튼 */}
        {profile?.is_admin && !adding && (
          <button onClick={() => setAdding(true)}
            className="h-8 px-2 border border-dashed text-xs opacity-30 hover:opacity-60 transition-opacity flex items-center gap-1"
            style={{ borderColor: 'rgba(0,17,60,0.2)', fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
            <Plus size={10} /> 뱃지
          </button>
        )}
      </div>

      {/* 추가 폼 */}
      {adding && (
        <form onSubmit={handleAdd} className="mt-3 flex flex-col gap-2 p-3 rounded-sm border" style={{ borderColor: 'rgba(0,17,60,0.1)' }}>
          <p className="text-xs opacity-50 mb-1" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
            88×31 뱃지 추가
          </p>
          <input className="w-full px-2 py-1.5 rounded-sm border text-xs outline-none"
            style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}
            placeholder="뱃지 이미지 URL (https://...)" value={newUrl} onChange={e => setNewUrl(e.target.value)} required autoFocus />
          <input className="w-full px-2 py-1.5 rounded-sm border text-xs outline-none"
            style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}
            placeholder="링크 URL (선택)" value={newHref} onChange={e => setNewHref(e.target.value)} />
          <input className="w-full px-2 py-1.5 rounded-sm border text-xs outline-none"
            style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}
            placeholder="설명 텍스트 (선택)" value={newAlt} onChange={e => setNewAlt(e.target.value)} />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-1.5 rounded-sm text-xs text-white" style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>추가</button>
            <button type="button" onClick={() => setAdding(false)} className="px-4 py-1.5 rounded-sm text-xs opacity-50" style={{ border: '1px solid rgba(0,17,60,0.15)', fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>취소</button>
          </div>
        </form>
      )}
    </div>
  )
}
