import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import DOMPurify from 'dompurify'
import { supabase } from '../../lib/supabase'
import type { Post } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'

export default function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchPost() {
      const { data } = await supabase
        .from('posts')
        .select('*, profiles(username)')
        .eq('id', id)
        .single()
      setPost(data)
      setLoading(false)
    }
    fetchPost()
  }, [id])

  async function handleDelete() {
    if (!confirm('이 글을 삭제하시겠습니까?')) return
    await supabase.from('posts').delete().eq('id', id)
    navigate('/main/board')
  }

  if (loading) return (
    <div className="py-20 text-center opacity-40" style={{ fontFamily: 'var(--font-deco)', fontSize: '1.5rem' }}>
      loading...
    </div>
  )

  if (!post) return (
    <div className="py-20 text-center opacity-40 text-sm" style={{ fontFamily: 'var(--font-sans)' }}>
      게시글을 찾을 수 없습니다
    </div>
  )

  const safeHTML = DOMPurify.sanitize(post.content, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'width', 'height'],
  })

  return (
    <article className="max-w-3xl mx-auto py-8">
      {/* 상단 */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/main/board"
          className="flex items-center gap-1 text-sm opacity-50 hover:opacity-80 transition-opacity"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}
        >
          <ArrowLeft size={14} />
          목록
        </Link>
        {profile?.is_admin && (
          <div className="flex items-center gap-3">
            <Link
              to={`/main/board/${id}/edit`}
              className="flex items-center gap-1 text-xs opacity-60 hover:opacity-90 transition-opacity"
              style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}
            >
              <Pencil size={13} />
              수정
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-xs opacity-60 hover:opacity-90 transition-opacity"
              style={{ fontFamily: 'var(--font-title)', color: 'var(--char-red)' }}
            >
              <Trash2 size={13} />
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 제목 */}
      {post.category !== 'general' && (
        <span className="inline-block text-xs px-2 py-0.5 rounded mb-3" style={{ background: 'var(--char-red)', color: 'white', fontFamily: 'var(--font-title)' }}>
          {post.category}
        </span>
      )}
      <h1
        className="mb-3"
        style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', color: 'var(--char-blue)' }}
      >
        {post.title}
      </h1>
      <p className="text-xs opacity-40 mb-8" style={{ fontFamily: 'var(--font-sans)' }}>
        {new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      {/* 본문 */}
      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: safeHTML }}
      />
    </article>
  )
}
