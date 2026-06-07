import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { supabase } from '../../lib/supabase'
import type { Post } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { getSiteSetting, setSiteSetting } from '../../lib/storage'
import { getCached, setCached } from '../../lib/queryCache'
import { PenSquare, Search, Lock, X, Plus, ChevronRight, LayoutList, LayoutGrid } from 'lucide-react'

type Board = { id: string; name: string; slug: string; description: string }

const DEFAULT_BOARDS: Board[] = []

async function loadBoards(): Promise<Board[]> {
  const raw = await getSiteSetting('boards_json')
  if (!raw) return DEFAULT_BOARDS
  try { return JSON.parse(raw) } catch { return DEFAULT_BOARDS }
}

async function saveBoards(boards: Board[]) {
  await setSiteSetting('boards_json', JSON.stringify(boards))
}

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'list' | 'board'>('board')
  const [newBoardName, setNewBoardName] = useState('')
  const [newBoardDesc, setNewBoardDesc] = useState('')
  const [addingBoard, setAddingBoard] = useState(false)
  const { profile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeSlug = searchParams.get('b') ?? ''

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const cached = getCached<Post[]>('posts')
    const [postsRes, loadedBoards] = await Promise.all([
      cached ? Promise.resolve({ data: cached }) : supabase.from('posts').select('*').order('created_at', { ascending: false }),
      loadBoards(),
    ])
    if (!cached && postsRes.data) setCached('posts', postsRes.data)
    setPosts(postsRes.data ?? [])
    setBoards(loadedBoards)
    setLoading(false)
  }

  async function handleAddBoard(e: React.FormEvent) {
    e.preventDefault()
    if (!newBoardName.trim()) return
    const name = newBoardName.trim()
    const slug = `board-${Date.now()}`
    const newBoard: Board = { id: slug, name, slug, description: newBoardDesc.trim() }
    const next = [...boards, newBoard]
    setBoards(next)
    setNewBoardName('')
    setNewBoardDesc('')
    setAddingBoard(false)
    await saveBoards(next)
  }

  async function handleDeleteBoard(slug: string) {
    if (!confirm('게시판을 삭제하시겠습니까?')) return
    const next = boards.filter(b => b.slug !== slug)
    setBoards(next)
    await saveBoards(next)
    if (activeSlug === slug) setSearchParams({})
  }

  const postsByBoard = (slug: string) =>
    posts.filter(p => {
      const ps = (p as Post & { board_slug?: string }).board_slug
      if (slug === 'general') return !ps || ps === 'general'
      return ps === slug
    })

  const filtered = postsByBoard(activeSlug || '').filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  )

  const allFiltered = !activeSlug
    ? posts.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()))
    : filtered

  if (loading) return <div className="py-20 text-center opacity-40" style={{ fontFamily: 'var(--font-deco)', fontSize: '1.5rem', color: 'var(--char-blue)' }}>loading...</div>

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--char-blue)' }}>Diary</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setView(v => v === 'list' ? 'board' : 'list')} className="p-1.5 rounded-sm opacity-40 hover:opacity-70" style={{ color: 'var(--char-blue)' }}>
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
          {boards.map(board => (
            <div key={board.id}
              className="group flex items-center justify-between px-4 py-3 rounded-sm border cursor-pointer hover:bg-black/5 transition-colors"
              style={{ borderColor: 'rgba(0,17,60,0.12)', background: 'rgba(0,17,60,0.02)' }}
              onClick={() => setSearchParams({ b: board.slug })}
            >
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full" style={{ background: 'var(--char-red)', opacity: 0.5 }} />
                <div>
                  <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}>{board.name}</p>
                  {board.description && <p className="text-xs opacity-40" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>{board.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs opacity-30" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
                  {postsByBoard(board.slug).length}개
                </span>
                {profile?.is_admin && (
                  <button onClick={e => { e.stopPropagation(); handleDeleteBoard(board.slug) }}
                    className="opacity-0 group-hover:opacity-30 hover:!opacity-70 transition-opacity text-xs"
                    style={{ color: 'var(--char-red)' }}>✕</button>
                )}
                <ChevronRight size={14} className="opacity-20" style={{ color: 'var(--char-blue)' }} />
              </div>
            </div>
          ))}

          {/* 게시판 추가 */}
          {profile?.is_admin && (
            addingBoard ? (
              <form onSubmit={handleAddBoard} className="flex flex-col gap-2 p-3 rounded-sm border" style={{ borderColor: 'rgba(0,17,60,0.12)', borderStyle: 'dashed' }}>
                <input
                  className="w-full px-3 py-1.5 rounded-sm border text-sm outline-none"
                  style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}
                  placeholder="게시판 이름"
                  value={newBoardName}
                  onChange={e => setNewBoardName(e.target.value)}
                  autoFocus
                />
                <input
                  className="w-full px-3 py-1.5 rounded-sm border text-sm outline-none"
                  style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}
                  placeholder="설명 (선택)"
                  value={newBoardDesc}
                  onChange={e => setNewBoardDesc(e.target.value)}
                />
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-1.5 rounded-sm text-xs text-white" style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>추가</button>
                  <button type="button" onClick={() => setAddingBoard(false)} className="px-4 py-1.5 rounded-sm text-xs opacity-50" style={{ border: '1px solid rgba(0,17,60,0.15)', fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>취소</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setAddingBoard(true)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-sm border text-xs opacity-40 hover:opacity-70 transition-opacity"
                style={{ borderColor: 'rgba(0,17,60,0.1)', borderStyle: 'dashed', fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
                <Plus size={12} /> 게시판 추가
              </button>
            )
          )}

          {/* 최근 글 */}
          {posts.length > 0 && (
            <div className="mt-2">
              <p className="text-xs opacity-30 mb-2 tracking-widest" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>RECENT</p>
              {posts.slice(0, 5).map(post => (
                <Link key={post.id} to={`/main/board/${post.id}`}
                  className="flex items-center justify-between py-2 border-b gap-2 hover:opacity-70 transition-opacity"
                  style={{ borderColor: 'rgba(0,17,60,0.07)' }}>
                  <span className="truncate text-xs" style={{ fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}>{post.title}</span>
                  <span className="text-xs opacity-30 shrink-0" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
                    {new Date(post.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 글 목록 */
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {activeSlug && (
              <button onClick={() => setSearchParams({})} className="text-xs opacity-50 hover:opacity-80 transition-opacity" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
                ← 목록
              </button>
            )}
            {activeSlug && <span className="text-xs opacity-20">/</span>}
            {activeSlug && (
              <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
                {boards.find(b => b.slug === activeSlug)?.name ?? activeSlug}
              </span>
            )}
          </div>

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

          {allFiltered.length === 0 ? (
            <p className="text-center py-12 opacity-30 text-sm" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
              {search ? '검색 결과가 없습니다' : '아직 게시글이 없습니다'}
            </p>
          ) : (
            <ul className="flex flex-col border-t" style={{ borderColor: 'rgba(0,17,60,0.1)' }}>
              {allFiltered.map(post => (
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
