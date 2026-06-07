import { useEffect, useState } from 'react'
import { getSiteSetting, setSiteSetting } from '../../lib/storage'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, X, Pencil, Check, ChevronDown, ChevronRight } from 'lucide-react'
import RichEditor from '../../components/RichEditor'
import DOMPurify from 'dompurify'

type Section = { id: string; title: string }
type Entry   = { id: string; sectionId: string; title: string; content: string }

export default function LorePage() {
  const [sections, setSections]   = useState<Section[]>([])
  const [entries, setEntries]     = useState<Entry[]>([])
  const [activeSection, setActiveSection] = useState('')
  const [expanded, setExpanded]   = useState<Set<string>>(new Set())
  const [loading, setLoading]     = useState(true)

  // 섹션 추가
  const [addingSection, setAddingSection] = useState(false)
  const [newSectionTitle, setNewSectionTitle] = useState('')

  // 항목 추가/편집
  const [addingEntry, setAddingEntry] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [entryTitle, setEntryTitle] = useState('')
  const [entryContent, setEntryContent] = useState('')

  const { profile } = useAuth()

  useEffect(() => {
    Promise.all([getSiteSetting('lore_sections'), getSiteSetting('lore_entries')]).then(([s, e]) => {
      const parsed = s ? (() => { try { return JSON.parse(s) } catch { return [] } })() : []
      const parsedE = e ? (() => { try { return JSON.parse(e) } catch { return [] } })() : []
      setSections(parsed)
      setEntries(parsedE)
      if (parsed.length > 0) setActiveSection(parsed[0].id)
      setLoading(false)
    })
  }, [])

  async function saveSections(next: Section[]) {
    setSections(next)
    await setSiteSetting('lore_sections', JSON.stringify(next))
  }

  async function saveEntries(next: Entry[]) {
    setEntries(next)
    await setSiteSetting('lore_entries', JSON.stringify(next))
  }

  async function handleAddSection(e: React.FormEvent) {
    e.preventDefault()
    if (!newSectionTitle.trim()) return
    const next = [...sections, { id: `s-${Date.now()}`, title: newSectionTitle.trim() }]
    await saveSections(next)
    if (sections.length === 0) setActiveSection(next[0].id)
    setNewSectionTitle('')
    setAddingSection(false)
  }

  async function handleDeleteSection(id: string) {
    if (!confirm('섹션을 삭제하시겠습니까? 해당 항목도 모두 삭제됩니다.')) return
    await saveSections(sections.filter(s => s.id !== id))
    await saveEntries(entries.filter(e => e.sectionId !== id))
    if (activeSection === id) setActiveSection(sections[0]?.id ?? '')
  }

  async function handleSaveEntry(e: React.FormEvent) {
    e.preventDefault()
    if (!entryTitle.trim()) return
    if (editingEntry) {
      const next = entries.map(en => en.id === editingEntry.id ? { ...en, title: entryTitle, content: entryContent } : en)
      await saveEntries(next)
      setEditingEntry(null)
    } else {
      const next = [...entries, { id: `e-${Date.now()}`, sectionId: activeSection, title: entryTitle, content: entryContent }]
      await saveEntries(next)
      setAddingEntry(false)
    }
    setEntryTitle('')
    setEntryContent('')
  }

  function startEditEntry(entry: Entry) {
    setEditingEntry(entry)
    setEntryTitle(entry.title)
    setEntryContent(entry.content)
    setAddingEntry(false)
  }

  function cancelEdit() {
    setEditingEntry(null)
    setAddingEntry(false)
    setEntryTitle('')
    setEntryContent('')
  }

  async function handleDeleteEntry(id: string) {
    await saveEntries(entries.filter(e => e.id !== id))
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const sectionEntries = entries.filter(e => e.sectionId === activeSection)

  if (loading) return <div className="py-20 text-center opacity-30" style={{ fontFamily: 'var(--font-deco)', fontSize: '1.5rem', color: 'var(--char-blue)' }}>loading...</div>

  return (
    <div className="max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--char-blue)' }}>Lore</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-px w-8" style={{ background: 'var(--char-red)' }} />
            <span style={{ color: 'var(--char-red)', fontSize: '0.6rem' }}>✦</span>
            <div className="h-px w-8" style={{ background: 'var(--char-red)', opacity: 0.3 }} />
          </div>
        </div>
      </div>

      {/* 섹션 탭 */}
      <div className="flex items-center gap-1 flex-wrap mb-6">
        {sections.map(sec => (
          <div key={sec.id} className="relative group flex items-center">
            <button
              onClick={() => setActiveSection(sec.id)}
              className="px-3 py-1.5 text-xs rounded-sm transition-all"
              style={{
                fontFamily: 'var(--font-title)',
                letterSpacing: '0.1em',
                background: activeSection === sec.id ? 'var(--char-blue)' : 'transparent',
                color: activeSection === sec.id ? 'white' : 'var(--char-blue)',
                border: '1px solid rgba(0,17,60,0.2)',
                opacity: activeSection === sec.id ? 1 : 0.55,
              }}
            >
              {sec.title}
            </button>
            {profile?.is_admin && (
              <button
                onClick={() => handleDeleteSection(sec.id)}
                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
              >
                <X size={8} />
              </button>
            )}
          </div>
        ))}

        {/* 섹션 추가 */}
        {profile?.is_admin && (
          addingSection ? (
            <form onSubmit={handleAddSection} className="flex items-center gap-1">
              <input
                autoFocus
                className="px-2 py-1 text-xs border rounded-sm outline-none"
                style={{ borderColor: 'rgba(0,17,60,0.2)', fontFamily: 'var(--font-title)', color: 'var(--char-blue)', width: '90px' }}
                placeholder="섹션명"
                value={newSectionTitle}
                onChange={e => setNewSectionTitle(e.target.value)}
              />
              <button type="submit" className="p-1 hover:opacity-80" style={{ color: 'var(--char-red)' }}><Check size={13} /></button>
              <button type="button" onClick={() => setAddingSection(false)} className="p-1 opacity-40 hover:opacity-70" style={{ color: 'var(--char-blue)' }}><X size={13} /></button>
            </form>
          ) : (
            <button
              onClick={() => setAddingSection(true)}
              className="px-2 py-1.5 text-xs rounded-sm opacity-30 hover:opacity-60 transition-opacity flex items-center gap-1"
              style={{ border: '1px dashed rgba(0,17,60,0.2)', fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}
            >
              <Plus size={10} /> 섹션
            </button>
          )
        )}
      </div>

      {/* 항목 목록 */}
      {sections.length === 0 ? (
        <p className="text-center py-16 opacity-30 text-sm" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
          {profile?.is_admin ? '섹션을 추가해 설정집을 시작해보세요.' : '아직 설정집이 없습니다.'}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {sectionEntries.length === 0 && !addingEntry && (
            <p className="text-center py-10 opacity-30 text-sm" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
              {profile?.is_admin ? '항목을 추가해보세요.' : '아직 항목이 없습니다.'}
            </p>
          )}

          {sectionEntries.map(entry => (
            <div key={entry.id} className="border rounded-sm overflow-hidden" style={{ borderColor: 'rgba(0,17,60,0.12)' }}>
              {editingEntry?.id === entry.id ? (
                <form onSubmit={handleSaveEntry} className="p-4 flex flex-col gap-3">
                  <input
                    className="w-full px-3 py-2 border rounded-sm text-sm outline-none"
                    style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}
                    value={entryTitle}
                    onChange={e => setEntryTitle(e.target.value)}
                    placeholder="제목"
                    autoFocus
                  />
                  <RichEditor value={entryContent} onChange={setEntryContent} />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={cancelEdit} className="px-3 py-1.5 text-xs opacity-50 rounded-sm" style={{ border: '1px solid rgba(0,17,60,0.15)', color: 'var(--char-blue)', fontFamily: 'var(--font-title)' }}>취소</button>
                    <button type="submit" className="px-4 py-1.5 text-xs text-white rounded-sm" style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>저장</button>
                  </div>
                </form>
              ) : (
                <>
                  <button
                    onClick={() => toggleExpand(entry.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-black/5 transition-colors"
                    style={{ background: 'rgba(0,17,60,0.02)' }}
                  >
                    <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}>
                      {entry.title}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {profile?.is_admin && (
                        <>
                          <span onClick={e => { e.stopPropagation(); startEditEntry(entry) }} className="opacity-0 group-hover:opacity-40 hover:!opacity-70 transition-opacity p-1" style={{ color: 'var(--char-blue)' }}>
                            <Pencil size={11} />
                          </span>
                          <span onClick={e => { e.stopPropagation(); handleDeleteEntry(entry.id) }} className="opacity-0 group-hover:opacity-40 hover:!opacity-70 transition-opacity p-1" style={{ color: 'var(--char-red)' }}>
                            <X size={11} />
                          </span>
                        </>
                      )}
                      {expanded.has(entry.id) ? <ChevronDown size={14} style={{ color: 'var(--char-blue)', opacity: 0.4 }} /> : <ChevronRight size={14} style={{ color: 'var(--char-blue)', opacity: 0.4 }} />}
                    </div>
                  </button>
                  {expanded.has(entry.id) && entry.content && (
                    <div className="px-5 py-4 border-t post-content" style={{ borderColor: 'rgba(0,17,60,0.08)' }}
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(entry.content) }}
                    />
                  )}
                </>
              )}
            </div>
          ))}

          {/* 항목 추가 폼 */}
          {profile?.is_admin && addingEntry && (
            <form onSubmit={handleSaveEntry} className="border rounded-sm p-4 flex flex-col gap-3" style={{ borderColor: 'rgba(0,17,60,0.12)', borderStyle: 'dashed' }}>
              <input
                className="w-full px-3 py-2 border rounded-sm text-sm outline-none"
                style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}
                value={entryTitle}
                onChange={e => setEntryTitle(e.target.value)}
                placeholder="제목"
                autoFocus
              />
              <RichEditor value={entryContent} onChange={setEntryContent} />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={cancelEdit} className="px-3 py-1.5 text-xs opacity-50 rounded-sm" style={{ border: '1px solid rgba(0,17,60,0.15)', color: 'var(--char-blue)', fontFamily: 'var(--font-title)' }}>취소</button>
                <button type="submit" className="px-4 py-1.5 text-xs text-white rounded-sm" style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>추가</button>
              </div>
            </form>
          )}

          {profile?.is_admin && !addingEntry && !editingEntry && (
            <button
              onClick={() => setAddingEntry(true)}
              className="flex items-center gap-1.5 px-4 py-3 rounded-sm border text-xs opacity-40 hover:opacity-70 transition-opacity"
              style={{ borderColor: 'rgba(0,17,60,0.1)', borderStyle: 'dashed', fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}
            >
              <Plus size={12} /> 항목 추가
            </button>
          )}
        </div>
      )}
    </div>
  )
}
