import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import DOMPurify from 'dompurify'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Eye, Code, PenLine } from 'lucide-react'
import RichEditor from '../../components/RichEditor'

type EditorMode = 'rich' | 'html' | 'preview'

export default function PostEditor() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [mode, setMode] = useState<EditorMode>('rich')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    async function load() {
      const { data } = await supabase.from('posts').select('*').eq('id', id).single()
      if (data) {
        setTitle(data.title)
        setContent(data.content)
        setCategory(data.category)
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
        .update({ title, content, category, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) { setError(error.message); setSaving(false); return }
      navigate(`/main/board/${id}`)
    } else {
      const { data, error } = await supabase
        .from('posts')
        .insert({ title, content, category, author_id: profile?.id })
        .select()
        .single()
      if (error) { setError(error.message); setSaving(false); return }
      navigate(`/main/board/${data.id}`)
    }
  }

  const safePreview = DOMPurify.sanitize(content, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'width', 'height'],
  })

  const inputBase = `w-full px-4 py-2 rounded border text-sm outline-none transition-colors bg-white focus:border-black/30`

  const tabBtn = (m: EditorMode, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${mode === m ? 'text-white' : 'opacity-50 hover:opacity-80'}`}
      style={{
        background: mode === m ? 'var(--char-blue)' : 'transparent',
        fontFamily: 'var(--font-title)',
        border: '1px solid rgba(0,17,60,0.2)',
      }}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1
        className="mb-6"
        style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--char-blue)' }}
      >
        {isEdit ? '글 수정' : '새 글 작성'}
      </h1>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {/* 제목 + 카테고리 */}
        <div className="flex gap-3">
          <input
            className={inputBase + ' flex-1'}
            style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}
            type="text"
            placeholder="제목"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input
            className={inputBase + ' w-36'}
            style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}
            type="text"
            placeholder="카테고리"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
        </div>

        {/* 탭 */}
        <div className="flex gap-2 items-center flex-wrap">
          {tabBtn('rich', '일반 편집', <PenLine size={13} />)}
          {tabBtn('html', 'HTML 직접 입력', <Code size={13} />)}
          {tabBtn('preview', '미리보기', <Eye size={13} />)}
        </div>

        {/* 일반 편집 */}
        {mode === 'rich' && (
          <RichEditor value={content} onChange={setContent} />
        )}

        {/* HTML 직접 입력 */}
        {mode === 'html' && (
          <textarea
            rows={24}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`<h2>제목</h2>\n<p>내용을 입력하세요...</p>\n<img src="..." alt="이미지" />`}
            className="w-full px-4 py-3 rounded border outline-none bg-white"
            style={{
              borderColor: 'rgba(0,17,60,0.15)',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              color: 'var(--char-blue)',
              resize: 'vertical',
              lineHeight: 1.6,
            }}
          />
        )}

        {/* 미리보기 */}
        {mode === 'preview' && (
          <div
            className="post-content min-h-64 p-6 rounded border bg-white"
            style={{ borderColor: 'rgba(0,17,60,0.1)', color: 'var(--char-blue)' }}
            dangerouslySetInnerHTML={{ __html: safePreview }}
          />
        )}

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
