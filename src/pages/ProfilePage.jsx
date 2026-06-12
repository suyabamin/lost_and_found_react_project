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
  FaMoon, FaSun, FaBell, FaLock, FaSms, FaClock, FaHistory, FaStar, FaMoneyBillWave,
  FaBoxOpen, FaHandshake, FaHeart, FaList, FaTrash, FaExternalLinkAlt, FaTimes
} from 'react-icons/fa'
import authService from '../services/authService'
import itemsService from '../services/itemsService'
import apiClient from '../services/api'
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
    bio: user?.bio || 'Lost and Found enthusiast',
    bkash_number: user?.bkash_number || '',
    nagad_number: user?.nagad_number || '',
    rocket_number: user?.rocket_number || ''
  })
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null)
  
  const [activeTab, setActiveTab] = useState('posts')
  const [myPosts, setMyPosts] = useState([])
  const [myFavorites, setMyFavorites] = useState([])
  const [myClaims, setMyClaims] = useState([])
  const [myHistory, setMyHistory] = useState([])
  const [myRewards, setMyRewards] = useState([])
  const [stats, setStats] = useState({
    total_posts: 0,
    resolved: 0,
    earnings: 0,
    claims: 0
  })

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    setDataLoading(true)
    try {
      const [postsRes, favsRes, claimsRes, statsRes, historyRes, rewardsRes] = await Promise.all([
        authService.getProfilePosts(),
        authService.getProfileFavorites(),
        authService.getProfileClaims(),
        authService.getProfileStats(),
        apiClient.get('/profile/history').catch(() => ({ data: { history: [] } })),
        apiClient.get('/rewards/my').catch(() => ({ data: { rewards: [] } }))
      ])
      
      setMyPosts(postsRes.data.posts || [])
      setMyFavorites(favsRes.data.favorites || [])
      setMyClaims(claimsRes.data.claims || [])
      setMyHistory(historyRes.data.history || [])
      setMyRewards(rewardsRes.data.rewards || [])
      setStats({
        total_posts: statsRes.data.total_posts || 0,
        resolved: statsRes.data.resolved || 0,
        earnings: statsRes.data.rewards_received || 0,
        claims: statsRes.data.claims || 0
      })
    } catch (err) {
      console.error('Failed to fetch profile data:', err)
    } finally {
      setDataLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const updateData = {
        name: formData.username,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        avatar: avatarPreview,
        bkash_number: formData.bkash_number,
        nagad_number: formData.nagad_number,
        rocket_number: formData.rocket_number
      }
      await authService.updateProfile(updateData)
      updateProfile({ ...user, ...updateData })
      setEditMode(false)
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500
      })
    } catch (err) {
      Swal.fire('Error', 'Failed to update profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = (postId) => {
    Swal.fire({
      title: 'Delete Listing?',
      text: 'Are you sure you want to remove this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#ef4444'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await itemsService.deleteItem(postId)
          fetchProfileData()
        } catch (err) {
          Swal.fire('Error', 'Failed to delete listing', 'error')
        }
      }
    })
  }

  const handleLogout = () => {
    Swal.fire({
      title: 'Sign Out?',
      text: 'See you again soon!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Log Out',
      confirmButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        logout()
        navigate('/login')
      }
    })
  }

  const avatarSrc = avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=00A9B5&color=fff&size=200&bold=true`

  return (
    <div className={styles.profilePage}>
      <Sidebar />
      <main className={styles.mainContent}>
        <div className={styles.contentArea}>
          
          {/* Hero Section */}
          <section className={styles.profileHero}>
             <div className={styles.avatarContainer}>
               <img src={avatarSrc} alt={user?.name} className={styles.avatar} />
               <button className={styles.editAvatarBtn} onClick={() => fileInputRef.current.click()}>
                 <FaCamera />
               </button>
               <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{display: 'none'}} 
                  onChange={(e) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => setAvatarPreview(ev.target.result);
                    reader.readAsDataURL(e.target.files[0]);
                  }}
               />
             </div>

             <div className={styles.heroInfo}>
               <div className={styles.heroTop}>
                 <div className={styles.nameArea}>
                    <span className={styles.verificationBadge}>Official Member</span>
                    <h1>{user?.name}</h1>
                    <div className={styles.heroEmail}><FaEnvelope /> {user?.email}</div>
                 </div>
                 {!editMode ? (
                   <button className="btn-premium btn-primary" onClick={() => setEditMode(true)}>
                     <FaEdit /> Edit Account
                   </button>
                 ) : (
                   <div style={{display: 'flex', gap: '10px'}}>
                     <button className="btn-premium btn-secondary" onClick={() => setEditMode(false)}>
                        <FaTimes /> Cancel
                     </button>
                     <button className="btn-premium btn-primary" onClick={handleSave} disabled={loading}>
                        {loading ? <FaSpinner className="spin" /> : <FaCheck />} {loading ? 'Saving...' : 'Save Changes'}
                     </button>
                   </div>
                 )}
               </div>

               <div className={styles.statsRow}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Postings</span>
                    <span className={styles.statValue}>{stats.total_posts}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Recovered</span>
                    <span className={styles.statValue}>{stats.resolved}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Claims</span>
                    <span className={styles.statValue}>{stats.claims}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Balance</span>
                    <span className={styles.statValue}>{stats.earnings} BDT</span>
                  </div>
               </div>
             </div>
          </section>

          <div className={styles.contentGrid}>
            {/* Left: Tabbed Content */}
            <div className={styles.leftColumn}>
               <div className={styles.tabsContainer}>
                  {[
                    { id: 'posts', label: 'My Listings', icon: FaBoxOpen },
                    { id: 'favorites', label: 'Favorites', icon: FaHeart },
                    { id: 'claims', label: 'My Claims', icon: FaHandshake },
                    { id: 'rewards', label: 'Wallet', icon: FaMoneyBillWave }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <tab.icon style={{marginRight: '8px'}} /> {tab.label}
                    </button>
                  ))}
               </div>

               <div className={styles.tabContent}>
                  {dataLoading ? (
                    <div className={styles.postList}>
                      {Array(3).fill(0).map((_, i) => <div key={i} style={{height: '100px'}} className="premium-card shimmer" />)}
                    </div>
                  ) : (
                    <div className={styles.postList}>
                      {activeTab === 'posts' && myPosts.map(post => (
                        <div key={post.id} className={styles.postItem}>
                          <img src={post.image_url || 'https://via.placeholder.com/80'} className={styles.postThumb} alt="" />
                          <div className={styles.postMeta}>
                            <h4>{post.title}</h4>
                            <p><FaMapMarkerAlt /> {post.location} • {new Date(post.created_at).toLocaleDateString()}</p>
                            <span className={`status-badge status-${post.status}`}>{post.status}</span>
                          </div>
                          <div className={styles.postActions}>
                            <button className="btn-premium btn-secondary" onClick={() => navigate(`/post/${post.id}`)}><FaExternalLinkAlt /></button>
                            <button className="btn-premium btn-secondary" onClick={() => handleDeletePost(post.id)} style={{color: '#ef4444'}}><FaTrash /></button>
                          </div>
                        </div>
                      ))}
                      
                      {activeTab === 'posts' && myPosts.length === 0 && (
                        <div className={styles.emptyListing} style={{padding: '60px'}}>
                           <FaBoxOpen size={40} color="var(--border-color)" />
                           <p>You haven't listed any items yet.</p>
                        </div>
                      )}

                      {activeTab === 'favorites' && myFavorites.map(fav => (
                        <div key={fav.id} className={styles.postItem}>
                          <img src={fav.image_url || 'https://via.placeholder.com/80'} className={styles.postThumb} alt="" />
                          <div className={styles.postMeta}>
                            <h4>{fav.title}</h4>
                            <p><FaMapMarkerAlt /> {fav.location}</p>
                          </div>
                          <button className="btn-premium btn-primary" onClick={() => navigate(`/post/${fav.id}`)}>View Listing</button>
                        </div>
                      ))}

                      {activeTab === 'claims' && myClaims.map(claim => (
                        <div key={claim.id} className={styles.postItem}>
                          <div className={styles.postMeta}>
                            <h4 style={{fontSize: '1rem'}}>Claim for: {claim.item_title}</h4>
                            <p>Submitted: {new Date(claim.created_at).toLocaleDateString()}</p>
                            <span className={`status-badge status-${claim.status}`}>{claim.status}</span>
                          </div>
                          <button className="btn-premium btn-secondary" onClick={() => navigate(`/post/${claim.item_id}`)}>View Listing</button>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
            </div>

            {/* Right: Personal Info */}
            <div className={styles.rightColumn}>
               <div className={styles.infoCard}>
                  <div className={styles.cardTitle}><FaUser /> Identity Details</div>
                  <div className={styles.infoGrid}>
                     <div className={styles.infoItemLine}>
                        <span className={styles.infoLabelSm}>Contact Number</span>
                        {editMode ? (
                          <input 
                            className="input" 
                            value={formData.phone} 
                            onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                          />
                        ) : (
                          <span className={styles.infoValueLine}>{user?.phone || 'Not Set'}</span>
                        )}
                     </div>
                     <div className={styles.infoItemLine}>
                        <span className={styles.infoLabelSm}>Preferred Pickup Area</span>
                        {editMode ? (
                          <input 
                            className="input" 
                            value={formData.location} 
                            onChange={(e) => setFormData({...formData, location: e.target.value})} 
                          />
                        ) : (
                          <span className={styles.infoValueLine}>{user?.location || 'Dhaka, Bangladesh'}</span>
                        )}
                     </div>
                     <div className={styles.sectionDivider} />
                     <div className={styles.infoItemLine}>
                        <span className={styles.infoLabelSm}>bKash (For Rewards)</span>
                        {editMode ? (
                          <input 
                            className="input" 
                            value={formData.bkash_number} 
                            onChange={(e) => setFormData({...formData, bkash_number: e.target.value})} 
                          />
                        ) : (
                          <span className={styles.infoValueLine}>{user?.bkash_number || 'None'}</span>
                        )}
                     </div>
                  </div>

                  <button className={styles.logoutBtn} onClick={handleLogout}>
                    <FaSignOutAlt /> Terminate Session
                  </button>
               </div>

               <div className={styles.infoCard} style={{background: 'var(--bg-card-alt)'}}>
                  <div className={styles.cardTitle}><FaShieldAlt /> Security Settings</div>
                  <div className={styles.infoGrid}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                       <span style={{fontSize: '0.9rem', fontWeight: '700'}}>Dark Mode Interface</span>
                       <button onClick={toggleTheme} className="btn-premium btn-secondary" style={{padding: '8px 12px'}}>
                         {isDark ? <FaSun /> : <FaMoon />}
                       </button>
                    </div>
                  </div>
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
