import { useEffect, useState } from 'react'
import { getSiteSetting } from '../lib/storage'
import ImageUpload from './ImageUpload'
import { useAuth } from '../contexts/AuthContext'
import { setSiteSetting } from '../lib/storage'

type Props = { settingKey: string; aspectClass?: string }

export default function PanelImage({ settingKey, aspectClass = 'aspect-square' }: Props) {
  const [url, setUrl] = useState('')
  const { profile } = useAuth()

  useEffect(() => {
    getSiteSetting(settingKey).then(setUrl)
  }, [settingKey])

  async function handleUploaded(newUrl: string) {
    setUrl(newUrl)
    await setSiteSetting(settingKey, newUrl)
  }

  if (profile?.is_admin) {
    return (
      <ImageUpload
        storagePath={`panel/${settingKey}`}
        currentUrl={url}
        onUploaded={handleUploaded}
        label=""
        aspectClass={aspectClass}
      />
    )
  }

  if (!url) return null

  return (
    <div className={`w-full ${aspectClass} overflow-hidden rounded-sm`}>
      <img src={url} alt="" className="w-full h-full object-cover block" draggable={false} />
    </div>
  )
}
