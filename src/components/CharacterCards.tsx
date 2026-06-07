import { useEffect, useRef, useState } from 'react'
import { getSiteSetting, setSiteSetting, uploadImage } from '../lib/storage'
import { useAuth } from '../contexts/AuthContext'
import { Pencil, Check, X, Camera } from 'lucide-react'

type Character = {
  id: string
  name: string
  subtitle: string
  description: string
  imageUrl: string
  tags: string[]
}

const DEFAULT_CHARS: Character[] = [
  { id: 'uriel', name: '우리엘', subtitle: 'Uriel', description: '', imageUrl: '', tags: [] },
  { id: 'ernest', name: '어니스트 칼더', subtitle: 'Ernest Calder', description: '', imageUrl: '', tags: [] },
]

export default function CharacterCards({ index }: { index?: number }) {
  const [chars, setChars] = useState<Character[]>(DEFAULT_CHARS)
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Character | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { profile } = useAuth()

  useEffect(() => {
    getSiteSetting('character_cards').then(raw => {
      if (raw) try { setChars(JSON.parse(raw)) } catch {}
    })
  }, [])

  async function save(next: Character[]) {
    setChars(next)
    await setSiteSetting('character_cards', JSON.stringify(next))
  }

  function startEdit(char: Character) {
    setDraft({ ...char })
    setEditing(char.id)
  }

  async function handleSave() {
    if (!draft) return
    const next = chars.map(c => c.id === draft.id ? draft : c)
    await save(next)
    setEditing(null)
    setDraft(null)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!draft || !e.target.files?.[0]) return
    setUploading(true)
    try {
      const url = await uploadImage(e.target.files[0], `chars/${draft.id}`)
      setDraft(d => d ? { ...d, imageUrl: url } : d)
    } catch {}
    setUploading(false)
    e.target.value = ''
  }

  // 단일 카드 모드 (index 지정 시)
  const displayChars = index !== undefined ? [chars[index]].filter(Boolean) : chars

  return (
    <div className="w-full">
      {index === undefined && (
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(0,17,60,0.15))' }} />
          <span className="text-xs tracking-[0.3em] opacity-40" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>CHARACTERS</span>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(0,17,60,0.15))' }} />
        </div>
      )}

      <div className={index !== undefined ? '' : 'grid grid-cols-2 gap-3'}>
        {displayChars.map(char => (
          <div key={char.id} className="relative group rounded-sm overflow-hidden border flex flex-col" style={{ borderColor: 'rgba(0,17,60,0.12)', background: 'rgba(0,17,60,0.02)', minHeight: '200px' }}>
            {editing === char.id && draft ? (
              /* 편집 모드 */
              <div className="flex flex-col gap-2 p-3">
                {/* 이미지 */}
                <div className="relative w-full aspect-square rounded-sm overflow-hidden border cursor-pointer bg-black/5 flex items-center justify-center"
                  style={{ borderColor: 'rgba(0,17,60,0.1)' }}
                  onClick={() => fileRef.current?.click()}>
                  {draft.imageUrl
                    ? <img src={draft.imageUrl} alt="" className="w-full h-full object-cover" />
                    : <span className="text-xs opacity-30" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>이미지 추가</span>
                  }
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={16} className="text-white" />}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
                <input className="w-full px-2 py-1 rounded-sm border text-xs outline-none" style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}
                  placeholder="이름" value={draft.name} onChange={e => setDraft(d => d ? { ...d, name: e.target.value } : d)} />
                <input className="w-full px-2 py-1 rounded-sm border text-xs outline-none" style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}
                  placeholder="서브타이틀 (영문)" value={draft.subtitle} onChange={e => setDraft(d => d ? { ...d, subtitle: e.target.value } : d)} />
                <textarea className="w-full px-2 py-1 rounded-sm border text-xs outline-none resize-none" rows={3} style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}
                  placeholder="소개글" value={draft.description} onChange={e => setDraft(d => d ? { ...d, description: e.target.value } : d)} />
                <input className="w-full px-2 py-1 rounded-sm border text-xs outline-none" style={{ borderColor: 'rgba(0,17,60,0.15)', fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}
                  placeholder="태그 (쉼표로 구분)" value={draft.tags.join(', ')}
                  onChange={e => setDraft(d => d ? { ...d, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) } : d)} />
                <div className="flex gap-1.5">
                  <button onClick={handleSave} className="flex-1 py-1.5 rounded-sm text-xs text-white" style={{ background: 'var(--char-red)', fontFamily: 'var(--font-title)' }}><Check size={11} className="inline mr-1" />저장</button>
                  <button onClick={() => { setEditing(null); setDraft(null) }} className="py-1.5 px-3 rounded-sm text-xs opacity-50" style={{ border: '1px solid rgba(0,17,60,0.15)', fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}><X size={11} /></button>
                </div>
              </div>
            ) : (
              /* 표시 모드 */
              <>
                {/* 이미지 */}
                <div className="w-full aspect-square overflow-hidden" style={{ background: 'rgba(0,17,60,0.04)' }}>
                  {char.imageUrl
                    ? <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <span style={{ color: 'rgba(0,17,60,0.1)', fontSize: '2.5rem' }}>✦</span>
                      </div>
                  }
                </div>
                {/* 정보 */}
                <div className="p-3 flex flex-col gap-1.5 flex-1">
                  <div>
                    <p className="text-sm font-bold leading-tight" style={{ fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}>{char.name}</p>
                    <p className="text-xs opacity-40 italic" style={{ fontFamily: 'var(--font-display)', color: 'var(--char-blue)' }}>{char.subtitle}</p>
                  </div>
                  {char.description && (
                    <p className="text-xs leading-relaxed opacity-60" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>{char.description}</p>
                  )}
                  {char.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-auto pt-1">
                      {char.tags.map(tag => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 rounded-sm" style={{ background: 'rgba(128,0,1,0.08)', color: 'var(--char-red)', fontFamily: 'var(--font-title)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {/* 편집 버튼 */}
                {profile?.is_admin && (
                  <button onClick={() => startEdit(char)}
                    className="absolute top-2 right-2 p-1.5 rounded-sm bg-black/40 text-white opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Pencil size={11} />
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
