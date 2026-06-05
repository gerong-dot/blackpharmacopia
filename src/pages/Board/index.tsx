import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { supabase } from '../../lib/supabase'
import type { Post } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PenSquare, Search, Lock, X, Plus, ChevronRight, LayoutList, LayoutGrid } from 'lucide-react'

type Board = { id: string; name: string; slug: string; description: string; position: number }

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'list' | 'board'>('board')
  const [newBoardName, setNewBoardName] = useState('')
  const [addingBoard, setAddingBoard] = useState(false)
  const { profile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeSlug = searchParams.get('b') ?? ''

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [postsRes, boardsRes] = await Promise.all([
      supabase.from('posts').select('*').order('created_at', { ascending: false }),
      supabase.from('boards').select('*').order('position'),
    ])
    setPosts(postsRes.data ?? [])
    setBoards(boardsRes.data ?? [])
    setLoading(false)
  }

  async function handleAddBoard(e: React.FormEvent) {
    e.preventDefault()
    if (!newBoardName.trim()) return
    const slug = newBoardName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `board-${Date.now()}`
    await supabase.from('boards').insert({ name: newBoardName.trim(), slug, position: boards.length })
    setNewBoardName('')
    setAddingBoard(false)
    fetchAll()
  }

  async function handleDeleteBoard(slug: string) {
    if (!confirm('게시판을 삭제하시겠습니까? (글은 유지됩니다)')) return
    await supabase.from('boards').delete().eq('slug', slug)
    if (activeSlug === slug) setSearchParams({})
    fetchAll()
  }

  const filtered = posts.filter(p => {
    const matchBoard = !activeSlug || (p as Post & { board_slug?: string }).board_slug === activeSlug || (activeSlug === 'general' && !(p as Post & { board_slug?: string }).board_slug)
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase())
    return matchBoard && matchSearch
  })

  const postCountBySlug = (slug: string) =>
    posts.filter(p => (p as Post & { board_slug?: string }).board_slug === slug || (!((p as Post & { board_slug?: string }).board_slug) && slug === 'general')).length

  if (loading) return <div className="py-20 text-center opacity-40" style={{ fontFamily: 'var(--font-deco)', fontSize: '1.5rem', color: 'var(--char-blue)' }}>loading...</div>

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--char-blue)' }}>Diary</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setView(v => v === 'list' ? 'board' : 'list')} className="p-1.5 rounded-sm opacity-40 hover:opacity-70 transition-opacity" style={{ color: 'var(--char-blue)' }}>
            {view === 'board' ? <LayoutList size={16} /> : <LayoutGrid size={16} />}
          </button>
          {profile?.is_admin && (
            <Link to="/main/board/new" className="flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs text-white" style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>
              <PenSquare size={12} /> 새 글
            </Link>
          )}
        </div>
      </div>

      {/* 게시판 목록 뷰 */}
      {view === 'board' && !activeSlug ? (
        <div className="flex flex-col gap-2">
          {/* 게시판 카드들 */}
          {boards.map(board => (
            <div key={board.id} className="group flex items-center justify-between px-4 py-3 rounded-sm border hover:border-opacity-30 transition-all cursor-pointer"
              style={{ borderColor: 'rgba(0,17,60,0.12)', background: 'rgba(0,17,60,0.02)' }}
              onClick={() => setSearchParams({ b: board.slug })}
            >
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full" style={{ background: 'var(--char-red)', opacity: 0.6 }} />
                <div>
                  <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}>{board.name}</p>
                  {board.description && <p className="text-xs opacity-40" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>{board.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs opacity-30" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>{postCountBySlug(board.slug)}개</span>
                {profile?.is_admin && (
                  <button onClick={e => { e.stopPropagation(); handleDeleteBoard(board.slug) }} className="opacity-0 group-hover:opacity-30 hover:!opacity-70 transition-opacity text-xs" style={{ color: 'var(--char-red)' }}>✕</button>
                )}
                <ChevronRight size={14} className="opacity-20" style={{ color: 'var(--char-blue)' }} />
              </div>
            </div>
          ))}

          {/* 게시판 추가 (관리자) */}
          {profile?.is_admin && (
            addingBoard ? (
              <form onSubmit={handleAddBoard} className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2 rounded-sm border text-sm outline-none"
                  style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}
                  placeholder="게시판 이름"
                  value={newBoardName}
                  onChange={e => setNewBoardName(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="px-3 py-2 rounded-sm text-xs text-white" style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>추가</button>
                <button type="button" onClick={() => setAddingBoard(false)} className="px-3 py-2 rounded-sm text-xs opacity-50" style={{ border: '1px solid rgba(0,17,60,0.15)', fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>취소</button>
              </form>
            ) : (
              <button onClick={() => setAddingBoard(true)} className="flex items-center gap-1.5 px-4 py-3 rounded-sm border text-xs opacity-40 hover:opacity-70 transition-opacity"
                style={{ borderColor: 'rgba(0,17,60,0.1)', borderStyle: 'dashed', fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
                <Plus size={12} /> 게시판 추가
              </button>
            )
          )}

          {/* 전체 최신글 미리보기 */}
          {posts.length > 0 && (
            <div className="mt-2">
              <p className="text-xs opacity-30 mb-2 tracking-widest" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>RECENT</p>
              {posts.slice(0, 5).map(post => (
                <Link key={post.id} to={`/main/board/${post.id}`} className="flex items-center justify-between py-2 border-b gap-2 hover:opacity-70 transition-opacity" style={{ borderColor: 'rgba(0,17,60,0.08)' }}>
                  <span className="truncate text-xs" style={{ fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}>{post.title}</span>
                  <span className="text-xs opacity-30 shrink-0" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>{new Date(post.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 게시글 목록 뷰 */
        <div className="flex flex-col gap-3">
          {/* 브레드크럼 + 검색 */}
          <div className="flex items-center gap-2">
            {activeSlug && (
              <button onClick={() => setSearchParams({})} className="flex items-center gap-1 text-xs opacity-50 hover:opacity-80 transition-opacity" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
                ← 게시판 목록
              </button>
            )}
            {activeSlug && <span className="text-xs opacity-20 mx-1" style={{ color: 'var(--char-blue)' }}>/</span>}
            {activeSlug && (
              <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
                {boards.find(b => b.slug === activeSlug)?.name ?? activeSlug}
              </span>
            )}
          </div>

          {/* 검색 */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" style={{ color: 'var(--char-blue)' }} />
            <input
              className="w-full pl-8 pr-8 py-2 rounded-sm border text-sm outline-none"
              style={{ borderColor: 'rgba(0,17,60,0.12)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', background: 'rgba(0,17,60,0.02)' }}
              placeholder="제목 검색..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-60"><X size={13} style={{ color: 'var(--char-blue)' }} /></button>}
          </div>

          {/* 글 목록 */}
          {filtered.length === 0 ? (
            <p className="text-center py-12 opacity-30 text-sm" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
              {search ? '검색 결과가 없습니다' : '아직 게시글이 없습니다'}
            </p>
          ) : (
            <ul className="flex flex-col border-t" style={{ borderColor: 'rgba(0,17,60,0.1)' }}>
              {filtered.map(post => (
                <li key={post.id}>
                  <Link to={`/main/board/${post.id}`}
                    className="flex items-center justify-between py-3 px-1 border-b gap-3 hover:bg-black/5 rounded transition-colors"
                    style={{ borderColor: 'rgba(0,17,60,0.07)' }}>
                    <div className="flex items-center gap-2 min-w-0">
                      {(post as Post & { is_private?: boolean }).is_private && <Lock size={11} style={{ color: 'var(--char-red)', flexShrink: 0 }} />}
                      {post.category !== 'general' && (
                        <span className="text-xs px-1.5 py-0.5 rounded-sm shrink-0" style={{ background: 'rgba(128,0,1,0.08)', color: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>{post.category}</span>
                      )}
                      <span className="truncate text-sm" style={{ fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}>{post.title}</span>
                    </div>
                    <span className="text-xs opacity-30 shrink-0" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
                      {new Date(post.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
