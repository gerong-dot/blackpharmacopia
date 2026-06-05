type Props = {
  title?: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  noPad?: boolean
  dark?: boolean
}

export default function WindowCard({ title, children, className = '', style, noPad, dark }: Props) {
  return (
    <div
      className={`rounded-sm overflow-hidden flex flex-col ${className}`}
      style={{
        background: dark ? 'rgba(8,13,26,0.95)' : 'var(--paper)',
        border: `1px solid ${dark ? 'rgba(195,195,195,0.12)' : 'rgba(0,17,60,0.15)'}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        ...style,
      }}
    >
      {title && (
        <div className="gothic-header shrink-0">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--char-red)' }} />
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
          </div>
          <span className="text-white/70 text-xs tracking-[0.2em] flex-1 text-center" style={{ fontFamily: 'var(--font-title)' }}>
            — {title} —
          </span>
        </div>
      )}
      <div className={noPad ? 'flex-1 overflow-hidden' : 'flex-1 overflow-auto p-4'}>
        {children}
      </div>
    </div>
  )
}
