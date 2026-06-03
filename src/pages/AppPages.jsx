import Header from '../components/Header'
import Footer from '../components/Footer'

const PlaceholderPage = ({ title, description }) => {
  return (
    <div>
      <Header />
      <div style={{
        minHeight: '70vh',
        padding: '3rem 1rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', color: '#00cfe8', marginBottom: '1rem' }}>
          {title}
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '1.1rem', marginBottom: '2rem' }}>
          {description || 'This feature is under construction. Stay tuned!'}
        </p>
      </div>
      <Footer />
    </div>
  )
}

const DashboardPage = () => (
  <PlaceholderPage 
    title="Dashboard" 
    description="Your personal dashboard with statistics and quick actions." 
  />
)

const BrowseListingPage = () => (
  <PlaceholderPage 
    title="Browse Listings" 
    description="Search and browse lost and found items in your area." 
  />
)

const CreatePostPage = () => (
  <PlaceholderPage 
    title="Post Item" 
    description="Report a lost or found item with photos and details." 
  />
)

const PostDetailsPage = () => (
  <PlaceholderPage 
    title="Item Details" 
    description="View complete information about this item." 
  />
)

const ChatPage = () => (
  <PlaceholderPage 
    title="Chat" 
    description="Communicate securely with item owners and finders." 
  />
)

const ConversationsPage = () => (
  <PlaceholderPage 
    title="Messages" 
    description="View all your conversations in one place." 
  />
)

const ProfilePage = () => (
  <PlaceholderPage 
    title="Profile" 
    description="Manage your account settings and preferences." 
  />
)

export {
  DashboardPage,
  BrowseListingPage,
  CreatePostPage,
  PostDetailsPage,
  ChatPage,
  ConversationsPage,
  ProfilePage
}
