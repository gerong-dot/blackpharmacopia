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

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* 배너 */}
      {mainBanner && (
        <div className="w-full rounded-sm overflow-hidden border" style={{ maxHeight: '140px', borderColor: 'rgba(0,17,60,0.1)' }}>
          <img src={mainBanner} alt="banner" className="w-full h-full object-cover block" />
        </div>
      )}

      {/* 3컬럼: 우리엘 | D-day | 어니스트 */}
      <div className="grid grid-cols-3 gap-3 items-start">
        {/* 왼쪽: 우리엘 */}
        <CharacterCards index={0} />

        {/* 가운데: D-day */}
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(0,17,60,0.15))' }} />
            <span style={{ color: 'var(--char-red)', fontSize: '0.5rem' }}>✦</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(0,17,60,0.15))' }} />
          </div>

          <p className="text-xs tracking-[0.2em] opacity-30" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)', fontSize: '0.55rem' }}>
            2026 · 01 · 07
          </p>

          <div className="text-center">
            <div className="flex items-baseline justify-center gap-0.5">
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--char-blue)', opacity: 0.4 }}>
                D +
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--char-blue)', lineHeight: 1, fontWeight: 700 }}>
                {Math.abs(dday)}
              </span>
            </div>

            <div className="flex items-center justify-center gap-1 mt-1">
              {[time.h, time.m, time.s].map((v, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="flex flex-col items-center">
                    <span style={{ fontFamily: 'var(--font-title)', fontSize: '0.85rem', color: 'var(--char-blue)', fontWeight: 600 }}>{v}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', opacity: 0.2, fontSize: '0.5rem' }}>{['HH','MM','SS'][i]}</span>
                  </div>
                  {i < 2 && <span className="opacity-20 mb-2.5" style={{ color: 'var(--char-blue)', fontSize: '0.7rem' }}>:</span>}
                </div>
              ))}
            </div>
          </div>

          <p className="text-center opacity-20 leading-relaxed" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)', fontSize: '0.55rem', letterSpacing: '0.05em' }}>
            틀린다는 것은<br/>또 다른 결과값의<br/>도출이랍니다.
          </p>

          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(0,17,60,0.15))' }} />
            <span style={{ color: 'var(--char-red)', fontSize: '0.5rem' }}>✦</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(0,17,60,0.15))' }} />
          </div>
        </div>

        {/* 오른쪽: 어니스트 */}
        <CharacterCards index={1} />
      </div>

      {/* 레트로 뱃지 */}
      <RetroBadges />
    </div>
  )
}
