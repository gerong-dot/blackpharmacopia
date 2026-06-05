import { useEffect, useRef, useState } from 'react'
import { getSiteSetting, setSiteSetting, uploadImage } from '../lib/storage'
import { useAuth } from '../contexts/AuthContext'
import { ImagePlus, Loader } from 'lucide-react'

type Props = { settingKey: string; aspectClass?: string }

export default function PanelImage({ settingKey, aspectClass = 'aspect-square' }: Props) {
  const [url, setUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const { profile } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getSiteSetting(settingKey).then(setUrl)
  }, [settingKey])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const newUrl = await uploadImage(file, `panel/${settingKey}`)
      setUrl(newUrl)
      await setSiteSetting(settingKey, newUrl)
    } catch {}
    setUploading(false)
    e.target.value = ''
  }

  // 비로그인 or 일반유저 — 이미지 없으면 아무것도 안 보임
  if (!profile?.is_admin && !url) return null

  // 이미지 있으면 그냥 보여줌 (일반유저도)
  if (!profile?.is_admin && url) {
    return (
      <div className={`w-full ${aspectClass} overflow-hidden rounded-sm`}>
        <img src={url} alt="" className="w-full h-full object-cover block" draggable={false} />
      </div>
    )
  }

  // 관리자 — 업로드 UI
  return (
    <div
      className={`w-full ${aspectClass} relative group cursor-pointer rounded-sm overflow-hidden border`}
      style={{ borderColor: 'rgba(195,195,195,0.12)', background: 'rgba(195,195,195,0.04)' }}
      onClick={() => inputRef.current?.click()}
    >
      {url
        ? <img src={url} alt="" className="w-full h-full object-cover block" draggable={false} />
        : <div className="w-full h-full flex flex-col items-center justify-center gap-1 opacity-20">
            <ImagePlus size={20} className="text-white" />
            <span className="text-white text-xs" style={{ fontFamily: 'var(--font-title)' }}>이미지 추가</span>
          </div>
      }
      {/* 호버 오버레이 */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        {uploading
          ? <Loader size={18} className="text-white animate-spin" />
          : <span className="text-white text-xs" style={{ fontFamily: 'var(--font-title)' }}>클릭하여 업로드</span>
        }
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}
