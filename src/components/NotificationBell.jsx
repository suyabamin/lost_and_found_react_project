import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBell, FaCheck, FaCheckDouble, FaExternalLinkAlt, FaSpinner } from 'react-icons/fa'
import apiClient from '../services/api'
import styles from './NotificationBell.module.css'

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 10000)
    
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const res = await apiClient.get('/notifications/unread-count')
      setUnreadCount(res.data.count)
    } catch (err) {
      console.error('Failed to fetch unread count', err)
    }
  }

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/notifications')
      setNotifications(res.data.notifications)
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBellClick = () => {
    setShowDropdown(!showDropdown)
    if (!showDropdown) {
      fetchNotifications()
    }
  }

  const markAsRead = async (e, id) => {
      e.stopPropagation()
      try {
          await apiClient.post(`/notifications/${id}/read`)
          setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n))
          fetchUnreadCount()
      } catch (err) {
          console.error(err)
      }
  }

  const markAllAsRead = async () => {
      try {
          await apiClient.post('/notifications/read-all')
          setNotifications(notifications.map(n => ({ ...n, is_read: 1 })))
          setUnreadCount(0)
      } catch (err) {
          console.error(err)
      }
  }

  const handleNotificationClick = (n) => {
      if (!n.is_read) {
          apiClient.post(`/notifications/${n.id}/read`).then(fetchUnreadCount)
      }
      setShowDropdown(false)
      
      // Navigate based on type
      if (n.type === 'message' && n.reference_id) navigate(`/chat/${n.reference_id}`)
      else if (n.type === 'claim' && n.reference_id) navigate(`/post/${n.reference_id}`)
      else if (n.type === 'tracking' && n.reference_id) navigate(`/tracking/${n.reference_id}`)
      else navigate('/notifications')
  }

  return (
    <div className={styles.bellContainer} ref={dropdownRef}>
      <button className={styles.bellBtn} onClick={handleBellClick}>
        <FaBell />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
                <button onClick={markAllAsRead} className={styles.markAllBtn}>
                    <FaCheckDouble /> Mark all read
                </button>
            )}
          </div>

          <div className={styles.dropdownList}>
            {loading ? (
                <div className={styles.loading}><FaSpinner className={styles.spin} /></div>
            ) : notifications.length > 0 ? (
                notifications.map(n => (
                    <div 
                        key={n.id} 
                        className={`${styles.item} ${!n.is_read ? styles.unread : ''}`}
                        onClick={() => handleNotificationClick(n)}
                    >
                        <div className={styles.itemContent}>
                            <h4 className={styles.itemTitle}>{n.title}</h4>
                            <p className={styles.itemMessage}>{n.message}</p>
                            <span className={styles.itemTime}>{n.time_ago}</span>
                        </div>
                        <div className={styles.itemActions}>
                            {!n.is_read && (
                                <button 
                                    className={styles.readBtn} 
                                    onClick={(e) => markAsRead(e, n.id)}
                                    title="Mark as read"
                                >
                                    <FaCheck />
                                </button>
                            )}
                            <FaExternalLinkAlt className={styles.linkIcon} />
                        </div>
                    </div>
                ))
            ) : (
                <div className={styles.empty}>No notifications yet.</div>
            )}
          </div>

          <div className={styles.dropdownFooter}>
            <Link to="/notifications" onClick={() => setShowDropdown(false)}>
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
