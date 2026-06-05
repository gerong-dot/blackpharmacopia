import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadImage } from '../../lib/storage'
import { useAuth } from '../../contexts/AuthContext'
import { Trash2, Plus, Loader } from 'lucide-react'

type GalleryItem = { id: string; url: string; caption: string; created_at: string }

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { profile } = useAuth()

  useEffect(() => { fetchItems() }, [])

  async function fetchItems() {
    // 공개 API로 호출 — 로그인 없이도 조회 가능
    const res = await fetch('/api/gallery')
    if (res.ok) setItems(await res.json())
    else {
      // 폴백: 로그인 상태면 supabase 직접 조회
      const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false })
      setItems(data ?? [])
    }
    setLoading(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = `gallery/${Date.now()}-${file.name.replace(/\s/g, '_').replace(/\.[^.]+$/, '')}`
      const url = await uploadImage(file, path)
      await supabase.from('gallery').insert({ url, caption: caption.trim() })
      setCaption('')
      await fetchItems()
    } catch (err) {
      alert('업로드 실패: ' + (err as Error).message)
    }
    setUploading(false)
    e.target.value = ''
  }

  async function handleDelete(id: string, url: string) {
    if (!confirm('삭제하시겠습니까?')) return
    const path = url.split('/images/')[1]
    if (path) await supabase.storage.from('images').remove([path])
    await supabase.from('gallery').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--char-blue)' }}>Gallery</h1>
        {profile?.is_admin && (
          <div className="flex items-center gap-2">
            <input
              className="px-3 py-1.5 rounded-sm border text-sm outline-none"
              style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', width: '130px' }}
              placeholder="캡션 (선택)"
              value={caption}
              onChange={e => setCaption(e.target.value)}
            />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs text-white disabled:opacity-50"
              style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}
            >
              {uploading ? <Loader size={13} className="animate-spin" /> : <Plus size={13} />}
              {uploading ? '업로드 중...' : '이미지 업로드'}
            </button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center opacity-40" style={{ fontFamily: 'var(--font-deco)', fontSize: '1.5rem', color: 'var(--char-blue)' }}>loading...</div>
      ) : items.length === 0 ? (
        <p className="text-center py-20 opacity-30 text-sm" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>갤러리가 비어있습니다</p>
      ) : (
        <div className="columns-2 md:columns-3 gap-3 space-y-3">
          {items.map(item => (
            <div key={item.id} className="break-inside-avoid relative group rounded-sm overflow-hidden border" style={{ borderColor: 'rgba(0,17,60,0.08)' }}>
              <img src={item.url} alt={item.caption} className="w-full object-cover block" />
              {item.caption && (
                <p className="text-xs px-2 py-1 opacity-50" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>{item.caption}</p>
              )}
              {profile?.is_admin && (
                <button
                  onClick={() => handleDelete(item.id, item.url)}
                  className="absolute top-2 right-2 p-1.5 rounded-sm bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
