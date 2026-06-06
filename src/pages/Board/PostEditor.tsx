import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import DOMPurify from 'dompurify'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { getSiteSetting } from '../../lib/storage'
import RichEditor from '../../components/RichEditor'

type Board = { id: string; name: string; slug: string; description: string }

export default function PostEditor() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [boardSlug, setBoardSlug] = useState('')
  const [boards, setBoards] = useState<Board[]>([])
  const [isPrivate, setIsPrivate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getSiteSetting('boards_json').then(raw => {
      if (raw) {
        try {
          const b: Board[] = JSON.parse(raw)
          setBoards(b)
          if (!isEdit && b.length > 0) setBoardSlug(b[0].slug)
        } catch {}
      }
    })
    if (!isEdit) return
    async function load() {
      const { data } = await supabase.from('posts').select('*').eq('id', id).single()
      if (data) {
        setTitle(data.title)
        setContent(data.content)
        setIsPrivate(data.is_private ?? false)
        setBoardSlug(data.board_slug ?? '')
      }
    }
    load()
  }, [id, isEdit])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.')
      return
    }
    setSaving(true)
    setError('')

    if (isEdit) {
      const { error } = await supabase
        .from('posts')
        .update({ title, content, category: 'general', board_slug: boardSlug, is_private: isPrivate, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) { setError(error.message); setSaving(false); return }
      navigate(`/main/board/${id}`)
    } else {
      const { data, error } = await supabase
        .from('posts')
        .insert({ title, content, category: 'general', board_slug: boardSlug, is_private: isPrivate, author_id: profile?.id })
        .select()
        .single()
      if (error) { setError(error.message); setSaving(false); return }
      navigate(`/main/board/${data.id}`)
    }
  }

  const inputBase = `w-full px-4 py-2 rounded border text-sm outline-none transition-colors bg-white focus:border-black/30`
  const label = (text: string) => (
    <p className="text-xs opacity-40" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)', letterSpacing: '0.1em' }}>{text}</p>
  )

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--char-blue)' }}>
        {isEdit ? '글 수정' : '새 글 작성'}
      </h1>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* 게시판 선택 */}
        {boards.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {label('BOARD')}
            <div className="flex gap-2 flex-wrap">
              {boards.map(b => (
                <button key={b.slug} type="button" onClick={() => setBoardSlug(b.slug)}
                  className="px-3 py-1.5 rounded-sm text-xs transition-all"
                  style={{
                    fontFamily: 'var(--font-title)',
                    background: boardSlug === b.slug ? 'var(--char-blue)' : 'transparent',
                    color: boardSlug === b.slug ? 'white' : 'var(--char-blue)',
                    border: '1px solid rgba(0,17,60,0.2)',
                    opacity: boardSlug === b.slug ? 1 : 0.5,
                  }}>
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 제목 */}
        <div className="flex flex-col gap-1.5">
          {label('TITLE')}
          <input
            className={inputBase}
            style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onCompositionEnd={e => setTitle(e.currentTarget.value.normalize('NFC'))}
          />
        </div>

        {/* 비공개 토글 */}
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <div
            onClick={() => setIsPrivate(v => !v)}
            className="w-10 h-5 rounded-full transition-colors relative"
            style={{ background: isPrivate ? 'var(--char-red)' : 'rgba(0,17,60,0.15)' }}
          >
            <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: isPrivate ? '22px' : '2px' }} />
          </div>
          <span className="text-xs" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)', opacity: 0.7 }}>
            관리자만 열람 가능
          </span>
        </label>

        {/* 본문 */}
        <div className="flex flex-col gap-1.5">
          {label('CONTENT')}
          <RichEditor value={content} onChange={setContent} />
        </div>

        {error && <p className="text-red-600 text-xs">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2 rounded text-sm transition-opacity hover:opacity-70"
            style={{ fontFamily: 'var(--font-title)', border: '1px solid rgba(0,17,60,0.2)', color: 'var(--char-blue)' }}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded text-sm text-white transition-opacity disabled:opacity-50"
            style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}
          >
            {saving ? '저장 중...' : isEdit ? '수정 완료' : '게시'}
          </button>
        </div>
      </form>
    </div>
  )
}
