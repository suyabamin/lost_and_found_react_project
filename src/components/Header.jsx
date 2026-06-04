import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import styles from './Header.module.css'
import { FaHeart, FaBars, FaTimes, FaHome, FaSearch, FaPlus, FaComments, FaUser, FaSignOutAlt, FaTachometerAlt, FaBell, FaSun, FaMoon } from 'react-icons/fa'
import NotificationBell from './NotificationBell'

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <FaHeart className={styles.logoIcon} />
            <span>Lost &amp; Found</span>
          </Link>

          {/* Desktop Nav Links */}
          {isAuthenticated && (
            <div className={styles.navLinks}>
              <Link to="/dashboard" className={isActive('/dashboard') ? styles.activeLink : ''}>
                <FaHome /> Dashboard
              </Link>
              <Link to="/browse" className={isActive('/browse') ? styles.activeLink : ''}>
                <FaSearch /> Browse
              </Link>
              <Link to="/post/create" className={isActive('/post/create') ? styles.activeLink : ''}>
                <FaPlus /> Post Item
              </Link>
              <Link to="/chat" className={isActive('/chat') ? styles.activeLink : ''}>
                <FaComments /> Messages
              </Link>
              <Link to="/favorites" className={isActive('/favorites') ? styles.activeLink : ''}>
                <FaHeart /> Favorites
              </Link>
              <NotificationBell />
            </div>
          )}

          {/* Desktop Auth Buttons */}
          <div className={styles.navActions}>
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link to="/admin" className={styles.adminLink}>
                    <FaTachometerAlt /> Admin
                  </Link>
                )}
                {/* Theme Toggle */}
                <button
                  className={styles.themeToggle}
                  onClick={toggleTheme}
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label="Toggle dark mode"
                >
                  {isDark ? <FaSun /> : <FaMoon />}
                </button>
                {/* Profile Picture — click goes to /profile */}
                <Link to="/profile" className={styles.userProfile} title="View Profile">
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=14B8A6&color=fff&bold=true&size=80`}
                    alt={user?.name}
                    className={styles.avatar}
                  />
                  <span className={styles.userName}>{user?.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.loginBtn}>Login</Link>
                <Link to="/register" className={styles.signupBtn}>Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={styles.menuToggle}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/browse" onClick={() => setMenuOpen(false)}>Browse</Link>
              <Link to="/post/create" onClick={() => setMenuOpen(false)}>Post Item</Link>
              <Link to="/chat" onClick={() => setMenuOpen(false)}>Messages</Link>
              <Link to="/notifications" onClick={() => setMenuOpen(false)}>Notifications</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
              )}
              <button
                onClick={() => { toggleTheme(); setMenuOpen(false) }}
                className={styles.themeToggleMobile}
              >
                {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              <button onClick={() => {
                handleLogout()
                setMenuOpen(false)
              }} className={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}

export default Header
