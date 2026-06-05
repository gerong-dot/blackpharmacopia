import { useRef } from 'react'
import { Bold, Italic, Heading2, Heading3, Link, Image, List, AlignLeft } from 'lucide-react'

type Props = {
  value: string
  onChange: (val: string) => void
}

export default function RichEditor({ value, onChange }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null)

  function wrap(before: string, after: string, placeholder = '') {
    const ta = taRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = value.slice(start, end) || placeholder
    const newVal = value.slice(0, start) + before + selected + after + value.slice(end)
    onChange(newVal)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }

  function insertAtCursor(text: string) {
    const ta = taRef.current
    if (!ta) return
    const start = ta.selectionStart
    const newVal = value.slice(0, start) + text + value.slice(start)
    onChange(newVal)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  function handleLink() {
    const url = prompt('링크 URL을 입력하세요:')
    if (!url) return
    const ta = taRef.current
    if (!ta) return
    const selected = value.slice(ta.selectionStart, ta.selectionEnd) || '링크 텍스트'
    wrap(`<a href="${url}" target="_blank">`, '</a>', selected)
  }

  function handleImage() {
    const url = prompt('이미지 URL을 입력하세요:')
    if (!url) return
    const alt = prompt('이미지 설명(alt)을 입력하세요:') || ''
    insertAtCursor(`<img src="${url}" alt="${alt}" />\n`)
  }

  const btnClass = `
    p-1.5 rounded transition-colors hover:bg-black/10
    text-[var(--char-blue)] opacity-60 hover:opacity-100
  `

  return (
    <div className="flex flex-col rounded border overflow-hidden" style={{ borderColor: 'rgba(0,17,60,0.15)' }}>
      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-white/60" style={{ borderColor: 'rgba(0,17,60,0.1)' }}>
        <button type="button" className={btnClass} title="굵게" onClick={() => wrap('<strong>', '</strong>', '굵은 텍스트')}>
          <Bold size={15} />
        </button>
        <button type="button" className={btnClass} title="기울임" onClick={() => wrap('<em>', '</em>', '기울임 텍스트')}>
          <Italic size={15} />
        </button>
        <div className="w-px h-4 bg-black/10 mx-1" />
        <button type="button" className={btnClass} title="제목2" onClick={() => wrap('<h2>', '</h2>', '제목')}>
          <Heading2 size={15} />
        </button>
        <button type="button" className={btnClass} title="제목3" onClick={() => wrap('<h3>', '</h3>', '소제목')}>
          <Heading3 size={15} />
        </button>
        <div className="w-px h-4 bg-black/10 mx-1" />
        <button type="button" className={btnClass} title="목록" onClick={() => wrap('<ul>\n  <li>', '</li>\n</ul>', '항목')}>
          <List size={15} />
        </button>
        <button type="button" className={btnClass} title="인용" onClick={() => wrap('<blockquote>', '</blockquote>', '인용 텍스트')}>
          <AlignLeft size={15} />
        </button>
        <div className="w-px h-4 bg-black/10 mx-1" />
        <button type="button" className={btnClass} title="링크 삽입" onClick={handleLink}>
          <Link size={15} />
        </button>
        <button type="button" className={btnClass} title="이미지 삽입" onClick={handleImage}>
          <Image size={15} />
        </button>
        <div className="w-px h-4 bg-black/10 mx-1" />
        <button type="button" className={btnClass} title="단락" onClick={() => insertAtCursor('<p></p>\n')}>
          <span className="text-xs font-bold" style={{ fontFamily: 'monospace' }}>P</span>
        </button>
        <button type="button" className={btnClass} title="구분선" onClick={() => insertAtCursor('<hr />\n')}>
          <span className="text-xs" style={{ fontFamily: 'monospace' }}>—</span>
        </button>
      </div>

      {/* 에디터 */}
      <textarea
        ref={taRef}
        rows={20}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={`<h2>제목</h2>\n<p>내용을 입력하세요...</p>\n\n툴바 버튼으로 서식을 삽입하거나 HTML을 직접 작성하세요.`}
        className="w-full px-4 py-3 outline-none bg-white text-sm"
        style={{
          fontFamily: "'Nanum Myeongjo', serif",
          fontSize: '0.95rem',
          color: 'var(--char-blue)',
          resize: 'vertical',
          lineHeight: 1.9,
        }}
      />
    </div>
  )
}
