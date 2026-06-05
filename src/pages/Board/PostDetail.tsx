import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import DOMPurify from 'dompurify'
import { supabase } from '../../lib/supabase'
import type { Post } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowLeft, Pencil, Trash2, Heart, Send } from 'lucide-react'

type Comment = {
  id: string
  author_id: string | null
  author_name: string
  content: string
  created_at: string
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { fetchAll() }, [id])

  async function fetchAll() {
    const [postRes, commentsRes, reactionsRes, myReactionRes] = await Promise.all([
      supabase.from('posts').select('*, profiles(username)').eq('id', id!).single(),
      supabase.from('comments').select('*').eq('post_id', id!).order('created_at'),
      supabase.from('reactions').select('id', { count: 'exact' }).eq('post_id', id!),
      supabase.from('reactions').select('id').eq('post_id', id!).eq('author_id', user?.id ?? '').maybeSingle(),
    ])
    setPost(postRes.data)
    setComments(commentsRes.data ?? [])
    setLikeCount(reactionsRes.count ?? 0)
    setLiked(!!myReactionRes.data)
    setLoading(false)
  }

  async function handleLike() {
    if (!user) return
    if (liked) {
      await supabase.from('reactions').delete().eq('post_id', id!).eq('author_id', user.id)
      setLiked(false)
      setLikeCount(c => c - 1)
    } else {
      await supabase.from('reactions').insert({ post_id: id, author_id: user.id })
      setLiked(true)
      setLikeCount(c => c + 1)
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim() || !profile) return
    setSubmitting(true)
    await supabase.from('comments').insert({
      post_id: id,
      author_id: user!.id,
      author_name: profile.username,
      content: commentText.trim(),
    })
    setCommentText('')
    const { data } = await supabase.from('comments').select('*').eq('post_id', id!).order('created_at')
    setComments(data ?? [])
    setSubmitting(false)
  }

  async function handleDeleteComment(commentId: string) {
    await supabase.from('comments').delete().eq('id', commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  async function handleDeletePost() {
    if (!confirm('이 글을 삭제하시겠습니까?')) return
    await supabase.from('posts').delete().eq('id', id!)
    navigate('/main/board')
  }

  if (loading) return <div className="py-20 text-center opacity-40" style={{ fontFamily: 'var(--font-deco)', fontSize: '1.5rem', color: 'var(--char-blue)' }}>loading...</div>
  if (!post) return <div className="py-20 text-center opacity-40 text-sm" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>게시글을 찾을 수 없습니다</div>

  const safeHTML = DOMPurify.sanitize(post.content, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'width', 'height'],
  })

  return (
    <article className="max-w-2xl mx-auto">
      {/* 상단 */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/main/board" className="flex items-center gap-1 text-xs opacity-40 hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
          <ArrowLeft size={13} /> 목록
        </Link>
        {profile?.is_admin && (
          <div className="flex items-center gap-3">
            <Link to={`/main/board/${id}/edit`} className="flex items-center gap-1 text-xs opacity-50 hover:opacity-80" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
              <Pencil size={12} /> 수정
            </Link>
            <button onClick={handleDeletePost} className="flex items-center gap-1 text-xs opacity-50 hover:opacity-80" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-red)' }}>
              <Trash2 size={12} /> 삭제
            </button>
          </div>
        )}
      </div>

      {/* 제목 */}
      {post.category !== 'general' && (
        <span className="inline-block text-xs px-2 py-0.5 rounded-sm mb-2" style={{ background: 'var(--char-red)', color: 'white', fontFamily: 'var(--font-title)' }}>
          {post.category}
        </span>
      )}
      <h1 className="mb-2" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: 'var(--char-blue)' }}>
        {post.title}
      </h1>
      <p className="text-xs opacity-30 mb-8" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
        {new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      {/* 본문 */}
      <div className="post-content mb-8" dangerouslySetInnerHTML={{ __html: safeHTML }} />

      {/* 좋아요 */}
      <div className="flex items-center gap-2 py-4 border-y mb-8" style={{ borderColor: 'rgba(0,17,60,0.1)' }}>
        <button
          onClick={handleLike}
          className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm transition-all"
          style={{
            border: '1px solid rgba(0,17,60,0.15)',
            background: liked ? 'var(--char-red)' : 'transparent',
            color: liked ? 'white' : 'var(--char-blue)',
            fontFamily: 'var(--font-title)',
          }}
        >
          <Heart size={14} fill={liked ? 'white' : 'none'} />
          {likeCount}
        </button>
      </div>

      {/* 댓글 */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)', letterSpacing: '0.1em' }}>
          COMMENTS · {comments.length}
        </h3>

        {/* 댓글 목록 */}
        {comments.map(c => (
          <div key={c.id} className="flex gap-3 group">
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-red)' }}>{c.author_name}</span>
                <span className="text-xs opacity-30" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
                  {new Date(c.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>{c.content}</p>
            </div>
            {(c.author_id === user?.id || profile?.is_admin) && (
              <button onClick={() => handleDeleteComment(c.id)} className="opacity-0 group-hover:opacity-30 hover:!opacity-70 transition-opacity shrink-0 mt-1" style={{ color: 'var(--char-blue)' }}>
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}

        {/* 댓글 작성 */}
        <form onSubmit={handleComment} className="flex gap-2 mt-2">
          <input
            className="flex-1 px-3 py-2 rounded-sm border text-sm outline-none"
            style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', background: 'rgba(0,17,60,0.02)' }}
            placeholder="댓글을 입력하세요..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            maxLength={300}
          />
          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            className="px-3 py-2 rounded-sm text-white disabled:opacity-40 transition-opacity"
            style={{ background: 'var(--char-blue)' }}
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </article>
  )
}
