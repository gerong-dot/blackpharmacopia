import { useEffect, useRef, useState } from 'react'
import { getSiteSetting, setSiteSetting, uploadImage } from '../../lib/storage'
import { useAuth } from '../../contexts/AuthContext'
import { Pencil, Check, X, Camera, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import RichEditor from '../../components/RichEditor'
import DOMPurify from 'dompurify'

// ─── Lore types ───────────────────────────────────────────────
type LoreSection = { id: string; title: string }
type LoreEntry   = { id: string; sectionId: string; title: string; content: string }

// ─── Character types ──────────────────────────────────────────
type ColorSwatch = { label: string; hex: string }
type CharProfile = {
  name: string; subtitle: string; age: string; gender: string; height: string
  quote: string; bio: string; tags: string[]
  portraitUrl: string; chibiUrl: string
  colors: ColorSwatch[]
  facial: string; hairDesc: string; etc: string
  feelingsToOther: string
}
type RelData = {
  chars: [CharProfile, CharProfile]
  relationshipDesc: string
  relationshipLabel: string
}
const DEFAULT_CHAR: CharProfile = {
  name: '이름', subtitle: '역할', age: '', gender: '', height: '',
  quote: '...', bio: '', tags: [],
  portraitUrl: '', chibiUrl: '',
  colors: [{ label: 'HAIR', hex: '#333333' }, { label: 'EYE', hex: '#334466' }, { label: 'SKIN', hex: '#f5e6d3' }],
  facial: '', hairDesc: '', etc: '', feelingsToOther: '',
}
const DEFAULT_REL: RelData = {
  chars: [{ ...DEFAULT_CHAR, name: '캐릭터 A' }, { ...DEFAULT_CHAR, name: '캐릭터 B' }],
  relationshipDesc: '', relationshipLabel: '관계',
}

// ══════════════════════════════════════════════════════════════
export default function RelationsPage() {
  const [tab, setTab] = useState<'chars' | 'lore'>('chars')
  const { profile } = useAuth()

  return (
    <div className="max-w-5xl mx-auto">
      {/* 페이지 탭 */}
      <div className="flex items-center gap-1 mb-6 border-b pb-3" style={{ borderColor: 'rgba(0,17,60,0.1)' }}>
        {(['chars', 'lore'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 text-xs rounded-sm transition-all"
            style={{
              fontFamily: 'var(--font-title)', letterSpacing: '0.12em',
              background: tab === t ? 'var(--char-blue)' : 'transparent',
              color: tab === t ? 'white' : 'var(--char-blue)',
              border: '1px solid rgba(0,17,60,0.2)',
              opacity: tab === t ? 1 : 0.5,
            }}>
            {t === 'chars' ? 'ELCAL' : 'LORE'}
          </button>
        ))}
      </div>

      {tab === 'chars' ? <CharactersTab profile={profile} /> : <LoreTab profile={profile} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// CHARACTERS TAB
// ══════════════════════════════════════════════════════════════
function CharactersTab({ profile }: { profile: { is_admin?: boolean } | null }) {
  const [data, setData] = useState<RelData>(DEFAULT_REL)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<RelData>(DEFAULT_REL)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const r00 = useRef<HTMLInputElement>(null)
  const r01 = useRef<HTMLInputElement>(null)
  const r10 = useRef<HTMLInputElement>(null)
  const r11 = useRef<HTMLInputElement>(null)
  const fileRefs = [[r00, r01], [r10, r11]] as const

  useEffect(() => {
    getSiteSetting('rel_data').then(raw => {
      if (raw) try { const p = JSON.parse(raw); setData(p); setDraft(p) } catch {}
      setLoading(false)
    })
  }, [])

  function startEdit() { setDraft(JSON.parse(JSON.stringify(data))); setEditing(true) }
  async function handleSave() {
    setSaving(true)
    await setSiteSetting('rel_data', JSON.stringify(draft))
    setData(draft); setEditing(false); setSaving(false)
  }
  function updateChar(idx: 0 | 1, field: keyof CharProfile, value: CharProfile[keyof CharProfile]) {
    setDraft(d => {
      const next = { ...d, chars: [...d.chars] as [CharProfile, CharProfile] }
      next.chars[idx] = { ...next.chars[idx], [field]: value }
      return next
    })
  }
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, key: string) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(key)
    try {
      const url = await uploadImage(file, `chars/${key}-${Date.now()}`)
      const [type, idx] = key.split('-')
      const i = parseInt(idx) as 0 | 1
      updateChar(i, type === 'portrait' ? 'portraitUrl' : 'chibiUrl', url)
    } catch (err) { alert('업로드 실패: ' + (err as Error).message) }
    setUploading(null); e.target.value = ''
  }
  function addColor(idx: 0 | 1) {
    updateChar(idx, 'colors', [...(editing ? draft : data).chars[idx].colors, { label: 'NEW', hex: '#888888' }])
  }
  function updateColor(ci: 0 | 1, pi: number, field: 'label' | 'hex', val: string) {
    const colors = [...draft.chars[ci].colors]; colors[pi] = { ...colors[pi], [field]: val }
    updateChar(ci, 'colors', colors)
  }
  function removeColor(ci: 0 | 1, pi: number) {
    updateChar(ci, 'colors', draft.chars[ci].colors.filter((_, i) => i !== pi))
  }

  const cur = editing ? draft : data
  if (loading) return <div className="py-20 text-center opacity-30" style={{ fontFamily: 'var(--font-deco)', fontSize: '1.5rem', color: 'var(--char-blue)' }}>loading...</div>

  return (
    <div>
      {profile?.is_admin && (
        <div className="flex justify-end mb-4">
          {editing ? (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs rounded-sm opacity-50" style={{ border: '1px solid rgba(0,17,60,0.2)', color: 'var(--char-blue)', fontFamily: 'var(--font-title)' }}>
                <X size={11} className="inline mr-1" />취소
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 text-xs text-white rounded-sm disabled:opacity-50" style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>
                <Check size={11} className="inline mr-1" />{saving ? '저장 중...' : '저장'}
              </button>
            </div>
          ) : (
            <button onClick={startEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm hover:opacity-70" style={{ border: '1px solid rgba(0,17,60,0.2)', color: 'var(--char-blue)', fontFamily: 'var(--font-title)' }}>
              <Pencil size={11} /> 편집
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {([0, 1] as const).map(idx => {
          const char = cur.chars[idx]
          return (
            <div key={idx} className="rounded-sm border overflow-hidden" style={{ borderColor: 'rgba(0,17,60,0.12)', background: 'rgba(0,17,60,0.02)' }}>
              {/* 이름 + 기본 정보 */}
              <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'rgba(0,17,60,0.08)' }}>
                {editing ? (
                  <div className="flex flex-col gap-2">
                    <input className="text-2xl font-bold w-full bg-transparent outline-none border-b pb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--char-blue)', borderColor: 'rgba(0,17,60,0.15)' }}
                      value={char.name} onChange={e => updateChar(idx, 'name', e.target.value)} placeholder="이름" />
                    <input className="text-sm w-full bg-transparent outline-none opacity-60" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}
                      value={char.subtitle} onChange={e => updateChar(idx, 'subtitle', e.target.value)} placeholder="역할/직업" />
                    <div className="flex gap-2">
                      {(['age','gender','height'] as const).map(f => (
                        <input key={f} className="flex-1 text-xs px-2 py-1 rounded-sm border bg-white outline-none" style={{ borderColor: 'rgba(0,17,60,0.12)', color: 'var(--char-blue)' }}
                          value={char[f]} onChange={e => updateChar(idx, f, e.target.value)} placeholder={f === 'age' ? '나이' : f === 'gender' ? '성별' : '키'} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--char-blue)', lineHeight: 1.1 }}>{char.name}</h2>
                    <p className="text-sm opacity-50 mt-0.5" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>{char.subtitle}</p>
                    {(char.age || char.gender || char.height) && (
                      <p className="text-xs mt-2 opacity-40" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)', letterSpacing: '0.05em' }}>
                        {[char.age && `${char.age}세`, char.gender, char.height].filter(Boolean).join(' / ')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 이미지 */}
              <div className="grid grid-cols-2 gap-0">
                {(['portrait', 'chibi'] as const).map((type, ti) => {
                  const imgUrl = type === 'portrait' ? char.portraitUrl : char.chibiUrl
                  const refKey = `${type}-${idx}`
                  const fileRef = fileRefs[idx][ti as 0 | 1]
                  return (
                    <div key={type} className="relative group aspect-square overflow-hidden border-r last:border-r-0" style={{ borderColor: 'rgba(0,17,60,0.08)', background: 'rgba(0,17,60,0.03)' }}>
                      {imgUrl
                        ? <img src={imgUrl} alt={type} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center opacity-20"><Camera size={24} style={{ color: 'var(--char-blue)' }} /></div>
                      }
                      {editing && (
                        <>
                          <div className="absolute inset-0 bg-black/40 opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            onClick={() => fileRef.current?.click()}>
                            {uploading === refKey
                              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              : <Camera size={18} className="text-white" />}
                          </div>
                          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, refKey)} />
                        </>
                      )}
                      <span className="absolute bottom-1 left-1 text-xs opacity-30 pointer-events-none" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)', fontSize: '0.55rem', letterSpacing: '0.1em' }}>
                        {type === 'portrait' ? 'PORTRAIT' : 'CHIBI'}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* 인용구 */}
              <div className="px-4 py-3 border-t border-b" style={{ borderColor: 'rgba(0,17,60,0.08)', background: 'rgba(128,0,1,0.03)' }}>
                {editing
                  ? <input className="w-full text-sm italic bg-transparent outline-none" style={{ fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}
                      value={char.quote} onChange={e => updateChar(idx, 'quote', e.target.value)} placeholder="대표 인용구" />
                  : <p className="text-sm italic opacity-70 text-center" style={{ fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}>
                      {char.quote && `"${char.quote}"`}
                    </p>
                }
              </div>

              {/* 캐릭터 소개 */}
              {(char.bio || editing) && (
                <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(0,17,60,0.08)' }}>
                  {editing
                    ? <textarea className="w-full text-xs bg-transparent outline-none resize-none leading-relaxed"
                        style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', minHeight: '60px' }}
                        value={char.bio} onChange={e => updateChar(idx, 'bio', e.target.value)}
                        placeholder="캐릭터 소개..." rows={3} />
                    : <p className="text-xs leading-relaxed opacity-60 whitespace-pre-line" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>{char.bio}</p>
                  }
                </div>
              )}

              {/* 태그 */}
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(0,17,60,0.08)' }}>
                {editing ? (
                  <input className="w-full text-xs bg-transparent outline-none" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}
                    value={char.tags.join(', ')} onChange={e => updateChar(idx, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                    placeholder="태그 (쉼표로 구분)" />
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {char.tags.map((tag, ti) => (
                      <span key={ti} className="text-xs px-2 py-0.5 rounded-sm" style={{ background: 'rgba(0,17,60,0.07)', color: 'var(--char-blue)', fontFamily: 'var(--font-title)', opacity: 0.7 }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 색상 팔레트 */}
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(0,17,60,0.08)' }}>
                <div className="flex items-center gap-2 flex-wrap">
                  {char.colors.map((col, ci) => (
                    <div key={ci} className="flex flex-col items-center gap-1 group/col relative">
                      {editing ? (
                        <>
                          <input type="color" value={col.hex} onChange={e => updateColor(idx, ci, 'hex', e.target.value)}
                            className="w-7 h-7 cursor-pointer border-0 p-0" style={{ borderRadius: '2px' }} />
                          <input className="text-center bg-transparent outline-none border-b w-10" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)', fontSize: '0.55rem', borderColor: 'rgba(0,17,60,0.15)' }}
                            value={col.label} onChange={e => updateColor(idx, ci, 'label', e.target.value)} />
                          <button onClick={() => removeColor(idx, ci)} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white opacity-60 flex items-center justify-center">
                            <X size={7} />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-7 h-7 rounded-sm border" style={{ background: col.hex, borderColor: 'rgba(0,17,60,0.1)' }} />
                          <span className="opacity-40" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)', fontSize: '0.55rem', letterSpacing: '0.05em' }}>{col.label}</span>
                        </>
                      )}
                    </div>
                  ))}
                  {editing && (
                    <button onClick={() => addColor(idx)} className="w-7 h-7 rounded-sm border flex items-center justify-center opacity-30 hover:opacity-60" style={{ borderColor: 'rgba(0,17,60,0.2)', borderStyle: 'dashed', color: 'var(--char-blue)' }}>
                      <Plus size={10} />
                    </button>
                  )}
                </div>
              </div>

              {/* 외형 설명 */}
              <div className="px-4 py-3 flex flex-col gap-2">
                {(['facial', 'hairDesc', 'etc'] as const).map(field => (
                  <div key={field} className="flex gap-3 items-start">
                    <span className="text-xs shrink-0 px-2 py-0.5 rounded-sm font-semibold" style={{ fontFamily: 'var(--font-title)', background: 'var(--char-blue)', color: 'white', fontSize: '0.6rem', letterSpacing: '0.05em', marginTop: '2px' }}>
                      {field === 'facial' ? 'Facial' : field === 'hairDesc' ? 'Hair' : 'ETC'}
                    </span>
                    {editing
                      ? <textarea className="flex-1 text-xs bg-transparent outline-none resize-none border-b" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', borderColor: 'rgba(0,17,60,0.1)', minHeight: '36px' }}
                          value={char[field]} onChange={e => updateChar(idx, field, e.target.value)} rows={2} />
                      : <p className="flex-1 text-xs leading-relaxed opacity-60" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>{char[field]}</p>
                    }
                  </div>
                ))}
              </div>

              {/* 상대에 대한 감정 */}
              {(char.feelingsToOther || editing) && (
                <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(0,17,60,0.08)', background: 'rgba(128,0,1,0.02)' }}>
                  <p className="text-xs opacity-40 mb-1 tracking-widest" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
                    → {cur.chars[idx === 0 ? 1 : 0].name || '상대'} 에 대해
                  </p>
                  {editing
                    ? <textarea className="w-full text-xs bg-transparent outline-none resize-none" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', minHeight: '48px' }}
                        value={char.feelingsToOther} onChange={e => updateChar(idx, 'feelingsToOther', e.target.value)} placeholder="상대에 대한 감정/생각..." rows={3} />
                    : <p className="text-xs leading-relaxed opacity-60" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>{char.feelingsToOther}</p>
                  }
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 관계 설명 */}
      {(cur.relationshipDesc || cur.relationshipLabel || editing) && (
        <div className="rounded-sm border px-6 py-5 text-center" style={{ borderColor: 'rgba(0,17,60,0.12)', background: 'rgba(0,17,60,0.02)' }}>
          <div className="flex items-center gap-3 justify-center mb-3">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(0,17,60,0.15))' }} />
            {editing
              ? <input className="text-sm font-semibold bg-transparent outline-none text-center border-b w-32" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-red)', borderColor: 'rgba(128,0,1,0.2)', letterSpacing: '0.15em' }}
                  value={draft.relationshipLabel} onChange={e => setDraft(d => ({ ...d, relationshipLabel: e.target.value }))} placeholder="관계 레이블" />
              : <span className="text-sm" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-red)', letterSpacing: '0.15em' }}>{cur.relationshipLabel}</span>
            }
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(0,17,60,0.15))' }} />
          </div>
          {editing
            ? <textarea className="w-full text-sm bg-transparent outline-none resize-none text-center leading-relaxed" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', minHeight: '60px', opacity: 0.7 }}
                value={draft.relationshipDesc} onChange={e => setDraft(d => ({ ...d, relationshipDesc: e.target.value }))} placeholder="관계 설명..." rows={3} />
            : <p className="text-sm leading-relaxed opacity-60" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>{cur.relationshipDesc}</p>
          }
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// LORE TAB
// ══════════════════════════════════════════════════════════════
function LoreTab({ profile }: { profile: { is_admin?: boolean } | null }) {
  const [sections, setSections]   = useState<LoreSection[]>([])
  const [entries, setEntries]     = useState<LoreEntry[]>([])
  const [activeSection, setActiveSection] = useState('')
  const [expanded, setExpanded]   = useState<Set<string>>(new Set())
  const [loading, setLoading]     = useState(true)
  const [addingSection, setAddingSection] = useState(false)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [addingEntry, setAddingEntry] = useState(false)
  const [editingEntry, setEditingEntry] = useState<LoreEntry | null>(null)
  const [entryTitle, setEntryTitle] = useState('')
  const [entryContent, setEntryContent] = useState('')

  useEffect(() => {
    Promise.all([getSiteSetting('lore_sections'), getSiteSetting('lore_entries')]).then(([s, e]) => {
      const sec: LoreSection[] = s ? (() => { try { return JSON.parse(s) } catch { return [] } })() : []
      const ent: LoreEntry[]   = e ? (() => { try { return JSON.parse(e) } catch { return [] } })() : []
      setSections(sec); setEntries(ent)
      if (sec.length > 0) setActiveSection(sec[0].id)
      setLoading(false)
    })
  }, [])

  async function saveSections(next: LoreSection[]) { setSections(next); await setSiteSetting('lore_sections', JSON.stringify(next)) }
  async function saveEntries(next: LoreEntry[]) { setEntries(next); await setSiteSetting('lore_entries', JSON.stringify(next)) }

  async function handleAddSection(e: React.FormEvent) {
    e.preventDefault(); if (!newSectionTitle.trim()) return
    const next = [...sections, { id: `s-${Date.now()}`, title: newSectionTitle.trim() }]
    await saveSections(next)
    if (sections.length === 0) setActiveSection(next[0].id)
    setNewSectionTitle(''); setAddingSection(false)
  }
  async function handleDeleteSection(id: string) {
    if (!confirm('섹션과 하위 항목을 모두 삭제하시겠습니까?')) return
    await saveSections(sections.filter(s => s.id !== id))
    await saveEntries(entries.filter(e => e.sectionId !== id))
    if (activeSection === id) setActiveSection(sections[0]?.id ?? '')
  }
  async function handleSaveEntry(e: React.FormEvent) {
    e.preventDefault(); if (!entryTitle.trim()) return
    if (editingEntry) {
      await saveEntries(entries.map(en => en.id === editingEntry.id ? { ...en, title: entryTitle, content: entryContent } : en))
      setEditingEntry(null)
    } else {
      await saveEntries([...entries, { id: `e-${Date.now()}`, sectionId: activeSection, title: entryTitle, content: entryContent }])
      setAddingEntry(false)
    }
    setEntryTitle(''); setEntryContent('')
  }
  function startEditEntry(entry: LoreEntry) { setEditingEntry(entry); setEntryTitle(entry.title); setEntryContent(entry.content); setAddingEntry(false) }
  function cancelEdit() { setEditingEntry(null); setAddingEntry(false); setEntryTitle(''); setEntryContent('') }
  async function handleDeleteEntry(id: string) { await saveEntries(entries.filter(e => e.id !== id)) }
  function toggleExpand(id: string) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const sectionEntries = entries.filter(e => e.sectionId === activeSection)

  if (loading) return <div className="py-20 text-center opacity-30" style={{ fontFamily: 'var(--font-deco)', fontSize: '1.5rem', color: 'var(--char-blue)' }}>loading...</div>

  return (
    <div className="max-w-3xl">
      {/* 섹션 탭 */}
      <div className="flex items-center gap-1 flex-wrap mb-6">
        {sections.map(sec => (
          <div key={sec.id} className="relative group flex items-center">
            <button onClick={() => setActiveSection(sec.id)} className="px-3 py-1.5 text-xs rounded-sm transition-all"
              style={{ fontFamily: 'var(--font-title)', letterSpacing: '0.1em', background: activeSection === sec.id ? 'var(--char-blue)' : 'transparent', color: activeSection === sec.id ? 'white' : 'var(--char-blue)', border: '1px solid rgba(0,17,60,0.2)', opacity: activeSection === sec.id ? 1 : 0.55 }}>
              {sec.title}
            </button>
            {profile?.is_admin && (
              <button onClick={() => handleDeleteSection(sec.id)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white opacity-70 flex items-center justify-center z-10">
                <X size={8} />
              </button>
            )}
          </div>
        ))}
        {profile?.is_admin && (
          addingSection ? (
            <form onSubmit={handleAddSection} className="flex items-center gap-1">
              <input autoFocus className="px-2 py-1 text-xs border rounded-sm outline-none" style={{ borderColor: 'rgba(0,17,60,0.2)', fontFamily: 'var(--font-title)', color: 'var(--char-blue)', width: '90px' }}
                placeholder="섹션명" value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} />
              <button type="submit" className="p-1 hover:opacity-80" style={{ color: 'var(--char-red)' }}><Check size={13} /></button>
              <button type="button" onClick={() => setAddingSection(false)} className="p-1 opacity-40"><X size={13} /></button>
            </form>
          ) : (
            <button onClick={() => setAddingSection(true)} className="px-2 py-1.5 text-xs rounded-sm opacity-30 hover:opacity-60 flex items-center gap-1"
              style={{ border: '1px dashed rgba(0,17,60,0.2)', fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
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
            <div key={entry.id} className="border rounded-sm overflow-hidden group" style={{ borderColor: 'rgba(0,17,60,0.12)' }}>
              {editingEntry?.id === entry.id ? (
                <form onSubmit={handleSaveEntry} className="p-4 flex flex-col gap-3">
                  <input autoFocus className="w-full px-3 py-2 border rounded-sm text-sm outline-none" style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}
                    value={entryTitle} onChange={e => setEntryTitle(e.target.value)} placeholder="제목" />
                  <RichEditor value={entryContent} onChange={setEntryContent} />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={cancelEdit} className="px-3 py-1.5 text-xs opacity-50 rounded-sm" style={{ border: '1px solid rgba(0,17,60,0.15)', color: 'var(--char-blue)', fontFamily: 'var(--font-title)' }}>취소</button>
                    <button type="submit" className="px-4 py-1.5 text-xs text-white rounded-sm" style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>저장</button>
                  </div>
                </form>
              ) : (
                <>
                  <button onClick={() => toggleExpand(entry.id)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-black/5 transition-colors" style={{ background: 'rgba(0,17,60,0.02)' }}>
                    <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}>{entry.title}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {profile?.is_admin && (
                        <>
                          <span onClick={e => { e.stopPropagation(); startEditEntry(entry) }} className="opacity-40 hover:opacity-80 transition-opacity p-2" style={{ color: 'var(--char-blue)' }}><Pencil size={13} /></span>
                          <span onClick={e => { e.stopPropagation(); handleDeleteEntry(entry.id) }} className="opacity-40 hover:opacity-80 transition-opacity p-2" style={{ color: 'var(--char-red)' }}><X size={13} /></span>
                        </>
                      )}
                      {expanded.has(entry.id) ? <ChevronDown size={14} style={{ color: 'var(--char-blue)', opacity: 0.4 }} /> : <ChevronRight size={14} style={{ color: 'var(--char-blue)', opacity: 0.4 }} />}
                    </div>
                  </button>
                  {expanded.has(entry.id) && entry.content && (
                    <div className="px-5 py-4 border-t post-content" style={{ borderColor: 'rgba(0,17,60,0.08)' }}
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(entry.content) }} />
                  )}
                </>
              )}
            </div>
          ))}
          {profile?.is_admin && addingEntry && (
            <form onSubmit={handleSaveEntry} className="border rounded-sm p-4 flex flex-col gap-3" style={{ borderColor: 'rgba(0,17,60,0.12)', borderStyle: 'dashed' }}>
              <input autoFocus className="w-full px-3 py-2 border rounded-sm text-sm outline-none" style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}
                value={entryTitle} onChange={e => setEntryTitle(e.target.value)} placeholder="제목" />
              <RichEditor value={entryContent} onChange={setEntryContent} />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={cancelEdit} className="px-3 py-1.5 text-xs opacity-50 rounded-sm" style={{ border: '1px solid rgba(0,17,60,0.15)', color: 'var(--char-blue)', fontFamily: 'var(--font-title)' }}>취소</button>
                <button type="submit" className="px-4 py-1.5 text-xs text-white rounded-sm" style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>추가</button>
              </div>
            </form>
          )}
          {profile?.is_admin && !addingEntry && !editingEntry && (
            <button onClick={() => setAddingEntry(true)} className="flex items-center gap-1.5 px-4 py-3 rounded-sm border text-xs opacity-40 hover:opacity-70 transition-opacity"
              style={{ borderColor: 'rgba(0,17,60,0.1)', borderStyle: 'dashed', fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
              <Plus size={12} /> 항목 추가
            </button>
          )}
        </div>
      )}
    </div>
  )
}
