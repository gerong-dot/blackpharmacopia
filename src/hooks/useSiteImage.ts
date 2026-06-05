import { useEffect, useState } from 'react'
import { getSiteSetting } from '../lib/storage'

export function useSiteImage(key: string) {
  const [url, setUrl] = useState('')
  const [position, setPosition] = useState('50% 50%')

  useEffect(() => {
    Promise.all([
      getSiteSetting(key),
      getSiteSetting(`${key}_pos`),
    ]).then(([u, p]) => {
      setUrl(u)
      if (p) setPosition(p)
    })
  }, [key])

  return { url, position }
}
