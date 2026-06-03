import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaBell, FaSpinner } from 'react-icons/fa'
import notificationsService from '../services/notificationsService'
import styles from './NotificationBell.module.css'

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [recentNotifications, setRecentNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUnreadCount()
    const timer = setInterval(fetchUnreadCount, 60000)
    return () => clearInterval(timer)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationsService.getUnreadCount()
      setUnreadCount(res.data.unread_count || 0)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }

  const handleToggle = async () => {
    if (!showDropdown) {
      setLoading(true)
      setShowDropdown(true)
      try {
        const res = await notificationsService.getNotifications()
        setRecentNotifications(res.data.notifications.slice(0, 5))
      } catch (err) {
        console.error('Failed to fetch notifications:', err)
      } finally {
        setLoading(false)
      }
    } else {
      setShowDropdown(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await notificationsService.markAsRead(id)
      setRecentNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark read:', err)
    }
  }

  return (
    <div className={styles.notificationBellContainer}>
      <button 
        className={`${styles.bellBtn} ${unreadCount > 0 ? styles.hasUnread : ''}`}
        onClick={handleToggle}
        title="Notifications"
      >
        <FaBell />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h3>Notifications</h3>
            <Link to="/notifications" onClick={() => setShowDropdown(false)}>View All</Link>
          </div>
          <div className={styles.notificationList}>
            {loading ? (
              <div className={styles.loader}><FaSpinner className={styles.spin} /></div>
            ) : recentNotifications.length === 0 ? (
              <div className={styles.empty}>No notifications</div>
            ) : (
              recentNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`${styles.notificationItem} ${!notification.is_read ? styles.unread : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={styles.notifType}>{notification.type === 'message' ? '💬' : '🔔'}</div>
                  <div className={styles.notifContent}>
                    <p>{notification.message}</p>
                    <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {showDropdown && <div className={styles.overlay} onClick={() => setShowDropdown(false)} />}
    </div>
  )
}

export default NotificationBell
