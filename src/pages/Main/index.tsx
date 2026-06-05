import { useEffect, useState } from 'react'
import { useSiteImage } from '../../hooks/useSiteImage'

const START_DATE = new Date('2026-01-07T00:00:00')

function getDday() {
  const now = new Date()
  const diff = Math.floor((now.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

function getTimeLeft() {
  const now = new Date()
  const next = new Date(START_DATE)
  next.setFullYear(next.getFullYear() + Math.ceil((now.getFullYear() - START_DATE.getFullYear())))
  const diff = now.getTime() - START_DATE.getTime()
  const totalSec = Math.floor(diff / 1000)
  const h = Math.floor((totalSec % 86400) / 3600).toString().padStart(2, '0')
  const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0')
  const s = (totalSec % 60).toString().padStart(2, '0')
  return { h, m, s }
}

export default function MainScreen() {
  const mainBanner = useSiteImage('main_banner')
  const [dday, setDday] = useState(getDday)
  const [time, setTime] = useState(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => {
      setDday(getDday())
      setTime(getTimeLeft())
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const isPositive = dday >= 0

  return (
    <div className="flex flex-col items-center gap-6 py-4 h-full">
      {/* 배너 이미지 */}
      {mainBanner && (
        <div className="w-full rounded-sm overflow-hidden border" style={{ maxHeight: '180px', borderColor: 'rgba(0,17,60,0.1)' }}>
          <img src={mainBanner} alt="banner" className="w-full h-full object-cover block" />
        </div>
      )}

      {/* D-day 카운터 */}
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        {/* 장식 상단 */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(0,17,60,0.2))' }} />
          <span style={{ color: 'var(--char-red)', fontSize: '0.7rem' }}>✦</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(0,17,60,0.2))' }} />
        </div>

        {/* D-day 숫자 */}
        <div className="text-center">
          <p className="text-xs tracking-[0.3em] opacity-40 mb-1" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
            2026 · 01 · 07
          </p>
          <div className="flex items-baseline justify-center gap-1">
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(0.8rem, 2vw, 1rem)', color: 'var(--char-blue)', opacity: 0.5 }}>
              {isPositive ? 'D +' : 'D -'}
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 10vw, 5rem)', color: 'var(--char-blue)', lineHeight: 1, fontWeight: 700 }}>
              {Math.abs(dday)}
            </span>
          </div>
        </div>

        {/* 시:분:초 */}
        <div className="flex items-center gap-2">
          {[time.h, time.m, time.s].map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <span style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', color: 'var(--char-blue)', letterSpacing: '0.05em', fontWeight: 600 }}>
                  {v}
                </span>
                <span className="text-xs opacity-30" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)' }}>
                  {['HH', 'MM', 'SS'][i]}
                </span>
              </div>
              {i < 2 && <span className="opacity-20 mb-3" style={{ color: 'var(--char-blue)', fontSize: '1.2rem' }}>:</span>}
            </div>
          ))}
        </div>

        {/* 장식 하단 */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(0,17,60,0.2))' }} />
          <span style={{ color: 'var(--char-red)', fontSize: '0.7rem' }}>✦</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(0,17,60,0.2))' }} />
        </div>

        <p className="text-xs opacity-30 tracking-widest text-center" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
          틀린다는 것은 또 다른 결과값의 도출이랍니다.
        </p>
      </div>
    </div>
  )
}
