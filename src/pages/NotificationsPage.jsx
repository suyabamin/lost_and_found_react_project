import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import notificationsService from '../services/notificationsService'
import claimsService from '../services/claimsService'
import ReviewClaimAnswers from '../components/ReviewClaimAnswers'
import Swal from 'sweetalert2'
import {
  FaBell, FaCheckCircle, FaInfoCircle,
  FaTrash, FaCheck, FaEnvelope, FaEnvelopeOpen,
  FaHandshake, FaSearch, FaTimesCircle, FaSpinner,
  FaBoxOpen, FaUser, FaPhone, FaFileAlt, FaImage,
  FaTimes, FaThumbsUp, FaThumbsDown, FaComments,
  FaShieldAlt, FaMapMarkerAlt, FaGem, FaStar
} from 'react-icons/fa'
import styles from '../styles/pages/Notifications.module.css'

import BackButton from '../components/BackButton'

// ─── Claim Detail Modal ──────────────────────────────────────────────────────
const ClaimModal = ({ claim, onClose, onApprove, onDeny, loading }) => {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}><FaTimes /></button>

        {loading || !claim ? (
          <div className={styles.loadingCenter} style={{ padding: '60px' }}>
            <FaSpinner className="spin" size={40} color="var(--primary)" />
            <p style={{ marginTop: '16px', fontWeight: '700' }}>Loading claim details...</p>
          </div>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <FaHandshake className={styles.modalHeaderIcon} />
              <h2>Claim Request</h2>
              <span className={`${styles.statusBadge} ${styles[claim.status]}`}>
                {claim.status}
              </span>
            </div>

            {/* Item info */}
            <div className={styles.modalItemRow}>
              {claim.item_image && (
                <img src={claim.item_image} alt={claim.item_title} className={styles.modalItemImg} />
              )}
              <div>
                <p className={styles.modalItemLabel}>Item</p>
                <h3 className={styles.modalItemTitle}>{claim.item_title}</h3>
                {claim.item_location && (
                  <p className={styles.modalItemSub}>📍 {claim.item_location}</p>
                )}
              </div>
            </div>

            <hr className={styles.divider} />

            {/* Claimant info */}
            <div className={styles.modalSection}>
              <h4><FaUser /> Claimant</h4>
              <div className={styles.claimantRow}>
                <img
                  src={claim.claimant_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(claim.claimant_name)}&background=00A9B5&color=fff&bold=true`}
                  alt={claim.claimant_name}
                  className={styles.claimantAvatar}
                />
                <div>
                  <p className={styles.claimantName}>{claim.claimant_name}</p>
                  <p className={styles.claimantEmail}>{claim.claimant_email}</p>
                  {claim.contact_info && <p className={styles.claimantPhone}><FaPhone /> {claim.contact_info}</p>}
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className={styles.modalSection}>
              <h4><FaFileAlt /> Reason for Claim</h4>
              <p className={styles.modalText}>{claim.reason || '—'}</p>
            </div>

            {/* Proof description */}
            {claim.proof_description && (
              <div className={styles.modalSection}>
                <h4><FaFileAlt /> Proof Description</h4>
                <p className={styles.modalText}>{claim.proof_description}</p>
              </div>
            )}

            {/* Verification Questions Answers */}
            <ReviewClaimAnswers answers={claim.answers} />

            {/* Proof image */}
            {claim.proof_image && (
              <div className={styles.modalSection}>
                <h4><FaImage /> Evidence Photo</h4>
                <img src={claim.proof_image} alt="Evidence" className={styles.proofImage} />
              </div>
            )}

            {/* Actions — only show if claim is still pending */}
            {claim.status === 'pending' && (
              <div className={styles.modalActions}>
                <button
                  className={styles.denyBtn}
                  onClick={() => onDeny(claim.id)}
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="spin" /> : <FaThumbsDown />}
                  Deny Claim
                </button>
                <button
                  className={styles.approveBtn}
                  onClick={() => onApprove(claim.id)}
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="spin" /> : <FaThumbsUp />}
                  Approve & Open Chat
                </button>
              </div>
            )}

            {claim.status === 'approved' && (
              <div className={styles.modalApprovedNote}>
                <FaCheckCircle /> Claim approved — chat has been opened with claimant.
              </div>
            )}
            {claim.status === 'rejected' && (
              <div className={styles.modalRejectedNote}>
                <FaTimesCircle /> This claim was denied.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
const NotificationsPage = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [claimModal, setClaimModal] = useState(null) // claim object or null
  const [claimLoading, setClaimLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationsService.getNotifications()
      setNotifications(res.data.notifications || [])
    } catch (err) {
      console.error('Notifications fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()

    // Handle Deep Linking / Navigation simulation
    const params = new URLSearchParams(window.location.search)
    const openClaimId = params.get('openClaim')
    if (openClaimId) {
      handleNotificationClick({ type: 'claim', reference_id: openClaimId, is_read: true })
    }
  }, [fetchNotifications])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markAllRead = async () => {
    try {
      await notificationsService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
    } catch (err) { console.error(err) }
  }

  const toggleRead = async (id, currentRead) => {
    try {
      if (!currentRead) {
        await notificationsService.markAsRead(id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n))
      } else {
        // No unread API, just toggle visually
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 0 } : n))
      }
    } catch (err) { console.error(err) }
  }

  const deleteNotification = async (id) => {
    try {
      await notificationsService.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) { console.error(err) }
  }

  const clearAll = async () => {
    const result = await Swal.fire({
      title: 'Clear all notifications?',
      text: 'This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Clear All',
      confirmButtonColor: '#ef4444',
      background: 'var(--card-bg, #1e293b)',
      color: 'var(--text-main, #e2e8f0)'
    })
    if (!result.isConfirmed) return
    setActionLoading(true)
    try {
      await Promise.all(notifications.map(n => notificationsService.deleteNotification(n.id)))
      setNotifications([])
    } catch (err) { console.error(err) }
    finally { setActionLoading(false) }
  }

  // Parse reference_id JSON from notification
  const parseRef = (notif) => {
    try {
      if (notif.reference_id) {
        const parsed = JSON.parse(notif.reference_id)
        return typeof parsed === 'object' && parsed !== null ? parsed : {}
      }
    } catch { }
    return {}
  }

  // Handle clicking a notification
  const handleNotificationClick = async (notif) => {
    // Mark as read
    if (!notif.is_read) {
      notificationsService.markAsRead(notif.id)
        .then(() => {
          setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: 1 } : n))
        })
        .catch(err => console.error('Error marking as read:', err))
    }

    const ref = parseRef(notif)
    const refId = notif.reference_id

    // 1. Claim Request (Received by Founder)
    if (notif.type === 'claim') {
      const claimId = ref.claim_id || ref.id || refId
      if (claimId && !isNaN(claimId)) {
        setClaimLoading(true)
        setClaimModal({ id: claimId }) // Use a dummy object with ID to show it's loading
        try {
          const res = await claimsService.getClaimById(claimId)
          if (res.data?.claim) {
            setClaimModal(res.data.claim)
          } else {
            throw new Error('Claim data not found')
          }
        } catch (err) {
          console.error('[NOTIF] Claim fetch error:', err)
          setClaimModal(null)
          Swal.fire({
            icon: 'error',
            title: 'Claim Not Found',
            text: 'This claim may have been deleted or processed already.',
            confirmButtonColor: '#ef4444'
          })
        } finally {
          setClaimLoading(false)
        }
        return
      }
    }

    // 2. Chat / Messages
    if (notif.type === 'message' || notif.type === 'claim_approved') {
      const convId = ref.conversation_id || refId
      if (convId) {
        navigate(`/chat/${convId}`)
      } else {
        navigate('/chat')
      }
      return
    }

    // 3. Tracking / Return / Reward / Rating
    if (['tracking', 'return', 'reward', 'rating'].includes(notif.type)) {
      const trackingId = ref.tracking_id || refId
      if (trackingId) {
        navigate(`/tracking/${trackingId}`)
      }
      return
    }

    // 4. Default / Fallback: Try to navigate to item if we have any reference
    const targetItemId = ref.item_id || ref.post_id || (!isNaN(refId) ? refId : null)
    if (targetItemId) {
      navigate(`/post/${targetItemId}`)
    }
  }

  // Founder approves claim
  const handleApprove = async (claimId) => {
    setClaimLoading(true)
    try {
      const res = await claimsService.founderRespond(claimId, 'approved')
      const convId = res.data.conversation_id
      setClaimModal(prev => ({ ...prev, status: 'approved' }))
      await fetchNotifications()
      Swal.fire({
        icon: 'success',
        title: '✅ Claim Approved!',
        text: 'A chat has been opened with the claimant. You can now talk!',
        confirmButtonText: 'Go to Chat',
        confirmButtonColor: '#00cfe8',
        background: 'var(--card-bg, #1e293b)',
        color: 'var(--text-main, #e2e8f0)'
      }).then(r => {
        if (r.isConfirmed && convId) navigate(`/chat/${convId}`)
        setClaimModal(null)
      })
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Could not approve claim.', 'error')
    } finally {
      setClaimLoading(false)
    }
  }

  // Founder denies claim
  const handleDeny = async (claimId) => {
    const result = await Swal.fire({
      title: 'Deny this claim?',
      text: 'The claimant will be notified.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Deny',
      confirmButtonColor: '#ef4444',
      background: 'var(--card-bg, #1e293b)',
      color: 'var(--text-main, #e2e8f0)'
    })
    if (!result.isConfirmed) return

    setClaimLoading(true)
    try {
      await claimsService.founderRespond(claimId, 'rejected')
      setClaimModal(prev => ({ ...prev, status: 'rejected' }))
      await fetchNotifications()
      Swal.fire({
        icon: 'info',
        title: 'Claim Denied',
        text: 'The claimant has been notified.',
        background: 'var(--card-bg, #1e293b)',
        color: 'var(--text-main, #e2e8f0)'
      }).then(() => setClaimModal(null))
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Could not deny claim.', 'error')
    } finally {
      setClaimLoading(false)
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'match': return <FaHandshake style={{ color: '#14B8A6' }} />
      case 'claim': return <FaHandshake style={{ color: '#f59e0b' }} />
      case 'admin_claim': return <FaShieldAlt style={{ color: '#0ea5e9' }} />
      case 'admin_alert': return <FaBell style={{ color: '#ef4444' }} />
      case 'claim_approved': return <FaCheckCircle style={{ color: '#22c55e' }} />
      case 'claim_rejected': return <FaTimesCircle style={{ color: '#ef4444' }} />
      case 'message': return <FaEnvelope style={{ color: '#0ea5e9' }} />
      case 'tracking': return <FaMapMarkerAlt style={{ color: '#10b981' }} />
      case 'reward': return <FaGem style={{ color: '#f59e0b' }} />
      case 'return': return <FaBoxOpen style={{ color: '#8b5cf6' }} />
      case 'rating': return <FaStar style={{ color: '#facc15' }} />
      case 'system': return <FaInfoCircle style={{ color: '#8b5cf6' }} />
      default: return <FaBell style={{ color: '#64748b' }} />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'match': return { label: 'Match', color: '#14B8A6', bg: 'rgba(20,184,166,0.12)' }
      case 'message': return { label: 'Message', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' }
      case 'claim': return { label: 'Claim', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }
      case 'admin_claim': return { label: '🛡️ Admin Claim', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' }
      case 'admin_alert': return { label: '🚨 Admin Alert', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
      case 'claim_approved': return { label: '✅ Approved', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' }
      case 'claim_rejected': return { label: '❌ Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
      case 'tracking': return { label: '📍 Tracking', color: '#10b981', bg: 'rgba(16,185,129,0.12)' }
      case 'reward': return { label: '💎 Reward', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }
      case 'return': return { label: '📦 Return', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' }
      case 'rating': return { label: '⭐ Rating', color: '#facc15', bg: 'rgba(250,204,21,0.12)' }
      case 'system': return { label: 'System', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' }
      default: return { label: 'Info', color: '#64748b', bg: 'rgba(100,116,139,0.12)' }
    }
  }

  const isClickable = (notif) => {
    const ref = parseRef(notif)
    const refId = notif.reference_id
    if (notif.type === 'claim' && (ref.claim_id || refId)) return true
    if (notif.type === 'claim_approved' && (ref.conversation_id || refId)) return true
    if (notif.type === 'message') return true
    if (['tracking', 'return', 'reward', 'rating'].includes(notif.type) && (ref.tracking_id || refId)) return true
    // System/Info/Match usually point to a post or item
    if (['system', 'info', 'match'].includes(notif.type) && (ref.item_id || ref.post_id || refId)) return true
    return false
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.is_read) return false
    if (filter === 'read' && !n.is_read) return false
    if (typeFilter !== 'all' && n.type !== typeFilter) return false
    if (searchQuery && !n.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !n.message?.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className={styles.notificationsPage}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.contentArea}>
          <div style={{ marginBottom: '24px' }}>
            <BackButton />
          </div>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>
                <FaBell className={styles.titleIcon} />
                Notifications
                {unreadCount > 0 && (
                  <span className={styles.unreadBadge}>{unreadCount} new</span>
                )}
              </h1>
              <p className={styles.subtitle}>Stay updated with all your lost and found activities</p>
            </div>
            <div className={styles.headerActions}>
              {unreadCount > 0 && (
                <button className={styles.markAllReadBtn} onClick={markAllRead}>
                  <FaCheck /> Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button className={styles.clearAllBtn} onClick={clearAll} disabled={actionLoading}>
                  {actionLoading ? <FaSpinner className="spin" /> : <FaTrash />} Clear all
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className={styles.filterBar}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>
                  <FaTimesCircle />
                </button>
              )}
            </div>
            <div className={styles.filterChips}>
              {['all', 'unread', 'read'].map(f => (
                <button key={f} className={`${styles.chip} ${filter === f ? styles.chipActive : ''}`} onClick={() => setFilter(f)}>
                  {f === 'all' && '✨ All'}
                  {f === 'unread' && `📬 Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                  {f === 'read' && '📖 Read'}
                </button>
              ))}
            </div>
            <div className={styles.filterChips}>
              {['all', 'match', 'message', 'claim', 'admin_claim', 'system'].map(t => (
                <button key={t} className={`${styles.chip} ${typeFilter === t ? styles.chipActive : ''}`} onClick={() => setTypeFilter(t)}>
                  {t === 'all' && 'All Types'}
                  {t === 'match' && '🤝 Matches'}
                  {t === 'message' && '💬 Messages'}
                  {t === 'claim' && '✅ Claims'}
                  {t === 'admin_claim' && '🛡️ Admin'}
                  {t === 'system' && 'ℹ️ System'}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className={styles.loadingCenter}>
              <FaSpinner className="spin" size={32} />
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔔</div>
              <h3>No notifications</h3>
              <p>
                {searchQuery
                  ? 'No notifications match your search.'
                  : filter === 'unread'
                    ? "You're all caught up! No unread notifications."
                    : 'No notifications found.'}
              </p>
              {(searchQuery || filter !== 'all' || typeFilter !== 'all') && (
                <button className={styles.resetBtn} onClick={() => { setSearchQuery(''); setFilter('all'); setTypeFilter('all') }}>
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className={styles.notifList}>
              {filteredNotifications.map(notif => {
                const typeInfo = getTypeLabel(notif.type)
                const clickable = isClickable(notif)
                const ref = parseRef(notif)
                const refId = notif.reference_id
                return (
                  <div
                    key={notif.id}
                    className={`${styles.notifCard} ${!notif.is_read ? styles.unread : ''} ${clickable ? styles.clickable : ''}`}
                    onClick={() => clickable && handleNotificationClick(notif)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && clickable) {
                        handleNotificationClick(notif)
                      }
                    }}
                    tabIndex={clickable ? 0 : -1}
                    role={clickable ? "button" : "article"}
                    aria-label={`Notification: ${notif.title || 'Update'}`}
                  >
                    {!notif.is_read && <div className={styles.unreadDot} />}
                    <div className={styles.notifIconWrap}>{getIcon(notif.type)}</div>
                    <div className={styles.notifBody}>
                      <div className={styles.notifHeader}>
                        <h4 className={styles.notifTitle}>{notif.title}</h4>
                        <span className={styles.typeBadge} style={{ color: typeInfo.color, background: typeInfo.bg }}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <p className={styles.notifMessage}>{notif.message}</p>
                      <div className={styles.notifMeta}>
                        <span className={styles.notifTime}>
                          {new Date(notif.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>

                        {/* Interactive Hints */}
                        {notif.type === 'claim' && (ref.claim_id || ref.id || refId) && (
                          <div className={styles.clickHint}>🔍 Review Claim Details</div>
                        )}
                        {(notif.type === 'claim_approved' || notif.type === 'message') && (ref.conversation_id || ref.id || refId) && (
                          <div className={styles.clickHint} style={{ color: '#059669', background: '#ecfdf5' }}>💬 Open Conversation</div>
                        )}
                      </div>
                    </div>
                    <div className={styles.notifActions} onClick={e => e.stopPropagation()}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => toggleRead(notif.id, notif.is_read)}
                        title={notif.is_read ? 'Mark as unread' : 'Mark as read'}
                      >
                        {notif.is_read ? <FaEnvelope /> : <FaEnvelopeOpen />}
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => deleteNotification(notif.id)}
                        title="Delete notification"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {filteredNotifications.length > 0 && (
            <div className={styles.summary}>
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </div>
          )}
        </div>
      </main>

      {/* Claim Detail Modal */}
      {(claimModal !== null) && (
        <ClaimModal
          claim={claimLoading ? null : claimModal}
          onClose={() => setClaimModal(null)}
          onApprove={handleApprove}
          onDeny={handleDeny}
          loading={claimLoading}
        />
      )}
      {claimLoading && claimModal === null && (
        <div className={styles.modalOverlay}>
          <div className={styles.loadingModal}>
            <FaSpinner className="spin" size={36} />
            <p>Loading claim details...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
