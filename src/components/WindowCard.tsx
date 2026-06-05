type Props = {
  title?: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  noPad?: boolean
}

export default function WindowCard({ title, children, className = '', style, noPad }: Props) {
  return (
    <div
      className={`rounded-lg overflow-hidden flex flex-col ${className}`}
      style={{ background: 'white', border: '1px solid rgba(0,17,60,0.12)', boxShadow: '0 2px 12px rgba(0,17,60,0.08)', ...style }}
    >
      {title && (
        <div
          className="flex items-center gap-2 px-3 py-2 shrink-0"
          style={{ background: 'var(--char-blue)' }}
        >
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--char-red)' }} />
            <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
          </div>
          <span className="text-white/80 text-xs tracking-widest" style={{ fontFamily: 'var(--font-title)' }}>
            {title}
          </span>
        </div>
      )}
      <div className={noPad ? 'flex-1 overflow-hidden' : 'flex-1 overflow-auto p-4'}>
        {children}
      </div>
    </div>
  )
}
