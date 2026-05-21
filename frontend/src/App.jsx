import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import { AnimatePresence, motion } from 'framer-motion'

const isRecoverableChunkError = (error) => {
  const message = String(error?.message || error || '')
  return message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('Loading chunk') ||
    message.includes('ChunkLoadError')
}

const lazyPage = (loader) => lazy(() =>
  loader().catch((error) => {
    if (typeof window !== 'undefined' && isRecoverableChunkError(error)) {
      const reloadKey = '3dsharespace:chunk-reload'

      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, '1')
        window.location.reload()
        return new Promise(() => {})
      }

      sessionStorage.removeItem(reloadKey)
    }

    throw error
  })
)

const PageLoading = () => (
  <div className="route-loading-screen" role="status" aria-live="polite">
    <div className="route-loading-box">
      <div className="route-loading-mark">3D</div>
      <div className="route-loading-bar">
        <span />
      </div>
      <p>Loading page...</p>
    </div>
  </div>
)

// Lazy load all pages for better performance
const Home = lazyPage(() => import('./pages/Home'))
const Explore = lazyPage(() => import('./pages/Explore'))
const Upload = lazyPage(() => import('./pages/Upload'))
const Login = lazyPage(() => import('./pages/Login'))
const Signup = lazyPage(() => import('./pages/Signup'))
const ForgotPassword = lazyPage(() => import('./pages/ForgotPassword'))
const ProfileView = lazyPage(() => import('./pages/ProfileView'))
const ProfileEdit = lazyPage(() => import('./pages/ProfileEdit'))
const Dashboard = lazyPage(() => import('./pages/Dashboard'))
const Tips = lazyPage(() => import('./pages/Tips'))
const ModelDetail = lazyPage(() => import('./pages/ModelDetail'))
const ModelImagePage = lazyPage(() => import('./pages/ModelImagePage'))
const ModelEdit = lazyPage(() => import('./pages/ModelEdit'))
const ModelManagement = lazyPage(() => import('./pages/ModelManagement'))
const AdminDashboard = lazyPage(() => import('./pages/AdminDashboard'))
const AdminBulkUpload = lazyPage(() => import('./pages/AdminBulkUpload'))
const PlatformRevenue = lazyPage(() => import('./pages/PlatformRevenue'))
const AdminCleanup = lazyPage(() => import('./pages/AdminCleanup'))
const AdminReports = lazyPage(() => import('./pages/AdminReports'))
const AdminModeration = lazyPage(() => import('./pages/AdminModeration'))
const AdSenseAdmin = lazyPage(() => import('./pages/AdSenseAdmin'))
const Privacy = lazyPage(() => import('./pages/Privacy'))
const Terms = lazyPage(() => import('./pages/Terms'))
const About = lazyPage(() => import('./pages/About'))
const Contact = lazyPage(() => import('./pages/Contact'))
const CommunityGuidelines = lazyPage(() => import('./pages/CommunityGuidelines'))
const Notifications = lazyPage(() => import('./pages/Notifications'))
const NotificationSettings = lazyPage(() => import('./pages/NotificationSettings'))
const Report = lazyPage(() => import('./pages/Report'))
const AuthTest = lazyPage(() => import('./components/AuthTest'))
const Earnings = lazyPage(() => import('./pages/Earnings'))
const CreatorTier = lazyPage(() => import('./pages/CreatorTier'))
const CreatorStorefront = lazyPage(() => import('./pages/CreatorStorefront'))
const Creators = lazyPage(() => import('./pages/Creators'))
const ReferralDashboard = lazyPage(() => import('./pages/ReferralDashboard'))
const GettingStarted = lazyPage(() => import('./pages/GettingStarted'))
const SearchLandingPage = lazyPage(() => import('./pages/SearchLandingPage'))
const ImageGalleryPage = lazyPage(() => import('./pages/ImageGalleryPage'))
const GuidePage = lazyPage(() => import('./pages/GuidePage'))

