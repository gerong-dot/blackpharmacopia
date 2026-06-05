import { useRef, useState, useCallback } from 'react'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Check, X } from 'lucide-react'

type Props = {
  src: string
  aspect?: number
  onCropped: (blob: Blob) => void
  onCancel: () => void
}

function centerAspectCrop(w: number, h: number, aspect: number) {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, w, h), w, h)
}

export default function ImageCropper({ src, aspect, onCropped, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completing, setCompleting] = useState(false)

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    setCrop(aspect ? centerAspectCrop(w, h, aspect) : centerCrop({ unit: '%', width: 90, height: 90 }, w, h))
  }, [aspect])

  async function handleComplete() {
    if (!imgRef.current || !crop) return
    setCompleting(true)
    const img = imgRef.current
    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    const pixelCrop = {
      x: (crop.unit === '%' ? (crop.x / 100) * img.width : crop.x) * scaleX,
      y: (crop.unit === '%' ? (crop.y / 100) * img.height : crop.y) * scaleY,
      width: (crop.unit === '%' ? (crop.width / 100) * img.width : crop.width) * scaleX,
      height: (crop.unit === '%' ? (crop.height / 100) * img.height : crop.height) * scaleY,
    }

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    ctx.drawImage(img, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)

    canvas.toBlob(blob => {
      if (blob) onCropped(blob)
      setCompleting(false)
    }, 'image/jpeg', 0.92)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="flex flex-col gap-4 w-full max-w-2xl">
        <p className="text-white text-xs tracking-widest text-center" style={{ fontFamily: 'var(--font-title)' }}>
          이미지를 드래그해서 영역을 선택하세요
        </p>
        <div className="flex justify-center">
          <ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={aspect} className="max-h-[60vh]">
            <img ref={imgRef} src={src} onLoad={onImageLoad} style={{ maxHeight: '60vh', maxWidth: '100%' }} alt="crop" />
          </ReactCrop>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="flex items-center gap-1.5 px-5 py-2 rounded-sm text-sm text-white/70 hover:text-white transition-colors" style={{ border: '1px solid rgba(255,255,255,0.2)', fontFamily: 'var(--font-title)' }}>
            <X size={14} /> 취소
          </button>
          <button onClick={handleComplete} disabled={completing || !crop} className="flex items-center gap-1.5 px-6 py-2 rounded-sm text-sm text-white disabled:opacity-40" style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>
            <Check size={14} /> {completing ? '처리 중...' : '적용'}
          </button>
        </div>
      </div>
    </div>
  )
}
