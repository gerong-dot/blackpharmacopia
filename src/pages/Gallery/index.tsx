import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadImage, getSiteSetting, setSiteSetting } from '../../lib/storage'
import { useAuth } from '../../contexts/AuthContext'
import { Trash2, Plus, Loader, X, ChevronLeft, ChevronRight, EyeOff, Eye } from 'lucide-react'
import { getCached, setCached, invalidateCache } from '../../lib/queryCache'

type GalleryItem = { id: string; url: string; caption: string; created_at: string }

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [sensitiveIds, setSensitiveIds] = useState<Set<string>>(new Set())
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)
  const { profile } = useAuth()

  useEffect(() => {
    fetchItems()
    getSiteSetting('gallery_sensitive').then(raw => {
      if (raw) try { setSensitiveIds(new Set(JSON.parse(raw))) } catch {}
    })
  }, [])

  useEffect(() => {
    if (lightbox === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox(i => i !== null ? Math.min(i + 1, items.length - 1) : null)
      if (e.key === 'ArrowLeft') setLightbox(i => i !== null ? Math.max(i - 1, 0) : null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, items.length])

  async function fetchItems(force = false) {
    const cached = getCached<GalleryItem[]>('gallery')
    if (cached && !force) { setItems(cached); setLoading(false); return }
    const res = await fetch('/api/gallery')
    if (res.ok) {
      const data = await res.json()
      setCached('gallery', data)
      setItems(data)
    } else {
      const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false })
      if (data) setCached('gallery', data)
      setItems(data ?? [])
    }
    setLoading(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = `gallery/${Date.now()}`
      const url = await uploadImage(file, path)
      await supabase.from('gallery').insert({ url, caption: caption.trim() })
      setCaption('')
      invalidateCache('gallery')
      await fetchItems(true)
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
    const next = items.filter(i => i.id !== id)
    setCached('gallery', next)
    setItems(next)
    // 민감 목록에서도 제거
    if (sensitiveIds.has(id)) {
      const next = new Set(sensitiveIds)
      next.delete(id)
      setSensitiveIds(next)
      await setSiteSetting('gallery_sensitive', JSON.stringify([...next]))
    }
  }

  async function toggleSensitive(id: string) {
    const next = new Set(sensitiveIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setSensitiveIds(next)
    await setSiteSetting('gallery_sensitive', JSON.stringify([...next]))
  }

  function toggleReveal(id: string) {
    setRevealedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleImageClick(idx: number) {
    const item = items[idx]
    const isSensitive = sensitiveIds.has(item.id)
    const isRevealed = revealedIds.has(item.id)
    if (isSensitive && !isRevealed) {
      toggleReveal(item.id)
    } else {
      setLightbox(idx)
    }
  }

  const lb = lightbox !== null ? items[lightbox] : null

  return (
    <div className="max-w-4xl mx-auto">
      {/* 라이트박스 */}
      {lb && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightbox(null)}
        >
          {lightbox! > 0 && (
            <button
              className="absolute left-3 p-2 text-white/60 hover:text-white transition-colors z-10"
              onClick={e => { e.stopPropagation(); setLightbox(i => i! - 1) }}
            >
              <ChevronLeft size={32} />
            </button>
          )}
          <div className="flex flex-col items-center gap-3 max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img
              src={lb.url}
              alt={lb.caption}
              style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
            />
            {lb.caption && (
              <p className="text-sm text-white/60" style={{ fontFamily: 'var(--font-sans)' }}>{lb.caption}</p>
            )}
          </div>
          {lightbox! < items.length - 1 && (
            <button
              className="absolute right-3 p-2 text-white/60 hover:text-white transition-colors z-10"
              onClick={e => { e.stopPropagation(); setLightbox(i => i! + 1) }}
            >
              <ChevronRight size={32} />
            </button>
          )}
          <button className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors" onClick={() => setLightbox(null)}>
            <X size={22} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--char-blue)' }}>Gallery</h1>
          {items.some(i => sensitiveIds.has(i.id)) && (
            <span className="text-xs opacity-30" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
              ✦ 일부 이미지는 성인/스포일러 내용을 포함합니다
            </span>
          )}
        </div>
        {profile?.is_admin && (
          <div className="flex items-center gap-2">
            <input
              className="px-3 py-1.5 rounded-sm border text-sm outline-none"
              style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', width: '130px' }}
              placeholder="캡션 (선택)"
              value={caption}
              onChange={e => setCaption(e.target.value)}
            />
            <label
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs text-white cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
              style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}
            >
              {uploading ? <Loader size={13} className="animate-spin" /> : <Plus size={13} />}
              {uploading ? '업로드 중...' : '이미지 업로드'}
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center opacity-40" style={{ fontFamily: 'var(--font-deco)', fontSize: '1.5rem', color: 'var(--char-blue)' }}>loading...</div>
      ) : items.length === 0 ? (
        <p className="text-center py-20 opacity-30 text-sm" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>갤러리가 비어있습니다</p>
      ) : (
        <div className="columns-2 md:columns-3 gap-3 space-y-3">
          {items.map((item, idx) => {
            const isSensitive = sensitiveIds.has(item.id)
            const isRevealed = revealedIds.has(item.id)
            const showBlur = isSensitive && !isRevealed
            return (
              <div key={item.id} className="break-inside-avoid relative group rounded-sm overflow-hidden border" style={{ borderColor: 'rgba(0,17,60,0.08)' }}>
                <div className="relative cursor-pointer" onClick={() => handleImageClick(idx)}>
                  <img
                    src={item.url}
                    alt={item.caption}
                    className="w-full object-cover block transition-all duration-300"
                    style={{ filter: showBlur ? 'blur(18px) brightness(0.7)' : 'none', cursor: showBlur ? 'pointer' : 'zoom-in' }}
                  />
                  {/* 블러 오버레이 */}
                  {showBlur && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                      <EyeOff size={22} className="text-white/80" />
                      <span className="text-xs text-white/70 tracking-widest" style={{ fontFamily: 'var(--font-title)' }}>클릭하여 보기</span>
                    </div>
                  )}
                  {/* 이미 열린 민감 이미지 - 다시 숨기기 버튼 */}
                  {isSensitive && isRevealed && (
                    <button
                      className="absolute top-2 left-2 p-2 rounded-sm bg-black/50 text-white/60 hover:text-white transition-opacity"
                      onClick={e => { e.stopPropagation(); toggleReveal(item.id) }}
                      title="다시 숨기기"
                    >
                      <Eye size={13} />
                    </button>
                  )}
                </div>
                {item.caption && (
                  <p className="text-xs px-2 py-1 opacity-50" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>{item.caption}</p>
                )}
                {profile?.is_admin && (
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {/* 민감 토글 */}
                    <button
                      onClick={() => toggleSensitive(item.id)}
                      className={`p-1.5 rounded-sm text-white transition-colors ${isSensitive ? 'bg-amber-600/80' : 'bg-black/50'}`}
                      title={isSensitive ? '민감 해제' : '성인/스포 블러'}
                    >
                      <EyeOff size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.url)}
                      className="p-2 rounded-sm bg-black/50 text-white"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
