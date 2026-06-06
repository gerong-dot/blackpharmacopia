import { useState } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { getSiteSetting } from '../../lib/storage'

type Board = { id: string; name: string; slug: string }

export default function HtmlUpload() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [boardSlug, setBoardSlug] = useState('')
  const [boards, setBoards] = useState<Board[]>([])
  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useState(() => {
    getSiteSetting('boards_json').then(raw => {
      if (raw) {
        try {
          const b = JSON.parse(raw)
          setBoards(b)
          if (b.length > 0) setBoardSlug(b[0].slug)
        } catch {}
      }
    })
  })

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => setContent(reader.result as string)
    reader.readAsText(file, 'utf-8')
    e.target.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content) { setError('제목과 파일을 입력해주세요.'); return }
    setSaving(true); setError('')
    const { data, error } = await supabase
      .from('posts')
      .insert({ title, content, category: 'general', board_slug: boardSlug, is_private: false, author_id: profile?.id })
      .select()
      .single()
    if (error) { setError(error.message); setSaving(false); return }
    navigate(`/main/board/${data.id}`)
  }

  const inputBase = 'w-full px-4 py-2 rounded border text-sm outline-none bg-white'

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--char-blue)' }}>
        HTML 파일 업로드
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {boards.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs opacity-40" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>BOARD</p>
            <div className="flex gap-2 flex-wrap">
              {boards.map(b => (
                <button key={b.slug} type="button" onClick={() => setBoardSlug(b.slug)}
                  className="px-3 py-1.5 rounded-sm text-xs transition-all"
                  style={{ fontFamily: 'var(--font-title)', background: boardSlug === b.slug ? 'var(--char-blue)' : 'transparent', color: boardSlug === b.slug ? 'white' : 'var(--char-blue)', border: '1px solid rgba(0,17,60,0.2)', opacity: boardSlug === b.slug ? 1 : 0.5 }}>
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <input
          className={inputBase}
          style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}
          placeholder="제목"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <label className="flex flex-col gap-1.5 cursor-pointer">
          <p className="text-xs opacity-40" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>HTML 파일</p>
          <div className="flex items-center gap-3 px-4 py-3 rounded border" style={{ borderColor: 'rgba(0,17,60,0.15)', background: 'rgba(0,17,60,0.02)' }}>
            <span className="text-xs px-3 py-1.5 rounded-sm text-white" style={{ background: 'var(--char-blue)', fontFamily: 'var(--font-title)' }}>파일 선택</span>
            <span className="text-sm opacity-50" style={{ color: 'var(--char-blue)', fontFamily: 'var(--font-sans)' }}>
              {fileName || '선택된 파일 없음'}
            </span>
          </div>
          <input type="file" accept=".html" className="hidden" onChange={handleFile} />
        </label>

        {content && (
          <p className="text-xs opacity-50" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
            ✓ {content.length.toLocaleString()}자 로드됨
          </p>
        )}

        {error && <p className="text-red-600 text-xs">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)}
            className="px-5 py-2 rounded text-sm opacity-60 hover:opacity-100"
            style={{ border: '1px solid rgba(0,17,60,0.2)', color: 'var(--char-blue)', fontFamily: 'var(--font-title)' }}>
            취소
          </button>
          <button type="submit" disabled={saving || !content}
            className="px-6 py-2 rounded text-sm text-white disabled:opacity-40"
            style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>
            {saving ? '업로드 중...' : '게시'}
          </button>
        </div>
      </form>
    </div>
  )
}
