import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { useAuth } from './contexts/AuthContext'
import MainLayout from './components/MainLayout'

const MainScreen  = lazy(() => import('./pages/Main'))
const AboutPage   = lazy(() => import('./pages/About'))
const BoardPage   = lazy(() => import('./pages/Board'))
const PostDetail  = lazy(() => import('./pages/Board/PostDetail'))
const PostEditor  = lazy(() => import('./pages/Board/PostEditor'))
const GalleryPage = lazy(() => import('./pages/Gallery'))
const GuestbookPage = lazy(() => import('./pages/Guestbook'))
const SiteImages  = lazy(() => import('./pages/Admin/SiteImages'))

function Loading() {
  return (
    <div className="py-20 text-center opacity-30" style={{ fontFamily: 'var(--font-deco)', fontSize: '1.5rem', color: 'var(--char-blue)' }}>
      loading...
    </div>
  )
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  if (loading) return null
  if (!profile?.is_admin) return <Navigate to="/main" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/main" replace />} />
      <Route path="/main" element={<MainLayout />}>
        <Route index element={<Suspense fallback={<Loading />}><MainScreen /></Suspense>} />
        <Route path="about" element={<Suspense fallback={<Loading />}><AboutPage /></Suspense>} />
        <Route path="board" element={<Suspense fallback={<Loading />}><BoardPage /></Suspense>} />
        <Route path="board/:id" element={<Suspense fallback={<Loading />}><PostDetail /></Suspense>} />
        <Route path="board/new" element={<AdminRoute><Suspense fallback={<Loading />}><PostEditor /></Suspense></AdminRoute>} />
        <Route path="board/:id/edit" element={<AdminRoute><Suspense fallback={<Loading />}><PostEditor /></Suspense></AdminRoute>} />
        <Route path="gallery" element={<Suspense fallback={<Loading />}><GalleryPage /></Suspense>} />
        <Route path="guestbook" element={<Suspense fallback={<Loading />}><GuestbookPage /></Suspense>} />
        <Route path="admin/images" element={<AdminRoute><Suspense fallback={<Loading />}><SiteImages /></Suspense></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/main" replace />} />
    </Routes>
  )
}
