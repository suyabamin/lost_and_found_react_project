import Header from '../components/Header'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import { FaHome } from 'react-icons/fa'

const NotFound = () => {
  return (
    <div>
      <Header />
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '2rem'
      }}>
        <h1 style={{ fontSize: '4rem', color: '#00cfe8', marginBottom: '1rem' }}>404</h1>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Page Not Found</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '2rem', fontSize: '1.1rem' }}>
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" style={{
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #00cfe8 0%, #00a8c4 100%)',
          color: 'white',
          borderRadius: '8px',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: '600'
        }}>
          <FaHome /> Go Home
        </Link>
      </div>
      <Footer />
    </div>
  )
}

export default NotFound
