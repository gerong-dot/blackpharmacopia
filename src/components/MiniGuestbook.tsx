import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { GuestbookEntry } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Send, ImagePlus, Loader } from 'lucide-react'
import WindowCard from './WindowCard'
import { getSiteSetting, setSiteSetting, uploadImage } from '../lib/storage'

export default function MiniGuestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [panelImg, setPanelImg] = useState('')
  const [uploading, setUploading] = useState(false)
  const { user, profile } = useAuth()
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchEntries()
    getSiteSetting('left_panel_bottom').then(setPanelImg)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  async function fetchEntries() {
    const { data } = await supabase.from('guestbook').select('*').order('created_at', { ascending: true }).limit(30)
    setEntries(data ?? [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !profile) return
    setSubmitting(true)
    await supabase.from('guestbook').insert({ author_id: user!.id, author_name: profile.username, content: text.trim() })
    setText('')
    await fetchEntries()
    setSubmitting(false)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file, 'panel/left_panel_bottom')
      setPanelImg(url)
      await setSiteSetting('left_panel_bottom', url)
    } catch {}
    setUploading(false)
    e.target.value = ''
  }

  return (
    <WindowCard title="CHAT" dark style={{ flexShrink: 0 }} noPad>
      {/* 메시지 목록 */}
      <div className="flex flex-col gap-2 p-3 overflow-y-auto" style={{ height: '130px' }}>
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
              <div className="px-3 py-1.5 text-xs max-w-[85%] leading-relaxed break-words"
                style={{ background: isMe ? 'var(--char-red)' : 'rgba(195,195,195,0.08)', color: 'rgba(195,195,195,0.85)', fontFamily: 'var(--font-sans)', borderRadius: isMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px' }}>
                {entry.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2 border-t" style={{ borderColor: 'rgba(195,195,195,0.08)' }}>
        <input
          className="flex-1 text-xs px-3 py-1.5 rounded-full outline-none border"
          style={{ borderColor: 'rgba(195,195,195,0.1)', fontFamily: 'var(--font-sans)', color: 'rgba(195,195,195,0.8)', background: 'rgba(195,195,195,0.05)' }}
          placeholder="메시지..."
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={200}
        />
        <button type="submit" disabled={submitting || !text.trim()}
          className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-30"
          style={{ background: 'var(--char-blue)' }}>
          <Send size={12} className="text-white" />
        </button>
      </form>

      {/* 이미지 슬롯 — 입력창 바로 아래 */}
      <div
        className="relative group border-t overflow-hidden"
        style={{ borderColor: 'rgba(195,195,195,0.08)', aspectRatio: '10/13', background: 'rgba(195,195,195,0.03)', cursor: profile?.is_admin ? 'pointer' : 'default' }}
        onClick={() => profile?.is_admin && fileRef.current?.click()}
      >
        {panelImg
          ? <img src={panelImg} alt="" className="w-full h-full object-cover block" draggable={false} />
          : profile?.is_admin && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1 opacity-25">
                <ImagePlus size={20} className="text-white" />
                <span className="text-white text-xs" style={{ fontFamily: 'var(--font-title)' }}>이미지 추가</span>
              </div>
            )
        }
        {profile?.is_admin && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploading ? <Loader size={16} className="text-white animate-spin" /> : <span className="text-white text-xs" style={{ fontFamily: 'var(--font-title)' }}>클릭하여 업로드</span>}
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>
    </WindowCard>
  )
}
