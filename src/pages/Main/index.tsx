import { useEffect, useState } from 'react'
import { useSiteImage } from '../../hooks/useSiteImage'
import CharacterCards from '../../components/CharacterCards'
import RetroBadges from '../../components/RetrodBadges'

const START_DATE = new Date('2026-01-07T00:00:00')

function getDday() {
  return Math.floor((new Date().getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24))
}

function getTimeLeft() {
  const totalSec = Math.floor((new Date().getTime() - START_DATE.getTime()) / 1000)
  return {
    h: Math.floor((totalSec % 86400) / 3600).toString().padStart(2, '0'),
    m: Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0'),
    s: (totalSec % 60).toString().padStart(2, '0'),
  }
}

export default function MainScreen() {
  const mainBanner = useSiteImage('main_banner')
  const [dday, setDday] = useState(getDday)
  const [time, setTime] = useState(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => { setDday(getDday()); setTime(getTimeLeft()) }, 1000)
    return () => clearInterval(id)
  }, [])

  const isPositive = dday >= 0

  return (
    <div className="flex flex-col gap-6 pb-4">
      {/* 배너 */}
      {mainBanner && (
        <div className="w-full rounded-sm overflow-hidden border" style={{ maxHeight: '160px', borderColor: 'rgba(0,17,60,0.1)' }}>
          <img src={mainBanner} alt="banner" className="w-full h-full object-cover block" />
        </div>
      )}

      {/* D-day */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(0,17,60,0.15))' }} />
          <span style={{ color: 'var(--char-red)', fontSize: '0.6rem' }}>✦</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(0,17,60,0.15))' }} />
        </div>

        <div className="text-center">
          <p className="text-xs tracking-[0.3em] opacity-30 mb-1" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
            2026 · 01 · 07
          </p>
          <div className="flex items-baseline justify-center gap-1">
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--char-blue)', opacity: 0.4 }}>
              {isPositive ? 'D +' : 'D -'}
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 8vw, 4rem)', color: 'var(--char-blue)', lineHeight: 1, fontWeight: 700 }}>
              {Math.abs(dday)}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-1">
            {[time.h, time.m, time.s].map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <span style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', color: 'var(--char-blue)', letterSpacing: '0.05em', fontWeight: 600 }}>{v}</span>
                  <span className="text-xs opacity-20" style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', fontSize: '0.6rem' }}>{['HH', 'MM', 'SS'][i]}</span>
                </div>
                {i < 2 && <span className="opacity-20 mb-3" style={{ color: 'var(--char-blue)' }}>:</span>}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs opacity-25 tracking-widest text-center" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)' }}>
          틀린다는 것은 또 다른 결과값의 도출이랍니다.
        </p>

        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(0,17,60,0.15))' }} />
          <span style={{ color: 'var(--char-red)', fontSize: '0.6rem' }}>✦</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(0,17,60,0.15))' }} />
        </div>
      </div>

      {/* 캐릭터 카드 */}
      <CharacterCards />

      {/* 레트로 뱃지 */}
      <RetroBadges />
    </div>
  )
}
