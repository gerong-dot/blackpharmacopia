import { useEffect, useState } from 'react'
import { getSiteSetting, setSiteSetting } from '../../lib/storage'
import ImageUpload from '../../components/ImageUpload'
import { Check } from 'lucide-react'

type Settings = {
  enter_bg: string
  main_banner: string
  about_image: string
}

export default function SiteImages() {
  const [settings, setSettings] = useState<Settings>({ enter_bg: '', main_banner: '', about_image: '' })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [enter_bg, main_banner, about_image] = await Promise.all([
        getSiteSetting('enter_bg'),
        getSiteSetting('main_banner'),
        getSiteSetting('about_image'),
      ])
      setSettings({ enter_bg, main_banner, about_image })
      setLoading(false)
    }
    load()
  }, [])

  async function handleUploaded(key: keyof Settings, url: string) {
    const next = { ...settings, [key]: url }
    setSettings(next)
    await setSiteSetting(key, url)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return (
    <div className="py-20 text-center opacity-40" style={{ fontFamily: 'var(--font-deco)', fontSize: '1.5rem' }}>loading...</div>
  )

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--char-blue)' }}>
          사이트 이미지 관리
        </h1>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-green-600" style={{ fontFamily: 'var(--font-title)' }}>
            <Check size={13} /> 저장됨
          </span>
        )}
      </div>

      <div className="flex flex-col gap-8">
        <ImageUpload
          storagePath="site/enter-bg"
          currentUrl={settings.enter_bg}
          onUploaded={url => handleUploaded('enter_bg', url)}
          label="엔터 페이지 배경 이미지"
          aspectClass="aspect-video"
        />
        <ImageUpload
          storagePath="site/main-banner"
          currentUrl={settings.main_banner}
          onUploaded={url => handleUploaded('main_banner', url)}
          label="메인 홈 상단 배너"
          aspectClass="aspect-video"
        />
        <ImageUpload
          storagePath="site/about-image"
          currentUrl={settings.about_image}
          onUploaded={url => handleUploaded('about_image', url)}
          label="About 페이지 이미지"
          aspectClass="aspect-square"
        />
      </div>

      <p className="mt-8 text-xs opacity-40 leading-relaxed" style={{ fontFamily: 'var(--font-sans)' }}>
        이미지를 클릭하면 바로 업로드되며 자동 저장됩니다. JPG, PNG, WebP, GIF 모두 지원. 최대 10MB.
      </p>
    </div>
  )
}
