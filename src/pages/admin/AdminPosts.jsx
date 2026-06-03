import Header from '../../components/Header'
import Footer from '../../components/Footer'

const AdminPosts = () => (
  <div>
    <Header />
    <div style={{ minHeight: '70vh', padding: '3rem 1rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', color: '#ff6b6b', marginBottom: '1rem' }}>Manage Posts</h1>
      <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>Review and moderate posted items.</p>
    </div>
    <Footer />
  </div>
)

export default AdminPosts
