import { useEffect, useState } from 'react'
import { getSiteSetting } from '../lib/storage'

export function useSiteImage(key: string) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    getSiteSetting(key).then(setUrl)
  }, [key])
  return url
}
