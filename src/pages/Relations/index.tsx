import { useEffect, useRef, useState } from 'react'
import { getSiteSetting, setSiteSetting } from '../../lib/storage'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, X, Pencil, Check } from 'lucide-react'

type RelChar = { id: string; name: string; subtitle?: string; x: number; y: number; color?: string }
type RelLink = { id: string; from: string; to: string; label: string; color?: string; style?: 'solid' | 'dashed' }

const COLORS = ['#800001', '#00113c', '#7c5c3a', '#3a6040', '#4a3a7c', '#7c3a6a']

export default function RelationsPage() {
  const [chars, setChars]   = useState<RelChar[]>([])
  const [links, setLinks]   = useState<RelLink[]>([])
  const [loading, setLoading] = useState(true)
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 500 })
  const canvasRef = useRef<HTMLDivElement>(null)

  // 편집 모드
  const [editMode, setEditMode] = useState(false)
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null)
  const [editingChar, setEditingChar] = useState<RelChar | null>(null)
  const [addingLink, setAddingLink] = useState(false)
  const [linkFrom, setLinkFrom] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [linkTo, setLinkTo] = useState('')
  const [linkColor, setLinkColor] = useState('#800001')
  const [linkStyle, setLinkStyle] = useState<'solid' | 'dashed'>('solid')

  const { profile } = useAuth()

  useEffect(() => {
    Promise.all([getSiteSetting('rel_chars'), getSiteSetting('rel_links')]).then(([c, l]) => {
      if (c) try { setChars(JSON.parse(c)) } catch {}
      if (l) try { setLinks(JSON.parse(l)) } catch {}
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    function update() {
      if (canvasRef.current) {
        const w = canvasRef.current.offsetWidth
        setCanvasSize({ w, h: Math.max(400, Math.round(w * 0.6)) })
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  async function saveChars(next: RelChar[]) { setChars(next); await setSiteSetting('rel_chars', JSON.stringify(next)) }
  async function saveLinks(next: RelLink[]) { setLinks(next); await setSiteSetting('rel_links', JSON.stringify(next)) }

  function handleAddChar() {
    const newChar: RelChar = {
      id: `c-${Date.now()}`, name: '새 캐릭터', subtitle: '',
      x: 40 + Math.random() * 20, y: 40 + Math.random() * 20,
      color: COLORS[chars.length % COLORS.length],
    }
    saveChars([...chars, newChar])
    setEditingChar(newChar)
  }

  async function handleSaveChar(e: React.FormEvent) {
    e.preventDefault()
    if (!editingChar) return
    await saveChars(chars.map(c => c.id === editingChar.id ? editingChar : c))
    setEditingChar(null)
  }

  async function handleDeleteChar(id: string) {
    await saveChars(chars.filter(c => c.id !== id))
    await saveLinks(links.filter(l => l.from !== id && l.to !== id))
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault()
    if (!linkFrom || !linkTo || linkFrom === linkTo) return
    const newLink: RelLink = { id: `l-${Date.now()}`, from: linkFrom, to: linkTo, label: linkLabel, color: linkColor, style: linkStyle }
    await saveLinks([...links, newLink])
    setLinkLabel(''); setLinkFrom(''); setLinkTo('')
    setAddingLink(false)
  }

  async function handleDeleteLink(id: string) { await saveLinks(links.filter(l => l.id !== id)) }

  // 드래그 핸들러
  function onMouseDown(e: React.MouseEvent, id: string) {
    if (!editMode) return
    e.preventDefault()
    const rect = canvasRef.current!.getBoundingClientRect()
    setDragging({ id, ox: e.clientX - rect.left, oy: e.clientY - rect.top })
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100))
    setChars(prev => prev.map(c => c.id === dragging.id ? { ...c, x, y } : c))
  }

  async function onMouseUp() {
    if (dragging) { await saveChars(chars); setDragging(null) }
  }

  // 두 캐릭터의 픽셀 좌표 계산
  function getPos(char: RelChar) {
    return { x: (char.x / 100) * canvasSize.w, y: (char.y / 100) * canvasSize.h }
  }

  // 선 중간 좌표 (라벨용)
  function midPoint(a: RelChar, b: RelChar) {
    const pa = getPos(a), pb = getPos(b)
    return { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 }
  }

  if (loading) return <div className="py-20 text-center opacity-30" style={{ fontFamily: 'var(--font-deco)', fontSize: '1.5rem', color: 'var(--char-blue)' }}>loading...</div>

  return (
    <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--char-blue)' }}>Relations</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-px w-8" style={{ background: 'var(--char-red)' }} />
            <span style={{ color: 'var(--char-red)', fontSize: '0.6rem' }}>✦</span>
            <div className="h-px w-8" style={{ background: 'var(--char-red)', opacity: 0.3 }} />
          </div>
        </div>
        {profile?.is_admin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditMode(v => !v)}
              className="px-3 py-1.5 text-xs rounded-sm transition-all"
              style={{
                fontFamily: 'var(--font-title)',
                background: editMode ? 'var(--char-blue)' : 'transparent',
                color: editMode ? 'white' : 'var(--char-blue)',
                border: '1px solid rgba(0,17,60,0.2)',
              }}
            >
              {editMode ? '편집 완료' : '편집'}
            </button>
            {editMode && (
              <>
                <button onClick={handleAddChar} className="flex items-center gap-1 px-3 py-1.5 text-xs text-white rounded-sm" style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>
                  <Plus size={11} /> 캐릭터
                </button>
                <button onClick={() => setAddingLink(true)} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-sm" style={{ border: '1px solid rgba(0,17,60,0.2)', fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
                  <Plus size={11} /> 관계
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 캔버스 */}
      <div
        ref={canvasRef}
        className="relative w-full rounded-sm overflow-hidden border select-none"
        style={{
          height: canvasSize.h,
          background: 'linear-gradient(135deg, rgba(0,17,60,0.04) 0%, rgba(128,0,1,0.02) 100%)',
          borderColor: 'rgba(0,17,60,0.12)',
          cursor: editMode ? 'default' : 'default',
        }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* 격자 배경 */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,17,60,0.04)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* 관계선 SVG */}
        <svg className="absolute inset-0" width={canvasSize.w} height={canvasSize.h} style={{ pointerEvents: 'none' }}>
          {links.map(link => {
            const from = chars.find(c => c.id === link.from)
            const to   = chars.find(c => c.id === link.to)
            if (!from || !to) return null
            const pa = getPos(from), pb = getPos(to)
            const mid = midPoint(from, to)
            return (
              <g key={link.id}>
                <line
                  x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                  stroke={link.color ?? '#800001'}
                  strokeWidth={1.5}
                  strokeDasharray={link.style === 'dashed' ? '6 4' : undefined}
                  strokeOpacity={0.5}
                />
                {link.label && (
                  <>
                    <rect
                      x={mid.x - link.label.length * 4 - 6}
                      y={mid.y - 10}
                      width={link.label.length * 8 + 12}
                      height={18}
                      rx={3}
                      fill="var(--paper)"
                      stroke={link.color ?? '#800001'}
                      strokeOpacity={0.3}
                      strokeWidth={1}
                    />
                    <text
                      x={mid.x} y={mid.y + 4}
                      textAnchor="middle"
                      fontSize={10}
                      fill={link.color ?? '#800001'}
                      fontFamily="Alumni Sans, sans-serif"
                      letterSpacing="0.05em"
                    >
                      {link.label}
                    </text>
                  </>
                )}
              </g>
            )
          })}
        </svg>

        {/* 캐릭터 노드 */}
        {chars.map(char => {
          const pos = getPos(char)
          const CARD_W = 90, CARD_H = 52
          return (
            <div
              key={char.id}
              className="absolute flex flex-col items-center"
              style={{
                left: pos.x - CARD_W / 2,
                top: pos.y - CARD_H / 2,
                width: CARD_W,
                cursor: editMode ? 'grab' : 'default',
                zIndex: dragging?.id === char.id ? 10 : 1,
              }}
              onMouseDown={e => onMouseDown(e, char.id)}
            >
              <div
                className="w-full rounded-sm px-2 py-1.5 text-center relative group"
                style={{
                  background: 'var(--paper)',
                  border: `1.5px solid ${char.color ?? 'rgba(0,17,60,0.2)'}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                }}
              >
                <p className="text-xs font-bold leading-tight" style={{ fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}>
                  {char.name}
                </p>
                {char.subtitle && (
                  <p className="text-xs opacity-40 leading-tight" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', fontSize: '0.6rem' }}>
                    {char.subtitle}
                  </p>
                )}
                {/* 상단 색상 바 */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-sm" style={{ background: char.color ?? 'var(--char-red)' }} />

                {editMode && (
                  <div className="absolute -top-2 -right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onMouseDown={e => e.stopPropagation()} onClick={() => setEditingChar({ ...char })} className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Pencil size={8} />
                    </button>
                    <button onMouseDown={e => e.stopPropagation()} onClick={() => handleDeleteChar(char.id)} className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center">
                      <X size={8} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* 빈 상태 */}
        {chars.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm opacity-30" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
              {profile?.is_admin ? '편집 버튼을 눌러 캐릭터를 추가해보세요.' : '아직 관계도가 없습니다.'}
            </p>
          </div>
        )}
      </div>

      {/* 관계 목록 (편집 모드) */}
      {editMode && links.length > 0 && (
        <div className="mt-4 flex flex-col gap-1">
          <p className="text-xs opacity-40 mb-1 tracking-widest" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>RELATIONS</p>
          {links.map(link => {
            const from = chars.find(c => c.id === link.from)
            const to   = chars.find(c => c.id === link.to)
            return (
              <div key={link.id} className="flex items-center justify-between px-3 py-1.5 rounded-sm border text-xs" style={{ borderColor: 'rgba(0,17,60,0.1)', background: 'rgba(0,17,60,0.02)' }}>
                <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
                  <span className="opacity-70">{from?.name}</span>
                  <span className="opacity-30 mx-2">—</span>
                  <span className="font-semibold" style={{ color: link.color }}>{link.label || '관계'}</span>
                  <span className="opacity-30 mx-2">—</span>
                  <span className="opacity-70">{to?.name}</span>
                </span>
                <button onClick={() => handleDeleteLink(link.id)} className="opacity-30 hover:opacity-70 transition-opacity" style={{ color: 'var(--char-red)' }}>
                  <X size={11} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* 캐릭터 편집 모달 */}
      {editingChar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setEditingChar(null)}>
          <form onSubmit={handleSaveChar} onClick={e => e.stopPropagation()} className="flex flex-col gap-3 p-5 rounded-sm shadow-xl w-72" style={{ background: 'var(--paper)', border: '1px solid rgba(0,17,60,0.15)' }}>
            <div className="flex items-center justify-between">
              <p className="text-xs tracking-widest" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>캐릭터 편집</p>
              <button type="button" onClick={() => setEditingChar(null)} className="opacity-30 hover:opacity-70"><X size={13} /></button>
            </div>
            <input
              className="w-full px-3 py-2 border rounded-sm text-sm outline-none"
              style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}
              placeholder="이름" value={editingChar.name}
              onChange={e => setEditingChar(c => c ? { ...c, name: e.target.value } : c)}
              autoFocus
            />
            <input
              className="w-full px-3 py-2 border rounded-sm text-sm outline-none"
              style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}
              placeholder="서브타이틀 (선택)" value={editingChar.subtitle ?? ''}
              onChange={e => setEditingChar(c => c ? { ...c, subtitle: e.target.value } : c)}
            />
            <div className="flex flex-col gap-1">
              <p className="text-xs opacity-40" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>색상</p>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(col => (
                  <button key={col} type="button" onClick={() => setEditingChar(c => c ? { ...c, color: col } : c)}
                    className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                    style={{ background: col, outline: editingChar.color === col ? `2px solid ${col}` : 'none', outlineOffset: '2px' }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <button type="submit" className="flex-1 py-1.5 text-xs text-white rounded-sm" style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>
                <Check size={11} className="inline mr-1" />저장
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 관계 추가 모달 */}
      {addingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setAddingLink(false)}>
          <form onSubmit={handleAddLink} onClick={e => e.stopPropagation()} className="flex flex-col gap-3 p-5 rounded-sm shadow-xl w-80" style={{ background: 'var(--paper)', border: '1px solid rgba(0,17,60,0.15)' }}>
            <div className="flex items-center justify-between">
              <p className="text-xs tracking-widest" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>관계 추가</p>
              <button type="button" onClick={() => setAddingLink(false)} className="opacity-30 hover:opacity-70"><X size={13} /></button>
            </div>
            <select className="w-full px-3 py-2 border rounded-sm text-sm outline-none" style={{ borderColor: 'rgba(0,17,60,0.15)', color: 'var(--char-blue)', background: 'white' }} value={linkFrom} onChange={e => setLinkFrom(e.target.value)} required>
              <option value="">캐릭터 A</option>
              {chars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input
              className="w-full px-3 py-2 border rounded-sm text-sm outline-none"
              style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}
              placeholder="관계 (예: 친구, 라이벌, 형제)" value={linkLabel}
              onChange={e => setLinkLabel(e.target.value)}
            />
            <select className="w-full px-3 py-2 border rounded-sm text-sm outline-none" style={{ borderColor: 'rgba(0,17,60,0.15)', color: 'var(--char-blue)', background: 'white' }} value={linkTo} onChange={e => setLinkTo(e.target.value)} required>
              <option value="">캐릭터 B</option>
              {chars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {COLORS.map(col => (
                  <button key={col} type="button" onClick={() => setLinkColor(col)}
                    className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                    style={{ background: col, outline: linkColor === col ? `2px solid ${col}` : 'none', outlineOffset: '2px' }}
                  />
                ))}
              </div>
              <select className="ml-auto px-2 py-1 border rounded-sm text-xs outline-none" style={{ borderColor: 'rgba(0,17,60,0.15)', color: 'var(--char-blue)', background: 'white' }} value={linkStyle} onChange={e => setLinkStyle(e.target.value as 'solid' | 'dashed')}>
                <option value="solid">실선</option>
                <option value="dashed">점선</option>
              </select>
            </div>
            <button type="submit" className="py-2 text-xs text-white rounded-sm" style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>추가</button>
          </form>
        </div>
      )}
    </div>
  )
}
