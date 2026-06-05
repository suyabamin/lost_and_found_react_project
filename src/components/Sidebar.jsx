import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Sidebar.module.css'
import { FaHome, FaSearch, FaPlusSquare, FaUser, FaQuestionCircle, FaComments, FaBell, FaTachometerAlt } from 'react-icons/fa'

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuth()

  const navItems = [
    { to: '/dashboard', icon: <FaHome />, label: 'Home' },
    { to: '/browse', icon: <FaSearch />, label: 'Browse' },
    { to: '/post/create', icon: <FaPlusSquare />, label: 'Post Item' },
    { to: '/notifications', icon: <FaBell />, label: 'Notifications' },
    { to: '/chat', icon: <FaComments />, label: 'Messages' },
    { to: '/profile', icon: <FaUser />, label: 'Profile' },
  ]

  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', icon: <FaTachometerAlt />, label: 'Admin Panel' })
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
        <div className={styles.logoIcon}>🔍</div>
        <div className={styles.logoText}>Lost<span>&amp;Found</span></div>
      </div>

      <ul className={styles.navLinks}>
        {navItems.map(item => (
          <li key={item.to} className={styles.navItem}>
            <Link
              to={item.to}
              className={location.pathname === item.to ? styles.active : ''}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.sidebarFooter}>
        <Link to="/profile" className={styles.userProfileMini}>
          <img 
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=14B8A6&color=fff`} 
            alt="Profile" 
            className={styles.miniAvatar}
          />
          <div className={styles.miniInfo}>
            <span className={styles.miniName}>{user?.name?.split(' ')[0] || 'User'}</span>
            <span className={styles.miniRole}>{user?.role || 'Member'}</span>
          </div>
        </Link>
        <div className={styles.helpBtn}>
          <FaQuestionCircle /> Help
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
