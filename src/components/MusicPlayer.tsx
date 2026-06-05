import { useEffect, useRef, useState } from 'react'
import { Music, Pause, Play, Settings, X } from 'lucide-react'
import { getSiteSetting, setSiteSetting } from '../lib/storage'
import { useAuth } from '../contexts/AuthContext'

export default function MusicPlayer() {
  const [url, setUrl] = useState('')
  const [playing, setPlaying] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [inputUrl, setInputUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { profile } = useAuth()

  useEffect(() => {
    getSiteSetting('music_url').then(v => { setUrl(v); setInputUrl(v) })
  }, [])

  useEffect(() => {
    if (!audioRef.current) return
    if (playing) audioRef.current.play().catch(() => setPlaying(false))
    else audioRef.current.pause()
  }, [playing])

  async function handleSaveMusic() {
    setSaving(true)
    await setSiteSetting('music_url', inputUrl)
    setUrl(inputUrl)
    setShowSettings(false)
    setSaving(false)
  }

  // YouTube URL이면 오디오만 재생 불가 — iframe 방식 사용
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be')

  function getYoutubeId(u: string) {
    const m = u.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
    return m?.[1] ?? ''
  }

  if (!url && !profile?.is_admin) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* 설정 패널 (관리자만) */}
      {showSettings && profile?.is_admin && (
        <div
          className="flex flex-col gap-2 p-4 rounded-lg shadow-lg w-72"
          style={{ background: 'var(--char-blue)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-white text-xs tracking-widest" style={{ fontFamily: 'var(--font-title)' }}>음악 설정</span>
            <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white"><X size={14} /></button>
          </div>
          <input
            className="w-full px-3 py-2 rounded text-sm outline-none bg-white/10 text-white placeholder-white/30 border border-white/10 focus:border-white/30"
            placeholder="YouTube URL 또는 음악 파일 URL"
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            style={{ fontFamily: 'var(--font-sans)' }}
          />
          <p className="text-white/30 text-xs" style={{ fontFamily: 'var(--font-sans)' }}>
            YouTube, mp3, ogg 등 지원
          </p>
          <button
            onClick={handleSaveMusic}
            disabled={saving}
            className="py-1.5 rounded text-xs text-white tracking-widest disabled:opacity-50"
            style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      )}

      {/* YouTube iframe (숨김) */}
      {isYoutube && url && (
        <iframe
          src={`https://www.youtube.com/embed/${getYoutubeId(url)}?autoplay=${playing ? 1 : 0}&loop=1&playlist=${getYoutubeId(url)}&controls=0&enablejsapi=1`}
          className="hidden"
          allow="autoplay"
          title="music"
        />
      )}

      {/* 일반 오디오 */}
      {!isYoutube && url && (
        <audio ref={audioRef} src={url} loop />
      )}

      {/* 플레이어 버튼 */}
      <div className="flex items-center gap-2">
        {profile?.is_admin && (
          <button
            onClick={() => setShowSettings(v => !v)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ background: 'rgba(0,17,60,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
            title="음악 설정"
          >
            <Settings size={13} className="text-white/60" />
          </button>
        )}
        {url && (
          <button
            onClick={() => setPlaying(v => !v)}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
            style={{ background: 'var(--char-blue)', border: '1px solid rgba(255,255,255,0.15)' }}
            title={playing ? '일시정지' : '재생'}
          >
            {playing
              ? <Pause size={16} className="text-white" />
              : <Play size={16} className="text-white ml-0.5" />
            }
          </button>
        )}
        {!url && profile?.is_admin && (
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-xs text-white/60 hover:text-white transition-colors shadow-lg"
            style={{ background: 'var(--char-blue)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-title)' }}
          >
            <Music size={13} />
            음악 추가
          </button>
        )}
      </div>
    </div>
  )
}
