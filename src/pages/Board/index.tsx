import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '../../lib/supabase'
import type { Post } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PenSquare, Search, Lock, X } from 'lucide-react'

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('전체')
  const { profile } = useAuth()

  useEffect(() => { fetchPosts() }, [])

  async function fetchPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false })
    setPosts(data ?? [])
    setLoading(false)
  }

  // 카테고리 목록
  const categories = ['전체', ...Array.from(new Set(posts.map(p => p.category).filter(c => c !== 'general')))]

  // 필터링
  const filtered = posts.filter(p => {
    const matchCat = activeCategory === '전체' || p.category === activeCategory
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (loading) return <div className="py-20 text-center opacity-40" style={{ fontFamily: 'var(--font-deco)', fontSize: '1.5rem', color: 'var(--char-blue)' }}>loading...</div>

  return (
    <div className="max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--char-blue)' }}>Diary</h1>
        {profile?.is_admin && (
          <Link to="/main/board/new" className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs text-white" style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>
            <PenSquare size={13} /> 새 글
          </Link>
        )}
      </div>

      {/* 검색 */}
      <div className="relative mb-3">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" style={{ color: 'var(--char-blue)' }} />
        <input
          className="w-full pl-8 pr-8 py-2 rounded-sm border text-sm outline-none"
          style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', background: 'rgba(0,17,60,0.02)' }}
          placeholder="제목 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-60">
            <X size={13} style={{ color: 'var(--char-blue)' }} />
          </button>
        )}
      </div>

      {/* 카테고리 필터 */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1 rounded-sm text-xs transition-all"
              style={{
                fontFamily: 'var(--font-title)',
                background: activeCategory === cat ? 'var(--char-blue)' : 'transparent',
                color: activeCategory === cat ? 'white' : 'var(--char-blue)',
                border: '1px solid rgba(0,17,60,0.2)',
                opacity: activeCategory === cat ? 1 : 0.5,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* 게시글 목록 */}
      {filtered.length === 0 ? (
        <p className="text-center py-16 opacity-30 text-sm" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
          {search ? '검색 결과가 없습니다' : '아직 게시글이 없습니다'}
        </p>
      ) : (
        <ul className="flex flex-col border-t" style={{ borderColor: 'rgba(0,17,60,0.1)' }}>
          {filtered.map(post => (
            <li key={post.id}>
              <Link
                to={`/main/board/${post.id}`}
                className="flex items-center justify-between py-3 px-1 border-b gap-3 group hover:bg-black/5 rounded transition-colors"
                style={{ borderColor: 'rgba(0,17,60,0.08)' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {(post as Post & { is_private?: boolean }).is_private && (
                    <Lock size={11} style={{ color: 'var(--char-red)', flexShrink: 0 }} />
                  )}
                  {post.category !== 'general' && (
                    <span className="text-xs px-1.5 py-0.5 rounded-sm shrink-0" style={{ background: 'rgba(128,0,1,0.1)', color: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>
                      {post.category}
                    </span>
                  )}
                  <span className="truncate text-sm font-medium group-hover:underline" style={{ fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}>
                    {post.title}
                  </span>
                </div>
                <span className="text-xs opacity-30 shrink-0" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
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
