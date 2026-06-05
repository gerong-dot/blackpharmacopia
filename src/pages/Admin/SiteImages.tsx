import { useEffect, useState } from 'react'
import { getSiteSetting, setSiteSetting } from '../../lib/storage'
import ImageUpload from '../../components/ImageUpload'
import { Check } from 'lucide-react'

type Settings = {
  enter_bg: string
  enter_bg_pos: string
  main_banner: string
  main_banner_pos: string
  about_image: string
  about_image_pos: string
}

export default function SiteImages() {
  const [settings, setSettings] = useState<Settings>({
    enter_bg: '', enter_bg_pos: '50% 50%',
    main_banner: '', main_banner_pos: '50% 50%',
    about_image: '', about_image_pos: '50% 50%',
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const keys = ['enter_bg','enter_bg_pos','main_banner','main_banner_pos','about_image','about_image_pos']
      const vals = await Promise.all(keys.map(k => getSiteSetting(k)))
      const s = Object.fromEntries(keys.map((k, i) => [k, vals[i]])) as Settings
      if (!s.enter_bg_pos) s.enter_bg_pos = '50% 50%'
      if (!s.main_banner_pos) s.main_banner_pos = '50% 50%'
      if (!s.about_image_pos) s.about_image_pos = '50% 50%'
      setSettings(s)
      setLoading(false)
    }
    load()
  }, [])

  async function handleUploaded(urlKey: keyof Settings, posKey: keyof Settings, url: string, position?: string) {
    const next = { ...settings, [urlKey]: url, [posKey]: position ?? settings[posKey] }
    setSettings(next)
    await Promise.all([
      setSiteSetting(urlKey, url),
      position ? setSiteSetting(posKey, position) : Promise.resolve(),
    ])
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div className="py-20 text-center opacity-40" style={{ fontFamily: 'var(--font-deco)', fontSize: '1.5rem', color: 'var(--char-blue)' }}>loading...</div>

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--char-blue)' }}>사이트 이미지 관리</h1>
        {saved && <span className="flex items-center gap-1 text-xs text-green-600" style={{ fontFamily: 'var(--font-title)' }}><Check size={13} /> 저장됨</span>}
      </div>

      <div className="flex flex-col gap-8">
        <ImageUpload
          storagePath="site/enter-bg"
          currentUrl={settings.enter_bg}
          currentPosition={settings.enter_bg_pos}
          onUploaded={(url, pos) => handleUploaded('enter_bg', 'enter_bg_pos', url, pos)}
          label="엔터 페이지 배경 이미지"
          aspectClass="aspect-video"
        />
        <ImageUpload
          storagePath="site/main-banner"
          currentUrl={settings.main_banner}
          currentPosition={settings.main_banner_pos}
          onUploaded={(url, pos) => handleUploaded('main_banner', 'main_banner_pos', url, pos)}
          label="메인 홈 상단 배너"
          aspectClass="aspect-video"
        />
        <ImageUpload
          storagePath="site/about-image"
          currentUrl={settings.about_image}
          currentPosition={settings.about_image_pos}
          onUploaded={(url, pos) => handleUploaded('about_image', 'about_image_pos', url, pos)}
          label="About 페이지 이미지"
          aspectClass="aspect-square"
        />
      </div>
      <p className="mt-8 text-xs opacity-40 leading-relaxed" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
        클릭하여 업로드 · 이미지 호버 후 <b>위치 조정</b> 버튼으로 보이는 영역 지정 가능
      </p>
    </div>
  )
}
