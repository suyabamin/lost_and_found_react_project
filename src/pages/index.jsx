import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

const placeholderPageComponent = (pageTitle) => {
  const DynamicPage = () => {
    const { user } = useAuth()
    return (
      <div>
        <Header />
        <div style={{
          minHeight: '70vh',
          padding: '3rem 1rem',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2.5rem', color: '#00cfe8', marginBottom: '1rem' }}>
            {pageTitle}
          </h1>
          <p style={{ color: '#7f8c8d', fontSize: '1.1rem', marginBottom: '2rem' }}>
            This page is under construction. Welcome {user?.name}!
          </p>
          <p style={{ color: '#95a5a6', fontSize: '0.95rem' }}>
            Coming soon with full functionality...
          </p>
        </div>
        <Footer />
      </div>
    )
  }
  return DynamicPage
}

export const DashboardPage = placeholderPageComponent('Dashboard')()
export const BrowseListingPage = placeholderPageComponent('Browse Listings')()
export const CreatePostPage = placeholderPageComponent('Create Post')()
export const PostDetailsPage = placeholderPageComponent('Post Details')()
export const ChatPage = placeholderPageComponent('Chat')()
export const ConversationsPage = placeholderPageComponent('Messages')()
export const ProfilePage = placeholderPageComponent('Profile')()

const AdminDashboard = placeholderPageComponent('Admin Dashboard')()
const AdminUsers = placeholderPageComponent('Manage Users')()
const AdminPosts = placeholderPageComponent('Manage Posts')()
const AdminReports = placeholderPageComponent('Manage Reports')()

export { AdminDashboard, AdminUsers, AdminPosts, AdminReports }
