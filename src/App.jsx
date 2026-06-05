import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import BrowseListingPage from './pages/BrowseListingPage'
import CreatePostPage from './pages/CreatePostPage'
import PostDetailsPage from './pages/PostDetailsPage'
import ChatPage from './pages/ChatPage'
import ConversationsPage from './pages/ConversationsPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import Favorites from './pages/Favorites'
import ClaimOwnership from './pages/ClaimOwnership'
import MapView from './pages/MapView'
import ClaimListingPage from './pages/ClaimListingPage'
import PoliceGD from './pages/PoliceGD'
import Analytics from './pages/Analytics'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPosts from './pages/admin/AdminPosts'
import AdminReports from './pages/admin/AdminReports'
import AdminClaims from './pages/admin/AdminClaims'
import AdminModeration from './pages/admin/AdminModeration'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminStats from './pages/admin/AdminStats'
import AdminLogs from './pages/admin/AdminLogs'
import AdminSettings from './pages/admin/AdminSettings'
import TrackingPage from './pages/TrackingPage'
import ReturnItemPage from './pages/ReturnItemPage'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/tracking/:sessionId" element={<TrackingPage />} />
            <Route path="/return-item/:trackingId" element={<ReturnItemPage />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/browse" element={<ProtectedRoute><BrowseListingPage /></ProtectedRoute>} />
            <Route path="/category/:category" element={<ProtectedRoute><BrowseListingPage /></ProtectedRoute>} />
            <Route path="/post/create" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
            <Route path="/post/:id" element={<ProtectedRoute><PostDetailsPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ConversationsPage /></ProtectedRoute>} />
            <Route path="/chat/:id" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
            <Route path="/claim" element={<ProtectedRoute><ClaimListingPage /></ProtectedRoute>} />
            <Route path="/claim/:id" element={<ProtectedRoute><ClaimOwnership /></ProtectedRoute>} />
            <Route path="/police-gd" element={<ProtectedRoute><PoliceGD /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/tracking/:sessionId" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/posts" element={<AdminRoute><AdminPosts /></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
            <Route path="/admin/claims" element={<AdminRoute><AdminClaims /></AdminRoute>} />
            <Route path="/admin/moderation" element={<AdminRoute><AdminModeration /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
            <Route path="/admin/stats" element={<AdminRoute><AdminStats /></AdminRoute>} />
            <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
