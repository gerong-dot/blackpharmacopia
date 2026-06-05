import { useState } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Menu, X, ImagePlay } from 'lucide-react'

const navItems = [
  { to: '/main', label: 'HOME', end: true },
  { to: '/main/about', label: 'ABOUT' },
  { to: '/main/board', label: 'BOARD' },
  { to: '/main/gallery', label: 'GALLERY' },
  { to: '/main/guestbook', label: 'GUESTBOOK' },
]

export default function MainLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* 헤더 */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b"
        style={{ background: 'var(--char-blue)', borderColor: 'rgba(195,195,195,0.15)' }}
      >
        <NavLink
          to="/main"
          className="text-white"
          style={{ fontFamily: 'var(--font-deco)', fontSize: '1.6rem', letterSpacing: '0.02em' }}
        >
          blackpharmacopia
        </NavLink>

        {/* 데스크탑 네비 */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `text-sm tracking-widest transition-colors ${isActive ? 'text-white font-semibold' : 'text-white/60 hover:text-white'}`
              }
              style={{ fontFamily: 'var(--font-title)' }}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden md:block text-white/50 text-xs" style={{ fontFamily: 'var(--font-sans)' }}>
            {profile?.username}
          </span>
          {profile?.is_admin && (
            <Link to="/main/admin/images" className="text-white/60 hover:text-white transition-colors" title="이미지 관리">
              <ImagePlay size={18} />
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="text-white/60 hover:text-white transition-colors"
            title="로그아웃"
          >
            <LogOut size={18} />
          </button>
          {/* 모바일 햄버거 */}
          <button
            className="md:hidden text-white/60 hover:text-white ml-2"
            onClick={() => setMenuOpen(v => !v)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <nav
          className="md:hidden flex flex-col px-6 py-4 gap-4 border-b"
          style={{ background: 'var(--char-blue)', borderColor: 'rgba(195,195,195,0.15)' }}
        >
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `text-sm tracking-widest ${isActive ? 'text-white font-semibold' : 'text-white/60'}`
              }
              style={{ fontFamily: 'var(--font-title)' }}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}

      {/* 콘텐츠 */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* 푸터 */}
      <footer
        className="text-center py-6 text-xs"
        style={{ color: 'var(--char-blue)', opacity: 0.5, fontFamily: 'var(--font-title)' }}
      >
        © blackpharmacopia
      </footer>
    </div>
  )
}
