import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { GuestbookEntry } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Send } from 'lucide-react'
import WindowCard from './WindowCard'

export default function MiniGuestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user, profile } = useAuth()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchEntries()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  async function fetchEntries() {
    const { data } = await supabase
      .from('guestbook')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(30)
    setEntries(data ?? [])
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

  return (
    <WindowCard title="CHAT" dark style={{ flexShrink: 0 }} noPad>
      {/* 메시지 목록 */}
      <div className="flex flex-col gap-2 p-3 overflow-y-auto" style={{ maxHeight: '200px', minHeight: '120px' }}>
        {entries.length === 0 && (
          <p className="text-center text-xs opacity-30 mt-4" style={{ fontFamily: 'var(--font-sans)' }}>
            첫 메시지를 남겨보세요
          </p>
        )}
        {entries.map(entry => {
          const isMe = entry.author_id === user?.id
          return (
            <div key={entry.id} className={`flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
              {!isMe && (
                <span className="text-xs px-1" style={{ fontFamily: 'var(--font-title)', color: 'rgba(195,195,195,0.35)' }}>
                  {entry.author_name}
                </span>
              )}
              <div
                className="px-3 py-1.5 text-xs max-w-[85%] leading-relaxed break-words"
                style={{
                  background: isMe ? 'var(--char-red)' : 'rgba(195,195,195,0.08)',
                  color: 'rgba(195,195,195,0.85)',
                  fontFamily: 'var(--font-sans)',
                  borderRadius: isMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                }}
              >
                {entry.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-2 border-t"
        style={{ borderColor: 'rgba(195,195,195,0.08)' }}
      >
        <input
          className="flex-1 text-xs px-3 py-1.5 rounded-full outline-none border"
          style={{
            borderColor: 'rgba(195,195,195,0.1)',
            fontFamily: 'var(--font-sans)',
            color: 'rgba(195,195,195,0.8)',
            background: 'rgba(195,195,195,0.05)',
          }}
          placeholder="메시지..."
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={200}
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-30 transition-opacity"
          style={{ background: 'var(--char-blue)' }}
        >
          <Send size={12} className="text-white" />
        </button>
      </form>
    </WindowCard>
  )
}
