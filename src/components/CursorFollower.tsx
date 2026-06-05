import { useEffect, useRef, useState } from 'react'

type Props = { enabled: boolean }

export default function CursorFollower({ enabled }: Props) {
  const cursorRef = useRef<HTMLImageElement>(null)
  const [cursorSrc, setCursorSrc] = useState('/cursors/default.gif')
  const pos = useRef({ x: -100, y: -100 })

  useEffect(() => {
    if (!enabled) return

    function onMove(e: MouseEvent) {
      pos.current = { x: e.clientX, y: e.clientY }
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      }
    }

    function onOver(e: MouseEvent) {
      const el = e.target as HTMLElement
      if (!cursorRef.current) return
      if (el.closest('a, button, [role="button"], label'))
        setCursorSrc('/cursors/pointer.gif')
      else if (el.closest('input, textarea'))
        setCursorSrc('/cursors/text.gif')
      else
        setCursorSrc('/cursors/default.gif')
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <img
      ref={cursorRef}
      src={cursorSrc}
      alt=""
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        width: '32px',
        height: '32px',
        imageRendering: 'pixelated',
        transform: `translate(${pos.current.x}px, ${pos.current.y}px)`,
        willChange: 'transform',
      }}
    />
  )
}
