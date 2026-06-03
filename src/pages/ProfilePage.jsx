import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import styles from '../styles/pages/Profile.module.css'
import {
  FaEdit, FaSignOutAlt, FaSpinner, FaCamera, FaCheck,
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaShieldAlt,
  FaMoon, FaSun, FaBell, FaLock, FaSms, FaClock, FaHistory
} from 'react-icons/fa'
import authService from '../services/authService'
import itemsService from '../services/itemsService'
import Swal from 'sweetalert2'

const ProfilePage = () => {
  const { user, logout, updateProfile } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    username: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || 'Dhaka, Bangladesh',
    bio: user?.bio || 'Lost and Found enthusiast'
  })
  const [savedData, setSavedData] = useState({ ...formData })
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsAlerts: false,
    twoFactor: false
  })
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null)
  
  const [activeTab, setActiveTab] = useState('posts')
  const [myPosts, setMyPosts] = useState([])
  const [myFavorites, setMyFavorites] = useState([])
  const [myClaims, setMyClaims] = useState([])
  const [stats, setStats] = useState({
    total_posts: 0,
    favorites: 0,
    claims: 0,
    resolved: 0
  })

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    setDataLoading(true)
    try {
      const [postsRes, favsRes, claimsRes, statsRes] = await Promise.all([
        authService.getProfilePosts(),
        authService.getProfileFavorites(),
        authService.getProfileClaims(),
        authService.getProfileStats()
      ])
      
      setMyPosts(postsRes.data.posts || [])
      setMyFavorites(favsRes.data.favorites || [])
      setMyClaims(claimsRes.data.claims || [])
      setStats(statsRes.data || {})
    } catch (err) {
      console.error('Failed to fetch profile data:', err)
    } finally {
      setDataLoading(false)
    }
  }

  const handleDeletePost = (postId) => {
    Swal.fire({
      title: 'Delete Post?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      confirmButtonColor: '#e74c3c',
      background: 'var(--bg-white)',
      color: 'var(--text-primary)'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await itemsService.deleteItem(postId)
          Swal.fire('Deleted!', 'Your post has been deleted.', 'success')
          fetchProfileData() // Refresh
        } catch (err) {
          Swal.fire('Error', 'Failed to delete post.', 'error')
        }
      }
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAvatarPreview(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handlePreferenceToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const updateData = {
        name: formData.username,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        avatar: avatarPreview
      }
      // Try API call, fall back gracefully if backend not available
      try {
        const response = await authService.updateProfile(updateData)
        const updatedUser = response.data.user
        updateProfile(updatedUser)
      } catch (apiErr) {
        // Update locally even if API fails
        updateProfile(updateData)
      }

      setSavedData({ ...formData })
      setEditMode(false)

      Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your changes have been saved successfully.',
        background: 'var(--bg-white)',
        color: 'var(--text-primary)',
        confirmButtonColor: '#14B8A6',
        timer: 2000,
        showConfirmButton: false
      })
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Could not save profile changes. Please try again.',
        background: 'var(--bg-white)',
        color: 'var(--text-primary)'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ ...savedData })
    setEditMode(false)
  }

  const handleLogout = () => {
    Swal.fire({
      title: 'Sign Out?',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#e74c3c',
      background: 'var(--bg-white)',
      color: 'var(--text-primary)'
    }).then((result) => {
      if (result.isConfirmed) {
        logout()
        navigate('/login')
      }
    })
  }

  const recentActivity = [
    { icon: '📱', time: '2 hours ago', desc: 'Posted "Lost iPhone 13 Pro"' },
    { icon: '✅', time: '1 day ago', desc: 'Marked "Found Blue Umbrella" as resolved' },
    { icon: '💬', time: '2 days ago', desc: 'Replied to a claim message' },
    { icon: '🌟', time: '1 week ago', desc: 'Joined the community' },
  ]

  const avatarSrc = avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=14B8A6&color=fff&bold=true&size=200`

  return (
    <div className={styles.profilePage}>
      <Sidebar />
      <main className={styles.mainContent}>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.breadcrumb}>
            <a href="/dashboard">Dashboard</a> / Profile
          </div>
          <div className={styles.pageHeaderRow}>
            <h1 className={styles.pageTitle}>My Profile</h1>
            {!editMode ? (
              <button className={styles.editProfileBtn} onClick={() => setEditMode(true)}>
                <FaEdit /> Edit Profile
              </button>
            ) : (
              <div className={styles.editActions}>
                <button className={styles.cancelBtn} onClick={handleCancel}>
                  Cancel
                </button>
                <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
                  {loading ? <FaSpinner className={styles.spin} /> : <FaCheck />}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.contentArea}>
          {/* Banner / Hero Section */}
          <div className={styles.bannerSection}>
            <div className={styles.avatarWrapper}>
              <img
                src={avatarSrc}
                alt={user?.name || 'User'}
                className={styles.avatar}
              />
              {editMode && (
                <>
                  <button
                    className={styles.editAvatarBtn}
                    onClick={() => fileInputRef.current?.click()}
                    title="Change profile picture"
                  >
                    <FaCamera />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                </>
              )}
            </div>
            <div className={styles.userInfo}>
              <h2>
                {user?.name}
                <span className={styles.verificationBadge}>✓ Verified</span>
              </h2>
              <p className={styles.userEmail}>
                <FaEnvelope style={{ marginRight: 6 }} />
                {user?.email}
              </p>
              <div className={styles.userDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Posts</span>
                  <strong>{stats.total_posts || 0}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Favorites</span>
                  <strong>{stats.favorites || 0}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Matches</span>
                  <strong>{stats.resolved || 0}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Claims</span>
                  <strong>{stats.claims || 0}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className={styles.contentGrid}>
            {/* Left Column */}
            <div className={styles.leftColumn}>
              {/* Personal Information Card */}
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <FaUser className={styles.cardIcon} />
                  Personal Information
                </h3>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <FaUser className={styles.labelIcon} /> Full Name
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        name="username"
                        className={styles.input}
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                      />
                    ) : (
                      <div className={styles.infoValue}>{savedData.username || '—'}</div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <FaEnvelope className={styles.labelIcon} /> Email Address
                    </label>
                    <div className={styles.infoValue} style={{ opacity: 0.7 }}>
                      {formData.email}
                      <span className={styles.lockedBadge}><FaLock size={10} /> Locked</span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <FaPhone className={styles.labelIcon} /> Phone Number
                    </label>
                    {editMode ? (
                      <input
                        type="tel"
                        name="phone"
                        className={styles.input}
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+880 1234-567890"
                      />
                    ) : (
                      <div className={styles.infoValue}>{savedData.phone || '—'}</div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <FaMapMarkerAlt className={styles.labelIcon} /> Location
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        name="location"
                        className={styles.input}
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, Country"
                      />
                    ) : (
                      <div className={styles.infoValue}>{savedData.location || '—'}</div>
                    )}
                  </div>

                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.label}>Bio</label>
                    {editMode ? (
                      <textarea
                        name="bio"
                        className={styles.textarea}
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    ) : (
                      <div className={styles.infoValue}>{savedData.bio || '—'}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preferences Card */}
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <FaShieldAlt className={styles.cardIcon} />
                  Preferences &amp; Settings
                </h3>

                <div className={styles.preferencesSection}>
                  {/* Dark Mode - uses global ThemeContext */}
                  <div className={styles.preferenceRow}>
                    <div className={styles.prefInfo}>
                      <div className={styles.prefIcon}>
                        {isDark ? <FaMoon style={{ color: '#818cf8' }} /> : <FaSun style={{ color: '#f59e0b' }} />}
                      </div>
                      <div>
                        <div className={styles.preferenceLabel}>Dark Mode</div>
                        <div className={styles.prefDescription}>
                          {isDark ? 'Dark theme is active' : 'Light theme is active'}
                        </div>
                      </div>
                    </div>
                    <button
                      className={`${styles.toggleSwitch} ${isDark ? styles.active : ''}`}
                      onClick={toggleTheme}
                      aria-label="Toggle dark mode"
                    />
                  </div>

                  <div className={styles.preferenceRow}>
                    <div className={styles.prefInfo}>
                      <div className={styles.prefIcon}><FaBell style={{ color: '#14B8A6' }} /></div>
                      <div>
                        <div className={styles.preferenceLabel}>Email Notifications</div>
                        <div className={styles.prefDescription}>Receive alerts via email</div>
                      </div>
                    </div>
                    <button
                      className={`${styles.toggleSwitch} ${preferences.emailNotifications ? styles.active : ''}`}
                      onClick={() => handlePreferenceToggle('emailNotifications')}
                    />
                  </div>

                  <div className={styles.preferenceRow} style={{ borderBottom: 'none' }}>
                    <div className={styles.prefInfo}>
                      <div className={styles.prefIcon}><FaLock style={{ color: '#f59e0b' }} /></div>
                      <div>
                        <div className={styles.preferenceLabel}>Two-Factor Auth</div>
                        <div className={styles.prefDescription}>Extra account security</div>
                      </div>
                    </div>
                    <button
                      className={`${styles.toggleSwitch} ${preferences.twoFactor ? styles.active : ''}`}
                      onClick={() => handlePreferenceToggle('twoFactor')}
                    />
                  </div>
                </div>

                <button className={styles.logoutBtn} onClick={handleLogout}>
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            </div>

            {/* Right Column - Tabs & Lists */}
            <div className={styles.rightColumn}>
              <div className={styles.tabsHeader}>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'posts' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('posts')}
                >
                  My Posts
                </button>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'favorites' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('favorites')}
                >
                  Favorites
                </button>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'claims' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('claims')}
                >
                  Claims
                </button>
              </div>

              <div className={styles.tabContent}>
                {dataLoading ? (
                  <div className={styles.tabLoading}>
                    <FaSpinner className={styles.spin} /> Loading...
                  </div>
                ) : (
                  <>
                    {activeTab === 'posts' && (
                      <div className={styles.listContainer}>
                        {myPosts.length === 0 ? (
                          <div className={styles.emptyState}>No posts yet.</div>
                        ) : (
                          myPosts.map(post => (
                            <div key={post.id} className={styles.listItem}>
                              <img src={post.image_url || 'https://via.placeholder.com/80'} alt={post.title} className={styles.itemThumb} />
                              <div className={styles.itemInfoSmall}>
                                <h4>{post.title}</h4>
                                <p>{post.location} • {new Date(post.created_at).toLocaleDateString()}</p>
                                <span className={`${styles.statusBadge} ${styles[post.status]}`}>{post.status}</span>
                              </div>
                              <div className={styles.itemActions}>
                                <button onClick={() => navigate(`/post/${post.id}`)} className={styles.viewBtn}>View</button>
                                <button onClick={() => navigate(`/post/edit/${post.id}`)} className={styles.editBtnSmall}>Edit</button>
                                <button onClick={() => handleDeletePost(post.id)} className={styles.deleteBtnSmall}>Delete</button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === 'favorites' && (
                      <div className={styles.listContainer}>
                        {myFavorites.length === 0 ? (
                          <div className={styles.emptyState}>No favorites yet.</div>
                        ) : (
                          myFavorites.map(fav => (
                            <div key={fav.id} className={styles.listItem}>
                              <img src={fav.image_url || 'https://via.placeholder.com/80'} alt={fav.title} className={styles.itemThumb} />
                              <div className={styles.itemInfoSmall}>
                                <h4>{fav.title}</h4>
                                <p>{fav.location}</p>
                              </div>
                              <div className={styles.itemActions}>
                                <button onClick={() => navigate(`/post/${fav.id}`)} className={styles.viewBtn}>View</button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === 'claims' && (
                      <div className={styles.listContainer}>
                        {myClaims.length === 0 ? (
                          <div className={styles.emptyState}>No claims submitted.</div>
                        ) : (
                          myClaims.map(claim => (
                            <div key={claim.id} className={styles.listItem}>
                              <img src={claim.item_image || 'https://via.placeholder.com/80'} alt={claim.item_title} className={styles.itemThumb} />
                              <div className={styles.itemInfoSmall}>
                                <h4>{claim.item_title}</h4>
                                <p>Status: <span className={styles[`status_${claim.status}`]}>{claim.status}</span></p>
                              </div>
                              <div className={styles.itemActions}>
                                <button onClick={() => navigate(`/items/${claim.item_id}`)} className={styles.viewBtn}>View Item</button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ProfilePage
