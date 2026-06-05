import { useEffect, useState } from 'react'
import { useSiteImage } from '../../hooks/useSiteImage'
import CharacterCards from '../../components/CharacterCards'
import RetroBadges from '../../components/RetrodBadges'
import PanelImage from '../../components/PanelImage'

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
  const { url: mainBanner } = useSiteImage('main_banner')
  const [dday, setDday] = useState(getDday)
  const [time, setTime] = useState(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => { setDday(getDday()); setTime(getTimeLeft()) }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* 배너 — 고정 높이로 수정 */}
      {mainBanner && (
        <div className="w-full rounded-sm overflow-hidden border" style={{ borderColor: 'rgba(0,17,60,0.1)', aspectRatio: '16 / 7' }}>
          <img
            src={mainBanner}
            alt="banner"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 50%', display: 'block' }}
          />
        </div>
      )}

      {/* 3컬럼: 우리엘 | D-day | 어니스트 */}
      <div className="grid grid-cols-3 gap-3 items-start">
        {/* 왼쪽: 우리엘 */}
        <CharacterCards index={0} />

        {/* 가운데: D-day */}
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(0,17,60,0.15))' }} />
            <span style={{ color: 'var(--char-red)', fontSize: '0.6rem' }}>✦</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(0,17,60,0.15))' }} />
          </div>

          {/* 날짜 */}
          <p className="tracking-widest opacity-50" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)', fontSize: '1rem' }}>
            2026 · 01 · 07
          </p>

          {/* D-day 숫자 */}
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--char-blue)', opacity: 0.5 }}>
                D +
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem, 8vw, 5.5rem)', color: 'var(--char-blue)', lineHeight: 1, fontWeight: 700 }}>
                {Math.abs(dday)}
              </span>
            </div>

            {/* 시간 */}
            <div className="flex items-center justify-center gap-2 mt-2">
              {[time.h, time.m, time.s].map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <span style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', color: 'var(--char-blue)', fontWeight: 600, letterSpacing: '0.05em' }}>{v}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--char-blue)', opacity: 0.25, fontSize: '0.6rem' }}>{['HH','MM','SS'][i]}</span>
                  </div>
                  {i < 2 && <span className="opacity-20 mb-3" style={{ color: 'var(--char-blue)', fontSize: '1rem' }}>:</span>}
                </div>
              ))}
            </div>
          </div>

          {/* 인용구 — 선 제거 */}
          <p className="text-center leading-relaxed opacity-50" style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)', fontSize: '0.8rem', letterSpacing: '0.06em' }}>
            틀린다는 것은<br/>또 다른 결과값의<br/>도출이랍니다.
          </p>

          {/* 센터 하단 이미지 슬롯 */}
          <PanelImage settingKey="dday_bottom_image" aspectClass="aspect-square" />
        </div>

        {/* 오른쪽: 어니스트 */}
        <CharacterCards index={1} />
      </div>

      {/* 레트로 뱃지 */}
      <RetroBadges />
    </div>
  )
}
