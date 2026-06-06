import { useEffect, useRef, useState } from 'react'
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

function parsePos(pos: string) {
  const [x, y] = pos.replace(/%/g, '').trim().split(/\s+/).map(Number)
  return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? 50 : y }
}

export default function ImageUpload({
  storagePath, currentUrl, currentPosition = '50% 50%',
  onUploaded, label = '이미지',
  aspectClass = 'aspect-video', containerStyle
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [adjusting, setAdjusting] = useState(false)
  const [pos, setPos] = useState(() => parsePos(currentPosition))
  const [displayUrl, setDisplayUrl] = useState(currentUrl || '')

  // 외부에서 currentUrl이 바뀌면 동기화
  useEffect(() => {
    if (currentUrl) setDisplayUrl(currentUrl)
  }, [currentUrl])

  const posStr = `${pos.x}% ${pos.y}%`

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setError('')
    try {
      const url = await uploadImage(file, storagePath)
      const busted = `${url}?t=${Date.now()}`
      setDisplayUrl(busted)
      onUploaded(url, posStr)
    } catch (err) {
      setError('업로드 실패: ' + (err as Error).message)
    }
    setUploading(false)
    e.target.value = ''
  }

  function handleSave() {
    setAdjusting(false)
    onUploaded(currentUrl, posStr)
  }

  function handleCancel() {
    setAdjusting(false)
    setPos(parsePos(currentPosition))
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium opacity-60" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
        {label}
      </p>

      {/* 미리보기 */}
      <div
        className={`w-full rounded-sm border overflow-hidden relative group${aspectClass ? ` ${aspectClass}` : ''}`}
        style={{ borderColor: 'rgba(0,17,60,0.15)', background: 'rgba(0,17,60,0.04)', cursor: 'pointer', ...(containerStyle ?? {}) }}
        onClick={() => { if (!adjusting) inputRef.current?.click() }}
      >
        {displayUrl ? (
          <img
            key={displayUrl}
            src={displayUrl}
            alt={label}
            className="w-full h-full"
            style={{ objectFit: 'cover', objectPosition: posStr, userSelect: 'none', pointerEvents: 'none' }}
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
                  {displayUrl && (
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
      </div>

      {/* 위치 조정 패널 — 배너 아래에 슬라이더로 표시 */}
      {adjusting && (
        <div className="flex flex-col gap-3 p-3 rounded-sm border" style={{ borderColor: 'rgba(0,17,60,0.12)', background: 'rgba(0,17,60,0.03)' }}>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3">
              <span className="text-xs w-12 shrink-0" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)', opacity: 0.6 }}>좌우</span>
              <input
                type="range" min={0} max={100} value={pos.x}
                onChange={e => setPos(p => ({ ...p, x: Number(e.target.value) }))}
                className="flex-1"
              />
              <span className="text-xs w-8 text-right" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', opacity: 0.5 }}>{pos.x}%</span>
            </label>
            <label className="flex items-center gap-3">
              <span className="text-xs w-12 shrink-0" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)', opacity: 0.6 }}>위아래</span>
              <input
                type="range" min={0} max={100} value={pos.y}
                onChange={e => setPos(p => ({ ...p, y: Number(e.target.value) }))}
                className="flex-1"
              />
              <span className="text-xs w-8 text-right" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', opacity: 0.5 }}>{pos.y}%</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleSave}
              className="px-4 py-1.5 rounded-sm text-xs text-white"
              style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>
              저장
            </button>
            <button type="button" onClick={handleCancel}
              className="px-4 py-1.5 rounded-sm text-xs opacity-50 hover:opacity-80"
              style={{ border: '1px solid rgba(0,17,60,0.2)', fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
              취소
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-600 text-xs">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}
