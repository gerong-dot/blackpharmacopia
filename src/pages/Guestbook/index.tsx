import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { GuestbookEntry } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Trash2 } from 'lucide-react'

export default function GuestbookPage() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user, profile } = useAuth()

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    const { data } = await supabase
      .from('guestbook')
      .select('*')
      .order('created_at', { ascending: false })
    setEntries(data ?? [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !profile) return
    setSubmitting(true)
    await supabase.from('guestbook').insert({
      author_id: user!.id,
      author_name: profile.username,
      content: text.trim(),
    })
    setText('')
    await fetchEntries()
    setSubmitting(false)
  }

  async function handleDelete(entryId: string) {
    if (!confirm('삭제하시겠습니까?')) return
    await supabase.from('guestbook').delete().eq('id', entryId)
    setEntries(prev => prev.filter(e => e.id !== entryId))
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1
        className="mb-8"
        style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--char-blue)' }}
      >
        Guestbook
      </h1>

      {/* 작성 폼 */}
      {profile ? (
        <form onSubmit={handleSubmit} className="mb-10 flex gap-2">
          <input
            className="flex-1 px-4 py-2 rounded border text-sm outline-none bg-white focus:border-black/30 transition-colors"
            style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}
            placeholder="방명록을 남겨주세요..."
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={200}
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="px-5 py-2 rounded text-sm text-white transition-opacity disabled:opacity-40"
            style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}
          >
            남기기
          </button>
        </form>
      ) : (
        <p className="mb-10 text-sm opacity-40 text-center py-4 rounded border border-dashed"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', borderColor: 'rgba(0,17,60,0.15)' }}>
          로그인 후 방명록을 남길 수 있어요
        </p>
      )}

      {/* 목록 */}
      {loading ? (
        <div className="text-center py-10 opacity-40" style={{ fontFamily: 'var(--font-deco)', fontSize: '1.5rem' }}>
          loading...
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center py-10 opacity-40 text-sm" style={{ fontFamily: 'var(--font-sans)' }}>
          아직 방명록이 없습니다
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map(entry => (
            <li
              key={entry.id}
              className="flex items-start justify-between gap-3 py-4 px-4 rounded border"
              style={{ borderColor: 'rgba(0,17,60,0.1)', background: 'rgba(0,17,60,0.02)' }}
            >
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-red)' }}>
                  {entry.author_name}
                </span>
                <p className="text-sm break-words" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
                  {entry.content}
                </p>
                <span className="text-xs opacity-30 mt-1" style={{ fontFamily: 'var(--font-sans)' }}>
                  {new Date(entry.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
              {(entry.author_id === user?.id || profile?.is_admin) && (
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="shrink-0 opacity-30 hover:opacity-70 transition-opacity mt-1"
                  style={{ color: 'var(--char-blue)' }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