function App() {
  useEffect(() => {
    sessionStorage.removeItem('3dsharespace:chunk-reload')
  }, [])

  const AnimatedRoutes = () => {
    const location = useLocation()
    return (
      <ErrorBoundary resetKey={location.pathname}>
        <AnimatePresence mode="wait" initial={false}>
        <motion.div
          className="route-transition-shell"
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14, ease: 'easeOut' }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile/:userId" element={<ProfileView />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/tips" element={<Tips />} />
            <Route path="/report" element={<Report />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="/advanced-earnings" element={<Navigate to="/tips" replace />} />
            <Route path="/creator-tier" element={<CreatorTier />} />
            <Route path="/creators" element={<Creators />} />
            <Route path="/store/:creatorId" element={<CreatorStorefront />} />
            <Route path="/store/url/:customUrl" element={<CreatorStorefront />} />
            <Route path="/referrals" element={<ReferralDashboard />} />
            <Route path="/getting-started" element={<GettingStarted />} />
            <Route path="/collections" element={<SearchLandingPage />} />
            <Route path="/collections/:slug" element={<SearchLandingPage />} />
            <Route path="/free-3d-models" element={<SearchLandingPage />} />
            <Route path="/free-fbx-3d-models" element={<SearchLandingPage />} />
            <Route path="/free-blender-3d-models" element={<SearchLandingPage />} />
            <Route path="/free-obj-3d-models" element={<SearchLandingPage />} />
            <Route path="/free-stl-3d-models" element={<SearchLandingPage />} />
            <Route path="/free-glb-gltf-3d-models" element={<SearchLandingPage />} />
            <Route path="/free-game-assets" element={<SearchLandingPage />} />
            <Route path="/free-furniture-3d-models" element={<SearchLandingPage />} />
            <Route path="/free-architecture-3d-models" element={<SearchLandingPage />} />
            <Route path="/free-3d-models-for-unity" element={<SearchLandingPage />} />
            <Route path="/free-3d-models-for-unreal-engine" element={<SearchLandingPage />} />
            <Route path="/free-low-poly-3d-models" element={<SearchLandingPage />} />
            <Route path="/free-rigged-3d-models" element={<SearchLandingPage />} />
            <Route path="/free-shoes-3d-models" element={<SearchLandingPage />} />
            <Route path="/free-props-3d-models" element={<SearchLandingPage />} />
            <Route path="/free-interior-design-3d-models" element={<SearchLandingPage />} />
            <Route path="/free-3d-models/:slug" element={<SearchLandingPage />} />
            <Route path="/free-3d-model-formats/:slug" element={<SearchLandingPage />} />
            <Route path="/free-3d-model-topics/:slug" element={<SearchLandingPage />} />
            <Route path="/free-3d-model-images" element={<ImageGalleryPage />} />
            <Route path="/free-3d-model-images/:categorySlug" element={<ImageGalleryPage />} />
            <Route path="/guides/:slug" element={<GuidePage />} />
            <Route path="/model/:slug/:modelId/images/:imageSlug" element={
              <ErrorBoundary>
                <ModelImagePage />
              </ErrorBoundary>
            } />
            <Route path="/model/:slug/:modelId" element={
              <ErrorBoundary>
                <ModelDetail />
              </ErrorBoundary>
            } />
            <Route path="/model/:modelId" element={
              <ErrorBoundary>
                <ModelDetail />
              </ErrorBoundary>
            } />
            <Route path="/model/:modelId/edit" element={<ModelEdit />} />
            <Route path="/manage" element={<ModelManagement />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/bulk-upload" element={<AdminBulkUpload />} />
            <Route path="/admin/revenue" element={<PlatformRevenue />} />
            <Route path="/admin/cleanup" element={<AdminCleanup />} />
            <Route path="/admin/setup" element={<Navigate to="/admin" replace />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/moderation" element={<AdminModeration />} />
            <Route path="/admin/adsense" element={<AdSenseAdmin />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/community-guidelines" element={<CommunityGuidelines />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings/notifications" element={<NotificationSettings />} />
            <Route path="/auth-test" element={<AuthTest />} />
          </Routes>
        </motion.div>
        </AnimatePresence>
      </ErrorBoundary>
    )
  }

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Layout>
            <ErrorBoundary>
              <Suspense fallback={<PageLoading />}>
                <AnimatedRoutes />
              </Suspense>
            </ErrorBoundary>
          </Layout>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
