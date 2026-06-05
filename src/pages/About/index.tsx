import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import { getSiteSetting, setSiteSetting } from '../../lib/storage'
import { useAuth } from '../../contexts/AuthContext'
import { Pencil, Check, X, Eye, Code } from 'lucide-react'
import RichEditor from '../../components/RichEditor'
import { useSiteImage } from '../../hooks/useSiteImage'

export default function NoticePage() {
  const { profile } = useAuth()
  const aboutImage = useSiteImage('about_image')
  const [content, setContent] = useState('')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [previewDraft, setPreviewDraft] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSiteSetting('notice_content').then(v => { setContent(v); setLoading(false) })
  }, [])

  async function handleSave() {
    setSaving(true)
    await setSiteSetting('notice_content', draft)
    setContent(draft)
    setEditing(false)
    setSaving(false)
  }

  function handleEdit() {
    setDraft(content)
    setPreviewDraft(false)
    setEditing(true)
  }

  const safeContent = DOMPurify.sanitize(content)
  const safeDraft = DOMPurify.sanitize(draft)

  if (loading) return (
    <div className="py-10 text-center opacity-30" style={{ fontFamily: 'var(--font-deco)', fontSize: '1.5rem', color: 'var(--char-blue)' }}>
      loading...
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--char-blue)' }}>
            Notice
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-px w-8" style={{ background: 'var(--char-red)' }} />
            <span style={{ color: 'var(--char-red)', fontSize: '0.6rem' }}>✦</span>
            <div className="h-px w-8" style={{ background: 'var(--char-red)', opacity: 0.3 }} />
          </div>
        </div>
        {profile?.is_admin && !editing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs transition-opacity hover:opacity-70"
            style={{ border: '1px solid rgba(0,17,60,0.2)', fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}
          >
            <Pencil size={12} />
            수정
          </button>
        )}
      </div>

      {/* 소개 이미지 */}
      {aboutImage && !editing && (
        <div className="w-full rounded-sm overflow-hidden mb-6 border" style={{ borderColor: 'rgba(0,17,60,0.1)' }}>
          <img src={aboutImage} alt="notice" className="w-full object-cover block" style={{ maxHeight: '300px' }} />
        </div>
      )}

      {/* 편집 모드 */}
      {editing ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewDraft(false)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs ${!previewDraft ? 'text-white' : 'opacity-40 hover:opacity-70'}`}
              style={{ background: !previewDraft ? 'var(--char-blue)' : 'transparent', border: '1px solid rgba(0,17,60,0.2)', fontFamily: 'var(--font-title)' }}
            >
              <Code size={12} /> 편집
            </button>
            <button
              type="button"
              onClick={() => setPreviewDraft(true)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs ${previewDraft ? 'text-white' : 'opacity-40 hover:opacity-70'}`}
              style={{ background: previewDraft ? 'var(--char-blue)' : 'transparent', border: '1px solid rgba(0,17,60,0.2)', fontFamily: 'var(--font-title)' }}
            >
              <Eye size={12} /> 미리보기
            </button>
          </div>

          {previewDraft ? (
            <div className="post-content p-4 rounded-sm border min-h-40" style={{ borderColor: 'rgba(0,17,60,0.1)', background: 'rgba(0,17,60,0.02)' }}
              dangerouslySetInnerHTML={{ __html: safeDraft }} />
          ) : (
            <RichEditor value={draft} onChange={setDraft} />
          )}

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 px-4 py-2 rounded-sm text-xs hover:opacity-70"
              style={{ border: '1px solid rgba(0,17,60,0.2)', fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}
            >
              <X size={12} /> 취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-4 py-2 rounded-sm text-xs text-white disabled:opacity-50"
              style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}
            >
              <Check size={12} /> {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      ) : (
        /* 콘텐츠 표시 */
        content
          ? <div className="post-content" dangerouslySetInnerHTML={{ __html: safeContent }} />
          : <p className="opacity-30 text-sm" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
              {profile?.is_admin ? '수정 버튼을 눌러 공지를 작성해보세요.' : '아직 공지가 없습니다.'}
            </p>
      )}
    </div>
  )
}
