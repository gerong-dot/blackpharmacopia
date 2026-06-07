import { useEffect, useState } from 'react'
import { getSiteSetting, setSiteSetting } from '../lib/storage'
import { useAuth } from '../contexts/AuthContext'
import { Plus, X } from 'lucide-react'

type Bookmark = { id: string; label: string; url: string }

export default function BookmarkBar() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [showPopup, setShowPopup] = useState(false)
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const { profile } = useAuth()

  useEffect(() => {
    getSiteSetting('bookmarks').then(raw => {
      if (raw) try { setBookmarks(JSON.parse(raw)) } catch {}
    })
  }, [])

  async function save(next: Bookmark[]) {
    setBookmarks(next)
    await setSiteSetting('bookmarks', JSON.stringify(next))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim() || !url.trim()) return
    const href = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`
    await save([...bookmarks, { id: `bk-${Date.now()}`, label: label.trim(), url: href }])
    setLabel(''); setUrl('')
    setShowPopup(false)
  }

  async function handleDelete(id: string) {
    await save(bookmarks.filter(b => b.id !== id))
  }

  if (!profile?.is_admin && bookmarks.length === 0) return null

  return (
    <>
      <div className="shrink-0 flex items-center gap-1 px-2 py-1 border-b overflow-x-auto" style={{ borderColor: 'rgba(195,195,195,0.08)', background: 'rgba(26,32,53,0.6)', minHeight: '28px' }}>
        {bookmarks.map(bk => (
          <div key={bk.id} className="relative group flex-shrink-0">
            <a
              href={bk.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-0.5 text-xs rounded-sm transition-colors hover:bg-white/10"
              style={{ fontFamily: 'var(--font-sans)', color: 'rgba(195,195,195,0.6)', whiteSpace: 'nowrap' }}
            >
              {bk.label}
            </a>
            {profile?.is_admin && (
              <button
                onClick={() => handleDelete(bk.id)}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
              >
                <X size={8} />
              </button>
            )}
          </div>
        ))}

        {profile?.is_admin && (
          <button
            onClick={() => setShowPopup(true)}
            className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 text-xs rounded-sm transition-colors hover:bg-white/10"
            style={{ fontFamily: 'var(--font-sans)', color: 'rgba(195,195,195,0.3)' }}
          >
            <Plus size={10} />
          </button>
        )}
      </div>

      {/* 팝업 */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowPopup(false)}>
          <form
            onSubmit={handleAdd}
            onClick={e => e.stopPropagation()}
            className="flex flex-col gap-3 p-5 rounded-sm shadow-xl w-72"
            style={{ background: 'var(--paper)', border: '1px solid rgba(0,17,60,0.15)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs tracking-widest" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
                북마크 추가
              </p>
              <button type="button" onClick={() => setShowPopup(false)} className="text-black/30 hover:text-black/60">
                <X size={13} />
              </button>
            </div>
            <input
              className="w-full px-2 py-1.5 rounded-sm border text-xs outline-none"
              style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}
              placeholder="이름"
              value={label}
              onChange={e => setLabel(e.target.value)}
              required
              autoFocus
            />
            <input
              className="w-full px-2 py-1.5 rounded-sm border text-xs outline-none"
              style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}
              placeholder="URL (https://...)"
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
            />
            <div className="flex gap-2 mt-1">
              <button type="submit" className="px-4 py-1.5 rounded-sm text-xs text-white" style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>
                추가
              </button>
              <button type="button" onClick={() => setShowPopup(false)} className="px-4 py-1.5 rounded-sm text-xs opacity-50" style={{ border: '1px solid rgba(0,17,60,0.15)', fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
                취소
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
