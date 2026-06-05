import { Routes, Route, Navigate } from 'react-router'
import { useAuth } from './contexts/AuthContext'
import MainLayout from './components/MainLayout'
import MainScreen from './pages/Main'
import AboutPage from './pages/About'
import BoardPage from './pages/Board'
import PostDetail from './pages/Board/PostDetail'
import PostEditor from './pages/Board/PostEditor'
import GalleryPage from './pages/Gallery'
import GuestbookPage from './pages/Guestbook'
import SiteImages from './pages/Admin/SiteImages'

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
        <Route index element={<MainScreen />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="board" element={<BoardPage />} />
        <Route path="board/:id" element={<PostDetail />} />
        <Route path="board/new" element={<AdminRoute><PostEditor /></AdminRoute>} />
        <Route path="board/:id/edit" element={<AdminRoute><PostEditor /></AdminRoute>} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="guestbook" element={<GuestbookPage />} />
        <Route path="admin/images" element={<AdminRoute><SiteImages /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/main" replace />} />
    </Routes>
  )
}
