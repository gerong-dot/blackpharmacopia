import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '../../lib/supabase'
import type { Post } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PenSquare } from 'lucide-react'

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase
        .from('posts')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false })
      setPosts(data ?? [])
      setLoading(false)
    }
    fetchPosts()
  }, [])

  if (loading) return (
    <div className="py-20 text-center opacity-40" style={{ fontFamily: 'var(--font-deco)', fontSize: '1.5rem' }}>
      loading...
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--char-blue)' }}>
          Board
        </h1>
        {profile?.is_admin && (
          <Link
            to="/main/board/new"
            className="flex items-center gap-2 px-4 py-2 rounded text-sm text-white transition-opacity hover:opacity-80"
            style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}
          >
            <PenSquare size={15} />
            새 글 작성
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <p className="text-center py-20 opacity-40 text-sm" style={{ fontFamily: 'var(--font-sans)' }}>
          아직 게시글이 없습니다
        </p>
      ) : (
        <ul className="flex flex-col gap-0 border-t" style={{ borderColor: 'rgba(0,17,60,0.15)' }}>
          {posts.map(post => (
            <li key={post.id}>
              <Link
                to={`/main/board/${post.id}`}
                className="flex items-baseline justify-between py-4 px-2 border-b gap-4 group hover:bg-black/5 transition-colors rounded"
                style={{ borderColor: 'rgba(0,17,60,0.1)' }}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  {post.category !== 'general' && (
                    <span className="text-xs px-2 py-0.5 rounded w-fit" style={{ background: 'var(--char-red)', color: 'white', fontFamily: 'var(--font-title)' }}>
                      {post.category}
                    </span>
                  )}
                  <span
                    className="truncate text-base font-medium group-hover:underline"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}
                  >
                    {post.title}
                  </span>
                </div>
                <span className="text-xs opacity-40 shrink-0" style={{ fontFamily: 'var(--font-sans)' }}>
                  {new Date(post.created_at).toLocaleDateString('ko-KR')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
