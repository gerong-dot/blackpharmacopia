import { NavLink } from 'react-router'
import { useSiteImage } from '../../hooks/useSiteImage'

const sections = [
  { to: '/main/about', label: 'ABOUT', desc: '소개' },
  { to: '/main/board', label: 'BOARD', desc: '게시판' },
  { to: '/main/gallery', label: 'GALLERY', desc: '갤러리' },
  { to: '/main/guestbook', label: 'GUESTBOOK', desc: '방명록' },
]

export default function MainScreen() {
  const mainBanner = useSiteImage('main_banner')

  return (
    <div className="flex flex-col items-center py-12 gap-10">
      {/* 메인 상단 배너 */}
      {mainBanner && (
        <div className="w-full max-w-3xl rounded overflow-hidden" style={{ maxHeight: '320px' }}>
          <img src={mainBanner} alt="main banner" className="w-full h-full object-cover block" />
        </div>
      )}

      <div className="text-center">
        <h2
          className="mb-3"
          style={{ fontFamily: 'var(--font-deco)', fontSize: 'clamp(2rem, 6vw, 3.5rem)', color: 'var(--char-blue)' }}
        >
          welcome
        </h2>
        <p className="text-sm opacity-70 max-w-sm mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-serif)', color: 'var(--char-blue)' }}>
          틀린다는 것은 또 다른 결과값의 도출이랍니다.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
        {sections.map(({ to, label, desc }) => (
          <NavLink
            key={to}
            to={to}
            className="flex flex-col items-center justify-center gap-1 py-8 rounded border transition-all hover:shadow-md group"
            style={{ borderColor: 'rgba(0,17,60,0.15)', background: 'rgba(0,17,60,0.03)' }}
          >
            <span
              className="text-sm tracking-widest font-semibold"
              style={{ fontFamily: 'var(--font-title)', color: 'var(--char-blue)', opacity: 0.8 }}
            >
              {label}
            </span>
            <span className="text-xs opacity-40" style={{ fontFamily: 'var(--font-sans)' }}>
              {desc}
            </span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}
