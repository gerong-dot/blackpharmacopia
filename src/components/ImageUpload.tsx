import { useRef, useState } from 'react'
import { Upload, Loader, Move } from 'lucide-react'
import { uploadImage } from '../lib/storage'

type Props = {
  storagePath: string
  currentUrl: string
  currentPosition?: string
  onUploaded: (url: string, position?: string) => void
  label?: string
  aspectClass?: string
  containerStyle?: React.CSSProperties
}

export default function ImageUpload({ storagePath, currentUrl, currentPosition = '50% 50%', onUploaded, label = '이미지', aspectClass = 'aspect-video', containerStyle }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [adjusting, setAdjusting] = useState(false)
  const [position, setPosition] = useState(currentPosition)
  const [dragging, setDragging] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('10MB 이하만 가능합니다.'); return }
    setUploading(true); setError('')
    try {
      const url = await uploadImage(file, storagePath)
      onUploaded(url, position)
    } catch (err) {
      setError('업로드 실패: ' + (err as Error).message)
    }
    setUploading(false)
    e.target.value = ''
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!dragging || !adjusting || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    const clamped = `${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`
    setPosition(clamped)
  }

  function handlePositionSave() {
    setAdjusting(false)
    setDragging(false)
    onUploaded(currentUrl, position)
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium opacity-60" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
        {label}
      </p>

      <div
        ref={containerRef}
        className={`${aspectClass} w-full rounded-sm border overflow-hidden relative group`}
        style={{
          borderColor: 'rgba(0,17,60,0.15)',
          cursor: adjusting ? (dragging ? 'grabbing' : 'grab') : 'pointer',
          background: 'rgba(0,17,60,0.04)',
          ...containerStyle,
        }}
        onClick={() => { if (!adjusting) inputRef.current?.click() }}
        onMouseMove={handleMouseMove}
        onMouseDown={() => { if (adjusting) setDragging(true) }}
        onMouseUp={() => { if (adjusting) setDragging(false) }}
        onMouseLeave={() => setDragging(false)}
      >
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={label}
            className="w-full h-full"
            style={{ objectFit: 'cover', objectPosition: position, userSelect: 'none', pointerEvents: 'none' }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-30">
            <Upload size={24} style={{ color: 'var(--char-blue)' }} />
          </div>
        )}

        {/* 호버 오버레이 */}
        {!adjusting && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            {uploading
              ? <Loader size={22} className="text-white animate-spin" />
              : <>
                  <span className="text-white text-xs tracking-widest" style={{ fontFamily: 'var(--font-title)' }}>클릭하여 업로드</span>
                  {currentUrl && (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setAdjusting(true) }}
                      className="flex items-center gap-1 px-2 py-1 rounded-sm text-xs text-white"
                      style={{ background: 'rgba(128,0,1,0.8)', fontFamily: 'var(--font-title)' }}
                    >
                      <Move size={11} /> 위치 조정
                    </button>
                  )}
                </>
            }
          </div>
        )}

        {/* 위치 조정 모드 */}
        {adjusting && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-3 gap-2"
            style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <Move size={11} className="text-white/70" />
              <span className="text-white text-xs" style={{ fontFamily: 'var(--font-title)' }}>드래그로 위치 조정</span>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={handlePositionSave}
                className="px-3 py-1 rounded-sm text-xs text-white"
                style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}
                onMouseDown={e => e.stopPropagation()}>
                저장
              </button>
              <button type="button" onClick={() => { setAdjusting(false); setPosition(currentPosition) }}
                className="px-3 py-1 rounded-sm text-xs text-white/70"
                style={{ background: 'rgba(0,0,0,0.5)', fontFamily: 'var(--font-title)' }}
                onMouseDown={e => e.stopPropagation()}>
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-xs">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}
