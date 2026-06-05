import { useRef, useState } from 'react'
import { Upload, Loader } from 'lucide-react'
import { uploadImage } from '../lib/storage'
import ImageCropper from './ImageCropper'

type Props = {
  storagePath: string
  currentUrl: string
  onUploaded: (url: string) => void
  label?: string
  aspectClass?: string
  aspect?: number
}

export default function ImageUpload({ storagePath, currentUrl, onUploaded, label = '이미지', aspectClass = 'aspect-video', aspect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [error, setError] = useState('')

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('10MB 이하 파일만 업로드 가능합니다.'); return }
    const reader = new FileReader()
    reader.onload = () => setCropSrc(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function handleCropped(blob: Blob) {
    setCropSrc(null)
    setUploading(true)
    setError('')
    try {
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' })
      const url = await uploadImage(file, storagePath)
      onUploaded(url)
    } catch (err) {
      setError('업로드 실패: ' + (err as Error).message)
    }
    setUploading(false)
  }

  return (
    <>
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          aspect={aspect}
          onCropped={handleCropped}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium opacity-60" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
          {label}
        </p>
        <div
          className={`${aspectClass} w-full rounded-sm border overflow-hidden bg-black/5 relative group cursor-pointer`}
          style={{ borderColor: 'rgba(0,17,60,0.15)' }}
          onClick={() => inputRef.current?.click()}
        >
          {currentUrl
            ? <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center opacity-30"><Upload size={24} /></div>
          }
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploading
              ? <Loader size={24} className="text-white animate-spin" />
              : <span className="text-white text-xs tracking-widest" style={{ fontFamily: 'var(--font-title)' }}>클릭하여 업로드</span>
            }
          </div>
        </div>
        {error && <p className="text-red-600 text-xs">{error}</p>}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      </div>
    </>
  )
}
